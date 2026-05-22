// =========================================================
// Agent Store — Gamification (leaderboard + hall of fame + cards)
// =========================================================

const AGENTS = [
  { id:"a1",  name:"@AccountTrace",       cat:"investigation analysis",   desc:"3 account cross money flow·hidden pattern detection", access:"case",   uses:"4,821", rating:4.9, maker:"Cyber Investigation Unit · Jang Ji-hoon", makerMedal:"gold",   trending:true,  pinned:true,  icon:"graph" },
  { id:"a2",  name:"@LawSearch",       cat:"Law lookup",   desc:"Investigation Rule·Criminal Procedure Act·related precedent RAG",      access:"common", uses:"12,402",rating:4.8, maker:"Legal Affairs Division · Kim Hye-young",   makerMedal:"gold",   trending:false, pinned:true,  icon:"book" },
  { id:"a3",  name:"@DrugTrendDetect",   cat:"Realtime Monitor",desc:"SNS slang·new pattern threshold auto Notifications",   access:"dept",   uses:"982",  rating:4.7, maker:"Narcotics Unit · Park Jae-hoon",   makerMedal:"silver", trending:true,  pinned:false, icon:"activity" },
  { id:"a4",  name:"@StatementSummary",       cat:"Documents",   desc:"Statement audio·HWP form summary + key citation", access:"dept",   uses:"7,318",rating:4.7, maker:"Investigation Planning Division · Lee Ji-won",   makerMedal:"silver", trending:false, pinned:false, icon:"file" },
  { id:"a5",  name:"@VoicePhishing",    cat:"investigation analysis",   desc:"Voice-phishing variant scenarios auto classifier",  access:"dept",   uses:"3,127",rating:4.6, maker:"Cyber Investigation Unit · Choi Min-ho", makerMedal:"silver", trending:true,  pinned:false, icon:"shield" },
  { id:"a6",  name:"@VehicleLookup",       cat:"investigation analysis",   desc:"plate → make·Owner·history single calls",access:"common", uses:"21,803",rating:4.5, maker:"Traffic Safety Division · Jeong Jae-hoon",   makerMedal:"gold",   trending:false, pinned:false, icon:"cpu" },
  { id:"a7",  name:"@SlangDict",       cat:"Glossary",   desc:"narcotics·gambling slang·new term Dictionary auto-mapped",  access:"common", uses:"2,049",rating:4.4, maker:"Narcotics Unit · Park Jae-hoon",   makerMedal:"silver", trending:false, pinned:false, icon:"book" },
  { id:"a8",  name:"@WarrantDraft",       cat:"Documents",   desc:"investigation memo → warrant application Draft",          access:"common", uses:"5,210",rating:4.5, maker:"Legal Affairs Division · Kim Hye-young",   makerMedal:"gold",   trending:false, pinned:false, icon:"file" },
  { id:"a9",  name:"@SNSCluster",   cat:"investigation analysis",   desc:"threat posts cluster + core nodes extract", access:"dept",   uses:"711",  rating:4.6, maker:"Digital Analysis Division · Park Seo-yeon", makerMedal:"bronze", trending:true,  pinned:false, icon:"graph" },
  { id:"a10", name:"@KICSRegister",      cat:"admin automation", desc:"analysis result → KICS auto register (gate review)",access:"dept",  uses:"1,902",rating:4.3, maker:"Investigation Planning Division · Lee Ji-won",   makerMedal:"silver", trending:false, pinned:false, icon:"upload" },
  { id:"a11", name:"@ShiftBriefing",    cat:"Documents",   desc:"night Conversation 12hour → 1min briefing auto-generated",access:"dept",  uses:"2,841",rating:4.8, maker:"On-call Operations Team · Choi Min-ho",   makerMedal:"silver", trending:true,  pinned:false, icon:"refresh" },
  { id:"a12", name:"@DataQuality",    cat:"admin automation", desc:"just before registration PII·duplicate/missing auto review",  access:"common", uses:"3,604",rating:4.4, maker:"Data Governance Team",      makerMedal:"bronze", trending:false, pinned:false, icon:"check" },
];

const ACCESS_TONES = {
  common: { tone: "brand",  label: "Common",   icon: "book"   },
  dept:   { tone: "warn",   label: "Dept",   icon: "shield" },
  case:   { tone: "danger", label: "Case",   icon: "lock"   },
};

const MEDAL_META = {
  gold:   { tone: "gold",   label: "Gold-tier Maker",  emoji: "🥇" },
  silver: { tone: "silver", label: "Silver-tier Maker",  emoji: "🥈" },
  bronze: { tone: "bronze", label: "Bronze-tier Maker",  emoji: "🥉" },
};

