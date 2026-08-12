-- ============================================================
-- 문서생성 파이프라인 스키마
--  · 입력DB  : templates / documents / doc_versions / ref_documents / ref_headings
--  · 요구사항DB(룰 0) : requirements / terms / requirement_terms / requirement_similarity
-- ============================================================

PRAGMA foreign_keys = ON;

-- ------------------------------------------------------------
-- 1.2 템플릿
--   · 파일형식은 hwpx 고정
--   · 글꼴: 제목=휴먼헤드라인, 본문=휴먼명조 (1.2.3)
--   · 글자크기 기본 13pt, 대>중>소 순으로 작아짐 (1.2.2)
--   · 강조는 볼드/기울임/빨간색만 (1.2.4)
--   · 문자표(글머리표)는 ㅁ → ㅇ → - 순 (1.2.5)
-- ------------------------------------------------------------
CREATE TABLE IF NOT EXISTS templates (
    template_id      INTEGER PRIMARY KEY AUTOINCREMENT,
    name             TEXT NOT NULL DEFAULT '기본 템플릿',
    file_format      TEXT NOT NULL DEFAULT 'hwpx' CHECK (file_format = 'hwpx'),
    title_font       TEXT NOT NULL DEFAULT '휴먼헤드라인',
    body_font        TEXT NOT NULL DEFAULT '휴먼명조',
    base_size_pt     REAL NOT NULL DEFAULT 13,
    h1_size_pt       REAL NOT NULL DEFAULT 20,   -- 대제목
    h2_size_pt       REAL NOT NULL DEFAULT 16,   -- 중제목
    h3_size_pt       REAL NOT NULL DEFAULT 14,   -- 소제목
    bullet_level1    TEXT NOT NULL DEFAULT 'ㅁ',
    bullet_level2    TEXT NOT NULL DEFAULT 'ㅇ',
    bullet_level3    TEXT NOT NULL DEFAULT '-',
    emphasis_allowed TEXT NOT NULL DEFAULT 'bold,italic,red',
    -- 룰 1.2.2: 대-중-소 순으로 글자크기가 작아져야 한다
    CHECK (h1_size_pt > h2_size_pt AND h2_size_pt > h3_size_pt)
);

-- ------------------------------------------------------------
-- 0. 문서 (기본값 자동입력)
--   · doc_id    : 할머니폴더+엄마폴더 이름에서 만든 알파벳+숫자 조합
--   · title     : 엄마폴더 이름
--   · 작성자    : 표지=웨어비즈 컨소시엄 / 버전관리=한국인프라 차유진
--   · created_at: 시스템 측정값
-- ------------------------------------------------------------
CREATE TABLE IF NOT EXISTS documents (
    doc_id         TEXT PRIMARY KEY,
    title          TEXT NOT NULL,
    author_cover   TEXT NOT NULL DEFAULT '웨어비즈 컨소시엄',
    author_version TEXT NOT NULL DEFAULT '한국인프라 차유진',
    created_at     TEXT NOT NULL,
    source_dir     TEXT,
    template_id    INTEGER REFERENCES templates(template_id)
);

-- 문서 버전 관리 (시작부 '문서 버전 관리' 표의 원장)
CREATE TABLE IF NOT EXISTS doc_versions (
    doc_id     TEXT NOT NULL REFERENCES documents(doc_id),
    version    TEXT NOT NULL,
    changed_at TEXT NOT NULL,
    author     TEXT NOT NULL DEFAULT '한국인프라 차유진',
    note       TEXT,
    PRIMARY KEY (doc_id, version)
);

-- ------------------------------------------------------------
-- 룰 0. 요구사항DB
--   · 매 문장마다 기계적으로 ID 부여
--   · 예상 출력 형식(산출물) 관리
--   · 반영 여부는 완전 수동 체크
-- ------------------------------------------------------------
CREATE TABLE IF NOT EXISTS requirements (
    req_id          TEXT PRIMARY KEY,            -- {doc_id}-R0001 형식(기계적)
    doc_id          TEXT NOT NULL REFERENCES documents(doc_id),
    sentence        TEXT NOT NULL,               -- 문장 단위 원문
    expected_output TEXT,                        -- 예상 산출물 형식
    reflected       INTEGER NOT NULL DEFAULT 0,  -- 반영 여부(수동 전용)
    reflected_by    TEXT,
    reflected_at    TEXT,
    created_at      TEXT NOT NULL
);

-- 용어 정의: graphify(후보 추출) -> 클로드(정의 초안) -> 사람 검토
CREATE TABLE IF NOT EXISTS terms (
    term_id        INTEGER PRIMARY KEY AUTOINCREMENT,
    term           TEXT NOT NULL UNIQUE,
    definition     TEXT,
    defined_by     TEXT CHECK (defined_by IN ('graphify', 'claude', 'human')),
    human_reviewed INTEGER NOT NULL DEFAULT 0,
    reviewed_by    TEXT,
    reviewed_at    TEXT
);

CREATE TABLE IF NOT EXISTS requirement_terms (
    req_id  TEXT NOT NULL REFERENCES requirements(req_id),
    term_id INTEGER NOT NULL REFERENCES terms(term_id),
    PRIMARY KEY (req_id, term_id)
);

-- 타 요구사항과의 중복도 (클로드 평가, 폴백은 difflib)
CREATE TABLE IF NOT EXISTS requirement_similarity (
    req_id_a  TEXT NOT NULL REFERENCES requirements(req_id),
    req_id_b  TEXT NOT NULL REFERENCES requirements(req_id),
    score     REAL NOT NULL CHECK (score BETWEEN 0 AND 1),
    method    TEXT NOT NULL DEFAULT 'claude',
    rationale TEXT,
    PRIMARY KEY (req_id_a, req_id_b),
    CHECK (req_id_a < req_id_b)
);

-- ------------------------------------------------------------
-- 1.3 참조문서
--   · 주로 이미지/docx/hwpx
--   · 문서 대제목-중제목-소제목 각각 id 부여
--   · 요구사항과 유사도 관리, 관련 타문서 id를 FK로 연결
-- ------------------------------------------------------------
CREATE TABLE IF NOT EXISTS ref_documents (
    ref_id         TEXT PRIMARY KEY,
    doc_id         TEXT REFERENCES documents(doc_id),
    file_path      TEXT NOT NULL,
    file_type      TEXT NOT NULL CHECK (file_type IN ('image', 'docx', 'hwpx', 'pdf', 'etc')),
    related_ref_id TEXT REFERENCES ref_documents(ref_id)   -- 관련 있는 타문서
);

CREATE TABLE IF NOT EXISTS ref_headings (
    heading_id        TEXT PRIMARY KEY,          -- {ref_id}-H{level}-{seq}
    ref_id            TEXT NOT NULL REFERENCES ref_documents(ref_id),
    level             INTEGER NOT NULL CHECK (level IN (1, 2, 3)),  -- 1=대 2=중 3=소
    title             TEXT NOT NULL,
    parent_heading_id TEXT REFERENCES ref_headings(heading_id)
);

CREATE TABLE IF NOT EXISTS ref_req_similarity (
    heading_id TEXT NOT NULL REFERENCES ref_headings(heading_id),
    req_id     TEXT NOT NULL REFERENCES requirements(req_id),
    score      REAL NOT NULL CHECK (score BETWEEN 0 AND 1),
    method     TEXT NOT NULL DEFAULT 'claude',
    PRIMARY KEY (heading_id, req_id)
);
