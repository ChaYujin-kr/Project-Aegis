// =========================================================
// Chat dashboard — 사용자 채팅 + Graph RAG
// =========================================================

// Mock conversation history
const CONVERSATIONS = [
  { id: "c1", ws: "case",    title: "2026-사이버-0418 자금 흐름 분석",   agent: "@계좌추적",      time: "10:08", pinned: true,  unread: 2 },
  { id: "c2", ws: "case",    title: "박○○ 진술 녹취 요약",               agent: "@조서요약",      time: "어제" },
  { id: "c3", ws: "dept",    title: "보이스피싱 신종 변형 동향 (5월)",     agent: "@보이스피싱",    time: "어제" },
  { id: "c4", ws: "common",  title: "압수수색영장 작성 가이드 §3.2",       agent: "@법령검색",      time: "06.18" },
  { id: "c5", ws: "common",  title: "내부 결재선 — 모델 등록 절차",         agent: "@사내가이드",    time: "06.17" },
  { id: "c6", ws: "dept",    title: "지역 마약 은어 사전 업데이트",         agent: "@은어사전",      time: "06.15" },
  { id: "c7", ws: "case",    title: "2026-마약-0202 SNS 클러스터링",      agent: "@마약동향감지",  time: "06.14" },
];

const WORKSPACES = {
  common: {
    key: "common", label: "공통 (가이드)",   icon: "book",
    tone: "brand",   summary: "법령·내규·매뉴얼 RAG",
    desc: "전 직원 공통 열람 가능한 가이드/법령 자료. 가명화 불필요.",
    color: "from-brand-700/40 to-brand-900/40 border-brand-600/40",
    badge: "공통",
    chipTone: "brand",
  },
  dept: {
    key: "dept",   label: "부서별 (가명화)",  icon: "shield",
    tone: "warn",  summary: "부서 사례 DB · 자동 가명화",
    desc: "동일 부서 내 공유. 개인정보·당사자 식별 정보는 자동으로 가명화됩니다.",
    color: "from-warn/30 to-orange-900/30 border-warn/40",
    badge: "부서",
    chipTone: "warn",
  },
  case: {
    key: "case",   label: "사건별 (원본)",    icon: "lock",
    tone: "danger", summary: "사건 종료 시 즉시 삭제",
    desc: "단일 사건에 묶인 임시 워크스페이스. 원본 증거 자료 RAG. 종결 시 모든 인덱스·임베딩·캐시가 자동 폐기됩니다.",
    color: "from-danger/30 to-rose-900/30 border-danger/40",
    badge: "사건",
    chipTone: "danger",
  },
};

// -- Workspace picker modal
const WorkspacePicker = ({ onPick, onClose }) => (
  <div className="fixed inset-0 z-50 bg-ink-900/70 backdrop-blur-sm grid place-items-center p-6">
    <div className="bg-ink-800 border border-line rounded-xl shadow-2xl max-w-3xl w-full overflow-hidden">
      <div className="px-6 pt-6 pb-4 border-b border-line flex items-start gap-4">
        <div className="w-10 h-10 rounded-md bg-brand-700/20 grid place-items-center text-brand-300">
          <Icon name="shield" className="w-5 h-5" />
        </div>
        <div className="flex-1">
          <h2 className="text-[17px] font-semibold text-text-hi">새 대화 — 보안 워크스페이스 선택</h2>
          <p className="text-[12.5px] text-text-mut mt-1">
            본 플랫폼은 폐쇄망에서 동작하나, 데이터 활용 범위는 워크스페이스 단위로 격리됩니다.
            <span className="text-text-hi"> 한 번 선택하면 대화 중 변경 불가</span>합니다.
          </p>
        </div>
        <button onClick={onClose} className="text-text-mut hover:text-text-hi p-1.5">
          <Icon name="close" className="w-4 h-4" />
        </button>
      </div>

      <div className="p-5 grid grid-cols-3 gap-3">
        {Object.values(WORKSPACES).map(ws => (
          <button
            key={ws.key}
            onClick={() => onPick(ws.key)}
            className={`bg-gradient-to-br ${ws.color} border rounded-lg p-4 text-left hover:scale-[1.01] transition`}
          >
            <div className="flex items-center justify-between mb-3">
              <Icon name={ws.icon} className="w-5 h-5 text-text-hi" />
              <Chip tone={ws.chipTone}>{ws.badge}</Chip>
            </div>
            <div className="text-[14.5px] font-semibold text-text-hi">{ws.label}</div>
            <div className="text-[11.5px] text-text-mut mt-0.5 mb-3">{ws.summary}</div>
            <p className="text-[11.5px] text-text leading-relaxed">{ws.desc}</p>
            <div className="mt-3 pt-2.5 border-t border-line/60 flex items-center justify-between text-[10.5px] text-text-mut">
              <span className="mono">{ws.key === "common" ? "RAG: GUIDE-V" : ws.key === "dept" ? "RAG: DEPT-CYB" : "RAG: CASE-EPHEMERAL"}</span>
              <span className="text-brand-300 font-medium">선택 →</span>
            </div>
          </button>
        ))}
      </div>

      <div className="px-6 py-3 border-t border-line bg-ink-900/40 flex items-center justify-between text-[11px] text-text-mut">
        <div className="flex items-center gap-2">
          <Icon name="lock" className="w-3.5 h-3.5" />
          모든 대화는 감사 로그에 기록됩니다 (IP, 사용자, RAG 출처, 모델 응답 토큰).
        </div>
        <span className="mono text-text-dim">감사번호 자동 발번</span>
      </div>
    </div>
  </div>
);

