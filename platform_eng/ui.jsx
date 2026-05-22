// =========================================================
// UI primitives + icons (shared across all dashboards)
// =========================================================

const Icon = ({ name, className = "w-4 h-4", strokeWidth = 1.6 }) => {
  const common = {
    width: "1em", height: "1em", viewBox: "0 0 24 24",
    fill: "none", stroke: "currentColor",
    strokeWidth, strokeLinecap: "round", strokeLinejoin: "round",
    className,
  };
  const P = {
    chat:        <path d="M21 11.5a8.4 8.4 0 0 1-1 4 8.4 8.4 0 0 1-7.5 4 8.4 8.4 0 0 1-4-1L3 21l1.5-5.5a8.4 8.4 0 0 1-1-4 8.4 8.4 0 0 1 4-7.5 8.4 8.4 0 0 1 4-1h.5a8.4 8.4 0 0 1 8 8z" />,
    store:       <><path d="M3 3h18l-1.5 5H4.5z" /><path d="M5 8v11a1 1 0 0 0 1 1h12a1 1 0 0 0 1-1V8" /><path d="M9 12h6" /></>,
    flask:       <><path d="M9 3h6" /><path d="M10 3v6L4 19a2 2 0 0 0 2 3h12a2 2 0 0 0 2-3l-6-10V3" /><path d="M7 14h10" /></>,
    cpu:         <><rect x="4" y="4" width="16" height="16" rx="2" /><rect x="9" y="9" width="6" height="6" /><path d="M9 2v2M15 2v2M9 20v2M15 20v2M2 9h2M2 15h2M20 9h2M20 15h2" /></>,
    shield:      <path d="M12 3 4 6v6c0 5 3.5 8.5 8 9 4.5-.5 8-4 8-9V6z" />,
    layers:      <><path d="M12 3 2 8l10 5 10-5z" /><path d="M2 13l10 5 10-5" /><path d="M2 18l10 5 10-5" /></>,
    book:        <><path d="M4 4v16a2 2 0 0 0 2 2h14V2H6a2 2 0 0 0-2 2z" /><path d="M4 20h16" /></>,
    database:    <><ellipse cx="12" cy="5" rx="8" ry="3" /><path d="M4 5v6c0 1.7 3.6 3 8 3s8-1.3 8-3V5" /><path d="M4 11v6c0 1.7 3.6 3 8 3s8-1.3 8-3v-6" /></>,
    moon:        <path d="M21 13A9 9 0 1 1 11 3a7 7 0 0 0 10 10z" />,
    sun:         <><circle cx="12" cy="12" r="4" /><path d="M12 2v2M12 20v2M2 12h2M20 12h2M4.9 4.9l1.4 1.4M17.7 17.7l1.4 1.4M4.9 19.1l1.4-1.4M17.7 6.3l1.4-1.4" /></>,
    search:      <><circle cx="11" cy="11" r="7" /><path d="m20 20-4.5-4.5" /></>,
    bell:        <><path d="M6 8a6 6 0 1 1 12 0c0 7 3 7 3 9H3c0-2 3-2 3-9z" /><path d="M10.3 21a2 2 0 0 0 3.4 0" /></>,
    plus:        <><path d="M12 5v14M5 12h14" /></>,
    send:        <path d="M22 2 11 13M22 2 15 22l-4-9-9-4z" />,
    clip:        <path d="M21.4 11 12 20.4a6 6 0 0 1-8.5-8.5l9.6-9.6a4 4 0 0 1 5.7 5.7L8.3 18.7a2 2 0 1 1-2.8-2.8L14 7.3" />,
    sparkle:     <path d="m12 3 1.5 5.5L19 10l-5.5 1.5L12 17l-1.5-5.5L5 10l5.5-1.5z" />,
    user:        <><circle cx="12" cy="8" r="4" /><path d="M4 21a8 8 0 0 1 16 0" /></>,
    users:       <><circle cx="9" cy="8" r="3.5" /><path d="M2 21a7 7 0 0 1 14 0" /><circle cx="17" cy="6" r="2.5" /><path d="M22 14a5 5 0 0 0-5-5" /></>,
    folder:      <path d="M3 5a2 2 0 0 1 2-2h4l2 2h8a2 2 0 0 1 2 2v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />,
    file:        <><path d="M14 3H6a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V9z" /><path d="M14 3v6h6" /></>,
    image:       <><rect x="3" y="3" width="18" height="18" rx="2" /><circle cx="9" cy="9" r="2" /><path d="m21 15-5-5L5 21" /></>,
    graph:       <><circle cx="6" cy="6" r="3" /><circle cx="18" cy="6" r="3" /><circle cx="12" cy="18" r="3" /><path d="M8.5 7.5l3.5 8M15.5 7.5l-3.5 8" /></>,
    chevron:     <path d="m9 6 6 6-6 6" />,
    chevronDown: <path d="m6 9 6 6 6-6" />,
    close:       <><path d="M6 6l12 12M18 6 6 18" /></>,
    check:       <path d="m5 12 5 5 9-12" />,
    info:        <><circle cx="12" cy="12" r="9" /><path d="M12 8v.01M11 12h1v5h1" /></>,
    warn:        <><path d="M10.3 3.86 1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" /><path d="M12 9v4M12 17v.01" /></>,
    lock:        <><rect x="4" y="11" width="16" height="10" rx="2" /><path d="M8 11V7a4 4 0 0 1 8 0v4" /></>,
    trash:       <><path d="M3 6h18M8 6V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2M5 6l1 14a2 2 0 0 0 2 2h8a2 2 0 0 0 2-2l1-14" /></>,
    trophy:      <><path d="M8 21h8M12 17v4M7 4h10v5a5 5 0 0 1-10 0z" /><path d="M3 5v2a3 3 0 0 0 4 3M21 5v2a3 3 0 0 1-4 3" /></>,
    medal:       <><circle cx="12" cy="15" r="6" /><path d="M8 9 6 3h12l-2 6" /></>,
    star:        <path d="M12 2.5 14.7 9 22 9.6l-5.5 4.9 1.7 7.5L12 18l-6.2 4 1.7-7.5L2 9.6 9.3 9z" />,
    download:    <><path d="M12 3v12M5 12l7 7 7-7M5 21h14" /></>,
    upload:      <><path d="M12 21V9M5 12l7-7 7 7M5 3h14" /></>,
    settings:    <><circle cx="12" cy="12" r="3" /><path d="M19.4 15a1.7 1.7 0 0 0 .3 1.8l.1.1a2 2 0 1 1-2.8 2.8l-.1-.1a1.7 1.7 0 0 0-1.8-.3 1.7 1.7 0 0 0-1 1.5V21a2 2 0 1 1-4 0v-.1a1.7 1.7 0 0 0-1.1-1.5 1.7 1.7 0 0 0-1.8.3l-.1.1a2 2 0 1 1-2.8-2.8l.1-.1a1.7 1.7 0 0 0 .3-1.8 1.7 1.7 0 0 0-1.5-1H3a2 2 0 1 1 0-4h.1a1.7 1.7 0 0 0 1.5-1.1 1.7 1.7 0 0 0-.3-1.8l-.1-.1a2 2 0 1 1 2.8-2.8l.1.1a1.7 1.7 0 0 0 1.8.3H9a1.7 1.7 0 0 0 1-1.5V3a2 2 0 1 1 4 0v.1a1.7 1.7 0 0 0 1 1.5 1.7 1.7 0 0 0 1.8-.3l.1-.1a2 2 0 1 1 2.8 2.8l-.1.1a1.7 1.7 0 0 0-.3 1.8V9a1.7 1.7 0 0 0 1.5 1H21a2 2 0 1 1 0 4h-.1a1.7 1.7 0 0 0-1.5 1z" /></>,
    refresh:     <><path d="M3 12a9 9 0 0 1 15-6.7L21 8" /><path d="M21 3v5h-5" /><path d="M21 12a9 9 0 0 1-15 6.7L3 16" /><path d="M3 21v-5h5" /></>,
    play:        <path d="m6 4 14 8L6 20z" />,
    edit:        <><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" /><path d="M18.5 2.5a2.1 2.1 0 0 1 3 3L12 15l-4 1 1-4z" /></>,
    eye:         <><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8S1 12 1 12z" /><circle cx="12" cy="12" r="3" /></>,
    kebab:       <><circle cx="12" cy="5" r="1.4" /><circle cx="12" cy="12" r="1.4" /><circle cx="12" cy="19" r="1.4" /></>,
    grid:        <><rect x="3" y="3" width="7" height="7" /><rect x="14" y="3" width="7" height="7" /><rect x="3" y="14" width="7" height="7" /><rect x="14" y="14" width="7" height="7" /></>,
    activity:    <path d="M3 12h4l3-9 4 18 3-9h4" />,
    branch:      <><circle cx="6" cy="3" r="2" /><circle cx="6" cy="21" r="2" /><circle cx="18" cy="12" r="2" /><path d="M6 5v14M6 12c0-3 3-5 6-5l4 0" /></>,
    pin:         <><path d="M12 17v5M9 9V3h6v6l3 4H6z" /></>,
  };
  return <svg {...common}>{P[name] || P.info}</svg>;
};

