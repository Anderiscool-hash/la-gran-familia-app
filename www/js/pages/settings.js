const settings = {
  async render() {
    const theme = localStorage.getItem('theme') || 'light';
    const lang  = localStorage.getItem('lang')  || 'en';
    const user  = App.getUser();

    return `
    <div class="card">
      <h2>⚙️ Settings</h2>
    </div>

    <div class="card">
      <h2>🎨 Appearance</h2>
      <div class="setting-tiles">
        <div class="setting-tile ${theme==='light'?'active':''}" onclick="settings.setTheme('light')">
          <div class="tile-icon">☀️</div>
          <div class="tile-label">Light</div>
        </div>
        <div class="setting-tile ${theme==='dark'?'active':''}" onclick="settings.setTheme('dark')">
          <div class="tile-icon">🌙</div>
          <div class="tile-label">Dark</div>
        </div>
      </div>
    </div>

    <div class="card">
      <h2>🌐 Language</h2>
      <div class="setting-tiles">
        <div class="setting-tile ${lang==='en'?'active':''}" onclick="settings.setLang('en')">
          <div class="tile-icon">🇺🇸</div>
          <div class="tile-label">English</div>
        </div>
        <div class="setting-tile ${lang==='es'?'active':''}" onclick="settings.setLang('es')">
          <div class="tile-icon">🇲🇽</div>
          <div class="tile-label">Español</div>
        </div>
      </div>
    </div>

    <div class="card">
      <h2>📲 Install as App</h2>
      <p style="font-size:14px;color:var(--text-muted);margin-bottom:16px">
        This app works offline on your phone. Install it for the best experience.
      </p>
      <div id="install-android" style="display:none">
        <button class="btn btn-success" onclick="settings.installAndroid()" style="width:100%;margin-bottom:10px">
          📲 Install on Android
        </button>
      </div>
      <div id="install-ios" style="display:none;background:var(--surface-alt);border-radius:10px;padding:16px;border:1px solid var(--border)">
        <p style="font-weight:600;color:var(--heading);margin-bottom:10px">Install on iPhone:</p>
        <ol style="margin:0 0 0 20px;line-height:2;font-size:14px;color:var(--text-muted)">
          <li>Tap the <strong>Share</strong> button <span style="font-size:18px">⬆️</span></li>
          <li>Tap <strong>"Add to Home Screen"</strong></li>
          <li>Tap <strong>"Add"</strong></li>
        </ol>
      </div>
      <div id="install-done" style="display:none;color:#27ae60;font-weight:600;font-size:14px">
        ✅ App is already installed!
      </div>
    </div>

    <div class="card">
      <h2>👤 Account</h2>
      <p style="margin-bottom:4px"><strong>${user?.name || 'User'}</strong></p>
      <p style="font-size:13px;color:var(--text-muted);margin-bottom:16px">@${user?.username || ''} · ${user?.role || ''}</p>
      <button class="btn btn-danger" onclick="App.logout()" style="width:100%">🚪 Sign Out</button>
    </div>`;
  },

  mount() {
    const isStandalone = window.matchMedia('(display-mode: standalone)').matches
                      || window.navigator.standalone;
    if (isStandalone) {
      document.getElementById('install-done').style.display = 'block';
    } else if (/iphone|ipad|ipod/i.test(navigator.userAgent)) {
      document.getElementById('install-ios').style.display = 'block';
    } else if (window._installPrompt) {
      document.getElementById('install-android').style.display = 'block';
    } else {
      // Generic: show both hints
      document.getElementById('install-ios').style.display = 'block';
    }
  },

  setTheme(theme) {
    localStorage.setItem('theme', theme);
    document.getElementById('htmlRoot').dataset.theme = theme;
    App.nav('settings');
  },

  setLang(lang) {
    localStorage.setItem('lang', lang);
    applyTranslations();
    App.nav('settings');
  },

  installAndroid() {
    if (window._installPrompt) {
      window._installPrompt.prompt();
    }
  }
};
