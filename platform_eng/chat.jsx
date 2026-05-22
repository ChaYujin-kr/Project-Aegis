// =========================================================
// Chat dashboard — user chat + Graph RAG
// =========================================================

// Mock conversation history
const CONVERSATIONS = [
  { id: "c1", ws: "case",    title: "2026-Cyber-0418 money-flow analysis",   agent: "@AccountTrace",      time: "10:08", pinned: true,  unread: 2 },
  { id: "c2", ws: "case",    title: "Park ○○ Statement transcript summary",               agent: "@StatementSummary",      time: "Yesterday" },
  { id: "c3", ws: "dept",    title: "Voice-phishing new variant trend (May)",     agent: "@VoicePhishing",    time: "Yesterday" },
  { id: "c4", ws: "common",  title: "search & seizurewarrant drafting Guide §3.2",       agent: "@LawSearch",      time: "06.18" },
  { id: "c5", ws: "common",  title: "Internal approval line — Model register process",         agent: "@InternalGuide",    time: "06.17" },
  { id: "c6", ws: "dept",    title: "regional narcotics slang Dictionary update",         agent: "@SlangDict",      time: "06.15" },
  { id: "c7", ws: "case",    title: "2026-Narcotics-0202 SNS clustering",      agent: "@DrugTrendDetect",  time: "06.14" },
];

const WORKSPACES = {
  common: {
    key: "common", label: "Common (Guide)",   icon: "book",
    tone: "brand",   summary: "Law·internal rule·manual RAG",
    desc: "Guides/laws viewable by all staff. No anonymization needed.",
    color: "from-brand-700/40 to-brand-900/40 border-brand-600/40",
    badge: "Common",
    chipTone: "brand",
  },
  dept: {
    key: "dept",   label: "By Dept (anonymized)",  icon: "shield",
    tone: "warn",  summary: "Dept example DB · auto anonymized",
    desc: "same Dept My Share. Personal info, party-identifying info auto-anonymized.",
    color: "from-warn/30 to-orange-900/30 border-warn/40",
    badge: "Dept",
    chipTone: "warn",
  },
  case: {
    key: "case",   label: "By Case (original)",    icon: "lock",
    tone: "danger", summary: "Case closed  instantly deleted",
    desc: "Workspace tied to single case. Original evidence-document RAG. On close, all indexes, embeddings, caches are auto-destroyed.",
    color: "from-danger/30 to-rose-900/30 border-danger/40",
    badge: "Case",
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
          <h2 className="text-[17px] font-semibold text-text-hi">New Conversation — Security Workspace Select</h2>
          <p className="text-[12.5px] text-text-mut mt-1">
            This platform closed network at operating, Data usage scope Workspace by unit isolated.
            <span className="text-text-hi">Cannot change mid-conversation once selected</span>.
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
              <span className="text-brand-300 font-medium">Select →</span>
            </div>
          </button>
        ))}
      </div>

      <div className="px-6 py-3 border-t border-line bg-ink-900/40 flex items-center justify-between text-[11px] text-text-mut">
        <div className="flex items-center gap-2">
          <Icon name="lock" className="w-3.5 h-3.5" />
          all Conversation Audit Log records (IP, user, RAG Sources, Model response Token).
        </div>
        <span className="mono text-text-dim">audit number auto-issued</span>
      </div>
    </div>
  </div>
);