// -- Case warning banner
const CaseWarning = ({ caseId, expiresAt }) => (
  <div className="bg-gradient-to-r from-danger/20 via-danger/10 to-transparent border border-danger/30 border-l-2 border-l-danger rounded-md px-3.5 py-2.5 flex items-start gap-3">
    <Icon name="warn" className="w-4 h-4 text-danger mt-0.5 shrink-0" />
    <div className="flex-1 text-[12px] text-text leading-relaxed">
      <span className="text-danger font-semibold">주의 · 사건별 RAG 모드</span>
      <span className="text-text-mut mx-2">·</span>
      본 사건(<span className="mono text-text-hi">{caseId}</span>) RAG 데이터는 사건 종료 시 즉시 완전 삭제됩니다.
      외부 반출·공유·캐시·임베딩 백업은 일체 금지됩니다.
    </div>
    <div className="flex items-center gap-2 shrink-0">
      <Chip tone="danger" icon="upload">증거 자료 업로드</Chip>
      <span className="text-[10.5px] text-text-dim mono">자동삭제 {expiresAt}</span>
    </div>
  </div>
);

// -- Chat history list (left rail)
const HistoryList = ({ current, onPick, onNew }) => {
  const [filter, setFilter] = React.useState("all");
  const list = filter === "all" ? CONVERSATIONS : CONVERSATIONS.filter(c => c.ws === filter);

  return (
    <div className="w-[280px] shrink-0 bg-ink-850 border-r border-line flex flex-col">
      <div className="p-3 border-b border-line">
        <Btn variant="primary" size="md" icon="plus" className="w-full" onClick={onNew}>
          새 대화
        </Btn>
        <div className="mt-2.5 flex items-center gap-1.5 h-7 px-2.5 rounded-md bg-ink-700 border border-line text-[12px] text-text-mut">
          <Icon name="search" className="w-3.5 h-3.5" />
          <input className="bg-transparent outline-none flex-1 text-text" placeholder="대화 검색" />
        </div>
      </div>

      {/* WS filter pills */}
      <div className="px-3 pt-3 pb-2 flex gap-1 flex-wrap">
        {[
          { k: "all", label: "전체" },
          { k: "common", label: "공통" },
          { k: "dept", label: "부서" },
          { k: "case", label: "사건" },
        ].map(t => (
          <button
            key={t.k}
            onClick={() => setFilter(t.k)}
            className={`h-6 px-2.5 rounded text-[11px] font-medium ${
              filter === t.k ? "bg-brand-700/30 text-brand-300" : "text-text-mut hover:text-text-hi"
            }`}
          >
            {t.label}
          </button>
        ))}
      </div>

      <div className="flex-1 overflow-y-auto px-2 pb-3">
        <div className="text-[10px] uppercase tracking-wider text-text-dim font-semibold px-2 pt-2 pb-1">고정됨</div>
        {list.filter(c => c.pinned).map(c => (
          <ConvItem key={c.id} conv={c} active={current === c.id} onPick={onPick} />
        ))}
        <div className="text-[10px] uppercase tracking-wider text-text-dim font-semibold px-2 pt-3 pb-1">최근</div>
        {list.filter(c => !c.pinned).map(c => (
          <ConvItem key={c.id} conv={c} active={current === c.id} onPick={onPick} />
        ))}
      </div>
    </div>
  );
};

