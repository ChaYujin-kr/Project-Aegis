"""문서생성 파이프라인 CLI.

사용 예:
  python -m pipeline.main init --source-dir ./제안서_폴더
  python -m pipeline.main add-req <doc_id> --text "요구사항 문단..." --output "hwpx 보고서"
  python -m pipeline.main define-terms <doc_id>
  python -m pipeline.main review-term <용어> --reviewer 차유진 [--definition "확정 정의"]
  python -m pipeline.main check-dup <doc_id> [--threshold 0.7]
  python -m pipeline.main add-ref <doc_id> --file ./참고.docx [--related <ref_id>]
  python -m pipeline.main add-heading <ref_id> --level 1 --title "대제목"
  python -m pipeline.main score-refs <doc_id>
  python -m pipeline.main set-reflected <req_id> --reviewer 차유진 [--off]
  python -m pipeline.main generate <doc_id> [--out ./out.hwpx] [--claim "핵심 주장"]
"""
from __future__ import annotations

import argparse
from pathlib import Path

from . import db, hwpx_writer, references, requirements, sandwich


def build_parser() -> argparse.ArgumentParser:
    parser = argparse.ArgumentParser(prog="pipeline", description="문서생성 파이프라인")
    parser.add_argument("--db", default=str(db.DEFAULT_DB_PATH), help="SQLite DB 경로")
    sub = parser.add_subparsers(dest="command", required=True)

    p = sub.add_parser("init", help="폴더 기준으로 문서 생성(기본값 자동입력)")
    p.add_argument("--source-dir", required=True)

    p = sub.add_parser("add-req", help="요구사항 추가(문장별 기계적 ID)")
    p.add_argument("doc_id")
    p.add_argument("--text", required=True)
    p.add_argument("--output", help="예상 산출물 형식")

    p = sub.add_parser("define-terms", help="용어 추출(graphify)+클로드 정의 초안")
    p.add_argument("doc_id")

    p = sub.add_parser("review-term", help="용어 정의 사람 검토 확정")
    p.add_argument("term")
    p.add_argument("--reviewer", required=True)
    p.add_argument("--definition")

    p = sub.add_parser("check-dup", help="요구사항 중복도 계산(클로드)")
    p.add_argument("doc_id")
    p.add_argument("--threshold", type=float, default=0.7)

    p = sub.add_parser("add-ref", help="참조문서 등록")
    p.add_argument("doc_id")
    p.add_argument("--file", required=True)
    p.add_argument("--related", help="관련 타문서 ref_id")

    p = sub.add_parser("add-heading", help="참조문서 대/중/소 제목 등록")
    p.add_argument("ref_id")
    p.add_argument("--level", type=int, required=True, choices=[1, 2, 3])
    p.add_argument("--title", required=True)
    p.add_argument("--parent")

    p = sub.add_parser("score-refs", help="참조문서 제목-요구사항 유사도 계산")
    p.add_argument("doc_id")

    p = sub.add_parser("set-reflected", help="요구사항 반영 여부(수동) 체크")
    p.add_argument("req_id")
    p.add_argument("--reviewer", required=True)
    p.add_argument("--off", action="store_true", help="반영 해제")

    p = sub.add_parser("generate", help="hwpx 생성(오답-진심-오답 샌드위치)")
    p.add_argument("doc_id")
    p.add_argument("--out")
    p.add_argument("--claim", help="샌드위치 가운데 넣을 진심 핵심 주장")
    return parser


def main(argv: list[str] | None = None) -> None:
    args = build_parser().parse_args(argv)
    conn = db.connect(args.db)

    if args.command == "init":
        doc_id = db.create_document(conn, args.source_dir)
        doc = db.get_document(conn, doc_id)
        print(f"문서 생성: {doc_id} / 제목='{doc['title']}' / 작성일={doc['created_at']}")

    elif args.command == "add-req":
        ids = requirements.add_requirements(conn, args.doc_id, args.text, args.output)
        for req_id in ids:
            print(f"요구사항 등록: {req_id}")

    elif args.command == "define-terms":
        for term, definition in requirements.define_terms(conn, args.doc_id):
            print(f"[용어] {term}: {definition}  (사람 검토 대기)")

    elif args.command == "review-term":
        requirements.review_term(conn, args.term, args.reviewer, args.definition)
        print(f"용어 검토 완료: {args.term} (by {args.reviewer})")

    elif args.command == "check-dup":
        pairs = requirements.check_duplication(conn, args.doc_id, args.threshold)
        if not pairs:
            print(f"중복도 {args.threshold} 이상인 쌍 없음")
        for a, b, score in pairs:
            print(f"[중복 의심] {a} <-> {b} : {score:.2f}")

    elif args.command == "add-ref":
        ref_id = references.add_reference(conn, args.doc_id, args.file, args.related)
        print(f"참조문서 등록: {ref_id}")

    elif args.command == "add-heading":
        hid = references.add_heading(conn, args.ref_id, args.level, args.title, args.parent)
        print(f"제목 등록: {hid}")

    elif args.command == "score-refs":
        n = references.score_against_requirements(conn, args.doc_id)
        print(f"유사도 {n}건 계산 완료")

    elif args.command == "set-reflected":
        requirements.set_reflected(conn, args.req_id, args.reviewer, not args.off)
        print(f"반영 여부 갱신: {args.req_id} -> {'반영' if not args.off else '미반영'}")

    elif args.command == "generate":
        doc = db.get_document(conn, args.doc_id)
        template = db.get_template(conn, doc["template_id"] or 1)
        model = sandwich.build_document(conn, args.doc_id, args.claim)
        out = Path(args.out) if args.out else Path(f"{args.doc_id}.hwpx")
        hwpx_writer.write_hwpx(model, template, out)
        manifest = sandwich.write_manifest(model, out.with_suffix(".sandwich.json"))
        print(f"hwpx 생성: {out}")
        print(f"진심 manifest: {manifest}")

    conn.close()


if __name__ == "__main__":
    main()
