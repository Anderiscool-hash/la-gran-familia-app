// ── icons.js — clean line-icon set, returns an SVG string ────────────────────
// Usage:  icon('home')                     → 22px default
//         icon('revenue', { size: 18 })     → custom size
//         icon('store', { size: 20, stroke: 1.9, cls: 'foo' })
const ICONS = (() => {
  const P = {
    home: '<path d="M3 10.5 12 3l9 7.5"/><path d="M5 9.5V20a1 1 0 0 0 1 1h12a1 1 0 0 0 1-1V9.5"/><path d="M9.5 21v-6h5v6"/>',
    revenue: '<rect x="2.5" y="6" width="19" height="12" rx="2.5"/><circle cx="12" cy="12" r="2.6"/><path d="M6 9.5v5M18 9.5v5"/>',
    expenses: '<path d="M6 2.5h9l3 3V21l-2-1.2-2 1.2-2-1.2-2 1.2-2-1.2L6 21V2.5Z"/><path d="M9 8h6M9 11.5h6M9 15h3.5"/>',
    merchandise: '<path d="M5.5 8h13l-1 12.5a1 1 0 0 1-1 .9H7.5a1 1 0 0 1-1-.9L5.5 8Z"/><path d="M8.5 8a3.5 3.5 0 0 1 7 0"/>',
    employees: '<circle cx="9" cy="8" r="3.2"/><path d="M3.5 20a5.5 5.5 0 0 1 11 0"/><path d="M16 5.2a3.2 3.2 0 0 1 0 5.8"/><path d="M17 14.4A5.5 5.5 0 0 1 20.5 20"/>',
    orders: '<rect x="5" y="4.5" width="14" height="16.5" rx="2.2"/><path d="M9 4.5V3.4A1.4 1.4 0 0 1 10.4 2h3.2A1.4 1.4 0 0 1 15 3.4V4.5"/><path d="m8.8 12 2 2 3.6-3.8"/>',
    reports: '<path d="M4 20V4"/><path d="M4 20h16"/><rect x="7.5" y="11" width="3" height="6" rx="0.7"/><rect x="13.5" y="7.5" width="3" height="9.5" rx="0.7"/>',
    users: '<circle cx="12" cy="7.5" r="3.4"/><path d="M5.5 20a6.5 6.5 0 0 1 13 0"/>',
    settings: '<path d="M4 7h11"/><path d="M19 7h1"/><circle cx="17" cy="7" r="2"/><path d="M4 17h2"/><path d="M10 17h10"/><circle cx="8" cy="17" r="2"/>',
    more: '<circle cx="5.5" cy="12" r="1.6"/><circle cx="12" cy="12" r="1.6"/><circle cx="18.5" cy="12" r="1.6"/>',
    plus: '<path d="M12 5v14M5 12h14"/>',
    close: '<path d="M6 6l12 12M18 6 6 18"/>',
    check: '<path d="m5 12.5 4.5 4.5L19 7"/>',
    chevronRight: '<path d="m9 5 7 7-7 7"/>',
    chevronLeft: '<path d="m15 5-7 7 7 7"/>',
    chevronDown: '<path d="m5 9 7 7 7-7"/>',
    sun: '<circle cx="12" cy="12" r="4"/><path d="M12 2.5v2M12 19.5v2M2.5 12h2M19.5 12h2M5 5l1.5 1.5M17.5 17.5 19 19M19 5l-1.5 1.5M6.5 17.5 5 19"/>',
    moon: '<path d="M20 13.5A8 8 0 1 1 10.5 4a6.2 6.2 0 0 0 9.5 9.5Z"/>',
    globe: '<circle cx="12" cy="12" r="9"/><path d="M3 12h18"/><path d="M12 3c2.5 2.4 3.8 5.6 3.8 9s-1.3 6.6-3.8 9c-2.5-2.4-3.8-5.6-3.8-9s1.3-6.6 3.8-9Z"/>',
    share: '<circle cx="6" cy="12" r="2.4"/><circle cx="17.5" cy="6" r="2.4"/><circle cx="17.5" cy="18" r="2.4"/><path d="m8.2 10.9 7.2-3.6M8.2 13.1l7.2 3.6"/>',
    camera: '<path d="M3.5 8.5A1.5 1.5 0 0 1 5 7h2l1.2-2h7.6L17 7h2a1.5 1.5 0 0 1 1.5 1.5v9A1.5 1.5 0 0 1 19 19H5a1.5 1.5 0 0 1-1.5-1.5v-9Z"/><circle cx="12" cy="12.5" r="3.2"/>',
    trash: '<path d="M4.5 6.5h15M9 6.5V5a1.5 1.5 0 0 1 1.5-1.5h3A1.5 1.5 0 0 1 15 5v1.5M6.5 6.5 7.4 20a1.5 1.5 0 0 0 1.5 1.4h6.2a1.5 1.5 0 0 0 1.5-1.4l.9-13.5"/>',
    store: '<path d="M4 9.5 5.2 5A1.5 1.5 0 0 1 6.6 4h10.8a1.5 1.5 0 0 1 1.4 1L20 9.5"/><path d="M4 9.5h16v1a3 3 0 0 1-6 0 3 3 0 0 1-6 0 3 3 0 0 1-4 0v-1Z"/><path d="M5 13.5V20h14v-6.5"/><path d="M10 20v-4h4v4"/>',
    card: '<rect x="2.5" y="5.5" width="19" height="13" rx="2.5"/><path d="M2.5 9.5h19"/><path d="M6 14.5h4"/>',
    cash: '<ellipse cx="12" cy="6.5" rx="7.5" ry="3"/><path d="M4.5 6.5v5c0 1.7 3.4 3 7.5 3s7.5-1.3 7.5-3v-5"/><path d="M4.5 11.5v5c0 1.7 3.4 3 7.5 3s7.5-1.3 7.5-3v-5"/>',
    up: '<path d="M7 17 17 7M9 7h8v8"/>',
    down: '<path d="M7 7l10 10M17 9v8H9"/>',
    calendar: '<rect x="3.5" y="5" width="17" height="16" rx="2.2"/><path d="M3.5 9.5h17M8 3v4M16 3v4"/>',
    repeat: '<path d="M4 9a5 5 0 0 1 5-5h7"/><path d="m13 1.5 3 2.5-3 2.5"/><path d="M20 15a5 5 0 0 1-5 5H8"/><path d="m11 22.5-3-2.5 3-2.5"/>',
    shield: '<path d="M12 3 5 6v5.5c0 4.2 2.9 7.4 7 9 4.1-1.6 7-4.8 7-9V6l-7-3Z"/><path d="m9.2 12 2 2 3.6-3.8"/>',
    logout: '<path d="M14 4.5H6.5A1.5 1.5 0 0 0 5 6v12a1.5 1.5 0 0 0 1.5 1.5H14"/><path d="M17 8.5 20.5 12 17 15.5M10 12h10.5"/>',
    wallet: '<path d="M3.5 7.5A1.5 1.5 0 0 1 5 6h12a1.5 1.5 0 0 1 1.5 1.5"/><rect x="3.5" y="7" width="17" height="12" rx="2.2"/><path d="M16.5 12.5h2"/>',
    receipt: '<path d="M6 2.5h9l3 3V21l-2-1.2-2 1.2-2-1.2-2 1.2-2-1.2L6 21V2.5Z"/><path d="M9 8h6M9 11.5h6M9 15h3.5"/>',
    info: '<circle cx="12" cy="12" r="9"/><path d="M12 11v5M12 7.8v.2"/>',
    sparkle: '<path d="M12 3.5c.6 3.7 1.8 4.9 5.5 5.5-3.7.6-4.9 1.8-5.5 5.5-.6-3.7-1.8-4.9-5.5-5.5 3.7-.6 4.9-1.8 5.5-5.5Z"/><path d="M18.5 15c.3 1.6.8 2.1 2.5 2.5-1.7.4-2.2.9-2.5 2.5-.3-1.6-.8-2.1-2.5-2.5 1.7-.4 2.2-.9 2.5-2.5Z"/>',
    download: '<path d="M12 3.5v11M8 11l4 4 4-4M5 20h14"/>',
    key: '<circle cx="8" cy="15" r="4.5"/><path d="m11.2 11.8 8.3-8.3M16 7l2.5 2.5M13.5 9.5 16 12"/>',
    refresh: '<path d="M3.5 12a8.5 8.5 0 0 1 14.5-6l2 2"/><path d="M20.5 4v4h-4"/><path d="M20.5 12a8.5 8.5 0 0 1-14.5 6l-2-2"/><path d="M3.5 20v-4h4"/>',
  };
  function icon(name, opts) {
    opts = opts || {};
    const size = opts.size || 22, stroke = opts.stroke || 1.75, cls = opts.cls || '';
    const d = P[name];
    if (!d) return '';
    return `<svg class="${cls}" width="${size}" height="${size}" viewBox="0 0 24 24" fill="none" `
      + `stroke="currentColor" stroke-width="${stroke}" stroke-linecap="round" stroke-linejoin="round" `
      + `style="display:block;flex-shrink:0">${d}</svg>`;
  }
  return { icon, names: Object.keys(P) };
})();
const icon = ICONS.icon;