const ConvItem = ({ conv, active, onPick }) => {
  const ws = WORKSPACES[conv.ws];
  return (
    <button
      onClick={() => onPick(conv.id)}
      className={`w-full flex items-start gap-2 px-2.5 py-2 rounded-md text-left mb-0.5 transition ${
        active ? "bg-brand-700/15 ring-1 ring-brand-600/30" : "hover:bg-ink-700"
      }`}
    >
      <span className={`w-1 h-1 mt-2 rounded-full shrink-0 ${
        conv.ws === "case" ? "bg-danger" : conv.ws === "dept" ? "bg-warn" : "bg-brand-400"
      }`}></span>
      <div className="flex-1 min-w-0">
        <div className="text-[12.5px] text-text-hi font-medium leading-tight line-clamp-1">{conv.title}</div>
        <div className="flex items-center gap-1.5 mt-1 text-[10.5px] text-text-mut">
          <span className="mono">{conv.agent}</span>
          <span className="text-text-dim">·</span>
          <span>{conv.time}</span>
          {conv.unread && (
            <span className="mono ml-auto text-[9.5px] px-1.5 rounded bg-brand-600 text-white">{conv.unread}</span>
          )}
        </div>
      </div>
    </button>
  );
};

// -- Messages
const Msg = ({ author, role = "user", time, children, citations, agent }) => {
  const isAi = role === "ai";
  return (
    <div className="flex gap-3 mb-6">
      <Avatar
        name={author}
        tone={isAi ? "bot" : "brand"}
        kind={isAi ? "bot" : "user"}
        size={30}
      />
      <div className="flex-1 min-w-0">
        <div className="flex items-baseline gap-2 mb-1">
          <span className="text-[13px] font-semibold text-text-hi">{author}</span>
          {agent && <Chip tone="brand">{agent}</Chip>}
          <span className="mono text-[10.5px] text-text-dim ml-1">{time}</span>
          {isAi && <span className="mono text-[10.5px] text-text-dim ml-auto">신뢰도 92% · llama-3-ko-70b-int8</span>}
        </div>
        <div className="text-[13.5px] text-text leading-[1.65]">{children}</div>
        {citations && (
          <div className="mt-2.5 flex flex-wrap gap-1.5">
            {citations.map((c, i) => (
              <span key={i} className="inline-flex items-center gap-1.5 text-[11px] px-2 py-1 rounded bg-ink-600 border border-line text-text-mut hover:text-text-hi cursor-pointer">
                <span className="mono text-brand-300">[{i + 1}]</span>
                <span className="truncate max-w-[200px]">{c}</span>
              </span>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

// -- Graph RAG widget (mini visualization)
const GraphRAG = () => {
  // Small force-direction-ish graph of evidence nodes
  const nodes = [
    { id: "q",   label: "질의: 자금 흐름", x: 50, y: 25, kind: "q" },
    { id: "k1",  label: "국민 9*4", x: 25, y: 55, kind: "acc", weight: 3 },
    { id: "k2",  label: "토스 1*7", x: 50, y: 70, kind: "acc", weight: 2 },
    { id: "k3",  label: "새마을 2*2", x: 75, y: 58, kind: "acc", weight: 2 },
    { id: "k4",  label: "USDT 지갑",   x: 18, y: 88, kind: "wallet" },
    { id: "k5",  label: "김○○",       x: 55, y: 92, kind: "person" },
    { id: "k6",  label: "영장 §3.2",    x: 82, y: 88, kind: "law" },
  ];
  const edges = [
    ["q", "k1", 0.9], ["q", "k2", 0.7], ["q", "k3", 0.6],
    ["k1", "k4", 0.8], ["k2", "k5", 0.6], ["k3", "k6", 0.5],
    ["k1", "k2", 0.4], ["k1", "k3", 0.4],
  ];
  const pos = Object.fromEntries(nodes.map(n => [n.id, n]));
  return (
    <div className="bg-ink-700 border border-line rounded-lg overflow-hidden">
      <div className="flex items-center gap-2 px-3.5 py-2.5 border-b border-line">
        <Icon name="graph" className="w-3.5 h-3.5 text-brand-300" />
        <span className="text-[12.5px] font-semibold text-text-hi">Graph RAG 출처</span>
        <span className="mono text-[10px] text-text-dim ml-auto">7 노드 · 8 간선</span>
      </div>
      <div className="relative bg-grid" style={{ height: 220 }}>
        <svg viewBox="0 0 100 100" preserveAspectRatio="none" className="absolute inset-0 w-full h-full">
          {edges.map(([a, b, w], i) => (
            <line
              key={i}
              x1={pos[a].x} y1={pos[a].y} x2={pos[b].x} y2={pos[b].y}
              stroke="#4f8fe0" strokeOpacity={w * 0.5} strokeWidth={0.4 + w * 0.6}
            />
          ))}
        </svg>
        {nodes.map(n => {
          const tones = {
            q:      "bg-brand-600 text-white border-brand-400 ring-4 ring-brand-600/20",
            acc:    "bg-ink-600 text-text-hi border-brand-400/60",
            wallet: "bg-ink-600 text-warn border-warn/60",
            person: "bg-ink-600 text-text-hi border-line-hard",
            law:    "bg-ink-600 text-ok border-ok/40",
          };
          const sz = n.kind === "q" ? 18 : 14;
          return (
            <div
              key={n.id}
              className="absolute -translate-x-1/2 -translate-y-1/2 flex flex-col items-center gap-1"
              style={{ left: `${n.x}%`, top: `${n.y}%` }}
            >
              <div className={`rounded-full border ${tones[n.kind]}`} style={{ width: sz, height: sz }}></div>
              <span className="text-[9.5px] text-text whitespace-nowrap mono px-1 bg-ink-800/80 rounded">{n.label}</span>
            </div>
          );
        })}
      </div>
      <div className="px-3.5 py-2.5 border-t border-line text-[10.5px] text-text-mut grid grid-cols-2 gap-1.5">
        <div className="flex items-center gap-1.5"><span className="w-2 h-2 rounded-full bg-brand-600"></span>질의</div>
        <div className="flex items-center gap-1.5"><span className="w-2 h-2 rounded-full bg-ink-600 border border-brand-400/60"></span>계좌</div>
        <div className="flex items-center gap-1.5"><span className="w-2 h-2 rounded-full bg-ink-600 border border-warn/60"></span>지갑</div>
        <div className="flex items-center gap-1.5"><span className="w-2 h-2 rounded-full bg-ink-600 border border-ok/40"></span>법령</div>
      </div>
    </div>
  );
};

// -- Citations list (sidebar)
const CitationList = () => {
  const cites = [
    { n: 1, type: "원본", tone: "danger",  title: "CDR_대포_3건.csv",        meta: "행 1,284 / 분석 영역: 송수신 시점, 금액, 단말 지문" },
    { n: 2, type: "원본", tone: "danger",  title: "거래내역_xls (5/19)",     meta: "국민·토스·새마을 3개 계좌, 90일 추출" },
    { n: 3, type: "내규", tone: "ok",      title: "수사규칙 §3.2 단서",       meta: "동일 일파 관여시 단일 영장 확장 사례 12건" },
    { n: 4, type: "사례", tone: "warn",    title: "유사 사례 — 2024-사이버-1102", meta: "가명화 인덱스: DEPT-CYB" },
  ];
  return (
    <div className="bg-ink-700 border border-line rounded-lg overflow-hidden">
      <div className="flex items-center gap-2 px-3.5 py-2.5 border-b border-line">
        <Icon name="pin" className="w-3.5 h-3.5 text-brand-300" />
        <span className="text-[12.5px] font-semibold text-text-hi">근거 자료 4건</span>
        <span className="mono text-[10px] text-text-dim ml-auto">정렬: 관련도</span>
      </div>
      <div className="divide-y divide-line/60">
        {cites.map(c => (
          <div key={c.n} className="p-3 hover:bg-ink-600/40 cursor-pointer">
            <div className="flex items-start gap-2">
              <span className="mono text-[10px] text-brand-300 mt-0.5">[{c.n}]</span>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-1.5 mb-1">
                  <Chip tone={c.tone} className="text-[10px] py-0">{c.type}</Chip>
                </div>
                <div className="text-[12px] font-medium text-text-hi truncate">{c.title}</div>
                <div className="text-[10.5px] text-text-mut mt-0.5 leading-snug">{c.meta}</div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

// -- Composer
const Composer = ({ ws }) => {
  const w = WORKSPACES[ws];
  return (
    <div className="border-t border-line p-4 bg-ink-800">
      <div className="bg-ink-700 border border-line-hard rounded-lg focus-within:border-brand-400 transition">
        <div className="px-3.5 pt-3 pb-2 flex items-center gap-2 border-b border-line/60">
          <Chip tone={w.chipTone} icon={w.icon}>{w.label}</Chip>
          <span className="text-[11px] text-text-mut">에이전트:</span>
          <Chip tone="brand">@계좌추적</Chip>
          <Chip tone="neutral">@법령검색</Chip>
          <button className="text-text-mut hover:text-text-hi text-[11px] flex items-center gap-1">
            <Icon name="plus" className="w-3 h-3" />추가
          </button>
          <span className="ml-auto mono text-[10.5px] text-text-dim">모델 llama-3-ko-70b · temp 0.2</span>
        </div>
        <textarea
          className="w-full bg-transparent outline-none px-3.5 py-3 text-[13.5px] text-text resize-none placeholder:text-text-dim"
          rows={3}
          placeholder="수사 관련 질문을 입력하세요. 첨부: 증거자료/문서/이미지 모두 사건 워크스페이스 안에서만 처리됩니다."
          defaultValue="국민 9*4 계좌가 허브로 보이는데, 영장 §13 단서를 적용해 범위 확장한 유사 사례가 있을까? 확장 시 검찰 단계에서 거절된 사례도 있다면 함께 알려줘."
        />
        <div className="px-3 pb-3 flex items-center gap-2">
          <Btn variant="ghost" size="sm" icon="clip">증거 첨부</Btn>
          <Btn variant="ghost" size="sm" icon="image">스크린샷</Btn>
          <Btn variant="ghost" size="sm" icon="book">RAG 범위</Btn>
          <span className="ml-auto text-[10.5px] text-text-dim mono mr-2">
            추정 토큰 2,340 · 응답 한도 8K
          </span>
          <Btn variant="primary" size="md" icon="send">전송</Btn>
        </div>
      </div>
    </div>
  );
};

// -- Main Chat panel
const ChatPanel = ({ activeWs, onChangeWs, onOpenStore }) => {
  const ws = WORKSPACES[activeWs];
  return (
    <div className="flex-1 flex flex-col min-w-0 bg-ink-850">
      {/* Chat header */}
      <div className="px-5 py-3 border-b border-line bg-ink-800 flex items-center gap-3">
        <div className="min-w-0">
          <div className="text-[14.5px] font-semibold text-text-hi truncate flex items-center gap-2">
            2026-사이버-0418 자금 흐름 분석
            <Chip tone={ws.chipTone} icon={ws.icon}>{ws.label}</Chip>
          </div>
          <div className="text-[11.5px] text-text-mut mt-0.5 flex items-center gap-2">
            <span>최민호, 이지원 외 3명 참여</span>
            <span className="text-text-dim">·</span>
            <span className="mono">스레드 #2026-04-18</span>
            <span className="text-text-dim">·</span>
            <span className="mono">메시지 24</span>
          </div>
        </div>
        <div className="ml-auto flex items-center gap-2">
          <Btn variant="ghost" size="sm" icon="users">공유</Btn>
          <Btn variant="ghost" size="sm" icon="download">감사로그 ↗</Btn>
          <Btn variant="secondary" size="sm" icon="store" onClick={onOpenStore}>에이전트 스토어</Btn>
          <button className="w-8 h-8 grid place-items-center rounded-md text-text-mut hover:text-text-hi hover:bg-ink-700">
            <Icon name="kebab" className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Body grid: messages | side rail */}
      <div className="flex-1 grid grid-cols-[1fr_320px] min-h-0">
        {/* Messages column */}
        <div className="overflow-y-auto px-7 py-5">
          {activeWs === "case" && (
            <div className="mb-5">
              <CaseWarning caseId="2026-사이버-0418" expiresAt="사건 종결 + 24h" />
            </div>
          )}

          <Msg author="장지훈 경위" time="10:07" role="user">
            <p>박○○ 사건에서 확보한 대포통장 3개의 거래내역에서 공통 자금 흐름이 보이는지 확인 부탁해. 영장은 <span className="text-brand-300">2026-사이버-0418</span> 범위 안에서.</p>
            <div className="mt-2.5 flex flex-wrap gap-1.5">
              <span className="inline-flex items-center gap-1.5 text-[11px] px-2 py-1 rounded bg-ink-700 border border-line text-text-mut">
                <Icon name="file" className="w-3 h-3" /> CDR_대포_3건.csv
              </span>
              <span className="inline-flex items-center gap-1.5 text-[11px] px-2 py-1 rounded bg-ink-700 border border-line text-text-mut">
                <Icon name="file" className="w-3 h-3" /> 거래내역_5월.xlsx
              </span>
            </div>
          </Msg>

          <Msg author="계좌추적" agent="에이전트" time="10:08" role="ai" citations={["CDR_대포_3건.csv", "거래내역_5월.xlsx", "수사규칙 §3.2", "사례 2024-사이버-1102"]}>
            <p>영장(<span className="mono text-brand-300">2026-사이버-0418</span>) 범위 확인 ✓ · 3개 계좌 거래 <span className="mono text-text-hi">1,284건</span>을 교차 분석했습니다.</p>

            <div className="mt-3 bg-ink-700 border border-line border-l-2 border-l-brand-400 rounded-md overflow-hidden">
              <div className="px-3.5 py-2 border-b border-line/60 flex items-center gap-2 text-[12px]">
                <Icon name="graph" className="w-3.5 h-3.5 text-brand-300" />
                <span className="font-semibold text-text-hi">공통 자금 흐름 — 3건 교차</span>
                <span className="mono text-[10px] text-text-dim ml-auto">근거 [1][2]</span>
              </div>
              <table className="w-full text-[12px]">
                <thead className="text-[10px] uppercase tracking-wider text-text-mut">
                  <tr>
                    <th className="text-left px-3.5 py-2 font-medium">중간 계좌</th>
                    <th className="text-left py-2 font-medium">경유</th>
                    <th className="text-left py-2 font-medium">총액</th>
                    <th className="text-left py-2 font-medium">최종지</th>
                    <th className="text-right px-3.5 py-2 font-medium">패턴 신뢰도</th>
                  </tr>
                </thead>
                <tbody className="text-text">
                  {[
                    ["국민 9*4", "3 / 3", "₩ 42,180,000", "USDT", 96],
                    ["토스 1*7", "2 / 3", "₩ 28,440,000", "김○○", 84],
                    ["새마을 2*2", "2 / 3", "₩ 12,090,000", "익명",  62],
                  ].map((r, i) => (
                    <tr key={i} className="border-t border-line/40">
                      <td className="px-3.5 py-2 mono text-text-hi">{r[0]}</td>
                      <td className="py-2">{r[1]}</td>
                      <td className="py-2 mono">{r[2]}</td>
                      <td className="py-2">{r[3]}</td>
                      <td className="text-right px-3.5 py-2">
                        <div className="flex items-center gap-2 justify-end">
                          <Bar value={r[4]} className="h-1 w-16" />
                          <span className="mono text-[11px] text-text-hi">{r[4]}%</span>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <p className="mt-3">
              <span className="text-text-hi font-medium">핵심 발견.</span> 3개 통장이 모두 입금 후 <span className="mono text-brand-300">12시간 이내</span> 국민 9*4로 전액 이체되며,
              동일 모바일 토큰 지문(<span className="mono">SHA: 8f2a…</span>)이 4회 관측됩니다. 사실상 1인 또는 동일 단말이 운용 중인 것으로 보입니다 [1][2].
            </p>
            <p>
              규정상 <span className="text-text-hi">수사규칙 §3.2 단서</span>를 적용하면 본 영장으로 국민 9*4까지 추적 가능합니다.
              과거 유사 사례(2024-사이버-1102)도 동일 단서로 확장 처리된 바 있습니다 [3][4].
            </p>

            <div className="mt-3 flex flex-wrap gap-2">
              <Btn variant="primary" size="sm" icon="branch">스레드로 이어보기</Btn>
              <Btn variant="secondary" size="sm" icon="download">결과 표 내보내기 (.xlsx)</Btn>
              <Btn variant="ghost" size="sm" icon="refresh">재분석</Btn>
              <Btn variant="ghost" size="sm" icon="edit">프롬프트 수정</Btn>
            </div>
          </Msg>

          <Msg author="이지원 경위" time="10:11" role="user">
            <p>좋아요, 그러면 국민 9*4 계좌도 영장 범위에 넣어서 청구할게요. <span className="text-brand-300">@법령검색</span> §13 단서 확장에 대한 검찰 거절 사례 있는지 봐줘.</p>
          </Msg>
        </div>

        {/* Right rail */}
        <aside className="border-l border-line bg-ink-800 overflow-y-auto p-3.5 space-y-3.5">
          <GraphRAG />
          <CitationList />
          <Card title="이 대화의 감사 정보" padded={false}>
            <div className="px-3.5 py-3 space-y-2 text-[11.5px]">
              <div className="flex justify-between"><span className="text-text-mut">감사번호</span><span className="mono text-text-hi">AUD-26-04188-0042</span></div>
              <div className="flex justify-between"><span className="text-text-mut">사용 모델</span><span className="mono">llama-3-ko-70b-int8</span></div>
              <div className="flex justify-between"><span className="text-text-mut">RAG 인덱스</span><span className="mono">CASE-2026-사이버-0418</span></div>
              <div className="flex justify-between"><span className="text-text-mut">참여자</span><span className="text-text-hi">5명</span></div>
              <div className="flex justify-between"><span className="text-text-mut">소모 토큰</span><span className="mono text-text-hi">14,820</span></div>
            </div>
          </Card>
        </aside>
      </div>

      {/* Composer */}
      <Composer ws={activeWs} />
    </div>
  );
};

// -- Top-level ChatScreen (with sub-tabs)
const ChatScreen = () => {
  const [subTab, setSubTab] = React.useState("chat");
  const [picker, setPicker] = React.useState(false);
  const [activeConv, setActiveConv] = React.useState("c1");
  const [activeWs, setActiveWs] = React.useState("case");

  return (
    <div className="flex-1 flex flex-col min-h-0">
      <TopBar
        crumbs={["AI 어시스턴트", subTab === "chat" ? "수사관 채팅" : "에이전트 스토어"]}
        actions={null}
      />

      <div className="px-5 pt-4 pb-3 border-b border-line bg-ink-800 flex items-center gap-3">
        <Tabs
          tabs={[
            { key: "chat",  label: "채팅 워크스페이스" },
            { key: "store", label: "에이전트 스토어", count: 38 },
          ]}
          value={subTab}
          onChange={setSubTab}
        />
        <div className="ml-auto flex items-center gap-2 text-[11.5px] text-text-mut">
          <Icon name="info" className="w-3.5 h-3.5" />
          본 모듈은 폐쇄망(온프레미스) 내부에서만 동작합니다.
        </div>
      </div>

      {subTab === "chat" ? (
        <div className="flex-1 flex min-h-0">
          <HistoryList current={activeConv} onPick={setActiveConv} onNew={() => setPicker(true)} />
          <ChatPanel
            activeWs={activeWs}
            onChangeWs={setActiveWs}
            onOpenStore={() => setSubTab("store")}
          />
        </div>
      ) : (
        <AgentStore onClose={() => setSubTab("chat")} />
      )}

      {picker && <WorkspacePicker onPick={(k) => { setActiveWs(k); setPicker(false); }} onClose={() => setPicker(false)} />}
    </div>
  );
};

Object.assign(window, { ChatScreen, WORKSPACES });
