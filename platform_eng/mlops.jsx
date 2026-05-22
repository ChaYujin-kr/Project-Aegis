// =========================================================
// MLOps & Data Governance view
// =========================================================

// ---------- 1. Biz Meta Glossary (wiki board) ----------
const BizDict = () => {
  const [active, setActive] = React.useState("term-1");
  const terms = [
    { id:"term-1", word:"Blue Bean",   cat:"narcotics slang",   updated:"2026.05.20",  contrib:"Park Jae-hoon Sergeant", v:7,  verified:true,  refs:14 },
    { id:"term-2", word:"leading room",   cat:"Voice-phishing",  updated:"2026.05.18",  contrib:"Choi Min-ho Lieutenant", v:12, verified:true,  refs:32 },
    { id:"term-3", word:"flea market", cat:"gambling",       updated:"2026.05.17",  contrib:"Lee Ji-won Lieutenant", v:4,  verified:false, refs:6  },
    { id:"term-4", word:"touting",     cat:"Voice-phishing",  updated:"2026.05.16",  contrib:"Choi Min-ho Lieutenant", v:8,  verified:true,  refs:21 },
    { id:"term-5", word:"Songpa-er",   cat:"narcotics slang",   updated:"2026.05.15",  contrib:"Park Jae-hoon Sergeant", v:3,  verified:false, refs:4  },
    { id:"term-6", word:"dawn gift", cat:"narcotics slang",   updated:"2026.05.13",  contrib:"Park Jae-hoon Sergeant", v:5,  verified:true,  refs:9  },
  ];
  const t = terms.find(x => x.id === active) || terms[0];
  return (
    <div className="grid grid-cols-[280px_1fr] gap-4 min-h-0 flex-1">
      <Card padded={false} className="flex flex-col min-h-0">
        <div className="p-3 border-b border-line space-y-2">
          <div className="flex items-center gap-1.5 h-7 px-2.5 rounded-md bg-ink-600 border border-line text-[12px]">
            <Icon name="search" className="w-3.5 h-3.5 text-text-mut" />
            <input className="bg-transparent outline-none flex-1 text-text" placeholder="Term Search" defaultValue="" />
          </div>
          <Btn variant="primary" size="sm" icon="plus" className="w-full">New Term register</Btn>
        </div>
        <div className="overflow-y-auto flex-1">
          <div className="text-[10px] uppercase tracking-wider text-text-dim font-semibold px-3 pt-3 pb-1">register Term · 142</div>
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
                {x.verified ? <Chip tone="ok" className="text-[10px]">Verified</Chip> : <Chip tone="warn" className="text-[10px]">Draft</Chip>}
              </div>
              <div className="text-[10.5px] text-text-mut mt-0.5 flex items-center gap-1.5">
                <span>{x.cat}</span><span>·</span><span className="mono">v{x.v}</span><span>·</span><span>{x.refs} refs</span>
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
              {t.verified && <Chip tone="ok" icon="check">Verified</Chip>}
            </div>
            <div className="text-[11.5px] text-text-mut mt-1">
              Recent fix {t.updated} · author <span className="text-text-hi">{t.contrib}</span> · version <span className="mono">v{t.v}</span> · citation {t.refs} items
            </div>
          </div>
          <div className="ml-auto flex items-center gap-2">
            <Btn variant="ghost" size="sm" icon="branch">version history</Btn>
            <Btn variant="ghost" size="sm" icon="users">contributieach othere (4)</Btn>
            <Btn variant="primary" size="sm" icon="edit">Edit</Btn>
          </div>
        </div>

        <div className="overflow-y-auto flex-1 px-7 py-6 max-w-[820px]">
          <p className="text-[13.5px] text-text leading-[1.75]">
            "<span className="text-text-hi font-medium">Blue Bean</span>" new synthetic drug(<span className="mono">alprazolam·MDMA variant</span> estimated)
            slang referring, 2026yr May after Busan, Seoul SNS Channels at started being observed simultaneously.
            existing "<span className="text-text-mut">jelly</span>" slang crackdown exposedone quickly replaced Flow.
          </p>

          <h3 className="text-[14.5px] font-semibold text-text-hi mt-6 mb-2">significant phrase</h3>
          <div className="flex flex-wrap gap-1.5">
            {["Bean", "blue bean", "B/B", "New Blue Bean", "ㅍㄹㅋ"].map(t => (
              <span key={t} className="inline-flex text-[12px] px-2 py-1 rounded bg-ink-600 border border-line mono text-text-hi">{t}</span>
            ))}
          </div>

          <h3 className="text-[14.5px] font-semibold text-text-hi mt-6 mb-2">context example</h3>
          <div className="space-y-2">
            {[
              { src:"Twitter anonymous account",   txt:"Blue Bean full set 8 / VVIP only DM",     when:"2026.05.20 03:21" },
              { src:"Telegram bot room",     txt:"Today dawn bean 4 left (province)",  when:"2026.05.19 23:48" },
              { src:"SNS threat channels",     txt:"B/B fresh stock. crackdown tough fast", when:"2026.05.18 11:02" },
            ].map((c, i) => (
              <div key={i} className="bg-ink-700 border border-line rounded-md p-3 flex items-start gap-3 text-[12px]">
                <Icon name="chat" className="w-4 h-4 text-text-dim mt-0.5" />
                <div className="flex-1">
                  <div className="text-text">{c.txt}</div>
                  <div className="text-[10.5px] text-text-mut mt-1">{c.src} · {c.when}</div>
                </div>
                <Chip tone="danger">threat</Chip>
              </div>
            ))}
          </div>

          <h3 className="text-[14.5px] font-semibold text-text-hi mt-6 mb-2">Related Cases</h3>
          <ul className="space-y-1.5 text-[12.5px]">
            <li className="flex items-center gap-2"><Icon name="file" className="w-3.5 h-3.5 text-text-mut" /><span className="mono text-brand-300">2026-Narcotics-0202</span><span className="text-text-mut">SNS clustering (Park Seo-yeon)</span></li>
            <li className="flex items-center gap-2"><Icon name="file" className="w-3.5 h-3.5 text-text-mut" /><span className="mono text-brand-300">2026-Cyber-0418</span><span className="text-text-mut">money-flow analysis (Jang Ji-hoon)</span></li>
          </ul>

          <div className="mt-6 p-3.5 bg-warn/10 border border-warn/30 rounded-md flex items-start gap-3">
            <Icon name="info" className="w-4 h-4 text-warn mt-0.5" />
            <div className="text-[12px] text-text leading-relaxed">
              <b className="text-warn">Field review request</b> — Park Jae-hoon Sergeant registered variant label <span className="mono">"ㅍㄹㅋ"</span> Please comment if its usage in Gwangju Agency is also confirmed.
            </div>
          </div>
        </div>
      </Card>
    </div>
  );
};