// -- Leaderboard
const Leaderboard = () => {
  const top = [...AGENTS].sort((a, b) => parseInt(b.uses.replace(/,/g,"")) - parseInt(a.uses.replace(/,/g,""))).slice(0, 5);
  const max = parseInt(top[0].uses.replace(/,/g,""));
  return (
    <Card padded={false} className="overflow-hidden">
      <div className="flex items-center gap-2 px-4 py-3 border-b border-line bg-gradient-to-r from-brand-700/15 to-transparent">
        <Icon name="trophy" className="w-4 h-4 text-gold" />
        <span className="text-[13px] font-semibold text-text-hi">This Week's Usage Leaderboard</span>
        <Chip tone="gold" className="ml-2">TOP 5</Chip>
        <span className="ml-auto text-[10.5px] text-text-mut mono">Tally: 05/19 23:59</span>
      </div>
      <div className="divide-y divide-line/60">
        {top.map((a, i) => {
          const v = parseInt(a.uses.replace(/,/g,""));
          const pct = (v / max) * 100;
          return (
            <div key={a.id} className="px-4 py-3 flex items-center gap-3 hover:bg-ink-600/30">
              <div className={`w-6 h-6 grid place-items-center rounded text-[12px] font-bold mono ${
                i === 0 ? "bg-gold/20 text-gold" : i === 1 ? "bg-silver/15 text-silver" : i === 2 ? "bg-bronze/30 text-orange-300" : "bg-ink-600 text-text-mut"
              }`}>{i + 1}</div>
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-1.5">
                  <span className="text-[12.5px] font-semibold text-text-hi mono">{a.name}</span>
                  <Chip tone={ACCESS_TONES[a.access].tone} icon={ACCESS_TONES[a.access].icon}>{ACCESS_TONES[a.access].label}</Chip>
                  {a.trending && <Chip tone="ok" className="text-[10px]">▲ Surging</Chip>}
                </div>
                <div className="mt-1 h-1 rounded bg-ink-500 overflow-hidden">
                  <div className={`h-full ${i === 0 ? "bg-gold" : "bg-brand-400"}`} style={{ width: `${pct}%` }}></div>
                </div>
              </div>
              <div className="mono text-[12px] text-text-hi tabular-nums w-16 text-right">{a.uses}</div>
            </div>
          );
        })}
      </div>
    </Card>
  );
};

// -- Hall of fame
const HallOfFame = () => {
  const honored = [
    { rank: 1, name: "Jang Ji-hoon Lieutenant",   dept: "Cyber Investigation Unit",  agents: 4, total: "8,124", medal: "gold",   spark: [3, 6, 5, 8, 12, 14, 18, 22, 28] },
    { rank: 2, name: "Kim Hye-young Lieutenant",   dept: "Legal Affairs Division",    agents: 6, total: "17,612", medal: "gold",  spark: [5, 8, 10, 13, 15, 17, 22, 26, 30] },
    { rank: 3, name: "Lee Ji-won Lieutenant",   dept: "Investigation Planning Division",    agents: 5, total: "9,220",  medal: "silver", spark: [4, 5, 7, 9, 11, 14, 16, 18, 22] },
    { rank: 4, name: "Park Jae-hoon Sergeant",   dept: "Narcotics Unit",    agents: 3, total: "3,031",  medal: "silver", spark: [2, 3, 5, 4, 6, 8, 10, 13, 15] },
  ];
  return (
    <Card padded={false} className="overflow-hidden">
      <div className="flex items-center gap-2 px-4 py-3 border-b border-line bg-gradient-to-r from-gold/10 to-transparent">
        <Icon name="star" className="w-4 h-4 text-gold" />
        <span className="text-[13px] font-semibold text-text-hi">Hall of Fame · Quarterly Top Makers</span>
        <span className="ml-auto text-[10.5px] text-text-mut mono">2026 Q2</span>
      </div>
      <div className="grid grid-cols-4 divide-x divide-line/60">
        {honored.map(h => (
          <div key={h.rank} className="p-4 hover:bg-ink-600/30 cursor-pointer">
            <div className="flex items-start gap-2.5">
              <div className="text-[28px] leading-none">{MEDAL_META[h.medal].emoji}</div>
              <div className="min-w-0">
                <div className="text-[13px] font-semibold text-text-hi truncate">{h.name}</div>
                <div className="text-[10.5px] text-text-mut mt-0.5">{h.dept}</div>
              </div>
            </div>
            <div className="mt-3 flex items-end justify-between gap-2">
              <div>
                <div className="mono text-[16px] text-text-hi tabular-nums">{h.total}</div>
                <div className="text-[10px] text-text-dim">calls · Agents {h.agents}</div>
              </div>
              <Spark data={h.spark} width={60} height={22} color="#fbbf24" />
            </div>
          </div>
        ))}
      </div>
    </Card>
  );
};