// -- Emblem / brand mark
const Emblem = ({ size = 28 }) => (
  <svg width={size} height={size} viewBox="0 0 64 64" className="text-gold">
    <path d="M32 4 L56 12 V30 C56 44 46 54 32 60 C18 54 8 44 8 30 V12 Z"
          fill="none" stroke="currentColor" strokeWidth="2.6" />
    <path d="M32 14 L46 18 V30 C46 39 40 46 32 50 C24 46 18 39 18 30 V18 Z"
          fill="currentColor" opacity="0.12" />
    <path d="M32 22 L34.2 28.5 L41 28.5 L35.4 32.5 L37.6 39 L32 35 L26.4 39 L28.6 32.5 L23 28.5 L29.8 28.5 Z"
          fill="currentColor" />
  </svg>
);

// -- Chip / Badge
const Chip = ({ tone = "neutral", children, className = "", icon }) => {
  const tones = {
    neutral: "bg-ink-600 text-text-mut border-line",
    brand:   "bg-brand-700/20 text-brand-300 border-brand-700/40",
    ok:      "bg-ok/15 text-ok border-ok/30",
    warn:    "bg-warn/15 text-warn border-warn/30",
    danger:  "bg-danger/15 text-danger border-danger/30",
    gold:    "bg-gold/15 text-gold border-gold/30",
    silver:  "bg-silver/15 text-silver border-silver/30",
    bronze:  "bg-bronze/25 text-orange-300 border-bronze/40",
  };
  return (
    <span className={`inline-flex items-center gap-1 px-2 py-[2px] rounded-full border text-[11px] font-medium ${tones[tone]} ${className}`}>
      {icon && <Icon name={icon} className="w-3 h-3" />}
      {children}
    </span>
  );
};