// ---------- 2. HITL Labeling ----------
const Labeling = () => {
  const [pick, setPick] = React.useState(0);
  const items = [
    { id:"L-204", kind:"X-RAY",   conf:0.94, tone:"ok",     pred:"electronics ()", note:"shape/corner ratio matched"  },
    { id:"L-205", kind:"X-RAY",   conf:0.71, tone:"warn",   pred:"tools or weapon", note:"classifier varies by angle" },
    { id:"L-206", kind:"doc",     conf:0.42, tone:"danger", pred:"handwritten IOU?",     note:"handwriting hard to identify"     },
    { id:"L-207", kind:"doc",     conf:0.88, tone:"ok",     pred:"statement form p.1",     note:"form/seal match"        },
    { id:"L-208", kind:"X-RAY",   conf:0.60, tone:"warn",   pred:"device + aux battery", note:"overlapping signal"             },
  ];
  const t = items[pick];

  return (
    <div className="grid grid-cols-[1fr_320px] gap-4 min-h-0 flex-1">
      <Card padded={false} className="flex flex-col min-h-0">
        <div className="px-4 py-3 border-b border-line flex items-center gap-2">
          <div className="text-[13px] font-semibold text-text-hi">{t.id} · {t.kind}</div>
          <Chip tone={t.tone}>Confidence {(t.conf * 100).toFixed(0)}%</Chip>
          <span className="ml-auto text-[11px] text-text-mut">{pick + 1} / {items.length}</span>
          <Btn variant="ghost" size="sm" icon="chevron"></Btn>
        </div>

        {/* Image preview (placeholder) */}
        <div className="flex-1 grid place-items-center bg-grid p-6 min-h-[340px]">
          <div className="relative w-full max-w-[640px] aspect-[4/3] rounded-lg bg-ink-900 border border-line overflow-hidden grid place-items-center">
            <div className="absolute inset-0 opacity-30" style={{ background: "repeating-linear-gradient(45deg, #1d2a52 0 14px, #121a32 14px 28px)" }}></div>
            <div className="text-text-dim text-[12px] mono">[ X-RAY scan — bag #{t.id} ]</div>

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
          <div className="text-[11.5px] text-text-mut">AI first tagging → labeler final decide needed:</div>
          <div className="grid grid-cols-4 gap-2">
            {[
              { l:"electronics",    tone:"brand" },
              { l:"tools",     tone:"brand" },
              { l:"risk items",   tone:"danger" },
              { l:"Other (direct input)", tone:"neutral" },
            ].map(b => (
              <button key={b.l} className={`h-8 px-2 rounded-md text-[12px] font-medium border transition ${
                b.tone === "brand" ? "bg-ink-700 hover:bg-brand-700/20 hover:text-brand-300 border-line"
                : b.tone === "danger" ? "bg-ink-700 hover:bg-danger/15 hover:text-danger border-line"
                : "bg-ink-700 hover:bg-ink-600 text-text-mut border-line"
              }`}>{b.l}</button>
            ))}
          </div>

          <div className="flex items-center gap-2 pt-1">
            <Btn variant="danger" size="md" icon="close">Rejected (Retraining candidate)</Btn>
            <Btn variant="ghost" size="md" icon="refresh">box rearrange</Btn>
            <Btn variant="ghost" size="md">skip</Btn>
            <Btn variant="primary" size="md" icon="check" className="ml-auto">final Approved · as training data</Btn>
          </div>
          <div className="text-[10.5px] text-text-dim flex items-center gap-1.5">
            <Icon name="info" className="w-3 h-3" />
            <span>Not included in training data until approved. All actions audit-logged.</span>
          </div>
        </div>
      </Card>

      {/* Right rail: queue + stats */}
      <div className="space-y-3.5 overflow-y-auto">
        <Card padded={false}>
          <div className="px-4 py-3 border-b border-line flex items-center gap-2">
            <Icon name="layers" className="w-3.5 h-3.5" />
            <span className="text-[13px] font-semibold text-text-hi">label queue</span>
            <Chip tone="warn" className="ml-auto">{items.length} items</Chip>
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

        <Card title="Today's Progress" sub="labeler: Kang Yu-ri Sergeant">
          <div className="grid grid-cols-3 gap-2 text-center">
            <div className="bg-ink-600 rounded p-2.5">
              <div className="mono text-[18px] text-text-hi">87</div>
              <div className="text-[10px] text-text-mut mt-0.5">Approved</div>
            </div>
            <div className="bg-ink-600 rounded p-2.5">
              <div className="mono text-[18px] text-warn">12</div>
              <div className="text-[10px] text-text-mut mt-0.5">Rejected</div>
            </div>
            <div className="bg-ink-600 rounded p-2.5">
              <div className="mono text-[18px] text-text-hi">94%</div>
              <div className="text-[10px] text-text-mut mt-0.5">agreement rate</div>
            </div>
          </div>
          <div className="mt-3 text-[11.5px] text-text-mut">
            VLM(<span className="mono text-text-hi">cls-vlm-3</span>) accuracy trend
          </div>
          <Spark data={[78, 80, 82, 81, 84, 87, 88, 88, 90, 92]} width={260} height={36} color="#10b981" />
        </Card>

        <Card title="current note">
          <div className="text-[12px] text-text leading-relaxed">{t.note}</div>
        </Card>
      </div>
    </div>
  );
};

// ---------- 3. Nightly ODS Monitoring ----------
const NightlyODS = () => {
  const jobs = [
    { id:"ETL-KICS-001",   src:"KICS",         rows:"428,210", dur:"03:24", quality:99.2, status:"ok",     when:"02" },
    { id:"ETL-CIS-014",    src:"investigationinfosystems",  rows:"112,884", dur:"01:18", quality:97.8, status:"ok",     when:"02" },
    { id:"ETL-CCTV-008",   src:"CCTV metadata",     rows:"984,210", dur:"06:42", quality:91.4, status:"warn",   when:"02" },
    { id:"ETL-INDIC-022",  src:"wanted/most-wanted",  rows:"4,302",   dur:"00:24", quality:99.8, status:"ok",     when:"03" },
    { id:"ETL-SNS-A1",     src:"SNS threat cluster",rows:"328,910",dur:"02:51", quality:88.7, status:"warn",   when:"03" },
    { id:"ETL-PHISH-002",  src:"Voice-phishing report",  rows:"7,442",  dur:"00:14", quality:96.5, status:"ok",     when:"04" },
    { id:"ETL-FIN-009",    src:"finance info (FIU)", rows:"-",       dur:"-",     quality:0,    status:"danger", when:"04:30" },
  ];

  return (
    <div className="space-y-4 flex-1 min-h-0 overflow-y-auto">
      <div className="grid grid-cols-4 gap-3">
        <Stat label="last night processed job" value="38" icon="refresh" delta="▲ same as yesterday" tone="ok" />
        <Stat label="Total processed rowsWed"   value="2.8" unit="M" icon="database" />
        <Stat label="average quality score" value="96.4" unit="%" icon="check" tone="ok" />
        <Stat label="Failed/Warning"     value="3" icon="warn" tone="warn" delta="FIU cert expired" />
      </div>

      <Card title="Night batch scheduling — 2026.05.20 02 → 06" sub="Realtime Integration not night ODS extract as operation. This system closed networkso external API direct calls none." padded={false}>
        <div className="overflow-x-auto">
          <table className="w-full text-[12px]">
            <thead>
              <tr className="text-text-mut text-[10.5px] uppercase tracking-wider border-b border-line">
                <th className="text-left px-4 py-2.5 font-medium">pipeline</th>
                <th className="text-left py-2.5 font-medium">Source</th>
                <th className="text-left py-2.5 font-medium">start</th>
                <th className="text-left py-2.5 font-medium">rows Wed</th>
                <th className="text-left py-2.5 font-medium">duration</th>
                <th className="text-left py-2.5 font-medium">quality</th>
                <th className="text-left py-2.5 font-medium">Status</th>
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
                      {j.status === "ok" ? "Normal" : j.status === "warn" ? "Warning" : "Failed"}
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
        <Card title="Load by time band" sub="last night 02–07 GPU·disk I/O usage">
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
            <span>Mon</span><span></span><span>Wed</span><span>Thu</span><span>Fri</span>
          </div>
        </Card>

        <Card title="above Notifications" sub="auto-detected quality issues">
          <div className="space-y-2">
            <div className="border border-danger/30 bg-danger/10 rounded-md p-2.5 text-[12px]">
              <div className="flex items-center gap-2 mb-1">
                <Icon name="warn" className="w-3.5 h-3.5 text-danger" />
                <b className="text-danger">FIU Integration Failed</b>
                <span className="ml-auto mono text-[10px] text-text-dim">04:30</span>
              </div>
              <div className="text-text-mut">cert expired (2026.05.18). IT Planning Bureau processed needed.</div>
            </div>
            <div className="border border-warn/30 bg-warn/10 rounded-md p-2.5 text-[12px]">
              <div className="flex items-center gap-2 mb-1">
                <Icon name="warn" className="w-3.5 h-3.5 text-warn" />
                <b className="text-warn">CCTV quality 91.4%</b>
                <span className="ml-auto mono text-[10px] text-text-dim">02:42</span>
              </div>
              <div className="text-text-mut">metadata part missing (0.4%). auto auto retry 1× done.</div>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
};

// ---------- 4. Model Mgmt ----------
const ModelCatalog = () => {
  const models = [
    { id:"llama-3-ko-70b-int8", task:"LLM", size:"70B", quant:"INT8", maker:"internal fine-tune", status:"prod",   uses:"21,894", deployed:true,  card:"enhanced investigation domain vocabulary. strong Korean inference." },
    { id:"clip-kor-vlm-3",       task:"VLM", size:"7B",  quant:"FP16", maker:"internal fine-tune", status:"prod",   uses:"4,310",  deployed:true,  card:"X-Ray, doc image classifier use." },
    { id:"qwen-2.5-32b",         task:"LLM", size:"32B", quant:"INT4", maker:"open source",     status:"prod",   uses:"8,022",  deployed:true,  card:"fast response auxiliary job use." },
    { id:"whisper-large-v3",     task:"STT", size:"1.5B", quant:"FP16",maker:"open source",     status:"prod",   uses:"2,841",  deployed:true,  card:"Statement audio → text." },
    { id:"deepseek-r1-distill-7b",task:"LLM", size:"7B", quant:"FP16",maker:"open source",     status:"staging",uses:"412",    deployed:false, card:"evaluating law-inference." },
    { id:"k-ocr-v3",             task:"OCR", size:"-",   quant:"-",    maker:"internal fine-tune", status:"prod",   uses:"31,028", deployed:true,  card:"HWP/PDF OCR. drift detect." },
  ];
  const [filter, setFilter] = React.useState("all");
  const list = filter === "all" ? models : models.filter(m => m.task === filter);

  return (
    <div className="space-y-4 flex-1 min-h-0 overflow-y-auto">
      <div className="flex items-center gap-3">
        <div className="flex items-center gap-1.5 h-9 px-3 rounded-md bg-ink-700 border border-line flex-1 max-w-[480px]">
          <Icon name="search" className="w-3.5 h-3.5 text-text-mut" />
          <input className="bg-transparent outline-none flex-1 text-[13px] text-text" placeholder="Model Search — e.g. 'OCR Korean INT8'" />
        </div>
        <Tabs
          tabs={[
            { key:"all", label:"All", count: models.length },
            { key:"LLM", label:"LLM" },
            { key:"VLM", label:"VLM" },
            { key:"OCR", label:"OCR" },
            { key:"STT", label:"STT" },
          ]}
          value={filter}
          onChange={setFilter}
        />
        <Btn variant="primary" size="md" icon="upload">vLLM Serving / Deploy</Btn>
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
              <span className="ml-auto mono">{m.uses} calls / wk</span>
            </div>
            <div className="mt-2.5 flex items-center gap-1.5">
              {m.deployed ? (
                <>
                  <Btn variant="secondary" size="sm" className="flex-1">Details</Btn>
                  <Btn variant="ghost" size="sm" icon="activity">Metrics</Btn>
                </>
              ) : (
                <>
                  <Btn variant="primary" size="sm" icon="play" className="flex-1">vLLM Deploy</Btn>
                  <Btn variant="ghost" size="sm" icon="flask">Evaluation</Btn>
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
    { key: "dict",   label: "Biz Meta Glossary" },
    { key: "label",  label: "Human-in-the-Loop Labeling", count: 5 },
    { key: "ods",    label: "Nightly ODS Monitoring" },
    { key: "model",  label: "Model Catalog" },
  ];
  return (
    <div className="flex-1 flex flex-col min-h-0">
      <TopBar crumbs={["Data Governance", tabs.find(t => t.key === tab).label]} />
      <div className="px-5 pt-4 pb-3 border-b border-line bg-ink-800 flex items-center gap-3">
        <Tabs tabs={tabs} value={tab} onChange={setTab} />
        <div className="ml-auto flex items-center gap-2">
          <Chip tone="ok" icon="check">ODS Normal</Chip>
          <Btn variant="ghost" size="sm" icon="settings">Pipeline Settings</Btn>
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