// -- Agent card
const AgentCard = ({ a }) => {
  const acc = ACCESS_TONES[a.access];
  const medal = MEDAL_META[a.makerMedal];
  return (
    <div className="bg-ink-700 border border-line rounded-lg p-3.5 hover:border-brand-400/60 hover:bg-ink-600/40 transition cursor-pointer flex flex-col">
      <div className="flex items-start gap-2.5 mb-3">
        <div className="w-10 h-10 rounded-md bg-gradient-to-br from-ink-500 to-ink-700 border border-line-hard grid place-items-center text-brand-300">
          <Icon name={a.icon} className="w-4.5 h-4.5" />
        </div>
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-1.5">
            <span className="text-[13.5px] font-semibold text-text-hi mono truncate">{a.name}</span>
            {a.trending && <span className="text-warn text-[10px] mono">●LIVE</span>}
          </div>
          <div className="text-[11px] text-text-mut mt-0.5">{a.cat}</div>
        </div>
        <Chip tone={acc.tone} icon={acc.icon}>{acc.label}</Chip>
      </div>

      <p className="text-[12px] text-text leading-snug min-h-[36px]">{a.desc}</p>

      <div className="mt-3 pt-3 border-t border-line/60 flex items-center justify-between">
        <div className="flex items-center gap-1.5 text-[10.5px]">
          <span className="text-base leading-none">{medal.emoji}</span>
          <span className="text-text-mut truncate max-w-[140px]">{a.maker}</span>
        </div>
        <div className="flex items-center gap-2 text-[10.5px] text-text-mut">
          <span className="flex items-center gap-0.5">
            <Icon name="star" className="w-3 h-3 text-gold" />
            <span className="mono text-text-hi">{a.rating}</span>
          </span>
          <span>·</span>
          <span className="mono">{a.uses}</span>
        </div>
      </div>

      <div className="mt-2.5 flex items-center gap-1.5">
        <Btn variant="primary" size="sm" className="flex-1">Use</Btn>
        <Btn variant="secondary" size="sm" icon="pin"></Btn>
        <Btn variant="ghost" size="sm" icon="kebab"></Btn>
      </div>
    </div>
  );
};

// -- Store top stat strip
const StoreStats = () => (
  <div className="grid grid-cols-5 gap-3">
    <Stat label="register Agent" value="38"     icon="store" />
    <Stat label="This Week calls"   value="42.1"   unit="k" icon="activity" delta="▲ +18%" tone="ok" />
    <Stat label="Active makers"    value="14"     icon="users" />
    <Stat label="Avg satisfaction"    value="4.6"    unit="/5" icon="star" />
    <Stat label="Pending approval"     value="3"      icon="check" tone="warn" delta="Review needed" />
  </div>
);

// -- Filters bar
const StoreFilters = ({ cat, setCat, access, setAccess, sort, setSort }) => {
  const cats = ["All", "investigation analysis", "Law lookup", "Documents", "Realtime Monitor", "Glossary", "admin automation"];
  return (
    <div className="flex items-center gap-2 flex-wrap">
      <div className="flex items-center gap-1.5 mr-2">
        {cats.map(c => (
          <button
            key={c}
            onClick={() => setCat(c)}
            className={`h-7 px-2.5 rounded-md text-[11.5px] font-medium border transition ${
              cat === c
                ? "bg-brand-700/20 text-brand-300 border-brand-600/40"
                : "bg-ink-700 text-text-mut border-line hover:text-text-hi"
            }`}
          >
            {c}
          </button>
        ))}
      </div>
      <div className="ml-auto flex items-center gap-2">
        <Tabs
          size="sm"
          tabs={[
            { key:"all",    label:"All" },
            { key:"common", label:"Common" },
            { key:"dept",   label:"Dept" },
            { key:"case",   label:"Case" },
          ]}
          value={access}
          onChange={setAccess}
        />
        <select
          value={sort}
          onChange={e => setSort(e.target.value)}
          className="h-7 px-2.5 rounded-md bg-ink-700 border border-line text-text-mut text-[11.5px] outline-none"
        >
          <option value="trending">Sort: Popular</option>
          <option value="recent">Sort: Latest</option>
          <option value="rating">Sort: rating</option>
        </select>
        <Btn variant="primary" size="sm" icon="plus">New Agent Create</Btn>
      </div>
    </div>
  );
};

