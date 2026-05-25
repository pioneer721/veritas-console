/* ============================================================
   VERITAS — Interactions
   Exposes window.initInteractions(), invoked after shell mount.
   All handlers are delegated + defensive so pages stay declarative.
   ============================================================ */
(function () {
  const MENUS = {
    account: [
      { label: 'Account', icon: 'user' },
      { label: 'Team & billing', icon: 'wallet' },
      { label: 'Preferences', icon: 'settings' },
      { sep: true },
      { label: 'Documentation', icon: 'file' },
      { label: 'Sign out', icon: 'logout' },
    ],
    notif: [
      { headline: 'Notifications' },
      { label: 'Dispute #D-4441 opened on “Fed cuts rates”', icon: 'scale' },
      { label: 'Resolution R-4468 published to Base', icon: 'circlecheck' },
      { label: 'Council degraded: Mistral latency high', icon: 'warn' },
    ],
  };

  let openMenu = null;
  function closeMenu() { if (openMenu) { openMenu.remove(); openMenu = null; } }

  function buildMenu(key, trigger) {
    const items = MENUS[key]; if (!items) return;
    const m = document.createElement('div');
    m.className = 'menu';
    let html = '';
    items.forEach(function (it) {
      if (it.sep) { html += '<div class="menu-sep"></div>'; return; }
      if (it.headline) { html += `<div class="menu-label">${it.headline}</div>`; return; }
      html += `<div class="menu-item">${it.icon ? `<i data-icon="${it.icon}"></i>` : ''}<span>${it.label}</span></div>`;
    });
    m.innerHTML = html;
    document.body.appendChild(m);
    if (window.hydrateIcons) window.hydrateIcons(m);

    const r = trigger.getBoundingClientRect();
    const mw = m.offsetWidth, mh = m.offsetHeight;
    let top = r.bottom + 6, left = r.left;
    if (key === 'account') { top = r.top - mh - 6; }            // open upward
    if (left + mw > window.innerWidth - 10) left = r.right - mw; // keep in viewport
    if (top + mh > window.innerHeight - 10) top = r.top - mh - 6;
    m.style.top = Math.max(10, top) + 'px';
    m.style.left = Math.max(10, left) + 'px';
    openMenu = m;
  }

  function onDocClick(e) {
    const trigger = e.target.closest('[data-menu]');
    if (trigger) {
      e.stopPropagation();
      const wasOpen = openMenu;
      closeMenu();
      if (!wasOpen || wasOpen._key !== trigger.getAttribute('data-menu')) {
        buildMenu(trigger.getAttribute('data-menu'), trigger);
        if (openMenu) openMenu._key = trigger.getAttribute('data-menu');
      }
      return;
    }
    if (openMenu && !e.target.closest('.menu')) closeMenu();
  }

  /* ---- Tabs --------------------------------------------------- */
  function initTabs(root) {
    root.querySelectorAll('[data-tab-group]').forEach(function (group) {
      const tabs = group.querySelectorAll('.tab[data-tab]');
      const scope = group.getAttribute('data-tab-scope');
      const panelRoot = scope ? document.querySelector(scope) : group.parentElement;
      tabs.forEach(function (tab) {
        tab.addEventListener('click', function () {
          tabs.forEach(t => t.classList.remove('active'));
          tab.classList.add('active');
          const key = tab.getAttribute('data-tab');
          if (panelRoot) {
            panelRoot.querySelectorAll('[data-panel]').forEach(function (p) {
              p.classList.toggle('hidden', p.getAttribute('data-panel') !== key);
            });
          }
        });
      });
    });
  }

  /* ---- Expandable resolution cards --------------------------- */
  function initExpanders(root) {
    root.querySelectorAll('[data-expand]').forEach(function (top) {
      top.addEventListener('click', function (e) {
        if (e.target.closest('a,button')) return;
        const card = top.closest('.res-card');
        const body = card && card.querySelector('.res-card-expand');
        if (body) body.classList.toggle('hidden');
        const chev = top.querySelector('[data-expand-chev]');
        if (chev) chev.style.transform = body.classList.contains('hidden') ? 'rotate(0deg)' : 'rotate(180deg)';
      });
    });
  }

  /* ---- Segmented controls ------------------------------------ */
  function initSegmented(root) {
    root.querySelectorAll('.segmented').forEach(function (seg) {
      seg.querySelectorAll('button').forEach(function (b) {
        b.addEventListener('click', function () {
          seg.querySelectorAll('button').forEach(x => x.classList.remove('active'));
          b.classList.add('active');
        });
      });
    });
  }

  /* ---- Basis radio options ----------------------------------- */
  function initBasis(root) {
    root.querySelectorAll('[data-basis-group]').forEach(function (group) {
      group.querySelectorAll('.basis-opt').forEach(function (opt) {
        opt.addEventListener('click', function () {
          group.querySelectorAll('.basis-opt').forEach(o => o.classList.remove('sel'));
          opt.classList.add('sel');
        });
      });
    });
  }

  /* ---- Wizard ------------------------------------------------- */
  function initWizard(root) {
    root.querySelectorAll('[data-wizard]').forEach(function (wiz) {
      const panels = wiz.querySelectorAll('[data-step-panel]');
      const steps = wiz.querySelectorAll('.step');
      const lines = wiz.querySelectorAll('.step-line');
      let cur = 1;
      function render() {
        panels.forEach(p => p.classList.toggle('hidden', +p.getAttribute('data-step-panel') !== cur));
        steps.forEach((s, i) => {
          s.classList.toggle('active', i + 1 === cur);
          s.classList.toggle('done', i + 1 < cur);
          const num = s.querySelector('.step-num');
          if (num) num.innerHTML = (i + 1 < cur) ? window.icon('check', { size: 14 }) : (i + 1);
        });
        lines.forEach((l, i) => l.classList.toggle('filled', i + 1 < cur));
        wiz.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
      wiz.querySelectorAll('[data-step-next]').forEach(b => b.addEventListener('click', () => { if (cur < panels.length) { cur++; render(); } }));
      wiz.querySelectorAll('[data-step-prev]').forEach(b => b.addEventListener('click', () => { if (cur > 1) { cur--; render(); } }));
      wiz.querySelectorAll('[data-step-go]').forEach(b => b.addEventListener('click', () => { cur = +b.getAttribute('data-step-go'); render(); }));
      render();
    });
  }

  /* ---- Sliders w/ output ------------------------------------- */
  function initSliders(root) {
    root.querySelectorAll('input[type=range][data-output]').forEach(function (s) {
      const out = document.querySelector(s.getAttribute('data-output'));
      const suffix = s.getAttribute('data-suffix') || '';
      function upd() { if (out) out.textContent = s.value + suffix; }
      s.addEventListener('input', upd); upd();
    });
  }

  /* ---- Copy buttons ------------------------------------------ */
  function initCopy(root) {
    root.querySelectorAll('[data-copy]').forEach(function (btn) {
      btn.addEventListener('click', function () {
        const val = btn.getAttribute('data-copy');
        if (navigator.clipboard) navigator.clipboard.writeText(val).catch(() => {});
        const orig = btn.innerHTML;
        btn.innerHTML = window.icon('check', { size: 15 });
        btn.classList.add('t-yes');
        setTimeout(() => { btn.innerHTML = orig; btn.classList.remove('t-yes'); if (window.hydrateIcons) window.hydrateIcons(btn); }, 1100);
      });
    });
  }

  /* ---- Animated fills (confidence, meters, bars, histo) ------ */
  function initFills(root) {
    requestAnimationFrame(function () {
      setTimeout(function () {
        root.querySelectorAll('.conf-fill[data-value]').forEach(f => f.style.width = f.getAttribute('data-value') + '%');
        root.querySelectorAll('.conf-threshold[data-at]').forEach(t => t.style.left = t.getAttribute('data-at') + '%');
        root.querySelectorAll('.meter > span[data-value]').forEach(s => s.style.width = s.getAttribute('data-value') + '%');
        root.querySelectorAll('.perfbar-track > span[data-value]').forEach(s => s.style.width = s.getAttribute('data-value') + '%');
        root.querySelectorAll('.hb-fill[data-h]').forEach(s => s.style.height = s.getAttribute('data-h') + '%');
      }, 60);
    });
  }

  window.initInteractions = function () {
    const root = document;
    document.addEventListener('click', onDocClick);
    window.addEventListener('resize', closeMenu);
    document.querySelector('.page') && document.querySelector('.page').addEventListener('scroll', closeMenu, { passive: true });
    initTabs(root);
    initExpanders(root);
    initSegmented(root);
    initBasis(root);
    initWizard(root);
    initSliders(root);
    initCopy(root);
    initFills(root);
  };
})();
