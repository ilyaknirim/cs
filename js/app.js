/* ============================================================
   ZAP Portal — общий скрипт
   Темы, прогресс, табы, аккордеон, навигация
   ============================================================ */

/* ---------- КОНФИГ ПРОГРЕССА ---------- */
const MODULE_TASKS = {
  m1: ['m1-install', 'm1-proxy', 'm1-intercept', 'm1-sqli', 'm1-scan', 'm1-review'],
  m2: ['m2-fuzzer', 'm2-script', 'm2-auth', 'm2-ajax', 'm2-juice', 'm2-dvwa', 'm2-ci'],
  m3: ['m3-nmap', 'm3-lynis', 'm3-openvas', 'm3-nuclei', 'm3-trivy', 'm3-report']
};

/* ---------- ТЕМЫ ---------- */
const THEMES = [
  { id: 'light',  name: 'Светлая',    swatch: 'linear-gradient(135deg,#f6f8fc,#e1f0f7)' },
  { id: 'dark',   name: 'Тёмная',     swatch: 'linear-gradient(135deg,#0b1120,#38bdf8)' },
  { id: 'ocean',  name: 'Океан',      swatch: 'linear-gradient(135deg,#e8f4f8,#0891b2)' },
  { id: 'sunset', name: 'Закат',      swatch: 'linear-gradient(135deg,#fff7ed,#ea580c)' }
];

function applyTheme(id) {
  document.documentElement.setAttribute('data-theme', id);
  localStorage.setItem('zap-theme', id);
  document.querySelectorAll('.theme-option').forEach(o => {
    o.classList.toggle('active', o.dataset.theme === id);
  });
}

function initTheme() {
  const saved = localStorage.getItem('zap-theme') || 'light';
  applyTheme(saved);
}

function buildThemeMenu() {
  const menu = document.querySelector('.theme-menu');
  if (!menu) return;
  menu.innerHTML = THEMES.map(t => `
    <button class="theme-option" data-theme="${t.id}">
      <span class="theme-swatch" style="background:${t.swatch}"></span>
      <span>${t.name}</span>
    </button>
  `).join('');
  menu.querySelectorAll('.theme-option').forEach(btn => {
    btn.addEventListener('click', () => {
      applyTheme(btn.dataset.theme);
      menu.classList.remove('open');
    });
  });
}

/* ---------- ПРОГРЕСС ---------- */
function getProgress() {
  try { return JSON.parse(localStorage.getItem('zap-progress') || '{}'); }
  catch { return {}; }
}
function saveProgress(p) { localStorage.setItem('zap-progress', JSON.stringify(p)); }

function toggleTask(taskId, checked) {
  const p = getProgress();
  if (checked) p[taskId] = true; else delete p[taskId];
  saveProgress(p);
  updateProgressUI();
}

function modulePercent(mid) {
  const p = getProgress();
  const ids = MODULE_TASKS[mid] || [];
  if (!ids.length) return 0;
  const done = ids.filter(id => p[id]).length;
  return Math.round(done / ids.length * 100);
}

function overallPercent() {
  const total = Object.values(MODULE_TASKS).reduce((s, a) => s + a.length, 0);
  const p = getProgress();
  const done = Object.keys(p).length;
  return total ? Math.round(done / total * 100) : 0;
}

function updateProgressUI() {
  // per module on current page
  document.querySelectorAll('[data-module-id]').forEach(mod => {
    const mid = mod.dataset.moduleId;
    const pct = modulePercent(mid);
    const fill = mod.querySelector('.module-progress-fill');
    const label = mod.querySelector('.module-progress-label');
    if (fill) fill.style.width = pct + '%';
    if (label) label.textContent = pct + '%';
  });

  // index cards
  document.querySelectorAll('[data-module-card]').forEach(card => {
    const mid = card.dataset.moduleCard;
    const pct = modulePercent(mid);
    const fill = card.querySelector('.progress-fill');
    const label = card.querySelector('.progress-label span:last-child');
    if (fill) fill.style.width = pct + '%';
    if (label) label.textContent = pct + '%';
    card.classList.toggle('completed', pct === 100);
  });

  // overall
  document.querySelectorAll('.overall-progress-fill').forEach(f => {
    f.style.width = overallPercent() + '%';
  });
  document.querySelectorAll('.overall-progress-label').forEach(l => {
    l.textContent = overallPercent() + '%';
  });

  // checkboxes state
  const p = getProgress();
  document.querySelectorAll('[data-task-id]').forEach(cb => {
    const on = !!p[cb.dataset.taskId];
    cb.checked = on;
    cb.closest('.task-item')?.classList.toggle('done', on);
  });
}

function initTasks() {
  document.querySelectorAll('[data-task-id]').forEach(cb => {
    cb.addEventListener('change', () => {
      toggleTask(cb.dataset.taskId, cb.checked);
    });
  });
}

/* ---------- TABS ---------- */
function initTabs() {
  document.querySelectorAll('.tab-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      const tabId = btn.dataset.tab;
      const parent = btn.closest('.tabs')?.parentElement || btn.closest('section');
      parent.querySelectorAll('.tab-btn').forEach(b => b.classList.remove('active'));
      parent.querySelectorAll('.tab-panel').forEach(p => p.classList.remove('active'));
      btn.classList.add('active');
      document.getElementById(tabId)?.classList.add('active');
    });
  });
}

/* ---------- ACCORDION ---------- */
function initAccordions() {
  document.querySelectorAll('.accordion-header').forEach(h => {
    h.addEventListener('click', () => h.parentElement.classList.toggle('open'));
  });
}

/* ---------- SIDEBAR ACTIVE ---------- */
function initSidebar() {
  const sections = document.querySelectorAll('section[id]');
  const links = document.querySelectorAll('.sidebar a[href^="#"]');
  if (!sections.length || !links.length) return;
  const update = () => {
    let cur = '';
    sections.forEach(s => {
      if (window.scrollY >= s.offsetTop - 120) cur = s.id;
    });
    links.forEach(l => l.classList.toggle('active', l.getAttribute('href') === '#' + cur));
  };
  window.addEventListener('scroll', update, { passive: true });
  update();
}

/* ---------- SMOOTH SCROLL ---------- */
function initSmoothScroll() {
  document.querySelectorAll('a[href^="#"]').forEach(a => {
    a.addEventListener('click', e => {
      const t = document.querySelector(a.getAttribute('href'));
      if (t) {
        e.preventDefault();
        t.scrollIntoView({ behavior: 'smooth' });
        history.replaceState(null, '', a.getAttribute('href'));
      }
    });
  });
}

/* ---------- INIT ---------- */
document.addEventListener('DOMContentLoaded', () => {
  initTheme();
  buildThemeMenu();
  initTasks();
  initTabs();
  initAccordions();
  initSidebar();
  initSmoothScroll();
  updateProgressUI();

  // theme menu toggle
  const tbtn = document.querySelector('.theme-btn');
  const tmenu = document.querySelector('.theme-menu');
  tbtn?.addEventListener('click', e => {
    e.stopPropagation();
    tmenu.classList.toggle('open');
  });
  document.addEventListener('click', () => tmenu?.classList.remove('open'));
});