// -- Main store
const AgentStore = () => {
  const [cat, setCat] = React.useState("All");
  const [access, setAccess] = React.useState("all");
  const [sort, setSort] = React.useState("trending");

  let list = AGENTS;
  if (cat !== "All") list = list.filter(a => a.cat === cat);
  if (access !== "all") list = list.filter(a => a.access === access);
  list = [...list].sort((a, b) => {
    if (sort === "trending") return (b.trending ? 1 : 0) - (a.trending ? 1 : 0) || parseInt(b.uses.replace(/,/g,"")) - parseInt(a.uses.replace(/,/g,""));
    if (sort === "rating") return b.rating - a.rating;
    return 0;
  });

  return (
    <div className="flex-1 overflow-y-auto bg-ink-850">
      <div className="max-w-[1480px] mx-auto px-6 py-5 space-y-5">
        {/* Hero */}
        <div className="relative overflow-hidden rounded-xl border border-line bg-gradient-to-br from-brand-900/40 via-ink-800 to-ink-800 panel-glow">
          <div className="absolute inset-0 bg-grid opacity-50"></div>
          <div className="relative px-6 py-5 flex items-end gap-6">
            <div className="flex-1">
              <Chip tone="brand" icon="store" className="mb-2">Agent Store</Chip>
              <h1 className="text-[24px] font-semibold text-text-hi tracking-tight">
                Pick AI built by colleagues and plug it into your work.
              </h1>
              <p className="text-[12.5px] text-text-mut mt-1.5 max-w-[680px] leading-relaxed">
                Security tier(<span className="text-brand-300">Common / Dept / Case</span>) follow access availableAgent only table.
                Each week, top makers are auto-awarded gold/silver/bronze badges and listed in the quarterly Hall of Fame.
              </p>
            </div>
            <div className="shrink-0 grid grid-cols-3 gap-2 text-center text-[10.5px] text-text-mut">
              {[
                { e:"🥇", n:"5", l:"Gold-tier" },
                { e:"🥈", n:"8", l:"Silver" },
                { e:"🥉", n:"4", l:"Bronze" },
              ].map(b => (
                <div key={b.l} className="bg-ink-700/60 border border-line rounded-lg px-3 py-2.5">
                  <div className="text-[22px] leading-none">{b.e}</div>
                  <div className="mono text-text-hi text-[14px] mt-1">{b.n}</div>
                  <div>{b.l}</div>
                </div>
              ))}
            </div>
          </div>
        </div>

        <StoreStats />

        <div className="grid grid-cols-[1fr_360px] gap-4">
          <Leaderboard />
          <Card padded={false}>
            <div className="px-4 py-3 border-b border-line flex items-center gap-2">
              <Icon name="medal" className="w-4 h-4 text-gold" />
              <span className="text-[13px] font-semibold text-text-hi">My Rank</span>
              <span className="ml-auto mono text-[10.5px] text-text-mut">Jang Ji-hoon Lieutenant</span>
            </div>
            <div className="p-4">
              <div className="flex items-center gap-3 mb-3">
                <div className="text-[40px] leading-none">🥇</div>
                <div>
                  <div className="text-[14px] font-semibold text-text-hi">Gold-tier Maker</div>
                  <div className="text-[11px] text-text-mut">Built 4 · Total Calls 8,124</div>
                </div>
              </div>
              <div className="space-y-2 text-[11.5px]">
                <div className="flex items-center justify-between">
                  <span className="text-text-mut">Next tier (Legend)</span>
                  <span className="mono text-text-hi">1,876 calls</span>
                </div>
                <Bar value={81} tone="warn" />
                <div className="grid grid-cols-3 gap-1.5 mt-3 text-center">
                  <div className="bg-ink-600 rounded p-2">
                    <div className="mono text-[15px] text-text-hi">4.9</div>
                    <div className="text-[10px] text-text-mut">Avg Rating</div>
                  </div>
                  <div className="bg-ink-600 rounded p-2">
                    <div className="mono text-[15px] text-text-hi">+18%</div>
                    <div className="text-[10px] text-text-mut">Weekly Growth</div>
                  </div>
                  <div className="bg-ink-600 rounded p-2">
                    <div className="mono text-[15px] text-text-hi">2</div>
                    <div className="text-[10px] text-text-mut">Follower Depts</div>
                  </div>
                </div>
              </div>
            </div>
          </Card>
        </div>

        <HallOfFame />

        <div className="space-y-3">
          <SectionTitle
            sub={`${list.length} Agents · available at your security level`}
            right={<Btn variant="ghost" size="sm" icon="grid">Change View</Btn>}
          >
            Agent Catalog
          </SectionTitle>
          <StoreFilters cat={cat} setCat={setCat} access={access} setAccess={setAccess} sort={sort} setSort={setSort} />
          <div className="grid grid-cols-4 gap-3">
            {list.map(a => <AgentCard key={a.id} a={a} />)}
          </div>
        </div>

        <div className="text-center py-6 text-[11.5px] text-text-dim">
          All agents in this store operate only inside the closed network; external API calls are entirely blocked.
        </div>
      </div>
    </div>
  );
};

Object.assign(window, { AgentStore });
