// =========================================================
// Agent Store — 게이미피케이션 (리더보드 + 명예의 전당 + 카드)
// =========================================================

const AGENTS = [
  { id:"a1",  name:"@계좌추적",       cat:"수사 분석",   desc:"3개 계좌 교차 자금 흐름·은닉 패턴 탐지", access:"case",   uses:"4,821", rating:4.9, maker:"사이버수사대 · 장지훈", makerMedal:"gold",   trending:true,  pinned:true,  icon:"graph" },
  { id:"a2",  name:"@법령검색",       cat:"법령 조회",   desc:"수사규칙·형사소송법·유관 판례 RAG",      access:"common", uses:"12,402",rating:4.8, maker:"법무행정과 · 김혜영",   makerMedal:"gold",   trending:false, pinned:true,  icon:"book" },
  { id:"a3",  name:"@마약동향감지",   cat:"실시간 모니터",desc:"SNS 은어·신종 패턴 임계치 자동 알림",   access:"dept",   uses:"982",  rating:4.7, maker:"마약수사대 · 박재훈",   makerMedal:"silver", trending:true,  pinned:false, icon:"activity" },
  { id:"a4",  name:"@조서요약",       cat:"문서 처리",   desc:"진술녹음·HWP 조서 요약 + 핵심 인용", access:"dept",   uses:"7,318",rating:4.7, maker:"수사기획과 · 이지원",   makerMedal:"silver", trending:false, pinned:false, icon:"file" },
  { id:"a5",  name:"@보이스피싱",    cat:"수사 분석",   desc:"보이스피싱 변형 시나리오 자동 분류",  access:"dept",   uses:"3,127",rating:4.6, maker:"사이버수사대 · 최민호", makerMedal:"silver", trending:true,  pinned:false, icon:"shield" },
  { id:"a6",  name:"@차량조회",       cat:"수사 분석",   desc:"번호판 → 차종·소유주·이력 단일 호출",access:"common", uses:"21,803",rating:4.5, maker:"교통안전과 · 정재훈",   makerMedal:"gold",   trending:false, pinned:false, icon:"cpu" },
  { id:"a7",  name:"@은어사전",       cat:"용어 사전",   desc:"마약·도박 은어·신조어 사전 자동 매핑",  access:"common", uses:"2,049",rating:4.4, maker:"마약수사대 · 박재훈",   makerMedal:"silver", trending:false, pinned:false, icon:"book" },
  { id:"a8",  name:"@영장초안",       cat:"문서 처리",   desc:"수사 메모 → 영장 청구서 초안",          access:"common", uses:"5,210",rating:4.5, maker:"법무행정과 · 김혜영",   makerMedal:"gold",   trending:false, pinned:false, icon:"file" },
  { id:"a9",  name:"@SNS클러스터",   cat:"수사 분석",   desc:"위협 게시물 클러스터 + 핵심 노드 추출", access:"dept",   uses:"711",  rating:4.6, maker:"디지털분석과 · 박서연", makerMedal:"bronze", trending:true,  pinned:false, icon:"graph" },
  { id:"a10", name:"@KICS등록",      cat:"행정 자동화", desc:"분석 결과 → KICS 자동 등록 (게이트 검수)",access:"dept",  uses:"1,902",rating:4.3, maker:"수사기획과 · 이지원",   makerMedal:"silver", trending:false, pinned:false, icon:"upload" },
  { id:"a11", name:"@교대브리핑",    cat:"문서 처리",   desc:"야간 대화 12시간 → 1분 브리핑 자동 생성",access:"dept",  uses:"2,841",rating:4.8, maker:"당직운영팀 · 최민호",   makerMedal:"silver", trending:true,  pinned:false, icon:"refresh" },
  { id:"a12", name:"@데이터품질",    cat:"행정 자동화", desc:"등록 직전 PII·중복·결측 자동 검수",  access:"common", uses:"3,604",rating:4.4, maker:"데이터거버넌스팀",      makerMedal:"bronze", trending:false, pinned:false, icon:"check" },
];

const ACCESS_TONES = {
  common: { tone: "brand",  label: "공통",   icon: "book"   },
  dept:   { tone: "warn",   label: "부서",   icon: "shield" },
  case:   { tone: "danger", label: "사건",   icon: "lock"   },
};

