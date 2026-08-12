"""입력DB 접근 + 기본값(자동입력) 생성.

기본값 규칙(입력DB 0):
  · 문서ID   : 할머니폴더·엄마폴더 이름 각각에서 뽑은 알파벳 + 일련번호 숫자 조합
  · 문서제목 : 엄마폴더 이름
  · 작성자   : 표지=웨어비즈 컨소시엄 / 버전관리=한국인프라 차유진 (스키마 DEFAULT)
  · 작성일   : 시스템 측정값
"""
from __future__ import annotations

import hashlib
import re
import sqlite3
from datetime import datetime
from pathlib import Path

SCHEMA_PATH = Path(__file__).parent / "schema.sql"
DEFAULT_DB_PATH = Path(__file__).parent / "pipeline.db"

AUTHOR_COVER = "웨어비즈 컨소시엄"
AUTHOR_VERSION = "한국인프라 차유진"


def connect(db_path: str | Path = DEFAULT_DB_PATH) -> sqlite3.Connection:
    conn = sqlite3.connect(str(db_path))
    conn.row_factory = sqlite3.Row
    conn.execute("PRAGMA foreign_keys = ON")
    conn.executescript(SCHEMA_PATH.read_text(encoding="utf-8"))
    # 기본 템플릿이 없으면 하나 만들어 둔다 (룰 1.2 기본값 그대로)
    if conn.execute("SELECT COUNT(*) FROM templates").fetchone()[0] == 0:
        conn.execute("INSERT INTO templates DEFAULT VALUES")
        conn.commit()
    return conn


def now() -> str:
    return datetime.now().isoformat(timespec="seconds")


def _alpha_code(name: str, length: int = 3) -> str:
    """폴더 이름 -> 알파벳 코드. 영문자가 없으면 해시에서 알파벳만 취한다."""
    letters = re.sub(r"[^A-Za-z]", "", name).upper()
    if len(letters) < length:
        digest = hashlib.sha1(name.encode("utf-8")).hexdigest().upper()
        letters += re.sub(r"[^A-Z]", "", digest)
    return letters[:length]


def make_doc_id(conn: sqlite3.Connection, source_dir: str | Path) -> str:
    """할머니폴더/엄마폴더 이름으로 '알파벳+숫자' 문서ID를 만든다."""
    p = Path(source_dir).resolve()
    mom, grandma = p.name, p.parent.name
    prefix = f"{_alpha_code(grandma)}{_alpha_code(mom)}"
    seq = conn.execute(
        "SELECT COUNT(*) FROM documents WHERE doc_id LIKE ?", (prefix + "%",)
    ).fetchone()[0] + 1
    return f"{prefix}{seq:04d}"


def create_document(
    conn: sqlite3.Connection,
    source_dir: str | Path,
    template_id: int = 1,
) -> str:
    """폴더를 기준으로 문서 레코드 생성. 기본값은 전부 자동입력."""
    source_dir = Path(source_dir).resolve()
    doc_id = make_doc_id(conn, source_dir)
    conn.execute(
        "INSERT INTO documents (doc_id, title, created_at, source_dir, template_id)"
        " VALUES (?, ?, ?, ?, ?)",
        (doc_id, source_dir.name, now(), str(source_dir), template_id),
    )
    conn.execute(
        "INSERT INTO doc_versions (doc_id, version, changed_at, note)"
        " VALUES (?, 'v0.1', ?, '최초 생성')",
        (doc_id, now()),
    )
    conn.commit()
    return doc_id


def add_version(conn: sqlite3.Connection, doc_id: str, version: str, note: str = "") -> None:
    conn.execute(
        "INSERT INTO doc_versions (doc_id, version, changed_at, note) VALUES (?, ?, ?, ?)",
        (doc_id, version, now(), note),
    )
    conn.commit()


def get_document(conn: sqlite3.Connection, doc_id: str) -> sqlite3.Row:
    row = conn.execute("SELECT * FROM documents WHERE doc_id = ?", (doc_id,)).fetchone()
    if row is None:
        raise KeyError(f"문서를 찾을 수 없습니다: {doc_id}")
    return row


def get_template(conn: sqlite3.Connection, template_id: int) -> sqlite3.Row:
    row = conn.execute(
        "SELECT * FROM templates WHERE template_id = ?", (template_id,)
    ).fetchone()
    if row is None:
        raise KeyError(f"템플릿을 찾을 수 없습니다: {template_id}")
    return row
