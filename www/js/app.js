const App = (() => {
  let currentPage = 'dashboard';

  // ── Boot ────────────────────────────────────────────────────────────────────
  async function boot() {
    await DB.open();

    const theme = localStorage.getItem('theme') || 'light';
    document.getElementById('htmlRoot').dataset.theme = theme;

    applyTranslations();
    nav('dashboard');

    window.addEventListener('offline', () => {
      document.getElementById('offlineBanner').style.display = 'block';
    });
    window.addEventListener('online', () => {
      document.getElementById('offlineBanner').style.display = 'none';
    });
  }

  // ── Navigation ──────────────────────────────────────────────────────────────
  async function nav(page) {
    closeNav();
    currentPage = page;

    document.querySelectorAll('.nav-link[data-page]').forEach(a => {
      a.classList.toggle('active', a.dataset.page === page);
    });

    const container = document.getElementById('pageContainer');
    container.innerHTML = '<div class="loading">Loading…</div>';

    const pages = { dashboard, revenue, expenses, merchandise, employees, reports, settings };
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

  // ── Helpers ──────────────────────────────────────────────────────────────────
  function getCurrentPage() { return currentPage; }

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

  document.addEventListener('DOMContentLoaded', boot);

  return { nav, toggleNav, closeNav, getCurrentPage, fmtMoney, fmtDate, weekBounds };
})();