const MEDAL_META = {
  gold:   { tone: "gold",   label: "금장 제작자",  emoji: "🥇" },
  silver: { tone: "silver", label: "은장 제작자",  emoji: "🥈" },
  bronze: { tone: "bronze", label: "동장 제작자",  emoji: "🥉" },
};

// -- Leaderboard
const Leaderboard = () => {
  const top = [...AGENTS].sort((a, b) => parseInt(b.uses.replace(/,/g,"")) - parseInt(a.uses.replace(/,/g,""))).slice(0, 5);
  const max = parseInt(top[0].uses.replace(/,/g,""));
  return (
    <Card padded={false} className="overflow-hidden">
      <div className="flex items-center gap-2 px-4 py-3 border-b border-line bg-gradient-to-r from-brand-700/15 to-transparent">
        <Icon name="trophy" className="w-4 h-4 text-gold" />
        <span className="text-[13px] font-semibold text-text-hi">이번 주 사용량 리더보드</span>
        <Chip tone="gold" className="ml-2">TOP 5</Chip>
        <span className="ml-auto text-[10.5px] text-text-mut mono">집계: 05/19 23:59</span>
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
                  {a.trending && <Chip tone="ok" className="text-[10px]">▲ 급상승</Chip>}
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
    { rank: 1, name: "장지훈 경위",   dept: "사이버수사대",  agents: 4, total: "8,124", medal: "gold",   spark: [3, 6, 5, 8, 12, 14, 18, 22, 28] },
    { rank: 2, name: "김혜영 경위",   dept: "법무행정과",    agents: 6, total: "17,612", medal: "gold",  spark: [5, 8, 10, 13, 15, 17, 22, 26, 30] },
    { rank: 3, name: "이지원 경위",   dept: "수사기획과",    agents: 5, total: "9,220",  medal: "silver", spark: [4, 5, 7, 9, 11, 14, 16, 18, 22] },
    { rank: 4, name: "박재훈 경사",   dept: "마약수사대",    agents: 3, total: "3,031",  medal: "silver", spark: [2, 3, 5, 4, 6, 8, 10, 13, 15] },
  ];
  return (
    <Card padded={false} className="overflow-hidden">
      <div className="flex items-center gap-2 px-4 py-3 border-b border-line bg-gradient-to-r from-gold/10 to-transparent">
        <Icon name="star" className="w-4 h-4 text-gold" />
        <span className="text-[13px] font-semibold text-text-hi">명예의 전당 · 분기 우수 제작자</span>
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
                <div className="text-[10px] text-text-dim">호출 · 에이전트 {h.agents}</div>
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
        <Btn variant="primary" size="sm" className="flex-1">사용하기</Btn>
        <Btn variant="secondary" size="sm" icon="pin"></Btn>
        <Btn variant="ghost" size="sm" icon="kebab"></Btn>
      </div>
    </div>
  );
};

// -- Store top stat strip
const StoreStats = () => (
  <div className="grid grid-cols-5 gap-3">
    <Stat label="등록 에이전트" value="38"     icon="store" />
    <Stat label="이번 주 호출"   value="42.1"   unit="k" icon="activity" delta="▲ +18%" tone="ok" />
    <Stat label="활성 제작자"    value="14"     icon="users" />
    <Stat label="평균 만족도"    value="4.6"    unit="/5" icon="star" />
    <Stat label="대기 승인"     value="3"      icon="check" tone="warn" delta="검토 필요" />
  </div>
);

// -- Filters bar
const StoreFilters = ({ cat, setCat, access, setAccess, sort, setSort }) => {
  const cats = ["전체", "수사 분석", "법령 조회", "문서 처리", "실시간 모니터", "용어 사전", "행정 자동화"];
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
            { key:"all",    label:"전체" },
            { key:"common", label:"공통" },
            { key:"dept",   label:"부서" },
            { key:"case",   label:"사건" },
          ]}
          value={access}
          onChange={setAccess}
        />
        <select
          value={sort}
          onChange={e => setSort(e.target.value)}
          className="h-7 px-2.5 rounded-md bg-ink-700 border border-line text-text-mut text-[11.5px] outline-none"
        >
          <option value="trending">정렬: 인기순</option>
          <option value="recent">정렬: 최신</option>
          <option value="rating">정렬: 평점</option>
        </select>
        <Btn variant="primary" size="sm" icon="plus">새 에이전트 만들기</Btn>
      </div>
    </div>
  );
};

