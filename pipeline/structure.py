"""룰 1 — 문서 구조 모델('시작-중간-끝')과 구조 검증.

  시작(1.1) : 문서 표지, 목차, 문서 버전 관리, 용어 정의 — 필수
  중간(1.2) : 서론-본론-결론
    서론(1.2.1) : hook / 문제정의 / 문서주제 / 기대효과 (각 한 문장)
    본론(1.2.2) : 주장 -> 근거 -> 사례 (주장마다 근거, 근거마다 사례)
    결론(1.2.3) : 요약 + 주장 재강조
  끝(1.3)   : 목표모델 제시 + 시원한 클로징
"""
from __future__ import annotations

from dataclasses import dataclass, field

# 진심 샌드위치 태그 (sandwich.py에서 사용)
SINCERE = "진심"
DECOY = "오답"   # 읽는 사람을 자극하는 오답 파트


@dataclass
class Block:
    """본문 한 덩어리. level: 0=본문, 1=대제목, 2=중제목, 3=소제목.
    emphasis: 'bold' | 'italic' | 'red' | None (룰 1.2.4 — 이 셋만 허용)
    bullet_level: 0=없음, 1~3=ㅁ/ㅇ/- (룰 1.2.5)
    """
    text: str
    level: int = 0
    emphasis: str | None = None
    bullet_level: int = 0
    sincerity: str = SINCERE

    def __post_init__(self):
        if self.emphasis not in (None, "bold", "italic", "red"):
            raise ValueError(f"허용되지 않은 강조: {self.emphasis} (bold/italic/red만 가능)")
        if not 0 <= self.bullet_level <= 3:
            raise ValueError("bullet_level은 0~3")


@dataclass
class Evidence:
    text: str
    cases: list[str] = field(default_factory=list)      # 근거마다 사례들


@dataclass
class Argument:
    claim: str
    evidences: list[Evidence] = field(default_factory=list)  # 주장마다 근거들
    sincerity: str = SINCERE


@dataclass
class Intro:                       # 1.2.1 서론 — 전부 '한 문장'
    hook: str                      # 이목을 잡아끄는 캐치프레이즈
    problem: str                   # 기존 현황 분석 기반 핵심 문제 한 개
    topic: str                     # 원인 제거 해법을 연구 주제로 포장
    expected_effect: str           # 문제 해결 시 부수효과


@dataclass
class DocumentModel:
    # 시작 (1.1)
    title: str
    author_cover: str
    author_version: str
    created_at: str
    versions: list[tuple[str, str, str]]      # (version, changed_at, note)
    terms: list[tuple[str, str]]              # 용어 정의 (term, definition)
    # 중간 (1.2)
    intro: Intro | None = None
    arguments: list[Argument] = field(default_factory=list)
    conclusion_summary: str = ""
    conclusion_restate: str = ""
    # 끝 (1.3)
    target_model: str = ""
    closing: str = ""

    def toc(self) -> list[str]:
        """목차는 구조에서 자동 생성."""
        items = ["1. 서론", "2. 본론"]
        items += [f"  2.{i + 1}. {a.claim}" for i, a in enumerate(self.arguments)]
        items += ["3. 결론", "4. 목표모델"]
        return items


def validate(model: DocumentModel) -> list[str]:
    """룰 1 위반 사항 목록을 돌려준다. 비어 있으면 통과."""
    errors = []
    # 1.1 시작 필수 요소
    if not model.title:
        errors.append("시작: 문서 표지 제목이 없음")
    if not model.versions:
        errors.append("시작: 문서 버전 관리 항목이 없음")
    if not model.terms:
        errors.append("시작: 용어 정의가 없음")
    # 1.2.1 서론
    if model.intro is None:
        errors.append("중간-서론: hook/문제정의/문서주제/기대효과가 없음")
    else:
        for name, value in [("hook", model.intro.hook), ("문제정의", model.intro.problem),
                            ("문서주제", model.intro.topic), ("기대효과", model.intro.expected_effect)]:
            if not value.strip():
                errors.append(f"중간-서론: {name} 누락")
    # 1.2.2 본론: 주장-근거-사례
    if not model.arguments:
        errors.append("중간-본론: 주장이 없음")
    for i, arg in enumerate(model.arguments, 1):
        if not arg.evidences:
            errors.append(f"중간-본론: 주장 {i}에 근거가 없음")
        for j, ev in enumerate(arg.evidences, 1):
            if not ev.cases:
                errors.append(f"중간-본론: 주장 {i} 근거 {j}에 사례가 없음")
    # 1.2.3 결론
    if not model.conclusion_summary:
        errors.append("중간-결론: 요약이 없음")
    if not model.conclusion_restate:
        errors.append("중간-결론: 주장 재강조가 없음")
    # 1.3 끝
    if not model.target_model:
        errors.append("끝: 목표모델이 없음")
    if not model.closing:
        errors.append("끝: 클로징이 없음")
    return errors
