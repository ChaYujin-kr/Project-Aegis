"""hwpx(OWPML) 출력기 — 외부 라이브러리 없이 표준 zip/xml로 생성.

템플릿 규칙 적용:
  · 제목 글꼴 휴먼헤드라인 / 본문 휴먼명조 (1.2.3)
  · 기본 13pt, 대>중>소 제목 크기 (1.2.2 — DB CHECK로도 강제)
  · 강조는 bold / italic / red 만 (1.2.4)
  · 글머리표 ㅁ -> ㅇ -> - (1.2.5)

hwpx는 zip 컨테이너이며 최소 구성은:
  mimetype, version.xml, META-INF/container.xml, META-INF/manifest.xml,
  Contents/content.hpf, Contents/header.xml, Contents/section0.xml, settings.xml
"""
from __future__ import annotations

import sqlite3
import zipfile
from pathlib import Path
from xml.sax.saxutils import escape

from .structure import Block, DocumentModel, validate

NS_HEAD = "http://www.hancom.co.kr/hwpml/2011/head"
NS_PARA = "http://www.hancom.co.kr/hwpml/2011/paragraph"
NS_SEC = "http://www.hancom.co.kr/hwpml/2011/section"

# charPr id 배치: 0=본문 1=대제목 2=중제목 3=소제목 4=bold 5=italic 6=red
CHAR_BODY, CHAR_H1, CHAR_H2, CHAR_H3, CHAR_BOLD, CHAR_ITALIC, CHAR_RED = range(7)
_EMPHASIS_TO_CHAR = {"bold": CHAR_BOLD, "italic": CHAR_ITALIC, "red": CHAR_RED}


def _pt100(pt: float) -> int:
    return int(round(pt * 100))


def _version_xml() -> str:
    return (
        '<?xml version="1.0" encoding="UTF-8" standalone="yes"?>\n'
        '<hv:HCFVersion xmlns:hv="http://www.hancom.co.kr/hwpml/2011/version" '
        'tagetApplication="WORDPROCESSOR" major="5" minor="0" micro="5" buildNumber="0" '
        'os="1" xmlVersion="1.4" application="Hancom Office Hangul" appVersion="9, 1, 1, 5656"/>'
    )


def _container_xml() -> str:
    return (
        '<?xml version="1.0" encoding="UTF-8" standalone="yes"?>\n'
        '<ocf:container xmlns:ocf="urn:oasis:names:tc:opendocument:xmlns:container" '
        'xmlns:hpf="http://www.hancom.co.kr/schema/2011/hpf">\n'
        '  <ocf:rootfiles>\n'
        '    <ocf:rootfile full-path="Contents/content.hpf" '
        'media-type="application/hwpml-package+xml"/>\n'
        '  </ocf:rootfiles>\n'
        '</ocf:container>'
    )


def _manifest_xml() -> str:
    entries = [
        ("/", "application/hwp+zip"),
        ("version.xml", "text/xml"),
        ("Contents/content.hpf", "application/hwpml-package+xml"),
        ("Contents/header.xml", "application/xml"),
        ("Contents/section0.xml", "application/xml"),
        ("settings.xml", "application/xml"),
    ]
    items = "\n".join(
        f'  <odf:file-entry odf:full-path="{p}" odf:media-type="{m}"/>' for p, m in entries
    )
    return (
        '<?xml version="1.0" encoding="UTF-8" standalone="yes"?>\n'
        '<odf:manifest xmlns:odf="urn:oasis:names:tc:opendocument:xmlns:manifest:1.0">\n'
        f"{items}\n</odf:manifest>"
    )


