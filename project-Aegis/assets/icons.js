// SVG icon system — return inline SVG strings
// Stroke icons, 16x16 viewBox, currentColor
window.Icon = (name, size = 16) => {
  const paths = window.__ICONS[name] || window.__ICONS.box;
  return `<svg class="ico" width="${size}" height="${size}" viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.4" stroke-linecap="round" stroke-linejoin="round">${paths}</svg>`;
};

window.__ICONS = {
  shield: `<path d="M8 1.5 2 3.5v4c0 3.5 2.6 6.4 6 7 3.4-.6 6-3.5 6-7v-4L8 1.5Z"/><path d="m5.5 8 2 2 3-4"/>`,
  home:   `<path d="M2 7 8 2l6 5v6.5a.5.5 0 0 1-.5.5h-3v-4h-5v4h-3a.5.5 0 0 1-.5-.5V7Z"/>`,
  chat:   `<path d="M2 4.5A1.5 1.5 0 0 1 3.5 3h9A1.5 1.5 0 0 1 14 4.5v6a1.5 1.5 0 0 1-1.5 1.5H6l-3 2.5v-2.5A1.5 1.5 0 0 1 2 10.5v-6Z"/>`,
  bot:    `<rect x="2.5" y="5" width="11" height="8" rx="2"/><path d="M8 2v3M5.5 8.5h.5M10 8.5h.5"/><path d="M1 9.5h1.5M13.5 9.5H15"/>`,
  prompt: `<path d="M3 3h10v8H8l-3 3v-3H3V3Z"/><path d="M5.5 7h5M5.5 5h3"/>`,
  monitor:`<rect x="2" y="3" width="12" height="8" rx="1"/><path d="M6 13.5h4M8 11v2.5"/>`,
  catalog:`<path d="M3 3h10v10H3z"/><path d="M3 6h10M6 3v10"/>`,
  ide:    `<path d="m4.5 5-2 3 2 3M11.5 5l2 3-2 3M9.5 4l-3 8"/>`,
  test:   `<path d="M5.5 2v4l-3 6a1.5 1.5 0 0 0 1.3 2.3h8.4A1.5 1.5 0 0 0 13.5 12L10.5 6V2"/><path d="M5 2h6"/>`,
  deploy: `<path d="M8 12V3M4 6.5 8 3l4 3.5M3 13.5h10"/>`,
  cpu:    `<rect x="3.5" y="3.5" width="9" height="9" rx="1"/><rect x="6" y="6" width="4" height="4"/><path d="M6 1.5v2M10 1.5v2M6 12.5v2M10 12.5v2M1.5 6h2M1.5 10h2M12.5 6h2M12.5 10h2"/>`,
  data:   `<ellipse cx="8" cy="4" rx="5" ry="2"/><path d="M3 4v4c0 1.1 2.2 2 5 2s5-.9 5-2V4M3 8v4c0 1.1 2.2 2 5 2s5-.9 5-2V8"/>`,
  tag:    `<path d="M2.5 8.5 8.5 2.5h4v4l-6 6-4-4Z"/><circle cx="10.5" cy="5.5" r=".8"/>`,
  governance: `<path d="M8 1.5 2 3.5v4c0 3.5 2.6 6.4 6 7 3.4-.6 6-3.5 6-7v-4L8 1.5Z"/><path d="M8 5v3l2 1.5"/>`,
  history:`<path d="M3 8a5 5 0 1 0 1.5-3.5L3 6"/><path d="M3 3v3h3M8 5v3l2 1.5"/>`,
  search: `<circle cx="7" cy="7" r="4.5"/><path d="m13.5 13.5-3-3"/>`,
  bell:   `<path d="M4 11V7a4 4 0 1 1 8 0v4l1 1.5H3L4 11ZM6.5 12.5a1.5 1.5 0 0 0 3 0"/>`,
  sun:    `<circle cx="8" cy="8" r="2.5"/><path d="M8 1v1.5M8 13.5V15M1 8h1.5M13.5 8H15M3 3l1 1M12 12l1 1M3 13l1-1M12 4l1-1"/>`,
  moon:   `<path d="M13 9.5A5.5 5.5 0 1 1 6.5 3 4.5 4.5 0 0 0 13 9.5Z"/>`,
  arrow:  `<path d="M3.5 8h9M9 4.5 12.5 8 9 11.5"/>`,
  plus:   `<path d="M8 3v10M3 8h10"/>`,
  send:   `<path d="m2.5 8 11-5.5L11 13l-2.5-4.5L4 6.5l9-4"/>`,
  upload: `<path d="M8 11V3M4.5 6.5 8 3l3.5 3.5M3 13.5h10"/>`,
  paperclip: `<path d="m13 7-5.5 5.5a3 3 0 0 1-4.2-4.2l6.7-6.7a2 2 0 0 1 2.8 2.8L6.6 11"/>`,
  spark:  `<path d="M8 2v3M8 11v3M2 8h3M11 8h3M4 4l2 2M10 10l2 2M4 12l2-2M10 6l2-2"/>`,
  link:   `<path d="M7 9 9 7M5.5 10.5a2.1 2.1 0 0 1-3-3l2-2a2.1 2.1 0 0 1 3 3M10.5 5.5a2.1 2.1 0 0 1 3 3l-2 2a2.1 2.1 0 0 1-3-3"/>`,
  check:  `<path d="m3 8.5 3 3 7-7"/>`,
  x:      `<path d="m3.5 3.5 9 9M12.5 3.5l-9 9"/>`,
  more:   `<circle cx="3.5" cy="8" r=".8"/><circle cx="8" cy="8" r=".8"/><circle cx="12.5" cy="8" r=".8"/>`,
  flow:   `<rect x="2" y="2" width="4" height="4" rx="0.5"/><rect x="10" y="10" width="4" height="4" rx="0.5"/><rect x="10" y="2" width="4" height="4" rx="0.5"/><path d="M6 4h4M12 6v4M6 12h4"/>`,
  play:   `<path d="m4 3 9 5-9 5V3Z"/>`,
  agent:  `<circle cx="8" cy="6" r="3"/><path d="M2 14c.5-2.5 3-4 6-4s5.5 1.5 6 4"/>`,
  filter: `<path d="M2 3h12l-4.5 6V14L6.5 12V9L2 3Z"/>`,
  download: `<path d="M8 3v8M4.5 7.5 8 11l3.5-3.5M3 13.5h10"/>`,
  rocket: `<path d="M9 11s-2 .5-4 0c-1-2 0-4 0-4l4-4c2-2 5-2 5-2s0 3-2 5l-4 4Z"/><path d="M5 7s-2 1-2 3 0 2 0 2 2 0 3-1"/><circle cx="10" cy="6" r=".8"/>`,
  globe:  `<circle cx="8" cy="8" r="6"/><path d="M2 8h12M8 2c2 2 2 10 0 12M8 2c-2 2-2 10 0 12"/>`,
  box:    `<path d="m2 5 6-3 6 3-6 3-6-3Z"/><path d="M2 5v6l6 3 6-3V5"/><path d="M8 8v6"/>`,
  copy:   `<rect x="5" y="5" width="8" height="8" rx="1"/><path d="M3 11V3h8"/>`,
  refresh:`<path d="M14 8a6 6 0 1 1-1.5-4"/><path d="M14 3v3h-3"/>`,
};