// -- Case warning banner
const CaseWarning = ({ caseId, expiresAt }) => (
  <div className="bg-gradient-to-r from-danger/20 via-danger/10 to-transparent border border-danger/30 border-l-2 border-l-danger rounded-md px-3.5 py-2.5 flex items-start gap-3">
    <Icon name="warn" className="w-4 h-4 text-danger mt-0.5 shrink-0" />
    <div className="flex-1 text-[12px] text-text leading-relaxed">
      <span className="text-danger font-semibold">caution · by Case RAG mode</span>
      <span className="text-text-mut mx-2">·</span>
      this Case(<span className="mono text-text-hi">{caseId}</span>) RAG Data Case closed  instantly completely Delete.
      external exported·Share·cache·embedding backup wholly prohibited.
    </div>
    <div className="flex items-center gap-2 shrink-0">
      <Chip tone="danger" icon="upload">evidence document Upload</Chip>
      <span className="text-[10.5px] text-text-dim mono">autoDelete {expiresAt}</span>
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
          New Conversation
        </Btn>
        <div className="mt-2.5 flex items-center gap-1.5 h-7 px-2.5 rounded-md bg-ink-700 border border-line text-[12px] text-text-mut">
          <Icon name="search" className="w-3.5 h-3.5" />
          <input className="bg-transparent outline-none flex-1 text-text" placeholder="Conversation Search" />
        </div>
      </div>

      {/* WS filter pills */}
      <div className="px-3 pt-3 pb-2 flex gap-1 flex-wrap">
        {[
          { k: "all", label: "All" },
          { k: "common", label: "Common" },
          { k: "dept", label: "Dept" },
          { k: "case", label: "Case" },
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
        <div className="text-[10px] uppercase tracking-wider text-text-dim font-semibold px-2 pt-2 pb-1">pin</div>
        {list.filter(c => c.pinned).map(c => (
          <ConvItem key={c.id} conv={c} active={current === c.id} onPick={onPick} />
        ))}
        <div className="text-[10px] uppercase tracking-wider text-text-dim font-semibold px-2 pt-3 pb-1">Recent</div>
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
          {isAi && <span className="mono text-[10.5px] text-text-dim ml-auto">Confidence 92% · llama-3-ko-70b-int8</span>}
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
    { id: "q",   label: "query: money flow", x: 50, y: 25, kind: "q" },
    { id: "k1",  label: "KB 9*4", x: 25, y: 55, kind: "acc", weight: 3 },
    { id: "k2",  label: "Toss 1*7", x: 50, y: 70, kind: "acc", weight: 2 },
    { id: "k3",  label: "Saemaul 2*2", x: 75, y: 58, kind: "acc", weight: 2 },
    { id: "k4",  label: "USDT wallet",   x: 18, y: 88, kind: "wallet" },
    { id: "k5",  label: "Kim ○○",       x: 55, y: 92, kind: "person" },
    { id: "k6",  label: "warrant §3.2",    x: 82, y: 88, kind: "law" },
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
        <span className="text-[12.5px] font-semibold text-text-hi">Graph RAG Sources</span>
        <span className="mono text-[10px] text-text-dim ml-auto">7 nodes · 8 edges</span>
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
        <div className="flex items-center gap-1.5"><span className="w-2 h-2 rounded-full bg-brand-600"></span>query</div>
        <div className="flex items-center gap-1.5"><span className="w-2 h-2 rounded-full bg-ink-600 border border-brand-400/60"></span>account</div>
        <div className="flex items-center gap-1.5"><span className="w-2 h-2 rounded-full bg-ink-600 border border-warn/60"></span>wallet</div>
        <div className="flex items-center gap-1.5"><span className="w-2 h-2 rounded-full bg-ink-600 border border-ok/40"></span>Law</div>
      </div>
    </div>
  );
};

// -- Citations list (sidebar)
const CitationList = () => {
  const cites = [
    { n: 1, type: "original", tone: "danger",  title: "CDR_burner_3.csv",        meta: "rows 1,284 / analysis area: send/receive point, amount, device fingerprint" },
    { n: 2, type: "original", tone: "danger",  title: "transactions.xls (5/19)",     meta: "3 accounts (KB, Toss, Saemaul), 90-day extract" },
    { n: 3, type: "internal rule", tone: "ok",      title: "Investigation Rule §3.2 proviso",       meta: "same gang involved single warrant extend example 12 items" },
    { n: 4, type: "example", tone: "warn",    title: "similar cases — 2024-Cyber-1102", meta: " index: DEPT-CYB" },
  ];
  return (
    <div className="bg-ink-700 border border-line rounded-lg overflow-hidden">
      <div className="flex items-center gap-2 px-3.5 py-2.5 border-b border-line">
        <Icon name="pin" className="w-3.5 h-3.5 text-brand-300" />
        <span className="text-[12.5px] font-semibold text-text-hi">evidence document 4 items</span>
        <span className="mono text-[10px] text-text-dim ml-auto">Sort: Related</span>
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
          <span className="text-[11px] text-text-mut">Agent:</span>
          <Chip tone="brand">@AccountTrace</Chip>
          <Chip tone="neutral">@LawSearch</Chip>
          <button className="text-text-mut hover:text-text-hi text-[11px] flex items-center gap-1">
            <Icon name="plus" className="w-3 h-3" />Add
          </button>
          <span className="ml-auto mono text-[10.5px] text-text-dim">Model llama-3-ko-70b · temp 0.2</span>
        </div>
        <textarea
          className="w-full bg-transparent outline-none px-3.5 py-3 text-[13.5px] text-text resize-none placeholder:text-text-dim"
          rows={3}
          placeholder="investigation-related questions inputdo. Attach: evidence/doc/image all Case Workspace processed only inside."
          defaultValue="KB 9*4 account hub as looks like —, warrant §13 proviso apply scope expansion: similar cases is there? when expanded also let me know if there are examples rejected at the prosecution stage."
        />
        <div className="px-3 pb-3 flex items-center gap-2">
          <Btn variant="ghost" size="sm" icon="clip">evidence Attach</Btn>
          <Btn variant="ghost" size="sm" icon="image">Screenshot</Btn>
          <Btn variant="ghost" size="sm" icon="book">RAG Scope</Btn>
          <span className="ml-auto text-[10.5px] text-text-dim mono mr-2">
            estimated Token 2,340 · response too 8K
          </span>
          <Btn variant="primary" size="md" icon="send">Send</Btn>
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
            2026-Cyber-0418 money-flow analysis
            <Chip tone={ws.chipTone} icon={ws.icon}>{ws.label}</Chip>
          </div>
          <div className="text-[11.5px] text-text-mut mt-0.5 flex items-center gap-2">
            <span>Choi Min-ho, Lee Ji-won, and 3 others</span>
            <span className="text-text-dim">·</span>
            <span className="mono">thread #2026-04-18</span>
            <span className="text-text-dim">·</span>
            <span className="mono">Messages 24</span>
          </div>
        </div>
        <div className="ml-auto flex items-center gap-2">
          <Btn variant="ghost" size="sm" icon="users">Share</Btn>
          <Btn variant="ghost" size="sm" icon="download">Audit Log ↗</Btn>
          <Btn variant="secondary" size="sm" icon="store" onClick={onOpenStore}>Agent Store</Btn>
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
              <CaseWarning caseId="2026-Cyber-0418" expiresAt="Case finalized + 24h" />
            </div>
          )}

          <Msg author="Jang Ji-hoon Lieutenant" time="10:07" role="user">
            <p>Park ○○ Case at seized burner account 3's transactions at Common money flow check whether please. warrant <span className="text-brand-300">2026-Cyber-0418</span> Scope inside at.</p>
            <div className="mt-2.5 flex flex-wrap gap-1.5">
              <span className="inline-flex items-center gap-1.5 text-[11px] px-2 py-1 rounded bg-ink-700 border border-line text-text-mut">
                <Icon name="file" className="w-3 h-3" /> CDR_burner_3.csv
              </span>
              <span className="inline-flex items-center gap-1.5 text-[11px] px-2 py-1 rounded bg-ink-700 border border-line text-text-mut">
                <Icon name="file" className="w-3 h-3" /> transactions_May.xlsx
              </span>
            </div>
          </Msg>

          <Msg author="AccountTrace" agent="Agent" time="10:08" role="ai" citations={["CDR_burner_3.csv", "transactions_May.xlsx", "Investigation Rule §3.2", "example 2024-Cyber-1102"]}>
            <p>warrant(<span className="mono text-brand-300">2026-Cyber-0418</span>) scope confirmed ✓ · 3 account transactions <span className="mono text-text-hi">1,284 items</span> cross analysis.</p>

            <div className="mt-3 bg-ink-700 border border-line border-l-2 border-l-brand-400 rounded-md overflow-hidden">
              <div className="px-3.5 py-2 border-b border-line/60 flex items-center gap-2 text-[12px]">
                <Icon name="graph" className="w-3.5 h-3.5 text-brand-300" />
                <span className="font-semibold text-text-hi">Common money flow — 3 cross</span>
                <span className="mono text-[10px] text-text-dim ml-auto">evidence [1][2]</span>
              </div>
              <table className="w-full text-[12px]">
                <thead className="text-[10px] uppercase tracking-wider text-text-mut">
                  <tr>
                    <th className="text-left px-3.5 py-2 font-medium">Intermediate Acct</th>
                    <th className="text-left py-2 font-medium">Hops</th>
                    <th className="text-left py-2 font-medium">Total</th>
                    <th className="text-left py-2 font-medium">Final Dest</th>
                    <th className="text-right px-3.5 py-2 font-medium">pattern Confidence</th>
                  </tr>
                </thead>
                <tbody className="text-text">
                  {[
                    ["KB 9*4", "3 / 3", "₩ 42,180,000", "USDT", 96],
                    ["Toss 1*7", "2 / 3", "₩ 28,440,000", "Kim ○○", 84],
                    ["Saemaul 2*2", "2 / 3", "₩ 12,090,000", "Anonymous",  62],
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
              <span className="text-text-hi font-medium">Core finding.</span> 3 accounts all deposit after <span className="mono text-brand-300">within 12 hours</span> KB 9*4 as full amount transfer; ,
              same mobile Token fingerprint(<span className="mono">SHA: 8f2a…</span>) 4 observed. in effect appears to be operated by 1 person or the same device [1][2].
            </p>
            <p>
              By rule <span className="text-text-hi">Investigation Rule §3.2 proviso</span> can extend this warrant to trace KB 9*4.
              past similar cases(2024-Cyber-1102) too same proviso as previously extended with same proviso [3][4].
            </p>

            <div className="mt-3 flex flex-wrap gap-2">
              <Btn variant="primary" size="sm" icon="branch">Continue in thread</Btn>
              <Btn variant="secondary" size="sm" icon="download">result table Export (.xlsx)</Btn>
              <Btn variant="ghost" size="sm" icon="refresh">resetanalysis</Btn>
              <Btn variant="ghost" size="sm" icon="edit">Prompt fix</Btn>
            </div>
          </Msg>

          <Msg author="Lee Ji-won Lieutenant" time="10:11" role="user">
            <p>Got it, then KB 9*4 I'll also include the account in the warrant scope and request. <span className="text-brand-300">@LawSearch</span> §13 proviso extend find prosecution rejection examples.</p>
          </Msg>
        </div>

        {/* Right rail */}
        <aside className="border-l border-line bg-ink-800 overflow-y-auto p-3.5 space-y-3.5">
          <GraphRAG />
          <CitationList />
          <Card title=" Conversation's audit info" padded={false}>
            <div className="px-3.5 py-3 space-y-2 text-[11.5px]">
              <div className="flex justify-between"><span className="text-text-mut">auditnumber</span><span className="mono text-text-hi">AUD-26-04188-0042</span></div>
              <div className="flex justify-between"><span className="text-text-mut">Use Model</span><span className="mono">llama-3-ko-70b-int8</span></div>
              <div className="flex justify-between"><span className="text-text-mut">RAG index</span><span className="mono">CASE-2026-Cyber-0418</span></div>
              <div className="flex justify-between"><span className="text-text-mut">participantsone</span><span className="text-text-hi">5 people</span></div>
              <div className="flex justify-between"><span className="text-text-mut">Tokens used</span><span className="mono text-text-hi">14,820</span></div>
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
        crumbs={["AI Assistant", subTab === "chat" ? "investigationjurisdictional chat" : "Agent Store"]}
        actions={null}
      />

      <div className="px-5 pt-4 pb-3 border-b border-line bg-ink-800 flex items-center gap-3">
        <Tabs
          tabs={[
            { key: "chat",  label: "chat Workspace" },
            { key: "store", label: "Agent Store", count: 38 },
          ]}
          value={subTab}
          onChange={setSubTab}
        />
        <div className="ml-auto flex items-center gap-2 text-[11.5px] text-text-mut">
          <Icon name="info" className="w-3.5 h-3.5" />
          This module closed network(On-premise) internal at only operates.
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
