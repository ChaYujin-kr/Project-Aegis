// =========================================================
// MLOps & 데이터 거버넌스 화면
// =========================================================

// ---------- 1. 비즈메타 사전 (위키 게시판) ----------
const BizDict = () => {
  const [active, setActive] = React.useState("term-1");
  const terms = [
    { id:"term-1", word:"파란콩",   cat:"마약 은어",   updated:"2026.05.20",  contrib:"박재훈 경사", v:7,  verified:true,  refs:14 },
    { id:"term-2", word:"리딩방",   cat:"보이스피싱",  updated:"2026.05.18",  contrib:"최민호 경위", v:12, verified:true,  refs:32 },
    { id:"term-3", word:"플리마켓", cat:"도박",       updated:"2026.05.17",  contrib:"이지원 경위", v:4,  verified:false, refs:6  },
    { id:"term-4", word:"호객",     cat:"보이스피싱",  updated:"2026.05.16",  contrib:"최민호 경위", v:8,  verified:true,  refs:21 },
    { id:"term-5", word:"송파러",   cat:"마약 은어",   updated:"2026.05.15",  contrib:"박재훈 경사", v:3,  verified:false, refs:4  },
    { id:"term-6", word:"새벽선물", cat:"마약 은어",   updated:"2026.05.13",  contrib:"박재훈 경사", v:5,  verified:true,  refs:9  },
  ];
  const t = terms.find(x => x.id === active) || terms[0];
  return (
    <div className="grid grid-cols-[280px_1fr] gap-4 min-h-0 flex-1">
      <Card padded={false} className="flex flex-col min-h-0">
        <div className="p-3 border-b border-line space-y-2">
          <div className="flex items-center gap-1.5 h-7 px-2.5 rounded-md bg-ink-600 border border-line text-[12px]">
            <Icon name="search" className="w-3.5 h-3.5 text-text-mut" />
            <input className="bg-transparent outline-none flex-1 text-text" placeholder="용어 검색" defaultValue="" />
          </div>
          <Btn variant="primary" size="sm" icon="plus" className="w-full">새 용어 등록</Btn>
        </div>
        <div className="overflow-y-auto flex-1">
          <div className="text-[10px] uppercase tracking-wider text-text-dim font-semibold px-3 pt-3 pb-1">등록 용어 · 142</div>
          {terms.map(x => (
            <button
              key={x.id}
              onClick={() => setActive(x.id)}
              className={`w-full px-3 py-2 text-left hover:bg-ink-600/40 border-l-2 ${
                active === x.id ? "bg-brand-700/15 border-brand-400" : "border-transparent"
              }`}
            >
              <div className="flex items-center gap-1.5">
                <span className="text-[13px] font-semibold text-text-hi">{x.word}</span>
                {x.verified ? <Chip tone="ok" className="text-[10px]">검증</Chip> : <Chip tone="warn" className="text-[10px]">초안</Chip>}
              </div>
              <div className="text-[10.5px] text-text-mut mt-0.5 flex items-center gap-1.5">
                <span>{x.cat}</span><span>·</span><span className="mono">v{x.v}</span><span>·</span><span>{x.refs}건 참조</span>
              </div>
            </button>
          ))}
        </div>
      </Card>

      <Card padded={false} className="flex flex-col min-h-0">
        <div className="px-5 py-3.5 border-b border-line flex items-start gap-3">
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-[19px] font-semibold text-text-hi tracking-tight">{t.word}</h2>
              <Chip tone="brand">{t.cat}</Chip>
              {t.verified && <Chip tone="ok" icon="check">검증 완료</Chip>}
            </div>
            <div className="text-[11.5px] text-text-mut mt-1">
              최근 수정 {t.updated} · 작성자 <span className="text-text-hi">{t.contrib}</span> · 버전 <span className="mono">v{t.v}</span> · 인용 {t.refs}건
            </div>
          </div>
          <div className="ml-auto flex items-center gap-2">
            <Btn variant="ghost" size="sm" icon="branch">버전 기록</Btn>
            <Btn variant="ghost" size="sm" icon="users">기여자 (4)</Btn>
            <Btn variant="primary" size="sm" icon="edit">편집</Btn>
          </div>
        </div>

        <div className="overflow-y-auto flex-1 px-7 py-6 max-w-[820px]">
          <p className="text-[13.5px] text-text leading-[1.75]">
            "<span className="text-text-hi font-medium">파란콩</span>"은 신종 합성 마약(<span className="mono">알프라졸람·MDMA 변형</span> 추정)을
            지칭하는 은어로, 2026년 5월 이후 부산·서울 SNS 채널에서 동시 관측되기 시작했습니다.
            기존 "<span className="text-text-mut">젤리</span>" 은어가 단속 노출되자 빠르게 대체되는 흐름.
          </p>

          <h3 className="text-[14.5px] font-semibold text-text-hi mt-6 mb-2">유의 표현</h3>
          <div className="flex flex-wrap gap-1.5">
            {["콩", "blue bean", "B/B", "새파란콩", "ㅍㄹㅋ"].map(t => (
              <span key={t} className="inline-flex text-[12px] px-2 py-1 rounded bg-ink-600 border border-line mono text-text-hi">{t}</span>
            ))}
          </div>

          <h3 className="text-[14.5px] font-semibold text-text-hi mt-6 mb-2">맥락 사례</h3>
          <div className="space-y-2">
            {[
              { src:"트위터 익명계정",   txt:"파란콩 풀세트 8 / VVIP만 디엠",     when:"2026.05.20 03:21" },
              { src:"텔레그램 봇방",     txt:"오늘 새벽 콩 4개 남았어요 (지방)",  when:"2026.05.19 23:48" },
              { src:"SNS 위협 채널",     txt:"B/B 신상 입고. 단속 빡세니 빠르게", when:"2026.05.18 11:02" },
            ].map((c, i) => (
              <div key={i} className="bg-ink-700 border border-line rounded-md p-3 flex items-start gap-3 text-[12px]">
                <Icon name="chat" className="w-4 h-4 text-text-dim mt-0.5" />
                <div className="flex-1">
                  <div className="text-text">{c.txt}</div>
                  <div className="text-[10.5px] text-text-mut mt-1">{c.src} · {c.when}</div>
                </div>
                <Chip tone="danger">위협</Chip>
              </div>
            ))}
          </div>

          <h3 className="text-[14.5px] font-semibold text-text-hi mt-6 mb-2">연관 사건</h3>
          <ul className="space-y-1.5 text-[12.5px]">
            <li className="flex items-center gap-2"><Icon name="file" className="w-3.5 h-3.5 text-text-mut" /><span className="mono text-brand-300">2026-마약-0202</span><span className="text-text-mut">SNS 클러스터링 (박서연)</span></li>
            <li className="flex items-center gap-2"><Icon name="file" className="w-3.5 h-3.5 text-text-mut" /><span className="mono text-brand-300">2026-사이버-0418</span><span className="text-text-mut">자금 흐름 분석 (장지훈)</span></li>
          </ul>

          <div className="mt-6 p-3.5 bg-warn/10 border border-warn/30 rounded-md flex items-start gap-3">
            <Icon name="info" className="w-4 h-4 text-warn mt-0.5" />
            <div className="text-[12px] text-text leading-relaxed">
              <b className="text-warn">현장 검토 요청</b> — 박재훈 경사가 등록한 변형 표기 <span className="mono">"ㅍㄹㅋ"</span> 사용처가 광주청에서도 확인되었다면 코멘트 부탁드립니다.
            </div>
          </div>
        </div>
      </Card>
    </div>
  );
};

