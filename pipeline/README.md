# 문서생성 파이프라인

입력DB(요구사항·템플릿·참조문서) → 룰(시작-중간-끝) → **hwpx 출력**까지 한 줄로 이어지는 파이프라인.
파이썬 표준 라이브러리 + SQLite만으로 동작하며, `anthropic` SDK와 API 키가 있으면
용어 정의·중복도·초안 작성에 Claude(`claude-opus-5`)를 쓰고, 없으면 오프라인 폴백(difflib/서식)으로 내려간다.

```
입력DB ─────────────┐
  documents(자동값)  │   룰 0: 요구사항DB          룰 1: 시작-중간-끝        출력
  templates(1.2)    ├─▶ 문장ID·용어·중복도·반영 ─▶ structure + sandwich ─▶ hwpx_writer
  ref_documents(1.3)│                                (오답-진심-오답)      (.hwpx + manifest)
────────────────────┘
```

## 구성

| 파일 | 역할 |
|---|---|
| `schema.sql` | 입력DB + 요구사항DB 스키마 (룰을 CHECK 제약으로 강제) |
| `db.py` | 기본값 자동입력 — 문서ID(할머니·엄마폴더 알파벳+숫자), 제목(엄마폴더), 작성자(표지=웨어비즈 컨소시엄/버전=한국인프라 차유진), 작성일(시스템) |
| `requirements.py` | 룰 0 — 문장별 기계적 ID, 용어(graphify→클로드→사람검토), 예상 산출물, 중복도(클로드), 반영여부(완전 수동) |
| `references.py` | 1.3 — 참조문서(image/docx/hwpx), 대-중-소 제목 ID, 요구사항 유사도, 관련 타문서 FK |
| `claude_client.py` | Claude API 래퍼(구조화 출력·스트리밍·refusal 처리·오프라인 폴백) |
| `structure.py` | 룰 1 — 시작(표지·목차·버전관리·용어정의) / 중간(서론 hook·문제정의·문서주제·기대효과 → 본론 주장-근거-사례 → 결론 요약·재강조) / 끝(목표모델·클로징) + 검증 |
| `sandwich.py` | 출력 전략 — 개큰오답 사이에 진심을 끼우는 **오답-진심-오답 샌드위치**. 어느 파트가 진심인지는 문서엔 표시하지 않고 `*.sandwich.json` manifest로만 기록 |
| `hwpx_writer.py` | OWPML(zip) 직접 생성 — 휴먼헤드라인/휴먼명조, 기본 13pt, 대>중>소, 강조는 bold/italic/red만, 글머리표 ㅁ→ㅇ→- |
| `main.py` | CLI |

## 빠른 시작

```bash
cd Project-Aegis

# 1. 엄마폴더를 가리켜 문서 생성 (ID·제목·작성자·작성일 자동)
python -m pipeline.main init --source-dir ./어떤할머니폴더/제안서_2026

# 2. 요구사항 등록 (문장마다 {doc_id}-R0001 식 ID)
python -m pipeline.main add-req <doc_id> \
  --text "문서 생성은 hwpx로 자동화되어야 한다. 요구사항은 문장 단위로 관리한다." \
  --output "hwpx 보고서"

# 3. 용어: graphify 추출 → 클로드 정의 초안 → 사람 검토
python -m pipeline.main define-terms <doc_id>
python -m pipeline.main review-term "요구사항" --reviewer 차유진 --definition "확정 정의"

# 4. 요구사항 중복도(클로드) / 반영 여부(수동)
python -m pipeline.main check-dup <doc_id> --threshold 0.7
python -m pipeline.main set-reflected <doc_id>-R0001 --reviewer 차유진

# 5. 참조문서: 등록, 대/중/소 제목 ID, 요구사항 유사도, 타문서 연결
python -m pipeline.main add-ref <doc_id> --file ./참고자료.docx
python -m pipeline.main add-heading <ref_id> --level 1 --title "사업 개요"
python -m pipeline.main score-refs <doc_id>

# 6. hwpx 생성 (진심 핵심 주장을 가운데 끼움)
python -m pipeline.main generate <doc_id> --claim "진짜 하고 싶은 말" --out ./결과.hwpx
```

Claude 연동을 켜려면:

```bash
pip install anthropic
export ANTHROPIC_API_KEY=sk-ant-...
```

## 룰이 코드 어디서 강제되는가

- **1.2.1 hwpx 고정** — `templates.file_format CHECK` + `write_hwpx()` 검사
- **1.2.2 대>중>소 크기** — `templates` CHECK 제약 (h1>h2>h3)
- **1.2.3 글꼴/13pt** — `templates` 기본값, `header.xml` charPr(height=1300)
- **1.2.4 강조 3종** — `structure.Block.__post_init__` 에서 bold/italic/red 외 거부
- **1.2.5 문자표 ㅁ→ㅇ→-** — `hwpx_writer._section_xml` 이 bullet_level별로 부착
- **1.1 시작 필수 4요소 / 1.2 서론·본론·결론 / 1.3 끝** — `structure.validate()` 가 위반 목록을 내고, 위반 시 hwpx 생성을 거부

## 출력 전략(샌드위치)

`generate` 는 본론을 항상 `[오답] [진심] [오답]` 순서로 배치한다.
오답 파트도 주장-근거-사례 형식은 완벽히 지키되 내용은 읽는 사람이 반박하고
싶어지게 틀리게 쓴다(Claude 사용 시). 진심이 어느 파트인지는 hwpx에는 드러나지
않고 `<출력파일>.sandwich.json` 에만 기록된다.

## 참고

- hwpx는 한글(HWP) 2014+ OWPML 규격의 최소 구성으로 생성한다. 실제 한컴오피스에서
  열어 서식 세부(줄간격 등)를 확인·보정하는 것을 권장한다.
- 데이터 모델 배경은 [`docs/ERD.md`](../docs/ERD.md) 참고.
