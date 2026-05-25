/* ============================================================
   VERITAS — App shell (sidebar + topbar) injection
   Each page sets on <body>:
     data-page="live-feed"
     data-crumb="Live Feed|live-feed.html > Resolution R-4471"
   ============================================================ */
(function () {
  const BRAND_MARK = `
    <svg class="brand-mark" viewBox="0 0 28 28" fill="none" xmlns="http://www.w3.org/2000/svg">
      <rect x="0.85" y="0.85" width="26.3" height="26.3" rx="7.6" fill="#101319" stroke="rgba(255,255,255,0.10)"/>
      <path d="M7.6 18.7 L14 7.6 L20.4 18.7" stroke="#4C8DFF" stroke-width="1.9" stroke-linecap="round" stroke-linejoin="round"/>
      <path d="M10.5 18.7 H17.5" stroke="#4C8DFF" stroke-width="1.9" stroke-linecap="round" opacity="0.45"/>
      <circle cx="14" cy="13.6" r="1.55" fill="#4C8DFF"/>
    </svg>`;

  const NAV = [
    { group: 'Overview', items: [
      { key: 'command',     label: 'Command Center', icon: 'gauge',    href: 'index.html' },
      { key: 'live-feed',   label: 'Live Feed',       icon: 'activity', href: 'live-feed.html' },
    ]},
    { group: 'Markets', items: [
      { key: 'markets',     label: 'Markets',         icon: 'layers',   href: 'markets.html' },
      { key: 'disputes',    label: 'Disputes',        icon: 'scale',    href: 'disputes.html', badge: '3', alert: true },
    ]},
    { group: 'Develop', items: [
      { key: 'integrations',label: 'Integrations',    icon: 'code',     href: 'integrations.html' },
      { key: 'analytics',   label: 'Analytics',       icon: 'barchart', href: 'analytics.html' },
    ]},
    { group: 'Configure', items: [
      { key: 'council',     label: 'Council',           icon: 'network', href: 'settings-council.html' },
      { key: 'roster',      label: 'Model Roster',      icon: 'cpu',     href: 'roster.html' },
      { key: 'authority',   label: 'Authority Registry',icon: 'library', href: 'settings-authority.html' },
    ]},
  ];

  function buildSidebar(active) {
    let nav = '';
    NAV.forEach(function (g) {
      nav += `<div class="nav-group"><div class="nav-group-label">${g.group}</div>`;
      g.items.forEach(function (it) {
        const on = it.key === active ? ' active' : '';
        const badge = it.badge ? `<span class="nav-badge${it.alert ? ' alert' : ''}">${it.badge}</span>` : '';
        nav += `<a class="nav-item${on}" href="${it.href}"><i data-icon="${it.icon}"></i><span>${it.label}</span>${badge}</a>`;
      });
      nav += `</div>`;
    });

    return `
      <aside class="sidebar">
        <div class="brand">
          ${BRAND_MARK}
          <span class="brand-name">Veritas</span>
          <span class="brand-env">Mainnet</span>
        </div>
        <nav class="nav">${nav}</nav>
        <div class="sidebar-foot">
          <div class="sys-status">
            <span class="dot dot-yes dot-live"></span>
            <span class="label">All systems nominal</span>
            <span class="sub">99.94%</span>
          </div>
          <div class="account" data-menu="account">
            <span class="avatar">CZ</span>
            <span class="meta">
              <div class="name">Chiliz Labs</div>
              <div class="addr">0x3f9a…d1b2</div>
            </span>
            <span class="chev"><i data-icon="chevupdown"></i></span>
          </div>
        </div>
      </aside>`;
  }

  function buildCrumb(raw) {
    if (!raw) return '<span class="current">Overview</span>';
    const parts = raw.split('>').map(s => s.trim());
    let html = '';
    parts.forEach(function (p, i) {
      const last = i === parts.length - 1;
      const [label, href] = p.split('|').map(s => s.trim());
      if (last) {
        html += `<span class="current">${label}</span>`;
      } else {
        html += href
          ? `<a href="${href}">${label}</a><span class="sep"><i data-icon="chevright" data-size="14"></i></span>`
          : `<span class="t-3">${label}</span><span class="sep"><i data-icon="chevright" data-size="14"></i></span>`;
      }
    });
    return html;
  }

  function buildTopbar(crumb) {
    return `
      <header class="topbar">
        <div class="crumb">${buildCrumb(crumb)}</div>
        <div class="topbar-search">
          <div class="input-wrap">
            <i data-icon="search"></i>
            <input class="input" placeholder="Search resolutions, markets, tx…" />
            <span class="kbd" style="position:absolute;right:8px;">⌘K</span>
          </div>
        </div>
        <div class="topbar-actions">
          <a class="btn btn-primary" href="new-market.html"><i data-icon="plus"></i>New Market</a>
          <button class="btn-icon notif-btn" data-menu="notif" title="Notifications">
            <i data-icon="bell"></i><span class="dot-badge"></span>
          </button>
          <button class="btn-icon" title="Help"><i data-icon="help"></i></button>
        </div>
      </header>`;
  }

  function mount() {
    const body = document.body;
    const active = body.getAttribute('data-page') || '';
    const crumb = body.getAttribute('data-crumb') || '';

    const shell = document.createElement('div');
    shell.className = 'app-shell';
    shell.innerHTML = buildSidebar(active) +
      `<div class="app-main">${buildTopbar(crumb)}<div class="page" id="page"></div></div>`;

    // Move existing body content into the page region
    const page = shell.querySelector('#page');
    const staged = document.createElement('div');
    while (body.firstChild) staged.appendChild(body.firstChild);
    body.appendChild(shell);
    page.appendChild(staged);
    // unwrap staging
    while (staged.firstChild) page.appendChild(staged.firstChild);
    staged.remove();

    if (window.hydrateIcons) window.hydrateIcons(document);
    if (window.initInteractions) window.initInteractions();
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', mount);
  } else {
    mount();
  }
})();
