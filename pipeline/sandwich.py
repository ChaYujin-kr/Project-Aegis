"""출력 전략 — '개큰오답 써내려가기 + 진심 샌드위치'.

읽는 사람이 반박하고 싶어 안달나게 만드는 '오답' 파트 사이에
진짜 하고 싶은 말(진심)을 끼워 넣는다. 순서는 항상:

    [맛없는 것(오답)] - [개맛있는 것(진심)] - [맛없는 것(오답)]

오답 파트도 룰 1.2.2(주장-근거-사례)는 그대로 지킨다 — 형식은 멀쩡한데
내용이 화나게 틀려야 좋은 오답이다. 어떤 파트가 진심인지는 문서에는
표시하지 않고, 별도 manifest(JSON)로만 남긴다.
"""
from __future__ import annotations

import json
import sqlite3
from pathlib import Path

from . import claude_client, structure
from .structure import Argument, DocumentModel, Evidence, Intro

_DECOY_ROLE = (
    "너는 일부러 '개큰오답'을 쓰는 작가다. 제안서 형식(주장-근거-사례)은 완벽하게 지키되, "
    "내용은 읽는 사람이 당장 반박 댓글을 달고 싶어질 만큼 과감하게 틀린 주장을 편다. "
    "욕설/비방 없이, 그럴듯한데 확실히 틀린 논리로 화를 돋운다."
)
_SINCERE_ROLE = (
    "너는 진심을 담아 쓰는 제안서 작가다. 주장-근거-사례 구조로, "
    "요구사항을 충실히 반영해 설득력 있게 쓴다."
)


def _fallback_argument(claim: str, reqs: list[str], sincerity: str) -> Argument:
    """Claude를 못 쓰는 환경용 뼈대 초안."""
    ev_text = reqs[0] if reqs else f"{claim}을(를) 뒷받침하는 근거 (작성 필요)"
    return Argument(
        claim=claim,
        evidences=[Evidence(text=f"근거: {ev_text}",
                            cases=[f"사례: {claim} 관련 사례 (작성 필요)"])],
        sincerity=sincerity,
    )


def _draft_argument(claim: str, reqs: list[str], sincerity: str) -> Argument:
    role = _SINCERE_ROLE if sincerity == structure.SINCERE else _DECOY_ROLE
    brief = (
        f"주장 한 줄: {claim}\n"
        "주장을 뒷받침하는 근거 2개, 근거마다 사례 1개씩을 다음 형식으로 써라.\n"
        "근거: ...\n사례: ...\n근거: ...\n사례: ..."
    )
    text = claude_client.draft_section(role, brief, reqs)
    if not text:
        return _fallback_argument(claim, reqs, sincerity)
    arg = Argument(claim=claim, sincerity=sincerity)
    current: Evidence | None = None
    for line in text.splitlines():
        line = line.strip().lstrip("-•ㅁㅇ ").strip()
        if line.startswith("근거"):
            current = Evidence(text=line)
            arg.evidences.append(current)
        elif line.startswith("사례") and current is not None:
            current.cases.append(line)
    if not arg.evidences:
        return _fallback_argument(claim, reqs, sincerity)
    for ev in arg.evidences:
        if not ev.cases:
            ev.cases.append("사례: (보강 필요)")
    return arg


def arrange_sandwich(arguments: list[Argument]) -> list[Argument]:
    """오답-진심-오답 순서로 정렬. 진심은 항상 가운데에 온다."""
    decoys = [a for a in arguments if a.sincerity == structure.DECOY]
    sincere = [a for a in arguments if a.sincerity == structure.SINCERE]
    front = decoys[: max(1, len(decoys) // 2)] if decoys else []
    back = decoys[len(front):]
    return front + sincere + back


def build_document(conn: sqlite3.Connection, doc_id: str,
                   sincere_claim: str | None = None) -> DocumentModel:
    """DB의 요구사항/용어/버전을 모아 샌드위치 구조의 문서 모델을 만든다."""
    doc = conn.execute("SELECT * FROM documents WHERE doc_id = ?", (doc_id,)).fetchone()
    versions = conn.execute(
        "SELECT version, changed_at, COALESCE(note, '') AS note FROM doc_versions"
        " WHERE doc_id = ? ORDER BY changed_at",
        (doc_id,),
    ).fetchall()
    terms = conn.execute(
        "SELECT t.term, COALESCE(t.definition, '') AS definition FROM terms t"
        " JOIN requirement_terms rt ON rt.term_id = t.term_id"
        " JOIN requirements r ON r.req_id = rt.req_id"
        " WHERE r.doc_id = ? GROUP BY t.term_id ORDER BY t.term",
        (doc_id,),
    ).fetchall()
    reqs = [r["sentence"] for r in conn.execute(
        "SELECT sentence FROM requirements WHERE doc_id = ? ORDER BY req_id", (doc_id,)
    ).fetchall()]

    title = doc["title"]
    core_claim = sincere_claim or f"{title}: 요구사항이 가리키는 핵심 해법"

    # 서론(1.2.1) — 각 한 문장
    intro = Intro(
        hook=f"당신의 업무 시간 절반이 '{title}' 없이는 그냥 사라지고 있다.",
        problem=f"현재 {title} 관련 업무는 표준 없는 수작업에 묶여 있다는 것이 핵심 문제다.",
        topic=f"본 문서는 그 원인을 제거하는 방안으로 '{core_claim}'을 연구 주제로 제시한다.",
        expected_effect="문제가 해결되면 문서 작성·검토 리드타임이 줄고 품질 편차가 사라진다.",
    )

    # 본론(1.2.2) — 샌드위치: 오답 / 진심 / 오답
    arguments = [
        _draft_argument(f"{title}은(는) 사실 아무 문제가 없으므로 아무것도 바꿀 필요가 없다",
                        reqs, structure.DECOY),
        _draft_argument(core_claim, reqs, structure.SINCERE),
        _draft_argument("모든 문서는 결국 안 읽히므로 형식만 화려하면 내용은 상관없다",
                        reqs, structure.DECOY),
    ]
    arguments = arrange_sandwich(arguments)

    model = DocumentModel(
        title=title,
        author_cover=doc["author_cover"],
        author_version=doc["author_version"],
        created_at=doc["created_at"],
        versions=[(v["version"], v["changed_at"], v["note"]) for v in versions],
        terms=[(t["term"], t["definition"]) for t in terms],
        intro=intro,
        arguments=arguments,
        conclusion_summary="요약: 서론의 문제를 본론의 주장-근거-사례로 검증했다.",
        conclusion_restate=f"다시 강조한다 — {core_claim}.",
        target_model=f"목표모델: 요구사항DB-참조문서-템플릿이 연결된 '{title}' 자동 생성 체계.",
        closing="그래서 이것이 해답이다. 속 시원하게, 여기서 닫는다.",
    )
    return model


def write_manifest(model: DocumentModel, out_path: str | Path) -> Path:
    """어느 파트가 진심(진짜 하고 싶은 말)인지 별도 JSON으로 기록한다."""
    out_path = Path(out_path)
    manifest = {
        "strategy": "오답-진심-오답 샌드위치",
        "arguments": [
            {"index": i, "claim": a.claim, "sincerity": a.sincerity}
            for i, a in enumerate(model.arguments)
        ],
    }
    out_path.write_text(json.dumps(manifest, ensure_ascii=False, indent=2), encoding="utf-8")
    return out_path
