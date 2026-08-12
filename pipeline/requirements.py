"""룰 0 — 요구사항DB 처리.

  · 문장 분리 + 기계적 ID 부여 ({doc_id}-R0001)
  · 용어: graphify(후보 추출) -> 클로드(정의 초안) -> 사람 검토(수동 플래그)
  · 예상 출력 형식(산출물) 관리
  · 타 요구사항과의 중복도(클로드, 폴백 difflib)
  · 요구사항 반영 여부는 완전 수동
"""
from __future__ import annotations

import re
import sqlite3
from collections import Counter

from . import claude_client, db

_SENTENCE_SPLIT = re.compile(r"(?<=[.!?。다\)])\s+|\n+")


def split_sentences(text: str) -> list[str]:
    """기계적 문장 분리. 한국어 종결('~다.')과 일반 구두점 기준."""
    parts = [s.strip() for s in _SENTENCE_SPLIT.split(text)]
    return [s for s in parts if s]


def add_requirements(
    conn: sqlite3.Connection,
    doc_id: str,
    text: str,
    expected_output: str | None = None,
) -> list[str]:
    """요구사항 원문을 문장 단위로 쪼개 ID를 달아 저장한다."""
    seq = conn.execute(
        "SELECT COUNT(*) FROM requirements WHERE doc_id = ?", (doc_id,)
    ).fetchone()[0]
    req_ids = []
    for sentence in split_sentences(text):
        seq += 1
        req_id = f"{doc_id}-R{seq:04d}"
        conn.execute(
            "INSERT INTO requirements (req_id, doc_id, sentence, expected_output, created_at)"
            " VALUES (?, ?, ?, ?, ?)",
            (req_id, doc_id, sentence, expected_output, db.now()),
        )
        req_ids.append(req_id)
    conn.commit()
    return req_ids


# ---------- 용어: graphify -> 클로드 -> 사람 검토 ----------

_TERM_CANDIDATE = re.compile(r"[가-힣A-Za-z]{2,}")
_STOPWORDS = {
    "그리고", "하지만", "또한", "위한", "위해", "대한", "통해", "관련", "경우",
    "있다", "한다", "된다", "이다", "않는", "있는", "하는", "및", "등",
}


_VERBISH_SUFFIXES = ("한다", "된다", "이다", "하다", "되다", "해야", "어야", "야한다",
                     "되어야", "하는", "되는", "있는", "없는", "합니다", "됩니다")
_PARTICLES = ("으로부터", "에서는", "으로", "에서", "부터", "까지", "은", "는", "이", "가",
              "을", "를", "의", "에", "로", "와", "과", "도", "만")


def _strip_particle(token: str) -> str:
    """어절 끝의 흔한 조사를 떼어 명사 후보를 정규화한다."""
    for particle in _PARTICLES:
        if token.endswith(particle) and len(token) - len(particle) >= 2:
            return token[: -len(particle)]
    return token


def graphify_terms(sentences: list[str], min_count: int = 2) -> list[str]:
    """graphify 단계: 반복 등장하는 명사 후보를 기계적으로 추출한다."""
    counter: Counter[str] = Counter()
    for s in sentences:
        for token in _TERM_CANDIDATE.findall(s):
            if token in _STOPWORDS or token.endswith(_VERBISH_SUFFIXES):
                continue
            counter[_strip_particle(token)] += 1
    return [t for t, c in counter.most_common() if c >= min_count]


def define_terms(conn: sqlite3.Connection, doc_id: str) -> list[tuple[str, str]]:
    """문서의 요구사항에서 용어를 추출하고 클로드로 정의 초안을 만든다.

    human_reviewed=0 상태로 저장되며, review_term() 으로 사람이 확정한다.
    """
    rows = conn.execute(
        "SELECT req_id, sentence FROM requirements WHERE doc_id = ?", (doc_id,)
    ).fetchall()
    sentences = {r["req_id"]: r["sentence"] for r in rows}
    results = []
    for term in graphify_terms(list(sentences.values())):
        context = [s for s in sentences.values() if term in s]
        definition, defined_by = claude_client.define_term(term, context)
        cur = conn.execute(
            "INSERT INTO terms (term, definition, defined_by) VALUES (?, ?, ?)"
            " ON CONFLICT(term) DO UPDATE SET definition = excluded.definition,"
            " defined_by = excluded.defined_by, human_reviewed = 0",
            (term, definition, defined_by),
        )
        term_id = cur.lastrowid or conn.execute(
            "SELECT term_id FROM terms WHERE term = ?", (term,)
        ).fetchone()[0]
        for req_id, sentence in sentences.items():
            if term in sentence:
                conn.execute(
                    "INSERT OR IGNORE INTO requirement_terms (req_id, term_id) VALUES (?, ?)",
                    (req_id, term_id),
                )
        results.append((term, definition))
    conn.commit()
    return results


def review_term(conn: sqlite3.Connection, term: str, reviewer: str,
                definition: str | None = None) -> None:
    """사람 검토 확정. definition을 주면 사람이 고쳐 쓴 것으로 기록."""
    if definition is not None:
        conn.execute(
            "UPDATE terms SET definition = ?, defined_by = 'human',"
            " human_reviewed = 1, reviewed_by = ?, reviewed_at = ? WHERE term = ?",
            (definition, reviewer, db.now(), term),
        )
    else:
        conn.execute(
            "UPDATE terms SET human_reviewed = 1, reviewed_by = ?, reviewed_at = ?"
            " WHERE term = ?",
            (reviewer, db.now(), term),
        )
    conn.commit()


# ---------- 중복도 ----------

def check_duplication(conn: sqlite3.Connection, doc_id: str,
                      threshold: float = 0.0) -> list[tuple[str, str, float]]:
    """문서 내 모든 요구사항 쌍의 중복도를 계산해 저장한다."""
    rows = conn.execute(
        "SELECT req_id, sentence FROM requirements WHERE doc_id = ? ORDER BY req_id",
        (doc_id,),
    ).fetchall()
    reported = []
    for i in range(len(rows)):
        for j in range(i + 1, len(rows)):
            a, b = rows[i], rows[j]
            score, method, rationale = claude_client.similarity(a["sentence"], b["sentence"])
            conn.execute(
                "INSERT OR REPLACE INTO requirement_similarity"
                " (req_id_a, req_id_b, score, method, rationale) VALUES (?, ?, ?, ?, ?)",
                (a["req_id"], b["req_id"], score, method, rationale),
            )
            if score >= threshold:
                reported.append((a["req_id"], b["req_id"], score))
    conn.commit()
    return reported


# ---------- 반영 여부(완전 수동) ----------

def set_reflected(conn: sqlite3.Connection, req_id: str, reviewer: str,
                  reflected: bool = True) -> None:
    conn.execute(
        "UPDATE requirements SET reflected = ?, reflected_by = ?, reflected_at = ?"
        " WHERE req_id = ?",
        (1 if reflected else 0, reviewer, db.now(), req_id),
    )
    conn.commit()