// -- Card
const Card = ({ title, sub, right, children, className = "", padded = true, glow = false }) => (
  <div className={`${glow ? "panel-glow" : "bg-ink-700"} border border-line rounded-lg ${className}`}>
    {(title || right) && (
      <div className="flex items-end gap-3 px-4 pt-3.5 pb-2.5 border-b border-line/70">
        <div className="min-w-0">
          {title && <h3 className="text-[13.5px] font-semibold text-text-hi tracking-tight">{title}</h3>}
          {sub && <p className="text-[11.5px] text-text-mut mt-0.5">{sub}</p>}
        </div>
        {right && <div className="ml-auto flex items-center gap-2">{right}</div>}
      </div>
    )}
    <div className={padded ? "p-4" : ""}>{children}</div>
  </div>
);

// -- Stat tile
const Stat = ({ label, value, unit, delta, tone = "ok", icon }) => (
  <div className="bg-ink-700 border border-line rounded-lg p-3.5">
    <div className="flex items-center gap-1.5 text-[11px] text-text-mut">
      {icon && <Icon name={icon} className="w-3.5 h-3.5" />}
      <span className="uppercase tracking-wider text-[10px]">{label}</span>
    </div>
    <div className="mono text-[22px] text-text-hi mt-1 leading-none">
      {value}<span className="text-[12px] text-text-mut ml-1">{unit}</span>
    </div>
    {delta && (
      <div className={`mono text-[10.5px] mt-1 ${tone === "ok" ? "text-ok" : tone === "danger" ? "text-danger" : "text-warn"}`}>
        {delta}
      </div>
    )}
  </div>
);

