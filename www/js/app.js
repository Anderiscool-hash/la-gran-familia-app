// ── Core app shell ────────────────────────────────────────────────────────────
const App = (() => {
  let currentUser = null;

  // ── Boot ──────────────────────────────────────────────────────────────────
  async function boot() {
    await DB.open();
    await DB.seedAdmin();

    // Apply saved theme
    const theme = localStorage.getItem('theme') || 'light';
    document.getElementById('htmlRoot').dataset.theme = theme;

    // Check saved session
    const saved = sessionStorage.getItem('currentUser');
    if (saved) {
      currentUser = JSON.parse(saved);
      showApp();
      nav(currentUser.role === 'admin' ? 'dashboard' : 'orders');
    } else {
      showLogin();
    }

    // Offline banner
    window.addEventListener('offline', () => {
      document.getElementById('offlineBanner').style.display = 'block';
    });
    window.addEventListener('online', () => {
      document.getElementById('offlineBanner').style.display = 'none';
    });
  }

  // ── Auth ──────────────────────────────────────────────────────────────────
  async function login() {
    const username = document.getElementById('loginUser').value.trim().toLowerCase();
    const password = document.getElementById('loginPass').value;
    const users = await DB.getAll('users');
    const user  = users.find(u => u.username === username && u.password === password);
    if (!user) {
      const el = document.getElementById('loginError');
      el.textContent = 'Wrong username or password.';
      el.style.display = 'block';
      return;
    }
    currentUser = user;
    sessionStorage.setItem('currentUser', JSON.stringify(user));
    showApp();
    nav(user.role === 'admin' ? 'dashboard' : 'orders');
  }

  function logout() {
    currentUser = null;
    sessionStorage.removeItem('currentUser');
    closeNav();
    showLogin();
  }

  function showLogin() {
    document.getElementById('loginScreen').style.display = 'flex';
    document.getElementById('app').style.display = 'none';
    document.getElementById('loginUser').value = '';
    document.getElementById('loginPass').value = '';
    document.getElementById('loginError').style.display = 'none';
  }

  function showApp() {
    document.getElementById('loginScreen').style.display = 'none';
    document.getElementById('app').style.display = 'block';
    document.getElementById('headerUser').textContent = currentUser.name;

    // Show/hide admin-only nav items
    document.querySelectorAll('.admin-only').forEach(el => {
      el.style.display = currentUser.role === 'admin' ? 'flex' : 'none';
    });

    applyTranslations();
  }

  // ── Navigation ────────────────────────────────────────────────────────────
  async function nav(page) {
    closeNav();

    // Guard workers
    const adminPages = ['dashboard','revenue','expenses','merchandise','employees','reports','users'];
    if (adminPages.includes(page) && currentUser?.role !== 'admin') {
      page = 'orders';
    }

    // Mark active
    document.querySelectorAll('.nav-link[data-page]').forEach(a => {
      a.classList.toggle('active', a.dataset.page === page);
    });

    const container = document.getElementById('pageContainer');
    container.innerHTML = '<div class="loading">Loading…</div>';

    const pages = { dashboard, revenue, expenses, merchandise, employees, orders, reports, users, settings };
    if (pages[page]) {
      container.innerHTML = await pages[page].render();
      if (pages[page].mount) pages[page].mount();
    }

    applyTranslations();
    window.scrollTo(0, 0);
  }

  function toggleNav() {
    const drawer  = document.getElementById('navDrawer');
    const overlay = document.getElementById('navOverlay');
    const open    = drawer.classList.toggle('open');
    overlay.style.display = open ? 'block' : 'none';
  }

  function closeNav() {
    document.getElementById('navDrawer').classList.remove('open');
    document.getElementById('navOverlay').style.display = 'none';
  }

  // ── Helpers ───────────────────────────────────────────────────────────────
  function getUser() { return currentUser; }

  function fmtMoney(n) {
    return '$' + (+n || 0).toFixed(2).replace(/\B(?=(\d{3})+(?!\d))/g, ',');
  }

  function fmtDate(d) {
    if (!d) return '—';
    return new Date(d).toLocaleDateString('en-US', { month:'short', day:'numeric', year:'numeric' });
  }

  function weekBounds() {
    const now = new Date();
    const monday = new Date(now);
    monday.setDate(now.getDate() - now.getDay() + (now.getDay() === 0 ? -6 : 1));
    monday.setHours(0,0,0,0);
    const sunday = new Date(monday);
    sunday.setDate(monday.getDate() + 6);
    sunday.setHours(23,59,59,999);
    return { monday, sunday };
  }

  function card(title, content) {
    return `<div class="card"><h2>${title}</h2>${content}</div>`;
  }

  function btn(label, cls, onclick) {
    return `<button class="btn ${cls}" onclick="${onclick}">${label}</button>`;
  }

  // ── Login enter key ───────────────────────────────────────────────────────
  document.addEventListener('DOMContentLoaded', () => {
    ['loginUser','loginPass'].forEach(id => {
      document.getElementById(id).addEventListener('keydown', e => {
        if (e.key === 'Enter') login();
      });
    });
    boot();
  });

  return { login, logout, nav, toggleNav, closeNav, getUser, fmtMoney, fmtDate, weekBounds, card, btn };
})();
