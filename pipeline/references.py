"""1.3 참조문서 관리.

  · 파일형식: image / docx / hwpx (그 외 pdf, etc)
  · 대제목(1)-중제목(2)-소제목(3) 각각 ID 부여: {ref_id}-H{level}-{seq:02d}
  · 요구사항과의 유사도 관리
  · 관련 있는 타문서를 related_ref_id FK로 연결
"""
from __future__ import annotations

import sqlite3
from pathlib import Path

from . import claude_client

_EXT_TO_TYPE = {
    ".png": "image", ".jpg": "image", ".jpeg": "image", ".gif": "image",
    ".docx": "docx", ".hwpx": "hwpx", ".pdf": "pdf",
}


def add_reference(
    conn: sqlite3.Connection,
    doc_id: str,
    file_path: str | Path,
    related_ref_id: str | None = None,
) -> str:
    file_path = Path(file_path)
    file_type = _EXT_TO_TYPE.get(file_path.suffix.lower(), "etc")
    seq = conn.execute(
        "SELECT COUNT(*) FROM ref_documents WHERE doc_id = ?", (doc_id,)
    ).fetchone()[0] + 1
    ref_id = f"{doc_id}-REF{seq:03d}"
    conn.execute(
        "INSERT INTO ref_documents (ref_id, doc_id, file_path, file_type, related_ref_id)"
        " VALUES (?, ?, ?, ?, ?)",
        (ref_id, doc_id, str(file_path), file_type, related_ref_id),
    )
    conn.commit()
    return ref_id


def link_related(conn: sqlite3.Connection, ref_id: str, related_ref_id: str) -> None:
    """관련 타문서 FK 연결."""
    conn.execute(
        "UPDATE ref_documents SET related_ref_id = ? WHERE ref_id = ?",
        (related_ref_id, ref_id),
    )
    conn.commit()


def add_heading(
    conn: sqlite3.Connection,
    ref_id: str,
    level: int,
    title: str,
    parent_heading_id: str | None = None,
) -> str:
    """대(1)/중(2)/소(3) 제목에 ID를 붙여 저장한다."""
    if level not in (1, 2, 3):
        raise ValueError("level은 1(대)/2(중)/3(소)만 허용")
    seq = conn.execute(
        "SELECT COUNT(*) FROM ref_headings WHERE ref_id = ? AND level = ?",
        (ref_id, level),
    ).fetchone()[0] + 1
    heading_id = f"{ref_id}-H{level}-{seq:02d}"
    conn.execute(
        "INSERT INTO ref_headings (heading_id, ref_id, level, title, parent_heading_id)"
        " VALUES (?, ?, ?, ?, ?)",
        (heading_id, ref_id, level, title, parent_heading_id),
    )
    conn.commit()
    return heading_id


def add_outline(conn: sqlite3.Connection, ref_id: str,
                outline: list[tuple[int, str]]) -> list[str]:
    """(level, title) 목록을 순서대로 넣으며 부모를 자동 연결한다."""
    last_at_level: dict[int, str] = {}
    ids = []
    for level, title in outline:
        parent = last_at_level.get(level - 1)
        hid = add_heading(conn, ref_id, level, title, parent)
        last_at_level[level] = hid
        ids.append(hid)
    return ids


def score_against_requirements(conn: sqlite3.Connection, doc_id: str) -> int:
    """참조문서 제목들과 요구사항 문장들의 유사도를 계산해 저장한다."""
    headings = conn.execute(
        "SELECT h.heading_id, h.title FROM ref_headings h"
        " JOIN ref_documents r ON r.ref_id = h.ref_id WHERE r.doc_id = ?",
        (doc_id,),
    ).fetchall()
    reqs = conn.execute(
        "SELECT req_id, sentence FROM requirements WHERE doc_id = ?", (doc_id,)
    ).fetchall()
    count = 0
    for h in headings:
        for r in reqs:
            score, method, _ = claude_client.similarity(h["title"], r["sentence"])
            conn.execute(
                "INSERT OR REPLACE INTO ref_req_similarity (heading_id, req_id, score, method)"
                " VALUES (?, ?, ?, ?)",
                (h["heading_id"], r["req_id"], score, method),
            )
            count += 1
    conn.commit()
    return count
