/* ════════════════════════════════════════════════════════════════════════
   App shell — header, bottom nav, sheets, theme/lang/accent, helpers
   Keeps the page-object contract: each page = { render(), mount?() }.
   ════════════════════════════════════════════════════════════════════════ */
const App = (() => {
  let currentPage = 'dashboard';
  let detail = null;              // { title, parentTab, render(), mount?() }
  let selectedMonday = getMonday(new Date());
  let signupRole = 'worker';

  const TABS = [
    { key: 'dashboard', icon: 'home',     label: 'home' },
    { key: 'revenue',   icon: 'revenue',  label: 'revenue' },
    { key: 'expenses',  icon: 'expenses', label: 'expenses' },
    { key: 'orders',    icon: 'orders',   label: 'orders' },
    { key: 'more',      icon: 'more',     label: 'more' },
  ];
  const TAB_KEYS   = ['dashboard', 'revenue', 'expenses', 'orders'];
  const WEEK_PAGES = ['dashboard', 'revenue', 'expenses', 'reports'];
  const MORE_ITEMS = [
    { key: 'merchandise', icon: 'merchandise', tone: 'info' },
    { key: 'employees',   icon: 'employees',   tone: 'brand' },
    { key: 'reports',     icon: 'reports',     tone: 'pos' },
    { key: 'users',       icon: 'users',       tone: 'warn' },
    { key: 'settings',    icon: 'settings',    tone: 'neutral' },
  ];
  const ACCENTS = { Pine: 162, Ocean: 232, Indigo: 278, Clay: 42 };

  const PAGES = () => ({ dashboard, revenue, expenses, merchandise, employees, orders, reports, users, settings });

  // ── Boot ──────────────────────────────────────────────────────────────
  async function boot() {
    document.getElementById('htmlRoot').dataset.theme = localStorage.getItem('theme') || 'light';
    applyAccent(localStorage.getItem('accent') || 'Pine');

    if (!Auth.isConfigured()) {
      renderSetupGate();
      return;
    }

    const me = await Auth.init();
    if (!me) {
      renderLogin();
      return;
    }

    await DB.open();
    DB.subscribe('orders', () => {
      if (currentPage === 'orders' || (detail && detail.parentTab === 'orders')) refresh();
    });
    renderChrome();
    nav(Auth.user().role === 'worker' ? 'orders' : 'dashboard');

    window.addEventListener('offline', () => document.getElementById('offlineBanner').style.display = 'block');
    window.addEventListener('online',  () => document.getElementById('offlineBanner').style.display = 'none');
  }

  // ── Navigation ─────────────────────────────────────────────────────────
  async function nav(page) {
    if (page === 'more') { openMore(); return; }
    if (!Auth.canAccess(page)) page = Auth.user().role === 'worker' ? 'orders' : 'dashboard';
    detail = null;
    currentPage = page;
    await renderActive();
    renderHeader();
    updateNav(page);
    document.getElementById('pageContainer').scrollTop = 0;
  }

  async function openDetail(d) {
    detail = d;
    await renderActive();
    renderHeader();
    updateNav(d.parentTab);
    document.getElementById('pageContainer').scrollTop = 0;
  }

  async function refresh() {
    const sc = document.getElementById('pageContainer').scrollTop;
    await renderActive();
    applyTranslations();
    document.getElementById('pageContainer').scrollTop = sc;
  }

  async function renderActive() {
    const c = document.getElementById('pageContainer');
    c.innerHTML = '<div class="loading">' + t('app_name') + '…</div>';
    const d = detail, page = currentPage;
    if (d) {
      c.innerHTML = await d.render();
      d.mount && d.mount();
    } else {
      const p = PAGES()[page];
      if (p) { c.innerHTML = await p.render(); p.mount && p.mount(); }
    }
    applyTranslations();
  }

  // ── Chrome (header + bottom nav skeletons) ──────────────────────────────
  function renderChrome() {
    const tabs = TABS.filter(tb => tb.key === 'more' || Auth.canAccess(tb.key));
    document.getElementById('bottomNav').innerHTML = tabs.map(tb => `
      <button class="nav-item" data-tab="${tb.key}" onclick="App.${tb.key === 'more' ? 'openMore()' : `nav('${tb.key}')`}">
        ${icon(tb.icon, { size: 23 })}
        <span class="nav-label" data-t="${tb.label}">${t(tb.label)}</span>
      </button>`).join('');
  }

  function renderHeader() {
    const h = document.getElementById('appHeader');
    const titles = {
      dashboard: t('app_name'), revenue: t('revenue'), expenses: t('expenses'), orders: t('order_lists'),
      merchandise: t('merchandise'), employees: t('employees'), reports: t('reports'),
      users: t('manage_users'), settings: t('settings'),
    };
    const isTab = !detail && TAB_KEYS.includes(currentPage);
    const title = detail ? detail.title : (titles[currentPage] || '');
    const showWeek = !detail && WEEK_PAGES.includes(currentPage);

    const left = isTab
      ? `<div class="hdr-mark" onclick="App.nav('dashboard')">${icon('store', { size: 20, stroke: 1.9 })}</div>`
      : `<button class="hdr-btn" onclick="App.back()">${icon('chevronLeft', { size: 19, stroke: 2.2 })}</button>`;

    const right = isTab && Auth.isAdmin()
      ? `<button class="hdr-btn brand" onclick="App.openQuickAdd()">${icon('plus', { size: 20, stroke: 2.3 })}</button>`
      : (detail && detail.action ? detail.action : '');

    h.innerHTML = `
      <div class="hdr-row">
        ${left}
        <div class="hdr-titles">
          <div class="hdr-title">${title}</div>
          ${currentPage === 'dashboard' && !detail ? `<div class="hdr-sub">${t('app_sub')}</div>` : ''}
        </div>
        ${right}
      </div>
      ${showWeek ? weekBarHTML() : ''}`;
  }

  function weekBarHTML() {
    const { monday, sunday } = weekBounds();
    const fmt = d => d.toLocaleDateString(lang() === 'es' ? 'es-MX' : 'en-US', { month: 'short', day: 'numeric' });
    const label = isCurrentWeek() ? t('this_week') : t('week_of');
    return `<div class="week-bar"><div class="week-inner">
      <button class="arrow" onclick="App.shiftWeek(-1)" aria-label="${t('back')}">${icon('chevronLeft', { size: 17 })}</button>
      <span class="lbl-mid">${icon('calendar', { size: 15, cls: 'c-brand' })}
        <span style="font-size:13.5px;font-weight:600">${label}</span>
        <span class="num" style="font-size:13.5px;color:var(--muted)">· ${fmt(monday)} – ${fmt(sunday)}</span>
      </span>
      <button class="arrow" onclick="App.shiftWeek(1)" aria-label="${t('this_week')}" ${isCurrentWeek() ? 'disabled' : ''}>${icon('chevronRight', { size: 17 })}</button>
    </div></div>`;
  }

  async function shiftWeek(delta) {
    selectedMonday = addDays(selectedMonday, delta * 7);
    const current = getMonday(new Date());
    if (selectedMonday > current) selectedMonday = current;
    renderHeader();
    await refresh();
  }

  function updateNav(activeTab) {
    const key = TAB_KEYS.includes(activeTab) ? activeTab : (activeTab === 'more' ? 'more' : 'more');
    document.querySelectorAll('.nav-item').forEach(n => n.classList.toggle('active', n.dataset.tab === key));
  }

  function back() {
    if (detail) { nav(detail.parentTab || 'dashboard'); return; }
    nav('dashboard');
  }

  // ── Sheets ──────────────────────────────────────────────────────────────
  function openSheet({ title, body, onMount }) {
    const scrim = document.getElementById('sheetScrim');
    const sheet = document.getElementById('sheet');
    sheet.innerHTML = `
      <div class="sheet-grip"></div>
      <div class="sheet-head">
        <div class="s-h-title">${title || ''}</div>
        <button class="icon-btn" onclick="App.closeSheet()" style="background:var(--sunken);width:30px;height:30px;border-radius:999px">${icon('close', { size: 17, stroke: 2.2 })}</button>
      </div>
      <div class="sheet-body">${body}</div>`;
    scrim.style.display = 'block';
    requestAnimationFrame(() => requestAnimationFrame(() => { scrim.classList.add('show'); sheet.classList.add('show'); }));
    onMount && onMount();
  }
  function closeSheet() {
    const scrim = document.getElementById('sheetScrim');
    const sheet = document.getElementById('sheet');
    scrim.classList.remove('show'); sheet.classList.remove('show');
    setTimeout(() => { scrim.style.display = 'none'; sheet.innerHTML = ''; }, 300);
  }

  function openMore() {
    updateNav('more');
    const rows = MORE_ITEMS.filter(m => Auth.canAccess(m.key)).map(m => `
      <div class="row tap" onclick="App.closeSheet(); App.nav('${m.key}')">
        <div class="iconchip t-${m.tone}">${icon(m.icon, { size: 20 })}</div>
        <div class="r-main"><div class="r-title">${t(m.key === 'users' ? 'users' : m.key)}</div></div>
        ${icon('chevronRight', { size: 18, cls: 'c-muted' })}
      </div>`).join('');
    openSheet({
      title: t('more'),
      body: `<div class="card flush">${rows}</div>
        <button class="btn btn-danger-ghost btn-full" style="margin-top:12px" onclick="App.closeSheet(); App.signOut()">
          ${icon('logout', { size: 18 })}<span data-t="sign_out">${t('sign_out')}</span></button>`,
    });
  }

  function openQuickAdd() {
    if (!Auth.isAdmin()) return;
    const opts = [
      ['revenue',  t('log_revenue'),   'revenue',     'pos'],
      ['expense',  t('log_expense'),   'expenses',    'neg'],
      ['merch',    t('add_purchase'),  'merchandise', 'info'],
      ['employee', t('add_employee'),  'employees',   'brand'],
    ];
    const rows = opts.map(([k, label, ic, tone]) => `
      <div class="row tap" onclick="App.openForm('${k}')">
        <div class="iconchip t-${tone}">${icon(ic, { size: 20 })}</div>
        <div class="r-main"><div class="r-title">${label}</div></div>
        ${icon('chevronRight', { size: 18, cls: 'c-muted' })}
      </div>`).join('');
    openSheet({ title: t('quick_add'), body: `<div class="card flush">${rows}</div>` });
  }

  // Open a specific add-form sheet (also used by each page's Add button)
  async function openForm(kind) {
    if (kind === 'merch') { await merchandise.openAddForm(); return; }
    if (kind === 'revenue') { await revenue.openAddForm(); return; }
    const map = {
      revenue:  { title: t('add_revenue'),  build: () => revenue.formHTML(),  mount: () => revenue.formMount && revenue.formMount() },
      expense:  { title: t('add_expense'),  build: () => expenses.formHTML() },
      employee: { title: t('add_employee'), build: () => employees.formHTML() },
      list:     { title: t('new_list'),     build: () => orders.formHTML() },
      user:     { title: t('add_user'),     build: () => users.formHTML() },
    };
    const m = map[kind];
    if (!m) return;
    openSheet({ title: m.title, body: m.build(), onMount: m.mount });
  }

  // ── Toast ───────────────────────────────────────────────────────────────
  let toastTimer = null;
  function toast(msg) {
    const el = document.getElementById('toast');
    el.innerHTML = icon('check', { size: 16, stroke: 2.4 }) + '<span>' + msg + '</span>';
    el.classList.add('show');
    clearTimeout(toastTimer);
    toastTimer = setTimeout(() => el.classList.remove('show'), 1700);
  }

  // ── Settings actions ─────────────────────────────────────────────────────
  function setTheme(th) { localStorage.setItem('theme', th); document.getElementById('htmlRoot').dataset.theme = th; if (currentPage === 'settings' && !detail) refresh(); }
  function setLang(lg)  { localStorage.setItem('lang', lg); renderChrome(); renderHeader(); refresh(); }
  function applyAccent(name) { document.getElementById('htmlRoot').style.setProperty('--brand-h', ACCENTS[name] || 162); localStorage.setItem('accent', name); }
  function setAccent(name) { applyAccent(name); if (currentPage === 'settings' && !detail) refresh(); }
  async function signOut() { await Auth.signOut(); location.reload(); }

  function renderSetupGate() {
    document.getElementById('appHeader').innerHTML = '';
    document.getElementById('bottomNav').innerHTML = '';
    document.getElementById('pageContainer').innerHTML = `<div class="auth-screen">
      <div class="auth-card">
        <div class="hdr-mark auth-mark">${icon('store', { size: 26, stroke: 1.9 })}</div>
        <h1>${t('app_name')}</h1>
        <p>${t('firebase_setup_needed')}</p>
        <div class="auth-note">Edit <span class="num">www/js/firebase-config.js</span> with your Firebase web config.</div>
      </div>
    </div>`;
  }

  function renderLogin(error) {
    document.getElementById('appHeader').innerHTML = '';
    document.getElementById('bottomNav').innerHTML = '';
    document.getElementById('pageContainer').innerHTML = `<div class="auth-screen">
      <form class="auth-card" onsubmit="App.login(event)">
        <div class="hdr-mark auth-mark">${icon('store', { size: 26, stroke: 1.9 })}</div>
        <h1>${t('app_name')}</h1>
        <p>${t('sign_in_sub')}</p>
        ${error ? `<div class="auth-error">${App.esc(error)}</div>` : ''}
        <div class="field"><label class="lbl">${t('username_or_email')}</label><input class="in" id="login-username" autocapitalize="none" autocomplete="username" required></div>
        <div class="field"><label class="lbl">${t('password')}</label><input class="in" id="login-password" type="password" autocomplete="current-password" required></div>
        <button class="btn btn-brand btn-full" type="submit">${icon('key', { size: 18 })}${t('sign_in')}</button>
        <button class="btn btn-ghost btn-full" type="button" style="margin-top:10px" onclick="App.openSignup()">${icon('plus', { size: 18 })}${t('create_account')}</button>
        <button class="btn btn-soft btn-full" type="button" style="margin-top:10px" onclick="App.openPasswordReset()">${icon('key', { size: 18 })}${t('reset_password')}</button>
      </form>
    </div>`;
  }

  async function login(e) {
    e.preventDefault();
    const username = document.getElementById('login-username').value;
    const password = document.getElementById('login-password').value;
    try {
      await Auth.signIn(username, password);
      await boot();
    } catch (err) {
      renderLogin(t('invalid_login'));
    }
  }

  function openSignup() {
    signupRole = 'worker';
    openSheet({ title: t('create_account'), body: signupHTML() });
  }

  function openPasswordReset() {
    openSheet({ title: t('reset_password'), body: passwordResetHTML() });
  }

  function passwordResetHTML() {
    return `<div style="padding-bottom:8px">
      <div class="field"><label class="lbl">${t('email')}</label><input class="in" id="reset-email" type="email" autocapitalize="none" autocomplete="email" placeholder="${t('email')}"></div>
      ${Auth.isConfigured() ? `<div class="auth-note" style="margin-bottom:14px">${t('firebase_reset_note')}</div>` : `<div class="field"><label class="lbl">${t('new_password')}</label><input class="in" id="reset-pass" type="password" autocomplete="new-password" placeholder="••••••"></div>`}
      <button class="btn btn-brand btn-full" onclick="App.resetPassword()">${icon('check', { size: 18 })}${t('reset_password')}</button>
    </div>`;
  }

  function signupHTML() {
    return `<div style="padding-bottom:8px">
      <div class="field"><label class="lbl">${t('full_name')}</label><input class="in" id="signup-name" placeholder="${t('full_name')}"></div>
      <div class="field"><label class="lbl">${t('username')}</label><input class="in" id="signup-username" autocapitalize="none" autocomplete="username"></div>
      <div class="field"><label class="lbl">${t('email')}</label><input class="in" id="signup-email" type="email" autocapitalize="none" autocomplete="email" placeholder="${t('email')}"></div>
      <div class="field"><label class="lbl">${t('password')}</label><input class="in" id="signup-pass" type="password" autocomplete="new-password" placeholder="••••••"></div>
      <div class="field"><label class="lbl">${t('role')}</label>
        <div class="segmented" id="signup-role-seg">
          <button class="active" data-v="worker" onclick="App.pickSignupRole('worker')">${t('worker')}</button>
          <button data-v="admin" onclick="App.pickSignupRole('admin')">${t('admin')}</button>
        </div></div>
      <div class="field" id="signup-admin-code-wrap" style="display:none">
        <label class="lbl">${t('admin_access_code')}</label>
        <input class="in" id="signup-admin-code" type="password" autocomplete="off" placeholder="${t('admin_access_code')}">
      </div>
      <label style="display:flex;align-items:flex-start;gap:10px;margin:4px 0 16px;color:var(--muted);font-size:13px;line-height:1.35">
        <input id="signup-eula" type="checkbox" style="width:18px;height:18px;margin-top:0;accent-color:var(--brand)">
        <span>${t('eula_agree')}</span>
      </label>
      <button class="btn btn-brand btn-full" onclick="App.signup()">${icon('check', { size: 18 })}${t('create_account')}</button>
    </div>`;
  }

  function pickSignupRole(role) {
    signupRole = role;
    document.querySelectorAll('#signup-role-seg button').forEach(b => b.classList.toggle('active', b.dataset.v === role));
    const code = document.getElementById('signup-admin-code-wrap');
    if (code) code.style.display = role === 'admin' ? 'block' : 'none';
  }

  async function signup() {
    const name = document.getElementById('signup-name').value.trim();
    const username = Auth.cleanUsername(document.getElementById('signup-username').value);
    const email = Auth.cleanEmail(document.getElementById('signup-email').value);
    const password = document.getElementById('signup-pass').value;
    const adminAccessCode = document.getElementById('signup-admin-code') ? document.getElementById('signup-admin-code').value.trim() : '';
    const eulaAccepted = !!(document.getElementById('signup-eula') && document.getElementById('signup-eula').checked);
    let role = signupRole;
    if (!name || !username || !email || !password) {
      toast(t('complete_required_fields'));
      return;
    }
    if (!eulaAccepted) {
      toast(t('eula_required'));
      return;
    }
    if (!email.includes('@')) {
      toast(t('invalid_email'));
      return;
    }
    if (role === 'admin') {
      if (!Auth.canCreateAdmin(adminAccessCode)) {
        toast(t('invalid_admin_code'));
        return;
      }
    }
    try {
      const eulaAcceptedAt = new Date().toISOString();
      if (Auth.isConfigured()) {
        await Auth.signUp({ name, username, email, password, role, adminAccessCode, eulaAcceptedAt });
      } else {
        await DB.add('users', { name, username, email, password, role, eulaAcceptedAt, eulaVersion: '1.0', createdAt: new Date().toISOString() });
      }
      closeSheet();
      toast(t('account_created'));
      await boot();
    } catch (err) {
      console.error('Account creation failed:', err);
      toast(accountCreateMessage(err));
    }
  }

  function accountCreateMessage(err) {
    if (!err) return t('account_create_failed');
    if (err.code === 'permission-denied') return t('signup_rules_needed');
    if (err.code === 'auth/email-already-in-use') return t('account_exists_reset');
    if (err.code === 'auth/invalid-credential' || err.code === 'auth/wrong-password') return t('account_exists_reset');
    if (err.code === 'auth/invalid-email') return t('invalid_email');
    if (err.code === 'auth/weak-password') return t('weak_password');
    return err.message || t('account_create_failed');
  }

  async function resetPassword() {
    const email = Auth.cleanEmail(document.getElementById('reset-email').value);
    if (!email) {
      toast(t('complete_required_fields'));
      return;
    }
    if (!email.includes('@')) {
      toast(t('invalid_email'));
      return;
    }
    try {
      if (Auth.isConfigured()) {
        await Auth.sendPasswordReset(email);
        closeSheet();
        toast(t('password_reset_sent'));
        return;
      }
      const newPassword = document.getElementById('reset-pass').value;
      if (!newPassword) {
        toast(t('complete_required_fields'));
        return;
      }
      const rows = await DB.getAll('users');
      const user = rows.find(u => Auth.cleanEmail(u.email) === email);
      if (!user) {
        toast(t('invalid_login'));
        return;
      }
      await DB.put('users', { ...user, email, password: newPassword });
      closeSheet();
      toast(t('password_updated'));
    } catch (err) {
      console.error('Password reset failed:', err);
      toast(err && err.message ? err.message : t('password_reset_failed'));
    }
  }

  // ── Helpers ───────────────────────────────────────────────────────────────
  function lang() { return localStorage.getItem('lang') || 'en'; }
  function getCurrentPage() { return currentPage; }

  function fmtMoney(n) { return '$' + (+n || 0).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 }); }
  function fmtMoney0(n) { return '$' + Math.round(+n || 0).toLocaleString('en-US'); }
  function fmtK(n) { return '$' + ((+n || 0) / 1000).toFixed(1) + 'k'; }
  function fmtDate(d) { if (!d) return '—'; return new Date(d.length === 10 ? d + 'T00:00:00' : d).toLocaleDateString(lang() === 'es' ? 'es-MX' : 'en-US', { month: 'short', day: 'numeric', year: 'numeric' }); }
  function fmtDateShort(d) { if (!d) return '—'; return new Date(d.length === 10 ? d + 'T00:00:00' : d).toLocaleDateString(lang() === 'es' ? 'es-MX' : 'en-US', { month: 'short', day: 'numeric' }); }

  function getMonday(date) {
    const monday = new Date(date);
    monday.setDate(date.getDate() - date.getDay() + (date.getDay() === 0 ? -6 : 1));
    monday.setHours(0, 0, 0, 0);
    return monday;
  }
  function addDays(date, days) {
    const d = new Date(date);
    d.setDate(d.getDate() + days);
    d.setHours(0, 0, 0, 0);
    return d;
  }
  function isoDate(date) {
    return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
  }
  function isCurrentWeek() {
    return isoDate(selectedMonday) === isoDate(getMonday(new Date()));
  }
  function weekBounds(offsetWeeks) {
    const monday = addDays(selectedMonday, (offsetWeeks || 0) * 7);
    const sunday = new Date(monday);
    sunday.setDate(monday.getDate() + 6);
    sunday.setHours(23, 59, 59, 999);
    return { monday, sunday };
  }
  function mondayISO() { return isoDate(weekBounds().monday); }
  function selectedWeekLabel() {
    const { monday, sunday } = weekBounds();
    return `${fmtDateShort(isoDate(monday))} - ${fmtDateShort(isoDate(sunday))}`;
  }
  function inThisWeek(iso) {
    const { monday, sunday } = weekBounds();
    const d = new Date((iso || '').length === 10 ? iso + 'T00:00:00' : iso);
    return d >= monday && d <= sunday;
  }

  function esc(s) { return String(s == null ? '' : s).replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c])); }
  function initials(name) { return (name || '?').trim().split(/\s+/).map(w => w[0]).slice(0, 2).join('').toUpperCase(); }
  const AV_TONES = ['brand', 'info', 'pos', 'warn'];
  function avTone(i) { return AV_TONES[i % 4]; }

  // shared bits used across pages
  function iconChip(name, tone, opts) { opts = opts || {}; return `<div class="iconchip ${opts.sm ? 'sm' : ''} t-${tone}">${icon(name, { size: opts.icon || (opts.sm ? 16 : 20) })}</div>`; }
  function avatar(name, tone) { return `<div class="avatar t-${tone}">${initials(name)}</div>`; }
  function badge(text, tone, ic) { return `<span class="badge t-${tone}">${ic ? icon(ic, { size: 12, stroke: 2.2 }) : ''}${text}</span>`; }
  function delta(pct) {
    if (pct == null || !isFinite(pct)) return '';
    const up = pct >= 0;
    return `<span class="badge t-${up ? 'pos' : 'neg'}">${icon(up ? 'up' : 'down', { size: 12, stroke: 2.4 })}<span class="num">${Math.abs(pct).toFixed(1)}%</span></span>`;
  }
  function moneyField(id, ph) {
    return `<div class="money-wrap"><span class="sym">$</span>
      <input class="in num" id="${id}" inputmode="decimal" placeholder="${ph || '0.00'}"></div>`;
  }
  function sectionHead(titleKey, actionHTML) {
    return `<div class="section-head"><div class="s-title">${t(titleKey)}</div>${actionHTML || ''}</div>`;
  }
  function emptyState(ic, key) {
    return `<div class="empty"><div class="e-icon">${icon(ic, { size: 24 })}</div><div class="e-text">${t(key)}</div></div>`;
  }
  function readMoney(id) { const el = document.getElementById(id); return el ? (+String(el.value).replace(/[^0-9.]/g, '') || 0) : 0; }

  document.addEventListener('DOMContentLoaded', boot);

  return {
    nav, openDetail, refresh, back, boot, login,
    openSignup, pickSignupRole, signup, openPasswordReset, resetPassword,
    openSheet, closeSheet, openMore, openQuickAdd, openForm, toast,
    shiftWeek,
    setTheme, setLang, setAccent, signOut, applyAccent, ACCENTS,
    getCurrentPage, lang, fmtMoney, fmtMoney0, fmtK, fmtDate, fmtDateShort,
    weekBounds, mondayISO, selectedWeekLabel, inThisWeek, esc, initials, avTone,
    iconChip, avatar, badge, delta, moneyField, sectionHead, emptyState, readMoney,
  };
})();