// -- Button
const Btn = ({ children, variant = "secondary", size = "md", icon, className = "", ...rest }) => {
  const v = {
    primary:   "bg-brand-600 hover:bg-brand-500 text-white border-brand-600",
    secondary: "bg-ink-600 hover:bg-ink-500 text-text-hi border-line-hard",
    ghost:     "bg-transparent hover:bg-ink-600 text-text-mut hover:text-text-hi border-transparent",
    danger:    "bg-danger/15 hover:bg-danger/25 text-danger border-danger/30",
  }[variant];
  const s = {
    sm: "h-7 px-2.5 text-[11.5px] gap-1",
    md: "h-8 px-3 text-[12.5px] gap-1.5",
    lg: "h-10 px-4 text-[13.5px] gap-2",
  }[size];
  return (
    <button {...rest} className={`inline-flex items-center justify-center rounded-md font-medium border transition ${v} ${s} ${className}`}>
      {icon && <Icon name={icon} className="w-3.5 h-3.5" />}
      {children}
    </button>
  );
};

// -- Progress bar
const Bar = ({ value, max = 100, tone = "brand", className = "h-1.5" }) => {
  const pct = Math.min(100, (value / max) * 100);
  const fill = {
    brand: "bg-gradient-to-r from-brand-700 to-brand-400",
    warn:  "bg-gradient-to-r from-warn to-gold",
    danger:"bg-gradient-to-r from-danger to-rose-400",
    ok:    "bg-gradient-to-r from-emerald-600 to-ok",
  }[tone];
  return (
    <div className={`relative ${className} rounded-full bg-ink-500 overflow-hidden`}>
      <div className={`${fill} h-full rounded-full`} style={{ width: `${pct}%` }}></div>
    </div>
  );
};

// -- Donut chart (SVG)
const Donut = ({ size = 96, stroke = 10, segments }) => {
  // segments: [{value, color}], sum = 100
  const r = (size - stroke) / 2;
  const c = 2 * Math.PI * r;
  let offset = 0;
  return (
    <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
      <circle cx={size/2} cy={size/2} r={r} fill="none" stroke="#1f2b4d" strokeWidth={stroke} />
      {segments.map((s, i) => {
        const len = (s.value / 100) * c;
        const dash = `${len} ${c - len}`;
        const el = (
          <circle key={i} cx={size/2} cy={size/2} r={r}
            fill="none" stroke={s.color} strokeWidth={stroke}
            strokeDasharray={dash} strokeDashoffset={-offset}
            transform={`rotate(-90 ${size/2} ${size/2})`}
            strokeLinecap="butt" />
        );
        offset += len;
        return el;
      })}
    </svg>
  );
};

// -- Sparkline
const Spark = ({ data, width = 100, height = 28, color = "#4f8fe0", fill = true }) => {
  const max = Math.max(...data), min = Math.min(...data);
  const range = max - min || 1;
  const stepX = width / (data.length - 1);
  const pts = data.map((v, i) => `${i * stepX},${height - ((v - min) / range) * (height - 4) - 2}`).join(" ");
  return (
    <svg width={width} height={height} viewBox={`0 0 ${width} ${height}`}>
      {fill && <polyline points={`0,${height} ${pts} ${width},${height}`} fill={color} fillOpacity="0.12" stroke="none" />}
      <polyline points={pts} fill="none" stroke={color} strokeWidth="1.5" />
    </svg>
  );
};

// -- Avatar
const Avatar = ({ name, tone = "brand", size = 28, kind = "user" }) => {
  const ch = (name || "?").slice(0, 1);
  const palette = {
    brand: "from-brand-600 to-brand-900 text-white",
    bot:   "from-ink-500 to-ink-800 text-gold ring-1 ring-gold/40",
    g1:    "from-violet-700 to-violet-900 text-white",
    g2:    "from-emerald-700 to-emerald-900 text-white",
    g3:    "from-orange-700 to-orange-900 text-white",
    g4:    "from-cyan-700 to-cyan-900 text-white",
  };
  return (
    <div
      className={`inline-grid place-items-center rounded-md bg-gradient-to-br font-semibold ${palette[tone]}`}
      style={{ width: size, height: size, fontSize: size * 0.42 }}
    >
      {kind === "bot" ? <Icon name="sparkle" className="w-3.5 h-3.5" /> : ch}
    </div>
  );
};