def _content_hpf(title: str, author: str, created_at: str) -> str:
    return (
        '<?xml version="1.0" encoding="UTF-8" standalone="yes"?>\n'
        '<opf:package xmlns:opf="http://www.idpf.org/2007/opf/" '
        'xmlns:dc="http://purl.org/dc/elements/1.1/" version="" unique-identifier="" id="">\n'
        '  <opf:metadata>\n'
        f'    <opf:title>{escape(title)}</opf:title>\n'
        f'    <opf:language>ko</opf:language>\n'
        f'    <opf:meta name="creator" content="{escape(author)}"/>\n'
        f'    <opf:meta name="CreatedDate" content="{escape(created_at)}"/>\n'
        '  </opf:metadata>\n'
        '  <opf:manifest>\n'
        '    <opf:item id="header" href="Contents/header.xml" media-type="application/xml"/>\n'
        '    <opf:item id="section0" href="Contents/section0.xml" media-type="application/xml"/>\n'
        '    <opf:item id="settings" href="settings.xml" media-type="application/xml"/>\n'
        '  </opf:manifest>\n'
        '  <opf:spine>\n'
        '    <opf:itemref idref="header" linear="yes"/>\n'
        '    <opf:itemref idref="section0" linear="yes"/>\n'
        '  </opf:spine>\n'
        '</opf:package>'
    )


def _settings_xml() -> str:
    return (
        '<?xml version="1.0" encoding="UTF-8" standalone="yes"?>\n'
        '<ha:HWPApplicationSetting xmlns:ha="http://www.hancom.co.kr/hwpml/2011/app">\n'
        '  <ha:CaretPosition listIDRef="0" paraIDRef="0" pos="0"/>\n'
        '</ha:HWPApplicationSetting>'
    )


_LANGS = ("hangul", "latin", "hanja", "japanese", "other", "symbol", "user")


def _lang_attrs(value: int | str) -> str:
    return " ".join(f'{lang}="{value}"' for lang in _LANGS)


def _char_pr(pr_id: int, font_id: int, size_pt: float,
             bold: bool = False, italic: bool = False, color: str = "#000000") -> str:
    flags = ""
    if bold:
        flags += "<hh:bold/>"
    if italic:
        flags += "<hh:italic/>"
    return (
        f'<hh:charPr id="{pr_id}" height="{_pt100(size_pt)}" textColor="{color}" '
        'shadeColor="none" useFontSpace="0" useKerning="0" symMark="NONE" borderFillIDRef="0">'
        f'<hh:fontRef {_lang_attrs(font_id)}/>'
        f'<hh:ratio {_lang_attrs(100)}/>'
        f'<hh:spacing {_lang_attrs(0)}/>'
        f'<hh:relSz {_lang_attrs(100)}/>'
        f'<hh:offset {_lang_attrs(0)}/>'
        f'{flags}'
        '</hh:charPr>'
    )


def _header_xml(template: sqlite3.Row) -> str:
    body_font, title_font = template["body_font"], template["title_font"]
    fonts = "".join(
        f'<hh:fontface lang="{lang}" fontCnt="2">'
        f'<hh:font id="0" face="{escape(body_font)}" type="TTF" isEmbedded="0"/>'
        f'<hh:font id="1" face="{escape(title_font)}" type="TTF" isEmbedded="0"/>'
        '</hh:fontface>'
        for lang in ("HANGUL", "LATIN", "HANJA", "JAPANESE", "OTHER", "SYMBOL", "USER")
    )
    base = template["base_size_pt"]
    char_prs = "".join([
        _char_pr(CHAR_BODY, 0, base),
        _char_pr(CHAR_H1, 1, template["h1_size_pt"], bold=True),
        _char_pr(CHAR_H2, 1, template["h2_size_pt"], bold=True),
        _char_pr(CHAR_H3, 1, template["h3_size_pt"], bold=True),
        _char_pr(CHAR_BOLD, 0, base, bold=True),
        _char_pr(CHAR_ITALIC, 0, base, italic=True),
        _char_pr(CHAR_RED, 0, base, color="#FF0000"),
    ])
    para_pr = (
        '<hh:paraPr id="0" tabPrIDRef="0" condense="0" fontLineHeight="0" '
        'snapToGrid="1" suppressLineNumbers="0" checked="0">'
        '<hh:align horizontal="JUSTIFY" vertical="BASELINE"/>'
        '<hh:lineSpacing type="PERCENT" value="160" unit="HWPUNIT"/>'
        '</hh:paraPr>'
    )
    style = (
        '<hh:style id="0" type="PARA" name="바탕글" engName="Normal" '
        'paraPrIDRef="0" charPrIDRef="0" nextStyleIDRef="0" langID="1042" lockForm="0"/>'
    )
    return (
        '<?xml version="1.0" encoding="UTF-8" standalone="yes"?>\n'
        f'<hh:head xmlns:hh="{NS_HEAD}" version="1.4" secCnt="1">\n'
        '<hh:beginNum page="1" footnote="1" endnote="1" pic="1" tbl="1" equation="1"/>\n'
        '<hh:refList>\n'
        f'<hh:fontfaces itemCnt="7">{fonts}</hh:fontfaces>\n'
        '<hh:borderFills itemCnt="1">'
        '<hh:borderFill id="0" threeD="0" shadow="0" centerLine="NONE" breakCellSeparateLine="0">'
        '<hh:slash type="NONE" Crooked="0" isCounter="0"/>'
        '<hh:backSlash type="NONE" Crooked="0" isCounter="0"/>'
        '<hh:leftBorder type="NONE" width="0.1 mm" color="#000000"/>'
        '<hh:rightBorder type="NONE" width="0.1 mm" color="#000000"/>'
        '<hh:topBorder type="NONE" width="0.1 mm" color="#000000"/>'
        '<hh:bottomBorder type="NONE" width="0.1 mm" color="#000000"/>'
        '<hh:diagonal type="SOLID" width="0.1 mm" color="#000000"/>'
        '</hh:borderFill></hh:borderFills>\n'
        f'<hh:charProperties itemCnt="7">{char_prs}</hh:charProperties>\n'
        '<hh:tabProperties itemCnt="1">'
        '<hh:tabPr id="0" autoTabLeft="0" autoTabRight="0"/></hh:tabProperties>\n'
        f'<hh:paraProperties itemCnt="1">{para_pr}</hh:paraProperties>\n'
        f'<hh:styles itemCnt="1">{style}</hh:styles>\n'
        '</hh:refList>\n'
        '</hh:head>'
    )