// ---------- 2. HITL 라벨링 ----------
const Labeling = () => {
  const [pick, setPick] = React.useState(0);
  const items = [
    { id:"L-204", kind:"X-RAY",   conf:0.94, tone:"ok",     pred:"전자기기 (확정)", note:"형태·모서리 비율 매칭"  },
    { id:"L-205", kind:"X-RAY",   conf:0.71, tone:"warn",   pred:"공구류 또는 무기", note:"각도에 따라 분류 차이" },
    { id:"L-206", kind:"문서",     conf:0.42, tone:"danger", pred:"수기 차용증?",     note:"필기체 식별 어려움"     },
    { id:"L-207", kind:"문서",     conf:0.88, tone:"ok",     pred:"진술조서 1쪽",     note:"양식·관인 일치"        },
    { id:"L-208", kind:"X-RAY",   conf:0.60, tone:"warn",   pred:"기기 + 보조배터리", note:"중첩 신호"             },
  ];
  const t = items[pick];

  return (
    <div className="grid grid-cols-[1fr_320px] gap-4 min-h-0 flex-1">
      <Card padded={false} className="flex flex-col min-h-0">
        <div className="px-4 py-3 border-b border-line flex items-center gap-2">
          <div className="text-[13px] font-semibold text-text-hi">{t.id} · {t.kind}</div>
          <Chip tone={t.tone}>신뢰도 {(t.conf * 100).toFixed(0)}%</Chip>
          <span className="ml-auto text-[11px] text-text-mut">{pick + 1} / {items.length}</span>
          <Btn variant="ghost" size="sm" icon="chevron"></Btn>
        </div>

        {/* Image preview (placeholder) */}
        <div className="flex-1 grid place-items-center bg-grid p-6 min-h-[340px]">
          <div className="relative w-full max-w-[640px] aspect-[4/3] rounded-lg bg-ink-900 border border-line overflow-hidden grid place-items-center">
            <div className="absolute inset-0 opacity-30" style={{ background: "repeating-linear-gradient(45deg, #1d2a52 0 14px, #121a32 14px 28px)" }}></div>
            <div className="text-text-dim text-[12px] mono">[ X-RAY 스캔 — 가방 #{t.id} ]</div>

            {/* AI bounding boxes */}
            <div className="absolute" style={{ left:"22%", top:"30%", width:"30%", height:"34%" }}>
              <div className={`w-full h-full border-2 ${t.tone === "ok" ? "border-ok" : t.tone === "warn" ? "border-warn" : "border-danger"} rounded`}></div>
              <div className={`absolute -top-5 left-0 text-[10px] mono px-1.5 py-px rounded ${t.tone === "ok" ? "bg-ok text-ink-900" : t.tone === "warn" ? "bg-warn text-ink-900" : "bg-danger text-white"}`}>
                {t.pred} · {(t.conf * 100).toFixed(0)}%
              </div>
            </div>
          </div>
        </div>

        {/* Quick label actions */}
        <div className="px-4 py-3 border-t border-line space-y-3 bg-ink-800">
          <div className="text-[11.5px] text-text-mut">AI 1차 태깅 → 라벨러 최종 결정 필요:</div>
          <div className="grid grid-cols-4 gap-2">
            {[
              { l:"전자기기",    tone:"brand" },
              { l:"공구류",     tone:"brand" },
              { l:"위험물품",   tone:"danger" },
              { l:"기타 (직접 입력)", tone:"neutral" },
            ].map(b => (
              <button key={b.l} className={`h-8 px-2 rounded-md text-[12px] font-medium border transition ${
                b.tone === "brand" ? "bg-ink-700 hover:bg-brand-700/20 hover:text-brand-300 border-line"
                : b.tone === "danger" ? "bg-ink-700 hover:bg-danger/15 hover:text-danger border-line"
                : "bg-ink-700 hover:bg-ink-600 text-text-mut border-line"
              }`}>{b.l}</button>
            ))}
          </div>

          <div className="flex items-center gap-2 pt-1">
            <Btn variant="danger" size="md" icon="close">반려 (재학습 후보)</Btn>
            <Btn variant="ghost" size="md" icon="refresh">박스 재조정</Btn>
            <Btn variant="ghost" size="md">건너뛰기</Btn>
            <Btn variant="primary" size="md" icon="check" className="ml-auto">최종 승인 · 학습 데이터로</Btn>
          </div>
          <div className="text-[10.5px] text-text-dim flex items-center gap-1.5">
            <Icon name="info" className="w-3 h-3" />
            <span>승인 전까지는 학습 데이터에 포함되지 않습니다. 모든 행위는 감사 기록됩니다.</span>
          </div>
        </div>
      </Card>

      {/* Right rail: queue + stats */}
      <div className="space-y-3.5 overflow-y-auto">
        <Card padded={false}>
          <div className="px-4 py-3 border-b border-line flex items-center gap-2">
            <Icon name="layers" className="w-3.5 h-3.5" />
            <span className="text-[13px] font-semibold text-text-hi">라벨 대기열</span>
            <Chip tone="warn" className="ml-auto">{items.length}건</Chip>
          </div>
          <div className="divide-y divide-line/60 max-h-[300px] overflow-y-auto">
            {items.map((x, i) => (
              <button
                key={x.id}
                onClick={() => setPick(i)}
                className={`w-full px-3 py-2.5 text-left hover:bg-ink-600/40 flex items-center gap-2 ${pick === i ? "bg-brand-700/15" : ""}`}
              >
                <span className={`w-1.5 h-1.5 rounded-full shrink-0 ${
                  x.tone === "ok" ? "bg-ok" : x.tone === "warn" ? "bg-warn" : "bg-danger"
                }`}></span>
                <div className="min-w-0 flex-1">
                  <div className="text-[12px] font-medium text-text-hi truncate mono">{x.id} · {x.kind}</div>
                  <div className="text-[10.5px] text-text-mut truncate">{x.pred}</div>
                </div>
                <span className="mono text-[10.5px] text-text-dim">{(x.conf * 100).toFixed(0)}%</span>
              </button>
            ))}
          </div>
        </Card>

        <Card title="오늘의 진척" sub="라벨러: 강유리 경사">
          <div className="grid grid-cols-3 gap-2 text-center">
            <div className="bg-ink-600 rounded p-2.5">
              <div className="mono text-[18px] text-text-hi">87</div>
              <div className="text-[10px] text-text-mut mt-0.5">승인</div>
            </div>
            <div className="bg-ink-600 rounded p-2.5">
              <div className="mono text-[18px] text-warn">12</div>
              <div className="text-[10px] text-text-mut mt-0.5">반려</div>
            </div>
            <div className="bg-ink-600 rounded p-2.5">
              <div className="mono text-[18px] text-text-hi">94%</div>
              <div className="text-[10px] text-text-mut mt-0.5">동의율</div>
            </div>
          </div>
          <div className="mt-3 text-[11.5px] text-text-mut">
            VLM(<span className="mono text-text-hi">cls-vlm-3</span>) 정확도 추세
          </div>
          <Spark data={[78, 80, 82, 81, 84, 87, 88, 88, 90, 92]} width={260} height={36} color="#10b981" />
        </Card>

        <Card title="현재 노트">
          <div className="text-[12px] text-text leading-relaxed">{t.note}</div>
        </Card>
      </div>
    </div>
  );
};

// ---------- 3. 야간 ODS 모니터링 ----------
const NightlyODS = () => {
  const jobs = [
    { id:"ETL-KICS-001",   src:"KICS",         rows:"428,210", dur:"03:24", quality:99.2, status:"ok",     when:"02:00" },
    { id:"ETL-CIS-014",    src:"수사정보시스템",  rows:"112,884", dur:"01:18", quality:97.8, status:"ok",     when:"02:00" },
    { id:"ETL-CCTV-008",   src:"CCTV 메타",     rows:"984,210", dur:"06:42", quality:91.4, status:"warn",   when:"02:00" },
    { id:"ETL-INDIC-022",  src:"수배·지명수배",  rows:"4,302",   dur:"00:24", quality:99.8, status:"ok",     when:"03:00" },
    { id:"ETL-SNS-A1",     src:"SNS 위협 클러스터",rows:"328,910",dur:"02:51", quality:88.7, status:"warn",   when:"03:00" },
    { id:"ETL-PHISH-002",  src:"보이스피싱 신고",  rows:"7,442",  dur:"00:14", quality:96.5, status:"ok",     when:"04:00" },
    { id:"ETL-FIN-009",    src:"금융정보 (FIU)", rows:"-",       dur:"-",     quality:0,    status:"danger", when:"04:30" },
  ];

  return (
    <div className="space-y-4 flex-1 min-h-0 overflow-y-auto">
      <div className="grid grid-cols-4 gap-3">
        <Stat label="간밤 처리 작업" value="38" icon="refresh" delta="▲ 어제와 동일" tone="ok" />
        <Stat label="총 처리 행수"   value="2.8" unit="M" icon="database" />
        <Stat label="평균 품질 점수" value="96.4" unit="%" icon="check" tone="ok" />
        <Stat label="실패/경고"     value="3" icon="warn" tone="warn" delta="FIU 인증서 만료" />
      </div>

      <Card title="야간 배치 스케줄링 — 2026.05.20 02:00 → 06:00" sub="실시간 연동이 아닌 야간 ODS 추출로 운용. 본 시스템은 폐쇄망이므로 외부 API 직접 호출 없음." padded={false}>
        <div className="overflow-x-auto">
          <table className="w-full text-[12px]">
            <thead>
              <tr className="text-text-mut text-[10.5px] uppercase tracking-wider border-b border-line">
                <th className="text-left px-4 py-2.5 font-medium">파이프라인</th>
                <th className="text-left py-2.5 font-medium">소스</th>
                <th className="text-left py-2.5 font-medium">시작</th>
                <th className="text-left py-2.5 font-medium">행 수</th>
                <th className="text-left py-2.5 font-medium">소요</th>
                <th className="text-left py-2.5 font-medium">품질</th>
                <th className="text-left py-2.5 font-medium">상태</th>
                <th className="text-right px-4 py-2.5 font-medium"></th>
              </tr>
            </thead>
            <tbody>
              {jobs.map(j => (
                <tr key={j.id} className="border-b border-line/40 hover:bg-ink-600/30">
                  <td className="px-4 py-2.5 mono text-text-hi">{j.id}</td>
                  <td className="py-2.5">{j.src}</td>
                  <td className="py-2.5 mono text-text-mut">{j.when}</td>
                  <td className="py-2.5 mono">{j.rows}</td>
                  <td className="py-2.5 mono text-text-mut">{j.dur}</td>
                  <td className="py-2.5">
                    {j.quality > 0 ? (
                      <div className="flex items-center gap-2">
                        <Bar value={j.quality} className="h-1 w-16" tone={j.quality > 95 ? "ok" : j.quality > 90 ? "warn" : "danger"} />
                        <span className="mono text-[11px]">{j.quality}%</span>
                      </div>
                    ) : <span className="text-text-dim">—</span>}
                  </td>
                  <td className="py-2.5">
                    <Chip tone={j.status}>
                      {j.status === "ok" ? "정상" : j.status === "warn" ? "경고" : "실패"}
                    </Chip>
                  </td>
                  <td className="text-right px-4 py-2.5">
                    <Btn variant="ghost" size="sm" icon="kebab" />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>

      <div className="grid grid-cols-[1fr_400px] gap-4">
        <Card title="시간대별 부하" sub="간밤 02:00–07:00 GPU·디스크 I/O 사용량">
          <div className="grid grid-cols-24 gap-[3px]" style={{ gridTemplateColumns: "repeat(24, 1fr)" }}>
            {Array.from({ length: 24 * 5 }).map((_, i) => {
              const h = i % 24;
              const intensity = (h >= 2 && h <= 6) ? 0.4 + Math.random() * 0.6 : Math.random() * 0.15;
              return (
                <div key={i} className="aspect-square rounded-sm"
                  style={{ background: `rgba(79,143,224,${intensity})` }}></div>
              );
            })}
          </div>
          <div className="flex items-center justify-between mt-2 text-[10.5px] text-text-mut">
            <span>월</span><span>화</span><span>수</span><span>목</span><span>금</span>
          </div>
        </Card>

        <Card title="이상 알림" sub="자동 감지된 품질 이슈">
          <div className="space-y-2">
            <div className="border border-danger/30 bg-danger/10 rounded-md p-2.5 text-[12px]">
              <div className="flex items-center gap-2 mb-1">
                <Icon name="warn" className="w-3.5 h-3.5 text-danger" />
                <b className="text-danger">FIU 연동 실패</b>
                <span className="ml-auto mono text-[10px] text-text-dim">04:30</span>
              </div>
              <div className="text-text-mut">인증서 만료 (2026.05.18). 정보화기획단 처리 필요.</div>
            </div>
            <div className="border border-warn/30 bg-warn/10 rounded-md p-2.5 text-[12px]">
              <div className="flex items-center gap-2 mb-1">
                <Icon name="warn" className="w-3.5 h-3.5 text-warn" />
                <b className="text-warn">CCTV 품질 91.4%</b>
                <span className="ml-auto mono text-[10px] text-text-dim">02:42</span>
              </div>
              <div className="text-text-mut">메타 일부 누락 (0.4%). 자동 재시도 1회 완료.</div>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
};

// ---------- 4. 모델 관리 ----------
const ModelCatalog = () => {
  const models = [
    { id:"llama-3-ko-70b-int8", task:"LLM", size:"70B", quant:"INT8", maker:"내부 파인튜닝", status:"prod",   uses:"21,894", deployed:true,  card:"수사 도메인 어휘 강화. 한국어 추론 강세." },
    { id:"clip-kor-vlm-3",       task:"VLM", size:"7B",  quant:"FP16", maker:"내부 파인튜닝", status:"prod",   uses:"4,310",  deployed:true,  card:"X-Ray, 조서 이미지 분류용." },
    { id:"qwen-2.5-32b",         task:"LLM", size:"32B", quant:"INT4", maker:"오픈소스",     status:"prod",   uses:"8,022",  deployed:true,  card:"빠른 응답이 필요한 보조 작업용." },
    { id:"whisper-large-v3",     task:"STT", size:"1.5B", quant:"FP16",maker:"오픈소스",     status:"prod",   uses:"2,841",  deployed:true,  card:"진술녹음 → 텍스트." },
    { id:"deepseek-r1-distill-7b",task:"LLM", size:"7B", quant:"FP16",maker:"오픈소스",     status:"staging",uses:"412",    deployed:false, card:"법령 추론 평가 중." },
    { id:"k-ocr-v3",             task:"OCR", size:"-",   quant:"-",    maker:"내부 파인튜닝", status:"prod",   uses:"31,028", deployed:true,  card:"HWP/PDF OCR. drift 감지됨." },
  ];
  const [filter, setFilter] = React.useState("all");
  const list = filter === "all" ? models : models.filter(m => m.task === filter);

  return (
    <div className="space-y-4 flex-1 min-h-0 overflow-y-auto">
      <div className="flex items-center gap-3">
        <div className="flex items-center gap-1.5 h-9 px-3 rounded-md bg-ink-700 border border-line flex-1 max-w-[480px]">
          <Icon name="search" className="w-3.5 h-3.5 text-text-mut" />
          <input className="bg-transparent outline-none flex-1 text-[13px] text-text" placeholder="모델 검색 — 예: 'OCR 한국어 INT8'" />
        </div>
        <Tabs
          tabs={[
            { key:"all", label:"전체", count: models.length },
            { key:"LLM", label:"LLM" },
            { key:"VLM", label:"VLM" },
            { key:"OCR", label:"OCR" },
            { key:"STT", label:"STT" },
          ]}
          value={filter}
          onChange={setFilter}
        />
        <Btn variant="primary" size="md" icon="upload">vLLM 서빙 / 배포</Btn>
      </div>

      <div className="grid grid-cols-3 gap-3">
        {list.map(m => (
          <div key={m.id} className="bg-ink-700 border border-line rounded-lg p-4 hover:border-brand-400/60 cursor-pointer">
            <div className="flex items-start gap-3 mb-3">
              <div className="w-10 h-10 rounded-md bg-brand-700/15 border border-brand-700/40 grid place-items-center text-brand-300">
                <Icon name={m.task === "LLM" ? "chat" : m.task === "VLM" ? "image" : m.task === "STT" ? "activity" : "file"} className="w-4 h-4" />
              </div>
              <div className="min-w-0 flex-1">
                <div className="text-[13px] font-semibold text-text-hi mono truncate">{m.id}</div>
                <div className="text-[11px] text-text-mut mt-0.5">{m.maker} · {m.task}</div>
              </div>
              <Chip tone={m.status === "prod" ? "ok" : m.status === "staging" ? "warn" : "neutral"}>
                {m.status === "prod" ? "Production" : "Staging"}
              </Chip>
            </div>
            <p className="text-[12px] text-text leading-snug min-h-[34px]">{m.card}</p>
            <div className="mt-3 pt-3 border-t border-line/60 flex items-center gap-3 text-[10.5px] text-text-mut">
              <span className="mono text-text-hi">{m.size}</span>
              <span>·</span>
              <span className="mono">{m.quant}</span>
              <span className="ml-auto mono">{m.uses} 호출 / 주</span>
            </div>
            <div className="mt-2.5 flex items-center gap-1.5">
              {m.deployed ? (
                <>
                  <Btn variant="secondary" size="sm" className="flex-1">상세</Btn>
                  <Btn variant="ghost" size="sm" icon="activity">메트릭</Btn>
                </>
              ) : (
                <>
                  <Btn variant="primary" size="sm" icon="play" className="flex-1">vLLM 배포</Btn>
                  <Btn variant="ghost" size="sm" icon="flask">평가</Btn>
                </>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

// ---------- Main MLOps screen ----------
const MLOpsScreen = () => {
  const [tab, setTab] = React.useState("dict");
  const tabs = [
    { key: "dict",   label: "비즈메타 사전" },
    { key: "label",  label: "Human-in-the-Loop 라벨링", count: 5 },
    { key: "ods",    label: "야간 ODS 모니터링" },
    { key: "model",  label: "모델 카탈로그" },
  ];
  return (
    <div className="flex-1 flex flex-col min-h-0">
      <TopBar crumbs={["데이터 거버넌스", tabs.find(t => t.key === tab).label]} />
      <div className="px-5 pt-4 pb-3 border-b border-line bg-ink-800 flex items-center gap-3">
        <Tabs tabs={tabs} value={tab} onChange={setTab} />
        <div className="ml-auto flex items-center gap-2">
          <Chip tone="ok" icon="check">ODS 정상</Chip>
          <Btn variant="ghost" size="sm" icon="settings">파이프라인 설정</Btn>
        </div>
      </div>
      <div className="flex-1 overflow-hidden bg-ink-850 p-5 flex flex-col min-h-0">
        {tab === "dict"  && <BizDict />}
        {tab === "label" && <Labeling />}
        {tab === "ods"   && <NightlyODS />}
        {tab === "model" && <ModelCatalog />}
      </div>
    </div>
  );
};

Object.assign(window, { MLOpsScreen });
