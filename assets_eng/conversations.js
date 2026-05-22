// LLM Conversation Data — Real police task scenarios + light work Automation
window.CONVERSATIONS = {

  // ============================================================
  // 1) vehicle trace (existing)
  // ============================================================
  'vehicle-track': {
    title: 'Vehicle Tracking — Plate 7-Na-1234',
    meta: 'Classification: Internal Only · case number 2026-Cyber-0418 · auditID #A82F-91C2',
    model: 'police-llm-13b',
    agents: [
      { name: '@VehicleLookup', sys: 'KOR-VEH-DB · KICS' },
      { name: '@PlateEnhance', sys: 'plate-enhance-v2' },
      { name: '@OCR', sys: 'k-ocr-v3' },
    ],
    systems: ['KOR-VEH-DB', 'KICS', 'Audit Log API'],
    messages: [
      { who: 'user', name: 'Jang Ji-hoon Lieutenant', time: '14:32',
        body: `<div class="att-img"><div class="thumb"><svg width="14" height="14" viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.4"><rect x="2" y="3" width="12" height="10" rx="1"/><path d="m2 11 3-3 2 2 3-4 4 5"/></svg></div><div><div>CCTV_2026-05-19_14-12.jpg</div><div style="font-size:11px;color:var(--text-mut)">1.8 MB · 1920×1080</div></div></div><p>Vehicle fleeing Yeouido intersection — captured by CCTV. The plate is blurry; if you can read it, please consolidate the owner info in one go.</p>`
      },
      { who: 'auxiliaryant', time: '14:32',
        body: `<p>Identifying plate → looking up vehicle/owner in sequence.</p>
${toolCall('image enhancement (plate-enhance-v2)', 'Plate ROI 320×120 → 4× SR · denoising', '✓ 0.8s', 'PSNR ↑ 28.4 → 36.1dB · output: enhanced_plate_82fa.png')}
${toolCall('OCR (k-ocr-v3 / plate variant)', 'Korean plate LPRNet · confidence threshold 0.85', '✓ 0.3s', 'Result: <b style="color:var(--text)">7 1234</b>  · conf 0.962')}
${toolCall('vehicleArt (KOR-VEH-DB)', 'Vehicle Registry · Warrant scope: 2026-Cyber-0418', '✓ 1.2s', 'SELECT * FROM vehicles WHERE plate = &#39;71234&#39; LIMIT 1\n→ 1 row')}
<p style="margin-top:14px;">Art result organized.</p>
<div style="border:1px solid var(--border); border-radius: var(--r-md); overflow:hidden; margin: 8px 0;">
  <table class="tbl" style="font-size:13px;">
    <tbody>
      <tr><td style="width:35%;color:var(--text-mut);">Plate</td><td class="mono" style="color:var(--text)">7 1234</td></tr>
      <tr><td style="color:var(--text-mut);">Make · Color</td><td>Hyundai Grandeur (IG) · Black</td></tr>
      <tr><td style="color:var(--text-mut);">Owner</td><td>Kim ○○ <span class="chip green">real-name match</span></td></tr>
      <tr><td style="color:var(--text-mut);">Priors / Related Cases</td><td>2 related cases (2024-Drug-0091, 2025-Fraud-2231)</td></tr>
    </tbody>
  </table>
</div>
<p>Related Cases 2 items Search <code>@CaseLookup</code> Agent Add as callsshall we?<sup style="color:var(--accent)">[1][2]</sup></p>`,
        citations: [
          { ix: 1, label: 'Vehicle Registry data · KOR-VEH-DB', sub: '/ vehicles table · 2026-05-19 14:32', type: 'DB' },
          { ix: 2, label: 'National Police Agency IT Planning Bureau — Comm/Vehicle Lookup Guideline §3.2', sub: '/ Warrant-based lookup procedure', type: 'DOC' },
        ]
      },
    ],
    sources: [
      { ix: 1, title: 'Vehicle Registry', snippet: 'vehicles table · 1 row matched plate 7-Na-1234', meta: 'KOR-VEH-DB · 14:32', type: 'DB' },
      { ix: 2, title: 'Comm/Vehicle Lookup Guideline §3.2', snippet: '"Warrant-based lookups must be scoped by case number..."', meta: 'policy-2025-v3.pdf p.14', type: 'DOC' },
    ],
    warrant: '2026-Cyber-0418 · expires 2026-06-12',
  },

  // ============================================================
  // 2) comm records(CDR) summary — Pandas + GraphAgent
  // ============================================================
  'cdr-summary': {
    title: 'Comm Data Summary (2026-W19)',
    meta: 'Case 2026-Cyber-0418 · Comm Privacy Protection Act Art. 13 / auditID #B14E-22A1',
    model: 'police-llm-13b · CDR-summarizer',
    agents: [
      { name: '@CDRSummarize', sys: 'KT/SKT/LGU+ comm records standard' },
      { name: '@CommGraph', sys: 'Neo4j · neo-cdr' },
      { name: '@PIIMask', sys: 'face-redact / pii-redact-v2' },
    ],
    systems: ['comm records ETL', 'Neo4j neo-cdr', 'Audit Log API'],
    messages: [
      { who: 'user', name: 'Jang Ji-hoon Lieutenant', time: '11:02',
        body: `<div class="att-img"><div class="thumb">📄</div><div><div>CDR_Kim ○○_2026-W19.csv</div><div style="font-size:11px;color:var(--text-mut)">4,182 rows · 7-day</div></div></div><p>suspect Kim ○○'s 1 week CDRis. top 5 frequent call numbers, dawn call pattern, usual and other outgoing location summarydo.</p>`
      },
      { who: 'auxiliaryant', time: '11:02',
        body: `${toolCall('CDRsummary', 'Pandas ETL · call frequency/duration/Timezone Tally', '✓ 1.4s', 'Total 4,182 · unique numbers 312 · night(22–04h) call share 23%')}
${toolCall('commgraph', 'send/receive graph build · 1-hop frequentcall', '✓ 0.6s', 'nodes 313 · edges 4,182 · 4 clusters found')}
${toolCall('PIImasking', 'Mask last 4 digits in output', '✓ 0.1s', '')}
<p style="margin-top:14px;">Summary.</p>
<table class="tbl" style="font-size:13px; margin:6px -4px;">
  <thead><tr><th>Rank</th><th>Number</th><th>call count</th><th>Total Time</th><th>Peak Hours</th></tr></thead>
  <tbody>
    <tr><td>1</td><td class="mono">010-2***-****</td><td class="mono">412</td><td class="mono">8h 12m</td><td>22–02</td></tr>
    <tr><td>2</td><td class="mono">010-7***-****</td><td class="mono">214</td><td class="mono">3h 04m</td><td>09–18</td></tr>
    <tr><td>3</td><td class="mono">010-4***-****</td><td class="mono">188</td><td class="mono">2h 41m</td><td>Mixed</td></tr>
    <tr><td>4</td><td class="mono">02-***-****</td><td class="mono">64</td><td class="mono">1h 22m</td><td>Business hours</td></tr>
    <tr><td>5</td><td class="mono">010-9***-****</td><td class="mono">52</td><td class="mono">38m</td><td>Weekend dawn</td></tr>
  </tbody>
</table>
<p style="margin-top:8px;"><b style="color:var(--text)">above Pattern:</b> #1 number's call 78% concentrated in 22–04hh normal call pattern(Weekly 60%) and differs greatly. also, since 4/15, outgoing cell tower Bupyeong-gu, Incheon → Yeongdeungpo-gu, Seoul as moved; user movement change estimated.<sup style="color:var(--accent)">[1][2]</sup></p>
<p>#1 number subscriber lookup -ly warrant is required. commfact-verification document request form Draft draft?</p>`,
        citations: [
          { ix: 1, label: 'CDR_Kim ○○_2026-W19.csv', sub: '/ ETL result · neo-cdr', type: 'DB' },
          { ix: 2, label: 'Cell-tower location index (LBS)', sub: '/ ETRI LBS standard', type: 'GEO' },
        ]
      },
    ],
    sources: [
      { ix: 1, title: 'CDR_Kim ○○_2026-W19', snippet: 'call 4,182 · unique number 312', meta: 'CDR-ETL · 11:02', type: 'DB' },
      { ix: 2, title: 'Cell-tower location index', snippet: 'Moved Bupyeong-gu, Incheon → Yeongdeungpo-gu, Seoul (4/15)', meta: 'LBS', type: 'GEO' },
    ],
    warrant: '2026-Cyber-0418 · commfact-verification document',
  },

  // ============================================================
  // 3) SNS threat speech — GraphRAG
  // ============================================================
  'sns-threat': {
    title: 'SNS Threat Speech Classification',
    meta: 'Cyber incident #2026-118 · monitoring auto collect',
    model: 'police-llm-13b · GraphRAG',
    agents: [
      { name: '@SNSCollect', sys: 'X / Telegram / DC Inside (Public API)' },
      { name: '@ThreatClassify', sys: 'threat-classify-v3' },
      { name: '@GraphRAG', sys: 'Neo4j · threat-person-case graph' },
      { name: '@WarrantDraft', sys: 'Law Info RAG' },
    ],
    systems: ['SNS monitoring pipeline', 'Neo4j threat-graph', 'National Law Information Center'],
    messages: [
      { who: 'user', name: 'Jang Ji-hoon Lieutenant', time: '09:34',
        body: `<p>From threats collected in the past 24 hours, show only the top 5 with high execution risk; include estimated same-author relations.</p>`
      },
      { who: 'auxiliaryant', time: '09:34',
        body: `${toolCall('SNScollect', '24h window · Keyword set v7 · Public postsonly', '✓ 2.1s', 'collect 2,408 → first filter after 142 items')}
${toolCall('threat classifier', 'threat-classify-v3 · multi-label (executability/target/means)', '✓ 0.8s', 'high-risk(executability ≥ 0.7) 11 items')}
${toolCall('GraphRAG', 'author-IP-device fingerprint-language style graph search', '✓ 1.6s', 'same author estimated cluster 3')}
<p style="margin-top:14px;">Top 5 (risk descending order)</p>
<table class="tbl" style="font-size:13px; margin:6px -4px;">
  <thead><tr><th>#</th><th>post time</th><th>platform</th><th>gist (masking)</th><th>executability</th><th>target</th><th>cluster</th></tr></thead>
  <tbody>
    <tr><td>1</td><td class="mono">05-19 03:14</td><td>X</td><td>specific person residence·schedule time-specific speech</td><td><span class="chip red">0.92</span></td><td>public figure</td><td class="mono">C-α (3)</td></tr>
    <tr><td>2</td><td class="mono">05-18 22:48</td><td>Telegram</td><td>Share multi-location simultaneous explosion scenarios</td><td><span class="chip red">0.88</span></td><td>multiple</td><td class="mono">C-β (5)</td></tr>
    <tr><td>3</td><td class="mono">05-19 01:02</td><td>DC Inside</td><td>school + weapon purchase context</td><td><span class="chip amber">0.78</span></td><td>school</td><td class="mono">C-γ</td></tr>
    <tr><td>4</td><td class="mono">05-18 19:30</td><td>X</td><td>government office Timezone specific threat</td><td><span class="chip amber">0.74</span></td><td>government office</td><td class="mono">C-α (3)</td></tr>
    <tr><td>5</td><td class="mono">05-19 06:11</td><td>Telegram</td><td>specific religious facility defamation/</td><td><span class="chip amber">0.71</span></td><td>religious facility</td><td class="mono">—</td></tr>
  </tbody>
</table>
<p style="margin-top:8px;"><b style="color:var(--text)">cluster C-α</b> (1·#4) same author as estimated (Jaccard 0.84, writing style similar 0.91). #1 posts about Cyber Investigation Unit Urgent trace request + comm records warrant request is priority.</p>
<p>#1 posts about comm records search & seizure warrant application Draft draft?<sup style="color:var(--accent)">[1][2]</sup></p>`,
        citations: [
          { ix: 1, label: 'GraphRAG: threat-person-case graph', sub: '/ Neo4j · threat-graph', type: 'DB' },
          { ix: 2, label: 'National Law Information Center — Comm Privacy Protection Act §13', sub: '/ warrant request  items', type: 'DOC' },
        ]
      },
    ],
    sources: [
      { ix: 1, title: 'threat-graph cluster C-α', snippet: '3, same IP range + same writing-style pattern', meta: 'Neo4j · 09:34', type: 'DB' },
      { ix: 2, title: 'Comm Privacy Protection Act §13', snippet: '"Prosecutor or judicial police officer for investigation…"', meta: 'Law Info RAG law-v3', type: 'DOC' },
    ],
    warrant: 'Cyber incident #2026-118',
  },

  // ============================================================
  // 4) POLNET quokka memes auto DM — light work Automation (AX example)
  // ============================================================
  'polnet-quokka': {
    title: 'POLNET Quokka-Meme Auto Message',
    meta: 'Personal automation · personal use · Classification: Internal Only',
    model: 'police-llm-13b',
    agents: [
      { name: '@POLNETSearch', sys: 'POLNET board API (internal)' },
      { name: '@POLNETDM', sys: 'POLNET DM API (internal)' },
    ],
    systems: ['POLNET board', 'POLNET DMs', 'Personal Favorites'],
    isPersonal: true,
    messages: [
      { who: 'user', name: 'Jang Ji-hoon Lieutenant', time: '12:14',
        body: `<p>POLNET board at <b>"quokka memes"</b> search and new posts posted articles if exists, <b>My favorite colleagues</b>to auto to DM send. Messages "Today's quokka pic 🐹 — lunch hearty!" somewhato as gently.</p>`
      },
      { who: 'auxiliaryant', time: '12:14',
        body: `<p>light internal Automation. build the workflow I'll run it.</p>
${toolCall('POLNETSearch', 'board = "humor board" · Keyword "quokka memes" · within 24h', '✓ 0.4s', 'New posts 2 Found:\n#142,802 "Today's quokka (8 photos)"\n#142,815 "quokka eating apple meme"')}
${toolCall('My Favorites load', 'POLNET Favorites user list load', '✓ 0.2s', '7 users (Cyber Investigation Unit 4 · Traffic Division 2 · IT Planning 1)')}
${toolCall('POLNETDM', '7 people DMed · Body + posts  links (2)', '✓ 1.1s', 'send Success 7 / Failed 0')}
<p style="margin-top:14px;">send Complete ✅</p>
<table class="tbl" style="font-size:13px;margin:6px -4px;">
  <thead><tr><th>recipient</th><th>Affiliation</th><th>Status</th></tr></thead>
  <tbody>
    <tr><td>Lee Ji-won Lieutenant</td><td>Cyber Investigation Unit</td><td><span class="chip green">deliver</span></td></tr>
    <tr><td>Park Seo-yeon Sergeant</td><td>Cyber Investigation Unit</td><td><span class="chip green">deliver</span></td></tr>
    <tr><td>Choi Min-ho Lieutenant</td><td>Cyber Investigation Unit</td><td><span class="chip green">read</span></td></tr>
    <tr><td>Han Ji-young Sergeant</td><td>Cyber Investigation Unit</td><td><span class="chip green">deliver</span></td></tr>
    <tr><td>Kim Tae-hoon Lieutenant</td><td>Traffic Division</td><td><span class="chip green">deliver</span></td></tr>
    <tr><td>Jeong Min-jae Sergeant</td><td>Traffic Division</td><td><span class="chip green">deliver</span></td></tr>
    <tr><td>Kang Yu-ri Officer</td><td>IT Planning Bureau</td><td><span class="chip green">read</span></td></tr>
  </tbody>
</table>
<p style="margin-top:8px;"> workflow <b>Daily lunch 12</b> to auto-run register? Save to 'My Workspace → Schedule Agent'.</p>
<div class="row" style="gap:6px;margin-top:10px;">
  <button class="btn sm primary">Daily 12 auto Run</button>
  <button class="btn sm">one time only Run</button>
  <button class="btn sm ghost">Agent as Save</button>
</div>`,
      },
    ],
    sources: [
      { ix: 1, title: 'POLNET board / humor board', snippet: '"quokka memes" Search result New 2 items', meta: 'POLNET API · 12:14', type: 'API' },
    ],
    warrant: ' per none (internal systems · Personal automation)',
  },

  // ============================================================
  // 5) Statement summary (Missing Child)
  // ============================================================
  'missing-child': {
    title: 'Missing Child Statement Summary — Case #21-403',
    meta: 'Child Safety Division · classifier: Confidential · Minor PII enhance',
    model: 'police-llm-13b · summarize-extract',
    agents: [
      { name: '@SpeechToText', sys: 'voice-stt-kr (whisper-large-kr)' },
      { name: '@Summarize', sys: 'summarize-extract-v2' },
      { name: '@PIIMask', sys: 'pii-redact-v2 (minor enhance)' },
      { name: '@Timeline', sys: 'timeline-builder' },
    ],
    systems: ['Statement audio archive', 'Missing Childsearch systems', 'KICS'],
    messages: [
      { who: 'user', name: 'Jang Ji-hoon Lieutenant', time: '13:18',
        body: `<div class="att-img"><div class="thumb">🎤</div><div><div>Statement audio_21-403_guardian.wav</div><div style="font-size:11px;color:var(--text-mut)">14min 22sec · 48kHz</div></div></div><p>It's the guardian's statement audio. Organize chronologically; key items include last-seen time/location·clothing·companion wiki pull as key points.</p>`
      },
      { who: 'auxiliaryant', time: '13:18',
        body: `${toolCall('voice transcription', 'Korean STT · speaker separation · noise removed', '✓ 18s', '4,182-character text · 2 speakers')}
${toolCall('summary', 'chronological summary + wiki entity extraction', '✓ 1.2s', 'Major Events 7 · entity 12')}
${toolCall('PIImasking', 'Minor Name·school auto masking', '✓ 0.3s', '14 masked tokens')}
${toolCall('timeline', 'hour phrase normalize → build timeline', '✓ 0.4s', '7-point timeline')}
<p style="margin-top:14px;"><b style="color:var(--text)">core summary</b></p>
<table class="tbl" style="font-size:13px;margin:6px -4px;">
  <tbody>
    <tr><td style="width:30%;color:var(--text-mut);">target</td><td>K○○ (masking) · 9yr</td></tr>
    <tr><td style="color:var(--text-mut);">last sighting</td><td>2026-05-18 17:42</td></tr>
    <tr><td style="color:var(--text-mut);">location</td><td>○○ Elementary School main gate area (masking) · CCTV 4-unit radius</td></tr>
    <tr><td style="color:var(--text-mut);">clothing</td><td>sky-blue hoodie · black backpack · white sneakers</td></tr>
    <tr><td style="color:var(--text-mut);">companion</td><td>none (mother statement basis)</td></tr>
    <tr><td style="color:var(--text-mut);">Recent changed</td><td>previous day night outing  too (mother statement)</td></tr>
  </tbody>
</table>
<p style="margin-top:8px;">radius 800m CCTV across 14 units <code>@CCTVTimeMatch</code> Agent as 17:30–18:30 window auto search recommended.</p>`,
      },
    ],
    sources: [
      { ix: 1, title: 'Statement audio_21-403_guardian.wav', snippet: '4,182-character STT result', meta: 'voice-stt-kr · 13:18', type: 'FILE' },
    ],
    warrant: 'Missing Child Emergency Action §9',
  },

  // ============================================================
  // 6) search-and-seizure warrant application Review
  // ============================================================
  'warrant-review': {
    title: 'Search Warrant Application Review',
    meta: 'Case 2025-Fraud-2231 · Legal Team DictionaryReview',
    model: 'police-llm-13b · LawRAG',
    agents: [
      { name: '@LawSearch', sys: 'National Law Information Center RAG (law-v3)' },
      { name: '@precedentSearch', sys: 'Supreme Court Integrated Law Info' },
      { name: '@FormCheck', sys: 'KICS form verifier' },
    ],
    systems: ['National Law Information Center', 'Supreme Court Integrated Law Info', 'KICS'],
    messages: [
      { who: 'user', name: 'Jang Ji-hoon Lieutenant', time: '09:42',
        body: `<div class="att-img"><div class="thumb">📄</div><div><div>warrant application_2025-Fraud-2231_Draft.docx</div><div style="font-size:11px;color:var(--text-mut)">8 pages</div></div></div><p> Review the warrant application draft. across statute, precedent, and form.</p>`
      },
      { who: 'auxiliaryant', time: '09:42',
        body: `${toolCall('form check', 'KICS form v2026.3 basis field map', '✓ 0.4s', '2 unfilled fields · 1 format error')}
${toolCall('LawSearch', 'law-v3 · Criminal Procedure Act · Comm Privacy Protection Act citation Verified', '✓ 1.2s', 'all 4 citations valid · §215 notation correction needed')}
${toolCall('precedentSearch', 'Recent 5 years similar precedent matched', '✓ 0.8s', 'Related precedent 3 (2023-Do-12345, etc.)')}
<p style="margin-top:14px;"><b style="color:var(--text)">Review result — 3 fix recommended</b></p>
<ol style="margin:6px 0 0; padding-left:20px;">
  <li><b>p.2</b> "Criminal Procedure Act §215 ¶1" → <b>"Criminal Procedure Act Art. 215 §1"</b> (common notation)</li>
  <li><b>p.4</b> seizure target list "electronic records whole" phrase broad scope — Supreme Court 202312345 verdict per intent <b>"suspect X and related transaction email·Messages limit to"</b>  to limitation recommended</li>
  <li><b>p.6</b> KICS form requiredfield "seizure post-handling method" unfilled</li>
</ol>
<p style="margin-top:10px;">fixes in docx changed (Track Changes) marks format to shall I output?<sup style="color:var(--accent)">[1][2][3]</sup></p>`,
        citations: [
          { ix: 1, label: 'National Law Information Center — Criminal Procedure Act §215', sub: '/ law-v3', type: 'DOC' },
          { ix: 2, label: 'Supreme Court 202312345', sub: '/ Integrated Law Info', type: 'DOC' },
          { ix: 3, label: 'KICS warrant form v2026.3', sub: '/ form verifier', type: 'API' },
        ]
      },
    ],
    sources: [
      { ix: 1, title: 'Criminal Procedure Act §215', snippet: '"A prosecutor, when needed for criminal investigation,…"', meta: 'law-v3', type: 'DOC' },
      { ix: 2, title: 'Supreme Court 202312345', snippet: '""Comprehensive seizure-target phrases are...""', meta: 'Integrated Law Info', type: 'DOC' },
    ],
    warrant: 'request all DictionaryReview',
  },

  // ============================================================
  // 7) Voice-phishing classifier result explain
  // ============================================================
  'phishing': {
    title: 'Voice-phishing Pattern Classifier Results',
    meta: 'call center report 24h · auto classifier after issite extract',
    model: 'phishing-classify-v2.4 + police-llm-13b',
    agents: [
      { name: '@PhishingClassify', sys: 'phishing-classify-v2.4' },
      { name: '@TrendAnalysis', sys: 'trend-analyzer' },
    ],
    systems: ['112 Call Center', 'FSS Data', 'KICS'],
    messages: [
      { who: 'user', name: 'Jang Ji-hoon Lieutenant', time: '15:08',
        body: `<p>Looking at today's 412 voice-phishing classification results,, briefly summarize new scenarios or variant patterns added this week.</p>`
      },
      { who: 'auxiliaryant', time: '15:08',
        body: `${toolCall('VoicePhishingClassifier', '412 items · 12 categories · F1 0.94', '✓ 1.0s', 'Classification complete · 8 new unclassified items')}
${toolCall('TrendsAnalysis', 'past 4wk baseline z-score', '✓ 0.6s', 'Significant increase 2 · New variant 1')}
<p style="margin-top:14px;"><b style="color:var(--text)">Friwk wkThu pattern</b></p>
<ul style="margin:6px 0;padding-left:18px;">
  <li><b>"Prosecution subpoena" variant</b> (+218%) — video calls newly added; fake Prosecutor General logos and forged emails included.</li>
  <li><b>"package undelivered" start → account login lure</b> pattern (+92%) — Impersonating legitimate services like KakaoT.</li>
  <li><b>New variant (unclassified 8):</b> "Court electronic service PDF" Attach + malicious app install lure. Recommend new category registration.</li>
</ul>
<p style="margin-top:10px;">New category <code>"court electronic service impersonation"</code> include in classifier's next training Dataset Labeling job shall we generate? (8 auto-assigned to the labeling admin)</p>`
      },
    ],
    sources: [
      { ix: 1, title: '112 Call Center 24h Data', snippet: '412 · 12 category', meta: '15 ETL', type: 'DB' },
    ],
    warrant: 'Aggregate analysis (aggregate analysis; no individual PII access)',
  },

  // ============================================================
  // 8) Cyber Incident Report Draft
  // ============================================================
  'cyber-report': {
    title: 'Cyber Incident Report Draft',
    meta: 'Incident #2026-118 · daily Operationsreporting',
    model: 'police-llm-13b · report-draft',
    agents: [
      { name: '@CaseLookup', sys: 'KICS Case index' },
      { name: '@LogAggregate', sys: 'ELK · Cyber Investigation Unit index' },
      { name: '@ReportWriter', sys: 'report-draft-v3' },
    ],
    systems: ['KICS', 'ELK Stack', 'internal report template archive'],
    messages: [
      { who: 'user', name: 'Jang Ji-hoon Lieutenant', time: '08:21',
        body: `<p>yesterday's incident #2026-118 Report Draft and build. Case Overview, damage scale, response actions, and future plan, in order.</p>`
      },
      { who: 'auxiliaryant', time: '08:21',
        body: `${toolCall('Caselookup', 'KICS · case_no=2026-118 Details', '✓ 0.5s', 'Case metadata + damage estimated')}
${toolCall('logTally', 'ELK · 5/18 00 ~ 23:59', '✓ 0.9s', 'Related Event 1,840 items')}
${toolCall('report drafting', 'internal form v4.2 · 4 sections auto filled', '✓ 1.1s', '7-page draft generated')}
<p style="margin-top:14px;">Report Draft Preview:</p>
<div style="border:1px solid var(--border);border-radius:var(--r-md);padding:14px;background:var(--panel-2);font-size:13px;line-height:1.65;">
  <div style="font-size:11px;color:var(--text-mut);text-transform:uppercase;letter-spacing:0.08em;">Cyber incident daily OperationsReport (Draft)</div>
  <h4 style="margin:8px 0 4px;font-size:13px;">1. Case Overview</h4>
  <p style="margin:0 0 8px;color:var(--text-mut);">2026.05.18 03:14: a threat post was caught on X by auto-monitoring and filed as incident #2026-118…</p>
  <h4 style="margin:8px 0 4px;font-size:13px;">2. damage scale</h4>
  <p style="margin:0 0 8px;color:var(--text-mut);">No actual harm occurred. for 3 target locations, pre-safety measures…</p>
  <h4 style="margin:8px 0 4px;font-size:13px;">3. response actions</h4>
  <p style="margin:0 0 8px;color:var(--text-mut);">Cyber Investigation Unit urgent tracing team formed (4) · GraphRAG based author cluster identify…</p>
  <h4 style="margin:8px 0 4px;font-size:13px;">4. Future Plan</h4>
  <p style="margin:0;color:var(--text-mut);">comm records warrant request (5/19), cluster C-α 3 identityverify in progress…</p>
</div>
<div class="row" style="gap:6px;margin-top:12px;">
  <button class="btn sm primary">DOCX download</button>
  <button class="btn sm">Approval Line Send</button>
  <button class="btn sm ghost">Regenerate section</button>
</div>`,
      },
    ],
    sources: [
      { ix: 1, title: 'KICS · Case #2026-118', snippet: 'Incident metadata', meta: 'KICS · 08:21', type: 'DB' },
      { ix: 2, title: 'ELK · Cyber Investigation Unit index', snippet: 'Event 1,840 items', meta: '05-18 24h', type: 'LOG' },
    ],
    warrant: 'internal reporting',
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