_SEC_PR = (
    '<hp:secPr id="" textDirection="HORIZONTAL" spaceColumns="1134" tabStop="8000" '
    'tabStopVal="4000" tabStopUnit="HWPUNIT" outlineShapeIDRef="1" memoShapeIDRef="0" '
    'textVerticalWidthHead="0" masterPageCnt="0">'
    '<hp:grid lineGrid="0" charGrid="0" wonggojiFormat="0" strtNum="0"/>'
    '<hp:startNum pageStartsOn="BOTH" page="0" pic="0" tbl="0" equation="0"/>'
    '<hp:visibility hideFirstHeader="0" hideFirstFooter="0" hideFirstMasterPage="0" '
    'border="SHOW_ALL" fill="SHOW_ALL" hideFirstPageNum="0" hideFirstEmptyLine="0" '
    'showLineNumber="0"/>'
    '<hp:pagePr landscape="WIDELY" width="59528" height="84188" gutterType="LEFT_ONLY">'
    '<hp:margin header="4252" footer="4252" gutter="0" left="8504" right="8504" '
    'top="5668" bottom="4252"/></hp:pagePr>'
    '</hp:secPr>'
)


def _paragraph(text: str, char_id: int, first: bool = False) -> str:
    sec = _SEC_PR if first else ""
    body = f"<hp:t>{escape(text)}</hp:t>" if text else "<hp:t/>"
    return (
        '<hp:p id="0" paraPrIDRef="0" styleIDRef="0" pageBreak="0" columnBreak="0" merged="0">'
        f'<hp:run charPrIDRef="{char_id}">{sec}{body}</hp:run>'
        '</hp:p>'
    )