// -- Tabs
const Tabs = ({ tabs, value, onChange, size = "md", className = "" }) => {
  const s = size === "sm" ? "h-7 text-[11.5px] px-2.5" : "h-8 text-[12.5px] px-3";
  return (
    <div className={`inline-flex rounded-md border border-line bg-ink-700 p-1 gap-1 ${className}`}>
      {tabs.map(t => {
        const active = (typeof t === 'string' ? t : t.key) === value;
        const key = typeof t === 'string' ? t : t.key;
        const label = typeof t === 'string' ? t : t.label;
        const count = typeof t === 'object' ? t.count : null;
        return (
          <button
            key={key}
            onClick={() => onChange(key)}
            className={`inline-flex items-center gap-1.5 rounded ${s} font-medium transition ${
              active ? "bg-brand-700/30 text-brand-300" : "text-text-mut hover:text-text-hi"
            }`}
          >
            {label}
            {count != null && (
              <span className={`mono text-[10px] px-1.5 py-px rounded ${active ? "bg-brand-600/30" : "bg-ink-600"}`}>{count}</span>
            )}
          </button>
        );
      })}
    </div>
  );
};

// -- Dot
const Dot = ({ tone = "ok", pulse = false }) => {
  const map = { ok: "bg-ok", warn: "bg-warn", danger: "bg-danger", brand: "bg-brand-400", mut: "bg-text-dim" }[tone];
  return <span className={`inline-block w-1.5 h-1.5 rounded-full ${map} ${pulse && tone === 'ok' ? 'pulse-ok' : ''}`}></span>;
};

// -- Section heading
const SectionTitle = ({ children, sub, right }) => (
  <div className="flex items-end gap-3 mb-3">
    <div>
      <h2 className="text-[15px] font-semibold text-text-hi tracking-tight">{children}</h2>
      {sub && <p className="text-[12px] text-text-mut mt-0.5">{sub}</p>}
    </div>
    {right && <div className="ml-auto flex items-center gap-2">{right}</div>}
  </div>
);

// -- Top bar (shared shell)
const TopBar = ({ crumbs = [], actions }) => (
  <div className="h-14 border-b border-line bg-ink-800/95 backdrop-blur flex items-center gap-4 px-5 shrink-0 relative z-10">
    <div className="flex items-center gap-2 text-[13px]">
      {crumbs.map((c, i) => (
        <React.Fragment key={i}>
          <span className={i === crumbs.length - 1 ? "text-text-hi font-medium" : "text-text-mut"}>{c}</span>
          {i < crumbs.length - 1 && <span className="text-text-dim">/</span>}
        </React.Fragment>
      ))}
    </div>

    <div className="ml-auto flex items-center gap-3">
      <div className="hidden md:flex items-center gap-2 h-8 px-3 rounded-md bg-ink-700 border border-line w-[260px] text-text-mut text-[12px]">
        <Icon name="search" className="w-3.5 h-3.5" />
        <span>Global Search (cases · docs · agents)</span>
        <span className="mono ml-auto text-[10px] text-text-dim border border-line rounded px-1">⌘ K</span>
      </div>

      <div className="flex items-center gap-2 text-[11.5px] text-text-mut pr-3 border-r border-line">
        <Dot tone="ok" pulse />
        <span>On-prem Normal</span>
        <span className="text-text-dim mx-2">·</span>
        <span className="mono">Classification: Internal Only</span>
      </div>

      <button className="w-8 h-8 grid place-items-center rounded-md text-text-mut hover:text-text-hi hover:bg-ink-700 relative">
        <Icon name="bell" className="w-4 h-4" />
        <span className="absolute top-1 right-1 w-1.5 h-1.5 bg-danger rounded-full"></span>
      </button>

      <div className="flex items-center gap-2 h-8 pl-1 pr-3 rounded-full border border-line bg-ink-700">
        <Avatar name="Lead" tone="brand" size={22} />
        <div className="leading-tight">
          <div className="text-[11.5px] text-text-hi font-medium">Jang Ji-hoon Lieutenant</div>
          <div className="text-[9.5px] text-text-dim">Cyber Investigation Unit · L3</div>
        </div>
      </div>

      {actions}
    </div>
  </div>
);

