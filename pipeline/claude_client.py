"""Claude API 래퍼.

용어 정의(룰 0), 요구사항 중복도(룰 0), 초안 작성에 쓰인다.
API 키가 없거나 호출이 실패하면 오프라인 폴백(difflib/서식 기반)으로 내려간다.
"""
from __future__ import annotations

import difflib
import json
import os

MODEL = "claude-opus-5"

try:
    import anthropic
except ImportError:  # SDK 미설치 환경에서도 파이프라인 나머지는 동작해야 한다
    anthropic = None


def _client():
    if anthropic is None:
        return None
    # ANTHROPIC_API_KEY / ANTHROPIC_AUTH_TOKEN / ant 프로필 순으로 자격증명 해석
    if not (os.environ.get("ANTHROPIC_API_KEY") or os.environ.get("ANTHROPIC_AUTH_TOKEN")):
        return None
    return anthropic.Anthropic()


def _first_text(response) -> str | None:
    if response.stop_reason == "refusal":
        return None
    for block in response.content:
        if block.type == "text":
            return block.text
    return None


def define_term(term: str, context_sentences: list[str]) -> tuple[str, str]:
    """용어 정의 초안. 반환: (정의문, defined_by). 사람 검토는 별도 단계."""
    client = _client()
    if client is None:
        return (f"[검토 필요] '{term}' — 요구사항 문맥에서 추출된 용어 (정의 초안 없음)", "graphify")
    try:
        response = client.messages.create(
            model=MODEL,
            max_tokens=1024,
            system="공공기관 제안서/보고서의 용어 정의표를 작성하는 조수다. "
                   "정의는 한국어 한두 문장, 명사형 종결로 쓴다.",
            messages=[{
                "role": "user",
                "content": "용어: {t}\n등장 문맥:\n{c}\n\n이 용어의 정의를 작성하라.".format(
                    t=term, c="\n".join(f"- {s}" for s in context_sentences[:5])
                ),
            }],
        )
        text = _first_text(response)
        if text:
            return (text.strip(), "claude")
    except Exception:
        pass
    return (f"[검토 필요] '{term}' — 정의 생성 실패", "graphify")


def similarity(text_a: str, text_b: str) -> tuple[float, str, str]:
    """두 문장의 중복도. 반환: (0~1 점수, method, 근거)."""
    client = _client()
    if client is not None:
        schema = {
            "type": "object",
            "properties": {
                "score": {"type": "number"},
                "rationale": {"type": "string"},
            },
            "required": ["score", "rationale"],
            "additionalProperties": False,
        }
        try:
            response = client.messages.create(
                model=MODEL,
                max_tokens=512,
                output_config={"format": {"type": "json_schema", "schema": schema}},
                messages=[{
                    "role": "user",
                    "content": "다음 두 요구사항 문장의 의미 중복도를 0~1 사이 score로 평가하고 "
                               f"근거를 rationale에 한 문장으로 써라.\nA: {text_a}\nB: {text_b}",
                }],
            )
            text = _first_text(response)
            if text:
                data = json.loads(text)
                return (max(0.0, min(1.0, float(data["score"]))), "claude", data["rationale"])
        except Exception:
            pass
    score = difflib.SequenceMatcher(None, text_a, text_b).ratio()
    return (round(score, 3), "difflib", "문자열 유사도(오프라인 폴백)")


def draft_section(role: str, brief: str, requirements: list[str]) -> str | None:
    """본문 섹션 초안. role은 프롬프트에 그대로 들어가는 작성 지침이다.

    긴 출력이 될 수 있으므로 스트리밍으로 요청한다. 실패 시 None(호출부에서 폴백).
    """
    client = _client()
    if client is None:
        return None
    try:
        with client.messages.stream(
            model=MODEL,
            max_tokens=16000,
            system=role,
            messages=[{
                "role": "user",
                "content": "작성 지시:\n{b}\n\n관련 요구사항:\n{r}".format(
                    b=brief, r="\n".join(f"- {s}" for s in requirements) or "- (없음)"
                ),
            }],
        ) as stream:
            response = stream.get_final_message()
        return _first_text(response)
    except Exception:
        return None
