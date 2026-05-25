// LLM 대화 데이터 — 실제 경찰 업무 시나리오 + 가벼운 업무 자동화
window.CONVERSATIONS = {

  // ============================================================
  // 1) 차량 추적 (기존)
  // ============================================================
  'vehicle-track': {
    title: '차량 추적 — 7나 1234 사건',
    meta: '분류: 대내전용 · 사건번호 2026-사이버-0418 · 감사ID #A82F-91C2',
    model: 'police-llm-13b',
    agents: [
      { name: '@차량조회', sys: 'KOR-VEH-DB · KICS' },
      { name: '@화질개선', sys: 'plate-enhance-v2' },
      { name: '@OCR', sys: 'k-ocr-v3' },
    ],
    systems: ['KOR-VEH-DB', 'KICS', '감사로그 API'],
    messages: [
      { who: 'user', name: '장지훈 경위', time: '14:32',
        body: `<div class="att-img"><div class="thumb"><svg width="14" height="14" viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.4"><rect x="2" y="3" width="12" height="10" rx="1"/><path d="m2 11 3-3 2 2 3-4 4 5"/></svg></div><div><div>CCTV_2026-05-19_14-12.jpg</div><div style="font-size:11px;color:var(--text-mut)">1.8 MB · 1920×1080</div></div></div><p>여의도 사거리 CCTV에서 잡힌 도주 차량입니다. 번호판이 흐릿한데 식별 가능하면 차주 정보까지 한 번에 정리해 줘.</p>`
      },
      { who: 'assistant', time: '14:32',
        body: `<p>차량 번호 식별 → 차량/소유주 조회를 순서대로 진행하겠습니다.</p>
${toolCall('화질개선 (plate-enhance-v2)', '번호판 ROI 320×120 → 4× SR · 노이즈 제거', '✓ 0.8s', 'PSNR ↑ 28.4 → 36.1dB · 출력: enhanced_plate_82fa.png')}
${toolCall('OCR (k-ocr-v3 / plate variant)', '한글 번호판 LPRNet · confidence 임계 0.85', '✓ 0.3s', '결과: <b style="color:var(--text)">7나 1234</b>  · conf 0.962')}
${toolCall('차량조회 (KOR-VEH-DB)', '자동차등록원부 · 영장범위: 2026-사이버-0418', '✓ 1.2s', 'SELECT * FROM vehicles WHERE plate = &#39;7나1234&#39; LIMIT 1\n→ 1 row')}
<p style="margin-top:14px;">조회 결과를 정리했습니다.</p>
<div style="border:1px solid var(--border); border-radius: var(--r-md); overflow:hidden; margin: 8px 0;">
  <table class="tbl" style="font-size:13px;">
    <tbody>
      <tr><td style="width:35%;color:var(--text-mut);">차량번호</td><td class="mono" style="color:var(--text)">7나 1234</td></tr>
      <tr><td style="color:var(--text-mut);">차종 · 색상</td><td>현대 그랜저 (IG) · 검정</td></tr>
      <tr><td style="color:var(--text-mut);">소유주</td><td>김○○ <span class="chip green">실명일치</span></td></tr>
      <tr><td style="color:var(--text-mut);">전과 / 관련사건</td><td>관련 사건 2건 (2024-마약-0091, 2025-사기-2231)</td></tr>
    </tbody>
  </table>
</div>
<p>관련 사건 2건이 검색되어 <code>@사건조회</code> 에이전트를 추가로 호출할까요?<sup style="color:var(--accent)">[1][2]</sup></p>`,
        citations: [
          { ix: 1, label: '자동차등록원부 데이터 · KOR-VEH-DB', sub: '/ vehicles 테이블 · 2026-05-19 14:32', type: 'DB' },
          { ix: 2, label: '경찰청 정보화기획단 — 통신·차량 조회 운영 지침 §3.2', sub: '/ 영장 기반 조회 절차', type: 'DOC' },
        ]
      },
    ],
    sources: [
      { ix: 1, title: '자동차등록원부', snippet: 'vehicles 테이블 · 7나1234 행 1건 매칭', meta: 'KOR-VEH-DB · 14:32', type: 'DB' },
      { ix: 2, title: '통신·차량 조회 운영 지침 §3.2', snippet: '"영장 기반 조회 시 사건번호 단위로 범위를 한정하며…"', meta: 'policy-2025-v3.pdf p.14', type: 'DOC' },
    ],
    warrant: '2026-사이버-0418 · 만료 2026-06-12',
  },

  // ============================================================
  // 2) 통신자료(CDR) 요약 — Pandas + GraphAgent
  // ============================================================
  'cdr-summary': {
    title: '통신 자료 요약 (2026-W19)',
    meta: '사건 2026-사이버-0418 · 통신비밀보호법 13조 / 감사ID #B14E-22A1',
    model: 'police-llm-13b · CDR-summarizer',
    agents: [
      { name: '@CDR요약', sys: 'KT/SKT/LGU+ 통신자료 표준' },
      { name: '@통신그래프', sys: 'Neo4j · neo-cdr' },
      { name: '@PII마스킹', sys: 'face-redact / pii-redact-v2' },
    ],
    systems: ['통신자료 ETL', 'Neo4j neo-cdr', '감사로그 API'],
    messages: [
      { who: 'user', name: '장지훈 경위', time: '11:02',
        body: `<div class="att-img"><div class="thumb">📄</div><div><div>CDR_김○○_2026-W19.csv</div><div style="font-size:11px;color:var(--text-mut)">4,182 행 · 7일치</div></div></div><p>피의자 김○○의 1주일치 CDR이야. 자주 통화한 상위 5개 번호, 새벽 통화 패턴, 평소와 다른 발신 위치를 요약해줘.</p>`
      },
      { who: 'assistant', time: '11:02',
        body: `${toolCall('CDR요약', 'Pandas ETL · 통화 빈도/지속/시간대 집계', '✓ 1.4s', '총 4,182건 · 고유 상대번호 312개 · 야간(22–04시) 통화 비중 23%')}
${toolCall('통신그래프', '발/수신 그래프 빌드 · 1-hop 자주통화', '✓ 0.6s', '노드 313 · 엣지 4,182 · 군집 4개 발견')}
${toolCall('PII마스킹', '응답 출력 시 번호 뒷 4자리 마스킹', '✓ 0.1s', '')}
<p style="margin-top:14px;">요약합니다.</p>
<table class="tbl" style="font-size:13px; margin:6px -4px;">
  <thead><tr><th>순위</th><th>상대번호</th><th>통화 건수</th><th>총 시간</th><th>주 시간대</th></tr></thead>
  <tbody>
    <tr><td>1</td><td class="mono">010-2***-****</td><td class="mono">412</td><td class="mono">8h 12m</td><td>22–02시</td></tr>
    <tr><td>2</td><td class="mono">010-7***-****</td><td class="mono">214</td><td class="mono">3h 04m</td><td>09–18시</td></tr>
    <tr><td>3</td><td class="mono">010-4***-****</td><td class="mono">188</td><td class="mono">2h 41m</td><td>혼합</td></tr>
    <tr><td>4</td><td class="mono">02-***-****</td><td class="mono">64</td><td class="mono">1h 22m</td><td>업무시간</td></tr>
    <tr><td>5</td><td class="mono">010-9***-****</td><td class="mono">52</td><td class="mono">38m</td><td>주말 새벽</td></tr>
  </tbody>
</table>
<p style="margin-top:8px;"><b style="color:var(--text)">이상 패턴:</b> 1순위 번호와의 통화 중 78%가 22–04시에 집중되어 있어 평상 통화 패턴(주간 60%)과 크게 다릅니다. 또한 4/15부터 발신 기지국이 인천 부평구 → 서울 영등포구로 이전되어 사용자 동선 변화가 추정됩니다.<sup style="color:var(--accent)">[1][2]</sup></p>
<p>1순위 번호 가입자 조회는 별도 영장이 필요합니다. 통신사실확인자료 신청서 초안을 작성할까요?</p>`,
        citations: [
          { ix: 1, label: 'CDR_김○○_2026-W19.csv', sub: '/ ETL 결과 · neo-cdr', type: 'DB' },
          { ix: 2, label: '기지국 위치 색인 (LBS)', sub: '/ ETRI LBS 표준', type: 'GEO' },
        ]
      },
    ],
    sources: [
      { ix: 1, title: 'CDR_김○○_2026-W19', snippet: '통화 4,182건 · 고유번호 312', meta: 'CDR-ETL · 11:02', type: 'DB' },
      { ix: 2, title: '기지국 위치 색인', snippet: '인천 부평구 → 서울 영등포구 이전 (4/15)', meta: 'LBS', type: 'GEO' },
    ],
    warrant: '2026-사이버-0418 · 통신사실확인자료',
  },

  // ============================================================
  // 3) SNS 위협 발언 — GraphRAG
  // ============================================================
  'sns-threat': {
    title: 'SNS 상 위협 발언 분류',
    meta: '사이버 침해사고 #2026-118 · 모니터링 자동 수집',
    model: 'police-llm-13b · GraphRAG',
    agents: [
      { name: '@SNS수집', sys: 'X / 텔레그램 / 디씨 (공개 API)' },
      { name: '@위협분류', sys: 'threat-classify-v3' },
      { name: '@GraphRAG', sys: 'Neo4j · 위협-인물-사건 그래프' },
      { name: '@영장청구초안', sys: '법령정보 RAG' },
    ],
    systems: ['SNS 모니터링 파이프라인', 'Neo4j threat-graph', '국가법령정보센터'],
    messages: [
      { who: 'user', name: '장지훈 경위', time: '09:34',
        body: `<p>지난 24시간 동안 수집된 위협성 게시물 중에서 실행 위험이 높은 5건만 추려서 보여줘. 동일 작성자 추정 관계도 같이.</p>`
      },
      { who: 'assistant', time: '09:34',
        body: `${toolCall('SNS수집', '24h 윈도우 · 키워드 셋 v7 · 공개 게시물만', '✓ 2.1s', '수집 2,408건 → 1차 필터 후 142건')}
${toolCall('위협분류', 'threat-classify-v3 · 다중 라벨 (실행성/대상/수단)', '✓ 0.8s', '고위험(실행성 ≥ 0.7) 11건')}
${toolCall('GraphRAG', '작성자-IP-기기 지문-언어 스타일 그래프 탐색', '✓ 1.6s', '동일 작성자 추정 클러스터 3개')}
<p style="margin-top:14px;">상위 5건 (위험도 내림차순)</p>
<table class="tbl" style="font-size:13px; margin:6px -4px;">
  <thead><tr><th>#</th><th>게시 시각</th><th>플랫폼</th><th>요지 (마스킹)</th><th>실행성</th><th>대상</th><th>클러스터</th></tr></thead>
  <tbody>
    <tr><td>1</td><td class="mono">05-19 03:14</td><td>X</td><td>특정 인물 거주지·일정 적시 위해 발언</td><td><span class="chip red">0.92</span></td><td>공인</td><td class="mono">C-α (3명)</td></tr>
    <tr><td>2</td><td class="mono">05-18 22:48</td><td>텔레그램</td><td>다중장소 동시 폭발 시나리오 공유</td><td><span class="chip red">0.88</span></td><td>다중</td><td class="mono">C-β (5명)</td></tr>
    <tr><td>3</td><td class="mono">05-19 01:02</td><td>디씨</td><td>학교명 + 무기 구매 정황</td><td><span class="chip amber">0.78</span></td><td>학교</td><td class="mono">C-γ</td></tr>
    <tr><td>4</td><td class="mono">05-18 19:30</td><td>X</td><td>관공서 시간대 적시 위협</td><td><span class="chip amber">0.74</span></td><td>관공서</td><td class="mono">C-α (3명)</td></tr>
    <tr><td>5</td><td class="mono">05-19 06:11</td><td>텔레그램</td><td>특정 종교시설 비방·위해</td><td><span class="chip amber">0.71</span></td><td>종교시설</td><td class="mono">—</td></tr>
  </tbody>
</table>
<p style="margin-top:8px;"><b style="color:var(--text)">클러스터 C-α</b> (1·4번)은 동일 작성자로 추정 (Jaccard 0.84, 문체 유사도 0.91). 1번 게시물에 대해 사이버수사대 긴급 추적 신청 + 통신자료 영장 청구가 우선되어야 합니다.</p>
<p>1번 게시물에 대한 통신자료 압수수색영장 청구서 초안을 작성할까요?<sup style="color:var(--accent)">[1][2]</sup></p>`,
        citations: [
          { ix: 1, label: 'GraphRAG: 위협-인물-사건 그래프', sub: '/ Neo4j · threat-graph', type: 'DB' },
          { ix: 2, label: '국가법령정보센터 — 통신비밀보호법 §13', sub: '/ 영장 청구 요건', type: 'DOC' },
        ]
      },
    ],
    sources: [
      { ix: 1, title: 'threat-graph 클러스터 C-α', snippet: '3명, 동일 IP 대역 + 동일 문체 패턴', meta: 'Neo4j · 09:34', type: 'DB' },
      { ix: 2, title: '통신비밀보호법 §13', snippet: '"검사 또는 사법경찰관은 수사를 위하여…"', meta: '법령정보 RAG law-v3', type: 'DOC' },
    ],
    warrant: '사이버 침해사고 #2026-118',
  },

  // ============================================================
  // 4) 폴넷 쿼카짤 자동 쪽지 — 가벼운 업무 자동화 (AX 예시)
  // ============================================================
  'polnet-quokka': {
    title: '폴넷 쿼카짤 쪽지 자동 발송',
    meta: '개인 자동화 · 사적 사용 · 분류: 대내전용',
    model: 'police-llm-13b',
    agents: [
      { name: '@폴넷검색', sys: '폴넷 게시판 API (사내)' },
      { name: '@폴넷쪽지', sys: '폴넷 쪽지 API (사내)' },
    ],
    systems: ['폴넷 게시판', '폴넷 쪽지함', '개인 즐겨찾기'],
    isPersonal: true,
    messages: [
      { who: 'user', name: '장지훈 경위', time: '12:14',
        body: `<p>폴넷 게시판에서 <b>"쿼카짤"</b> 검색해서 새로 올라온 글 있으면, <b>내가 즐겨찾기한 동료들</b>한테 자동으로 쪽지 보내줘. 메시지는 "오늘의 쿼카 한 컷 🐹 — 점심 든든히!" 정도로 부드럽게.</p>`
      },
      { who: 'assistant', time: '12:14',
        body: `<p>가벼운 사내 자동화네요. 작업 흐름을 만들어 실행해볼게요.</p>
${toolCall('폴넷검색', '게시판 = "유머마당" · 키워드 "쿼카짤" · 24h 이내', '✓ 0.4s', '신규 게시물 2건 발견:\n#142,802 "오늘의 쿼카 (사진 8장)"\n#142,815 "쿼카가 사과 먹는 짤"')}
${toolCall('내 즐겨찾기 로드', '폴넷 즐겨찾기 사용자 목록 가져오기', '✓ 0.2s', '7명 확인 (사이버수사대 4 · 교통과 2 · 정보화기획 1)')}
${toolCall('폴넷쪽지', '7명에게 쪽지 발송 · 본문 + 게시물 링크 2개', '✓ 1.1s', '발송 성공 7 / 실패 0')}
<p style="margin-top:14px;">발송 완료 ✅</p>
<table class="tbl" style="font-size:13px;margin:6px -4px;">
  <thead><tr><th>수신자</th><th>소속</th><th>상태</th></tr></thead>
  <tbody>
    <tr><td>이지원 경위</td><td>사이버수사대</td><td><span class="chip green">전달</span></td></tr>
    <tr><td>박서연 경사</td><td>사이버수사대</td><td><span class="chip green">전달</span></td></tr>
    <tr><td>최민호 경위</td><td>사이버수사대</td><td><span class="chip green">읽음</span></td></tr>
    <tr><td>한지영 경사</td><td>사이버수사대</td><td><span class="chip green">전달</span></td></tr>
    <tr><td>김태훈 경위</td><td>교통과</td><td><span class="chip green">전달</span></td></tr>
    <tr><td>정민재 경사</td><td>교통과</td><td><span class="chip green">전달</span></td></tr>
    <tr><td>강유리 주임</td><td>정보화기획단</td><td><span class="chip green">읽음</span></td></tr>
  </tbody>
</table>
<p style="margin-top:8px;">이 워크플로우를 <b>매일 점심 12시</b>에 자동 실행하도록 등록할까요? '내 워크스페이스 → 스케줄 에이전트'에 저장됩니다.</p>
<div class="row" style="gap:6px;margin-top:10px;">
  <button class="btn sm primary">매일 12시 자동 실행</button>
  <button class="btn sm">1회만 실행</button>
  <button class="btn sm ghost">에이전트로 저장</button>
</div>`,
      },
    ],
    sources: [
      { ix: 1, title: '폴넷 게시판 / 유머마당', snippet: '"쿼카짤" 검색 결과 신규 2건', meta: '폴넷 API · 12:14', type: 'API' },
    ],
    warrant: '해당 없음 (사내 시스템 · 개인 자동화)',
  },

  // ============================================================
  // 5) 진술 요약 (실종아동)
  // ============================================================
  'missing-child': {
    title: '실종아동 진술 요약 — 사례 #21-403',
    meta: '아동안전과 · 분류: 2급비밀 · 미성년자 PII 강화',
    model: 'police-llm-13b · summarize-extract',
    agents: [
      { name: '@음성받아쓰기', sys: 'voice-stt-kr (whisper-large-kr)' },
      { name: '@요약', sys: 'summarize-extract-v2' },
      { name: '@PII마스킹', sys: 'pii-redact-v2 (미성년 강화)' },
      { name: '@타임라인', sys: 'timeline-builder' },
    ],
    systems: ['진술 녹음 보관소', '실종아동찾기 시스템', 'KICS'],
    messages: [
      { who: 'user', name: '장지훈 경위', time: '13:18',
        body: `<div class="att-img"><div class="thumb">🎤</div><div><div>진술녹음_21-403_보호자.wav</div><div style="font-size:11px;color:var(--text-mut)">14분 22초 · 48kHz</div></div></div><p>보호자 진술 녹음이야. 시간순으로 정리하고, 마지막 목격 시점·장소·복장·동행자 키 포인트로 뽑아줘.</p>`
      },
      { who: 'assistant', time: '13:18',
        body: `${toolCall('음성받아쓰기', '한국어 STT · 화자분리 · 잡음 제거', '✓ 18s', '4,182자 텍스트 · 화자 2명')}
${toolCall('요약', '시간순 요약 + 키 엔티티 추출', '✓ 1.2s', '주요 사건 7개 · 엔티티 12개')}
${toolCall('PII마스킹', '미성년자 이름·학교명 자동 마스킹', '✓ 0.3s', '마스킹된 토큰 14개')}
${toolCall('타임라인', '시간 표현 정규화 → 타임라인 빌드', '✓ 0.4s', '7-point 타임라인')}
<p style="margin-top:14px;"><b style="color:var(--text)">핵심 요약</b></p>
<table class="tbl" style="font-size:13px;margin:6px -4px;">
  <tbody>
    <tr><td style="width:30%;color:var(--text-mut);">대상</td><td>K○○ (마스킹) · 9세</td></tr>
    <tr><td style="color:var(--text-mut);">마지막 목격</td><td>2026-05-18 17:42</td></tr>
    <tr><td style="color:var(--text-mut);">위치</td><td>○○초등학교 정문 인근 (마스킹) · CCTV 4대 반경</td></tr>
    <tr><td style="color:var(--text-mut);">복장</td><td>하늘색 후드 · 검정 백팩 · 흰 운동화</td></tr>
    <tr><td style="color:var(--text-mut);">동행자</td><td>없음 (모친 진술 기준)</td></tr>
    <tr><td style="color:var(--text-mut);">최근 변경</td><td>전날 야간 외출 시도 (모친 진술)</td></tr>
  </tbody>
</table>
<p style="margin-top:8px;">반경 800m CCTV 14대에 대해 <code>@CCTV시간매칭</code> 에이전트로 17:30–18:30 구간 자동 탐색을 권장합니다.</p>`,
      },
    ],
    sources: [
      { ix: 1, title: '진술녹음_21-403_보호자.wav', snippet: '4,182자 STT 결과', meta: 'voice-stt-kr · 13:18', type: 'FILE' },
    ],
    warrant: '실종아동 긴급조치 §9',
  },

  // ============================================================
  // 6) 압수영장 청구서 검토
  // ============================================================
  'warrant-review': {
    title: '압수영장 청구서 양식 검토',
    meta: '사건 2025-사기-2231 · 법무팀 사전검토',
    model: 'police-llm-13b · 법령RAG',
    agents: [
      { name: '@법령검색', sys: '국가법령정보센터 RAG (law-v3)' },
      { name: '@판례검색', sys: '대법원 종합법률정보' },
      { name: '@양식검사', sys: 'KICS 양식 검증기' },
    ],
    systems: ['국가법령정보센터', '대법원 종합법률정보', 'KICS'],
    messages: [
      { who: 'user', name: '장지훈 경위', time: '09:42',
        body: `<div class="att-img"><div class="thumb">📄</div><div><div>영장청구서_2025-사기-2231_초안.docx</div><div style="font-size:11px;color:var(--text-mut)">8 페이지</div></div></div><p>이 영장 청구서 초안 검토해줘. 법 조항·판례·양식 측면 모두.</p>`
      },
      { who: 'assistant', time: '09:42',
        body: `${toolCall('양식검사', 'KICS 양식 v2026.3 기준 필드 매핑', '✓ 0.4s', '미입력 필드 2 · 형식 오류 1')}
${toolCall('법령검색', 'law-v3 · 형사소송법 · 통신비밀보호법 인용 검증', '✓ 1.2s', '인용 4건 모두 유효 · §215 항 표기 정정 필요')}
${toolCall('판례검색', '최근 5년 유사 판례 매칭', '✓ 0.8s', '관련 판례 3건 (2023도12345 외)')}
<p style="margin-top:14px;"><b style="color:var(--text)">검토 결과 — 3건 수정 권장</b></p>
<ol style="margin:6px 0 0; padding-left:20px;">
  <li><b>p.2</b> "형사소송법 제215조 1항" → <b>"형사소송법 제215조 제1항"</b> (관용 표기)</li>
  <li><b>p.4</b> 압수 대상 목록 중 "전자기록 일체" 표현이 광범위 — 대법원 2023도12345 판시 취지에 따라 <b>"피의자 X와 관련된 거래 이메일·메시지에 한함"</b> 으로 한정 권장</li>
  <li><b>p.6</b> KICS 양식 필수필드 "압수 후 처리 방법" 미입력</li>
</ol>
<p style="margin-top:10px;">수정안을 곧바로 docx 변경 흔적(Track Changes) 형식으로 출력해드릴까요?<sup style="color:var(--accent)">[1][2][3]</sup></p>`,
        citations: [
          { ix: 1, label: '국가법령정보센터 — 형사소송법 §215', sub: '/ law-v3', type: 'DOC' },
          { ix: 2, label: '대법원 2023도12345', sub: '/ 종합법률정보', type: 'DOC' },
          { ix: 3, label: 'KICS 영장양식 v2026.3', sub: '/ 양식 검증기', type: 'API' },
        ]
      },
    ],
    sources: [
      { ix: 1, title: '형사소송법 §215', snippet: '"검사는 범죄수사에 필요한 때에는…"', meta: 'law-v3', type: 'DOC' },
      { ix: 2, title: '대법원 2023도12345', snippet: '"포괄적 압수 대상 표현은…"', meta: '종합법률정보', type: 'DOC' },
    ],
    warrant: '청구 전 사전검토',
  },

  // ============================================================
  // 7) 보이스피싱 분류기 결과 해설
  // ============================================================
  'phishing': {
    title: '보이스피싱 패턴 분류기 결과 해설',
    meta: '신고센터 신고건 24h · 자동 분류 후 인사이트 추출',
    model: 'phishing-classify-v2.4 + police-llm-13b',
    agents: [
      { name: '@보이스피싱분류', sys: 'phishing-classify-v2.4' },
      { name: '@트렌드분석', sys: 'trend-analyzer' },
    ],
    systems: ['112 신고센터', '금융감독원 데이터', 'KICS'],
    messages: [
      { who: 'user', name: '장지훈 경위', time: '15:08',
        body: `<p>오늘 신고된 보이스피싱 412건 분류 결과 보면서, 이번 주 새로 늘어난 시나리오나 변형 패턴이 있는지 짧게 정리해줘.</p>`
      },
      { who: 'assistant', time: '15:08',
        body: `${toolCall('보이스피싱분류', '412건 · 12 카테고리 · F1 0.94', '✓ 1.0s', '분류 완료 · 신규 미분류 8건')}
${toolCall('트렌드분석', '지난 4주 베이스라인 대비 z-score', '✓ 0.6s', '유의 증가 2개 · 신규 변형 1개')}
<p style="margin-top:14px;"><b style="color:var(--text)">금주 주목 패턴</b></p>
<ul style="margin:6px 0;padding-left:18px;">
  <li><b>"검찰 출석 통보" 변형</b> (+218%) — 화상통화 요구가 새로 추가됨. 가짜 대검 로고·이메일 위조 동반.</li>
  <li><b>"택배 미배송" 시작 → 계정 로그인 유도</b> 패턴 (+92%) — KakaoT 등 정상 서비스 사칭.</li>
  <li><b>신규 변형 (미분류 8건):</b> "법원 전자송달 PDF" 첨부 + 악성 앱 설치 유도. 신규 카테고리 등록 권장.</li>
</ul>
<p style="margin-top:10px;">신규 카테고리 <code>"법원 전자송달 사칭"</code>을 분류기 다음 학습에 포함하도록 데이터셋에 라벨링 작업을 생성할까요? (라벨링 관리자에게 8건 자동 할당)</p>`
      },
    ],
    sources: [
      { ix: 1, title: '112 신고센터 24h 데이터', snippet: '412건 · 12 카테고리', meta: '15:00 ETL', type: 'DB' },
    ],
    warrant: '집계 분석 (개별 신고 PII 미접근)',
  },

  // ============================================================
  // 8) 사이버 침해사고 보고서 초안
  // ============================================================
  'cyber-report': {
    title: '사이버 침해사고 보고서 초안',
    meta: '사고 #2026-118 · 일일 운영보고용',
    model: 'police-llm-13b · report-draft',
    agents: [
      { name: '@사건조회', sys: 'KICS 사건 색인' },
      { name: '@로그집계', sys: 'ELK · 사이버수사대 인덱스' },
      { name: '@보고서작성', sys: 'report-draft-v3' },
    ],
    systems: ['KICS', 'ELK Stack', '사내 보고서 양식 저장소'],
    messages: [
      { who: 'user', name: '장지훈 경위', time: '08:21',
        body: `<p>어제 발생한 사고 #2026-118 보고서 초안 만들어줘. 사건 개요, 피해 규모, 대응 조치, 향후 계획 순으로.</p>`
      },
      { who: 'assistant', time: '08:21',
        body: `${toolCall('사건조회', 'KICS · case_no=2026-118 상세', '✓ 0.5s', '사건 메타데이터 + 피해 추정')}
${toolCall('로그집계', 'ELK · 5/18 00:00 ~ 23:59', '✓ 0.9s', '관련 이벤트 1,840건')}
${toolCall('보고서작성', '사내 양식 v4.2 · 4섹션 자동 채움', '✓ 1.1s', '7페이지 초안 생성')}
<p style="margin-top:14px;">보고서 초안 미리보기:</p>
<div style="border:1px solid var(--border);border-radius:var(--r-md);padding:14px;background:var(--panel-2);font-size:13px;line-height:1.65;">
  <div style="font-size:11px;color:var(--text-mut);text-transform:uppercase;letter-spacing:0.08em;">사이버 침해사고 일일 운영보고서 (초안)</div>
  <h4 style="margin:8px 0 4px;font-size:13px;">1. 사건 개요</h4>
  <p style="margin:0 0 8px;color:var(--text-mut);">2026.05.18 03:14, 위협성 게시물 1건이 X 플랫폼에서 자동 모니터링에 적발되어 사고번호 #2026-118로 접수…</p>
  <h4 style="margin:8px 0 4px;font-size:13px;">2. 피해 규모</h4>
  <p style="margin:0 0 8px;color:var(--text-mut);">실제 위해 발생 없음. 대상지 3개소에 대해 사전 안전조치…</p>
  <h4 style="margin:8px 0 4px;font-size:13px;">3. 대응 조치</h4>
  <p style="margin:0 0 8px;color:var(--text-mut);">사이버수사대 긴급 추적팀 편성 (4명) · GraphRAG 기반 작성자 클러스터 식별…</p>
  <h4 style="margin:8px 0 4px;font-size:13px;">4. 향후 계획</h4>
  <p style="margin:0;color:var(--text-mut);">통신자료 영장 청구 (5/19), 클러스터 C-α 3명 신원확인 진행…</p>
</div>
<div class="row" style="gap:6px;margin-top:12px;">
  <button class="btn sm primary">DOCX 다운로드</button>
  <button class="btn sm">결재 라인 전송</button>
  <button class="btn sm ghost">섹션별 재생성</button>
</div>`,
      },
    ],
    sources: [
      { ix: 1, title: 'KICS · 사건 #2026-118', snippet: '사고 메타데이터', meta: 'KICS · 08:21', type: 'DB' },
      { ix: 2, title: 'ELK · 사이버수사대 인덱스', snippet: '이벤트 1,840건', meta: '05-18 24h', type: 'LOG' },
    ],
    warrant: '내부 보고용',
  },
};

// helper to render a tool-call card
function toolCall(name, sub, status, out) {
  return `<div class="tool-call exp">
    <div class="head">
      <div class="ico-box"><svg width="14" height="14" viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.4"><circle cx="8" cy="8" r="3"/><path d="M8 1v3M8 12v3M1 8h3M12 8h3"/></svg></div>
      <div><div class="name">${name}</div><div class="sub">${sub}</div></div>
      <span class="status">${status}</span>
    </div>${out ? `<div class="out">${out}</div>` : ''}
  </div>`;
}
window.toolCall = toolCall;