// -- LNB / Sidebar
const Sidebar = ({ current, onNavigate }) => {
  const navItems = [
    { key: "chat",   icon: "chat",   label: "AI Assistant",      desc: "Chat · Agent Store", badge: 3 },
    { key: "mlops",  icon: "layers", label: "Data Governance",      desc: "MLOps · Labeling · Glossary" },
    { key: "llmops", icon: "flask",  label: "Prompt Lab",      desc: "LLMOps · A/B" },
    { key: "admin",  icon: "cpu",    label: "Resource Control",          desc: "Token · GPU · requestbox",     badge: 7 },
  ];

  return (
    <aside className="w-56 shrink-0 bg-ink-900 border-r border-line flex flex-col">
      {/* Brand block */}
      <div className="px-4 pt-4 pb-3 border-b border-line">
        <div className="flex items-center gap-2.5">
          <div className="w-9 h-9 rounded-md bg-gradient-to-br from-brand-700 to-brand-900 grid place-items-center border border-brand-600/30">
            <Emblem size={20} />
          </div>
          <div className="min-w-0">
            <div className="text-[13px] font-semibold text-text-hi leading-tight">NPA AI Integrated</div>
            <div className="text-[10px] text-text-dim mono tracking-wider mt-0.5">PIAP · v2.4</div>
          </div>
        </div>
      </div>

      {/* Nav */}
      <nav className="flex-1 overflow-y-auto px-2 py-3">
        <div className="text-[10px] uppercase tracking-[0.14em] text-text-dim font-semibold px-2 mb-1.5">Workspace</div>
        {navItems.map(item => {
          const active = current === item.key;
          return (
            <button
              key={item.key}
              onClick={() => onNavigate(item.key)}
              className={`w-full flex items-start gap-2.5 px-2.5 py-2 rounded-md text-left mb-0.5 relative transition ${
                active
                  ? "bg-brand-700/15 text-brand-300"
                  : "text-text-mut hover:bg-ink-700 hover:text-text-hi"
              }`}
            >
              {active && <span className="absolute -left-2 top-2 bottom-2 w-[3px] rounded-r bg-brand-400"></span>}
              <Icon name={item.icon} className="w-4 h-4 mt-0.5 shrink-0" />
              <div className="min-w-0 flex-1">
                <div className="text-[12.5px] font-medium leading-tight flex items-center gap-1.5">
                  {item.label}
                  {item.badge && (
                    <span className="mono text-[9.5px] px-1.5 rounded bg-danger/20 text-danger ml-auto">{item.badge}</span>
                  )}
                </div>
                <div className="text-[10.5px] text-text-dim mt-0.5">{item.desc}</div>
              </div>
            </button>
          );
        })}

        <div className="text-[10px] uppercase tracking-[0.14em] text-text-dim font-semibold px-2 mt-5 mb-1.5">Favorite Agents</div>
        {[
          { name: "@AccountTrace",       last: "10:08" },
          { name: "@LawSearch",       last: "Yesterday" },
          { name: "@DrugTrendDetect",    last: "03:42", warn: true },
          { name: "@StatementSummary",       last: "07:14" },
        ].map(a => (
          <button key={a.name} className="w-full flex items-center gap-2 px-2.5 py-1.5 rounded-md text-text-mut hover:bg-ink-700 hover:text-text-hi text-left">
            <span className="w-1.5 h-1.5 rounded-full bg-brand-400 shrink-0"></span>
            <span className="text-[12px] truncate">{a.name}</span>
            {a.warn && <span className="ml-auto w-1.5 h-1.5 bg-danger rounded-full"></span>}
            {!a.warn && <span className="mono ml-auto text-[9.5px] text-text-dim">{a.last}</span>}
          </button>
        ))}
      </nav>

      {/* Footer */}
      <div className="px-3 py-3 border-t border-line text-[10px] text-text-dim">
        <div className="flex items-center justify-between mb-1.5">
          <span className="flex items-center gap-1.5"><Dot tone="ok" pulse />A100×24 / H100×8</span>
          <span className="mono text-text-mut">72%</span>
        </div>
        <Bar value={72} className="h-1" />
        <div className="flex items-center justify-between mt-2.5 text-[10.5px]">
          <span>Model 142 users · Agents 38</span>
          <Icon name="settings" className="w-3.5 h-3.5 text-text-mut hover:text-text-hi cursor-pointer" />
        </div>
      </div>
    </aside>
  );
};

// Expose globally
Object.assign(window, {
  Icon, Emblem, Chip, Card, Stat, Btn, Bar, Donut, Spark, Avatar, Tabs, Dot,
  SectionTitle, TopBar, Sidebar,
});
