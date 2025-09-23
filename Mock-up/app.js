// /app.js (ES module)
import {
  getCurrentUser,
  getLeaderboard,
  getTeamLeaderboard,
  getStaleDocuments,
  daysSince
} from './data.js';

// Single-mount guard (ifall app.js råkar laddas dubbelt)
if (window.__APP_MOUNTED__) {
  // gör inget om vi redan initierat
} else {
  window.__APP_MOUNTED__ = true;

  // Sätt tema tidigt
  (function initEarlyTheme() {
    const saved = localStorage.getItem('theme') || 'light';
    document.documentElement.setAttribute('data-theme', saved);
  })();

  // Snabb DOM-hjälp
  const $ = (id) => document.getElementById(id);

  // Elementrefs
  const themeSelect           = $('theme-select');
  const loginSection          = $('login-section');
  const dashboardSection      = $('dashboard-section');
  const loginForm             = $('login-form');
  const welcomeMessage        = $('welcome-message');
  const leaderboardList       = $('leaderboard-list');
  const teamLeaderboardList   = $('team-leaderboard-list');
  const staleFilter           = $('stale-filter');
  const staleDocumentsList    = $('stale-documents-list');
  const analyzeCommitBtn      = $('analyze-commit-btn');
  const aiDocumentationOutput = $('ai-documentation-output');
  const copyDocBtn            = $('copy-doc-btn');
  const generatedDocContent   = $('generated-doc-content');
  const logoutBtn             = $('logout-btn');

  // ========== Tema ==========
  function applyTheme(theme) {
    document.documentElement.setAttribute('data-theme', theme);
    try { localStorage.setItem('theme', theme); } catch {}
    if (themeSelect) themeSelect.value = theme;
  }
  (function initTheme() {
    const saved = localStorage.getItem('theme') || 'light';
    applyTheme(saved);
    themeSelect?.addEventListener('change', (e) => applyTheme(e.target.value));
  })();

  // ========== Login/Logout ==========
  async function showDashboard(username) {
    loginSection?.classList.add('hidden');
    dashboardSection?.classList.remove('hidden');
    logoutBtn?.classList.remove('hidden');

    if (welcomeMessage) welcomeMessage.textContent = `Welcome${username ? ', ' + username : ''}!`;
    const pointsEl = $('user-points');
    const rankEl   = $('user-rank');
    if (pointsEl) pointsEl.textContent = '1250';
    if (rankEl)   rankEl.textContent   = 'Gold';

    await Promise.all([
      populateLeaderboard(),
      populateTeamLeaderboard(),
      populateStaleDocuments()
    ]);
  }

  function showLogin() {
    dashboardSection?.classList.add('hidden');
    loginSection?.classList.remove('hidden');
    logoutBtn?.classList.add('hidden');
  }

  async function checkLogin() {
    const savedUser = await getCurrentUser();
    if (savedUser) { await showDashboard(savedUser); return true; }
    showLogin(); return false;
  }

  loginForm?.addEventListener('submit', async (e) => {
    e.preventDefault();
    const usernameEl = document.getElementById('username');
    const passwordEl = document.getElementById('password');
    const username = usernameEl && 'value' in usernameEl ? usernameEl.value.trim() : '';
    const password = passwordEl && 'value' in passwordEl ? passwordEl.value : '';
    if (!username || !password) {
      loginForm.classList.add('form-error');
      setTimeout(() => loginForm.classList.remove('form-error'), 1200);
      return;
    }
    try { localStorage.setItem('loggedInUser', username); } catch {}
    await showDashboard(username);
  });

  logoutBtn?.addEventListener('click', () => {
    try { localStorage.removeItem('loggedInUser'); } catch {}
    showLogin();
  });

  // ========== Listor ==========
async function populateLeaderboard() {
  if (!leaderboardList) return;
  leaderboardList.innerHTML = '';

  const [rows, currentUser] = await Promise.all([getLeaderboard(), getCurrentUser()]);

  rows.forEach((player, i) => {
    const userKey = player.name;                                   // kanoniskt (t.ex. "You", "Alice")
    const displayName = (userKey === 'You' && currentUser) ? currentUser : userKey;

    const li = document.createElement('li');
    li.classList.add('lb-item');
    li.dataset.user = userKey;                                     // behåll "You" som KEY
    if (userKey === 'You') li.classList.add('is-current-user');    // highlight funkar som förr

    li.innerHTML = `
      <span class="lb-user">${i + 1}. ${displayName}</span>
      <span>${player.points} points</span>
    `;
    leaderboardList.appendChild(li);
  });
}


async function populateTeamLeaderboard() {
  if (!teamLeaderboardList) return;
  teamLeaderboardList.innerHTML = '';
  const data = await getTeamLeaderboard();
  data.forEach((team, i) => {
    const li = document.createElement('li');
    li.classList.add('lb-item');           // klickbar stil
    li.dataset.team = team.name;           // viktigt för click-hook
    li.innerHTML = `
      <span class="lb-user">${i + 1}. ${team.name}</span>
      <span>${team.points} points</span>
    `;
    teamLeaderboardList.appendChild(li);
  });
}

  async function populateStaleDocuments() {
    if (!staleFilter || !staleDocumentsList) return;
    const docs = await getStaleDocuments();
    const nowFilter = parseInt(staleFilter.value, 10);
    staleDocumentsList.innerHTML = '';

    const filtered = docs.filter(d => {
      const diff = daysSince(d.lastEdited);
      if (nowFilter === 90) return diff >= 90;
      return diff >= nowFilter && diff < nowFilter + 15;
    });

    if (!filtered.length) {
      const li = document.createElement('li');
      li.textContent = 'No documents in this category.';
      staleDocumentsList.appendChild(li);
      return;
    }

    filtered.forEach(doc => {
      const diffDays = daysSince(doc.lastEdited);
      const li = document.createElement('li');
      li.innerHTML = `<span>${doc.name}</span> <span class="stale-days">(${diffDays} days)</span>`;
      staleDocumentsList.appendChild(li);
    });
  }
  staleFilter?.addEventListener('change', populateStaleDocuments);

  // ========== AI-dokumentationsdemo ==========
  analyzeCommitBtn?.addEventListener('click', () => {
    aiDocumentationOutput?.classList.remove('hidden');
  });

  copyDocBtn?.addEventListener('click', () => {
    if (!generatedDocContent) return;
    navigator.clipboard.writeText(generatedDocContent.innerText).then(() => {
      const original = copyDocBtn.textContent;
      copyDocBtn.textContent = 'Copied!';
      setTimeout(() => (copyDocBtn.textContent = original || 'Copy Documentation'), 1500);
    });
  });

  // ========= OVERLAY =========
  (function injectOverlayStyles(){
    if (document.getElementById('overlay-styles')) return;
    const s = document.createElement('style');
    s.id = 'overlay-styles';
    s.textContent = `
      .overlay-root{position:fixed;inset:0;z-index:1000}
      .overlay-hidden{display:none!important}
      .overlay-backdrop{position:absolute;inset:0;background:rgba(0,0,0,.5);backdrop-filter:blur(2px)}
      .overlay-panel{position:absolute;top:5vh;left:50%;transform:translateX(-50%);width:min(1100px,92vw);height:min(80vh,900px);background:var(--card-background,#fff);color:var(--text-color,#111);border-radius:16px;box-shadow:0 20px 60px rgba(0,0,0,.35);overflow:hidden}
      .overlay-close{position:absolute;top:10px;right:12px;border:0;background:transparent;font-size:28px;line-height:1;cursor:pointer;color:inherit;z-index:2}
      .overlay-iframe{width:100%;height:100%;border:0;display:block}
      body.overlay-lock{overflow:hidden}
      #leaderboard-list .lb-item{cursor:pointer}
      #leaderboard-list .lb-item .lb-user{text-decoration:underline;color:inherit}
      /* ↓ gör team-listan visuellt klickbar också */
      #team-leaderboard-list .lb-item{cursor:pointer}
      #team-leaderboard-list .lb-item .lb-user{text-decoration:underline;color:inherit}
      `;
    document.head.appendChild(s);
  })();

  function ensureOverlay(){
    let root = document.getElementById('app-overlay');
    if (root) return root;

    root = document.createElement('div');
    root.id = 'app-overlay';
    root.className = 'overlay-root overlay-hidden';
    root.setAttribute('aria-hidden','true');

    const backdrop = document.createElement('div');
    backdrop.className = 'overlay-backdrop';
    backdrop.setAttribute('data-close-overlay','');

    const panel = document.createElement('div');
    panel.className = 'overlay-panel';
    panel.setAttribute('role','dialog');
    panel.setAttribute('aria-modal','true');

    const closeBtn = document.createElement('button');
    closeBtn.className = 'overlay-close';
    closeBtn.type = 'button';
    closeBtn.setAttribute('data-close-overlay','');
    closeBtn.setAttribute('aria-label','Close');
    closeBtn.textContent = '×';

    const frame = document.createElement('iframe');
    frame.className = 'overlay-iframe';
    frame.id = 'overlay-frame';
    frame.title = 'Overlay';
    frame.loading = 'lazy';
    frame.referrerPolicy = 'no-referrer';
    frame.sandbox = 'allow-same-origin allow-scripts allow-forms allow-popups';
    frame.src = 'about:blank';

    panel.appendChild(closeBtn);
    panel.appendChild(frame);
    root.appendChild(backdrop);
    root.appendChild(panel);
    document.body.appendChild(root);
    return root;
  }

  function openOverlay(src){
    const root = ensureOverlay();
    const frame = root.querySelector('#overlay-frame');
    frame.setAttribute('src', src);
    root.classList.remove('overlay-hidden');
    root.setAttribute('aria-hidden','false');
    document.body.classList.add('overlay-lock');

    const panel = root.querySelector('.overlay-panel');
    let leaveTimer = null;
    panel.onmouseleave = () => { leaveTimer = setTimeout(closeOverlay, 800); };
    panel.onmouseenter = () => { if (leaveTimer){ clearTimeout(leaveTimer); leaveTimer = null; } };
  }

  function closeOverlay(){
    const root = document.getElementById('app-overlay');
    if (!root) return;
    root.classList.add('overlay-hidden');
    root.setAttribute('aria-hidden','true');
    document.body.classList.remove('overlay-lock');
  }

  document.addEventListener('click', (e) => {
    const el = e.target;
    if (!(el instanceof Element)) return;
    if (el.closest('[data-close-overlay]')) closeOverlay();
  });

  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
      const root = document.getElementById('app-overlay');
      if (root && root.getAttribute('aria-hidden') === 'false') closeOverlay();
    }
  });

  // Hook: "My Progress" → overlay user_profile med aktuell user (fallback 'You')
const myProgress = document.querySelector('.js-open-my-progress');
if (myProgress) {
  myProgress.addEventListener('click', (e) => {
    e.preventDefault();
    openOverlay(`user_profile.html?user=${encodeURIComponent('You')}`);
  });
}

  // Hook: klick på leaderboard-rad → overlay user_profile?user=...
  if (leaderboardList) {
    leaderboardList.addEventListener('click', (e) => {
      const li = e.target instanceof Element ? e.target.closest('li.lb-item') : null;
      if (!li) return;
      const user = li.dataset.user || '';
      if (!user) return;
      e.preventDefault();
      openOverlay(`user_profile.html?user=${encodeURIComponent(user)}`);
    });
  }

// Klick på team-rad → öppna teamprofil i overlay
  if (teamLeaderboardList) {
  teamLeaderboardList.addEventListener('click', (e) => {
    const li = e.target instanceof Element ? e.target.closest('li.lb-item') : null;
    if (!li) return;
    const team = li.dataset.team || '';
    if (!team) return;
    e.preventDefault();
    openOverlay(`team_profile.html?team=${encodeURIComponent(team)}`);
  });
}

  // Init
  checkLogin();
}