def _blocks_from_model(model: DocumentModel, template: sqlite3.Row) -> list[Block]:
    """DocumentModel -> 순서 있는 Block 목록 (시작-중간-끝)."""
    b: list[Block] = []
    # ---- 시작(1.1): 표지 / 목차 / 버전 관리 / 용어 정의 ----
    b.append(Block(model.title, level=1))
    b.append(Block(f"작성: {model.author_cover}", emphasis="bold"))
    b.append(Block(f"작성일: {model.created_at}"))
    b.append(Block(""))
    b.append(Block("목차", level=2))
    b.extend(Block(item, bullet_level=1) for item in model.toc())
    b.append(Block(""))
    b.append(Block("문서 버전 관리", level=2))
    for version, changed_at, note in model.versions:
        b.append(Block(f"{version} | {changed_at} | {model.author_version} | {note}",
                       bullet_level=1))
    b.append(Block(""))
    b.append(Block("용어 정의", level=2))
    for term, definition in model.terms:
        b.append(Block(f"{term}: {definition}", bullet_level=1))
    b.append(Block(""))
    # ---- 중간(1.2): 서론 - 본론 - 결론 ----
    b.append(Block("1. 서론", level=1))
    if model.intro:
        b.append(Block(model.intro.hook, emphasis="bold"))
        b.append(Block(f"문제정의: {model.intro.problem}"))
        b.append(Block(f"문서주제: {model.intro.topic}"))
        b.append(Block(f"기대효과: {model.intro.expected_effect}"))
    b.append(Block(""))
    b.append(Block("2. 본론", level=1))
    for i, arg in enumerate(model.arguments, 1):
        b.append(Block(f"2.{i}. {arg.claim}", level=2, sincerity=arg.sincerity))
        for ev in arg.evidences:
            b.append(Block(ev.text, bullet_level=1, sincerity=arg.sincerity))
            for case in ev.cases:
                b.append(Block(case, bullet_level=2, sincerity=arg.sincerity))
    b.append(Block(""))
    b.append(Block("3. 결론", level=1))
    b.append(Block(model.conclusion_summary))
    b.append(Block(model.conclusion_restate, emphasis="red"))
    b.append(Block(""))
    # ---- 끝(1.3): 목표모델 + 클로징 ----
    b.append(Block("4. 목표모델", level=1))
    b.append(Block(model.target_model))
    b.append(Block(model.closing, emphasis="italic"))
    return b


def _section_xml(blocks: list[Block], template: sqlite3.Row) -> str:
    bullets = {1: template["bullet_level1"], 2: template["bullet_level2"],
               3: template["bullet_level3"]}
    level_to_char = {1: CHAR_H1, 2: CHAR_H2, 3: CHAR_H3}
    paras = []
    for i, block in enumerate(blocks):
        if block.level in level_to_char:
            char_id = level_to_char[block.level]
        elif block.emphasis:
            char_id = _EMPHASIS_TO_CHAR[block.emphasis]
        else:
            char_id = CHAR_BODY
        text = block.text
        if block.bullet_level:
            text = f"{bullets[block.bullet_level]} {text}"   # 룰 1.2.5
        paras.append(_paragraph(text, char_id, first=(i == 0)))
    return (
        '<?xml version="1.0" encoding="UTF-8" standalone="yes"?>\n'
        f'<hs:sec xmlns:hs="{NS_SEC}" xmlns:hp="{NS_PARA}">\n'
        + "\n".join(paras)
        + "\n</hs:sec>"
    )


def write_hwpx(model: DocumentModel, template: sqlite3.Row,
               out_path: str | Path) -> Path:
    """룰 검증 후 hwpx 파일을 만든다. 위반이 있으면 ValueError."""
    errors = validate(model)
    if errors:
        raise ValueError("문서 구조 룰 위반:\n" + "\n".join(f"  - {e}" for e in errors))
    if template["file_format"] != "hwpx":
        raise ValueError("출력값은 hwpx만 지원한다 (룰 1.2.1)")

    out_path = Path(out_path)
    out_path.parent.mkdir(parents=True, exist_ok=True)
    blocks = _blocks_from_model(model, template)

    with zipfile.ZipFile(out_path, "w", zipfile.ZIP_DEFLATED) as zf:
        # mimetype은 압축 없이 첫 엔트리여야 한다
        zf.writestr(zipfile.ZipInfo("mimetype"), "application/hwp+zip",
                    compress_type=zipfile.ZIP_STORED)
        zf.writestr("version.xml", _version_xml())
        zf.writestr("META-INF/container.xml", _container_xml())
        zf.writestr("META-INF/manifest.xml", _manifest_xml())
        zf.writestr("Contents/content.hpf",
                    _content_hpf(model.title, model.author_cover, model.created_at))
        zf.writestr("Contents/header.xml", _header_xml(template))
        zf.writestr("Contents/section0.xml", _section_xml(blocks, template))
        zf.writestr("settings.xml", _settings_xml())
    return out_path