// -- Main store
const AgentStore = () => {
  const [cat, setCat] = React.useState("전체");
  const [access, setAccess] = React.useState("all");
  const [sort, setSort] = React.useState("trending");

  let list = AGENTS;
  if (cat !== "전체") list = list.filter(a => a.cat === cat);
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
              <Chip tone="brand" icon="store" className="mb-2">에이전트 스토어</Chip>
              <h1 className="text-[24px] font-semibold text-text-hi tracking-tight">
                동료가 만든 AI를 골라, 내 업무에 바로 붙이세요.
              </h1>
              <p className="text-[12.5px] text-text-mut mt-1.5 max-w-[680px] leading-relaxed">
                보안 등급(<span className="text-brand-300">공통 / 부서 / 사건</span>)에 따라 접근 가능한 에이전트만 표시됩니다.
                매주 우수 제작자에게 금·은·동 뱃지가 자동 부여되며, 분기 명예의 전당에 등재됩니다.
              </p>
            </div>
            <div className="shrink-0 grid grid-cols-3 gap-2 text-center text-[10.5px] text-text-mut">
              {[
                { e:"🥇", n:"5", l:"금장" },
                { e:"🥈", n:"8", l:"은장" },
                { e:"🥉", n:"4", l:"동장" },
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
              <span className="text-[13px] font-semibold text-text-hi">내 등급</span>
              <span className="ml-auto mono text-[10.5px] text-text-mut">장지훈 경위</span>
            </div>
            <div className="p-4">
              <div className="flex items-center gap-3 mb-3">
                <div className="text-[40px] leading-none">🥇</div>
                <div>
                  <div className="text-[14px] font-semibold text-text-hi">금장 제작자</div>
                  <div className="text-[11px] text-text-mut">제작 4 · 누적 호출 8,124</div>
                </div>
              </div>
              <div className="space-y-2 text-[11.5px]">
                <div className="flex items-center justify-between">
                  <span className="text-text-mut">다음 등급(레전드)까지</span>
                  <span className="mono text-text-hi">1,876 호출</span>
                </div>
                <Bar value={81} tone="warn" />
                <div className="grid grid-cols-3 gap-1.5 mt-3 text-center">
                  <div className="bg-ink-600 rounded p-2">
                    <div className="mono text-[15px] text-text-hi">4.9</div>
                    <div className="text-[10px] text-text-mut">평균 평점</div>
                  </div>
                  <div className="bg-ink-600 rounded p-2">
                    <div className="mono text-[15px] text-text-hi">+18%</div>
                    <div className="text-[10px] text-text-mut">주간 성장</div>
                  </div>
                  <div className="bg-ink-600 rounded p-2">
                    <div className="mono text-[15px] text-text-hi">2</div>
                    <div className="text-[10px] text-text-mut">팔로워 부서</div>
                  </div>
                </div>
              </div>
            </div>
          </Card>
        </div>

        <HallOfFame />

        <div className="space-y-3">
          <SectionTitle
            sub={`${list.length}개 에이전트 · 내 보안등급에서 사용 가능`}
            right={<Btn variant="ghost" size="sm" icon="grid">보기 변경</Btn>}
          >
            에이전트 카탈로그
          </SectionTitle>
          <StoreFilters cat={cat} setCat={setCat} access={access} setAccess={setAccess} sort={sort} setSort={setSort} />
          <div className="grid grid-cols-4 gap-3">
            {list.map(a => <AgentCard key={a.id} a={a} />)}
          </div>
        </div>

        <div className="text-center py-6 text-[11.5px] text-text-dim">
          본 스토어의 모든 에이전트는 폐쇄망 내부에서만 동작하며, 외부 API 호출이 일체 차단됩니다.
        </div>
      </div>
    </div>
  );
};

Object.assign(window, { AgentStore });
