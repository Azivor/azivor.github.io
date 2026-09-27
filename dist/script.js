const links = Array.from(document.querySelectorAll('.nav a'));
const currentPath = location.pathname.replace(/index\.html$/, '') || '/';
for (const link of links) {
  const active = link.getAttribute('href') === currentPath;
  link.classList.toggle('selected', active);
  if (active) link.setAttribute('aria-current', 'page');
  else link.removeAttribute('aria-current');
}

const navToggle = document.querySelector?.('.nav-toggle');
if (navToggle) {
  const menu = document.getElementById(navToggle.getAttribute('aria-controls'));
  const closeMenu = () => {
    navToggle.setAttribute('aria-expanded', 'false');
    navToggle.setAttribute('aria-label', 'Open navigation menu');
    menu?.classList.remove('nav-open');
    document.body.classList.remove('menu-open');
  };
  navToggle.addEventListener('click', () => {
    const open = navToggle.getAttribute('aria-expanded') !== 'true';
    navToggle.setAttribute('aria-expanded', String(open));
    navToggle.setAttribute('aria-label', open ? 'Close navigation menu' : 'Open navigation menu');
    menu?.classList.toggle('nav-open', open);
    document.body.classList.toggle('menu-open', open);
    if (open) menu?.querySelector('a')?.focus();
  });
  menu?.addEventListener('click', event => {
    if (event.target.closest('a')) closeMenu();
  });
  document.addEventListener('keydown', event => {
    if (event.key === 'Escape' && navToggle.getAttribute('aria-expanded') === 'true') {
      closeMenu();
      navToggle.focus();
    }
  });
  window.addEventListener('resize', () => {
    if (window.innerWidth > 700) closeMenu();
  });
}

// Let the homepage action travel through the scroll-driven Earth scene.
const descentLink = document.querySelector('.descent-link');
if (descentLink) {
  const destination = document.getElementById('first-content');
  descentLink.addEventListener('click', event => {
    if (!destination || event.defaultPrevented || event.button !== 0 || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;
    event.preventDefault();
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      destination.scrollIntoView({behavior: 'instant', block: 'start'});
      destination.focus({preventScroll: true});
      history.replaceState(null, '', '#first-content');
      return;
    }

    const start = window.scrollY;
    const end = destination.getBoundingClientRect().top + start;
    const duration = 5100;
    const oldBehavior = document.documentElement.style.scrollBehavior;
    document.documentElement.style.scrollBehavior = 'auto';
    let frame;
    let started;
    let stopped = false;
    const cancelKeys = new Set(['ArrowDown', 'ArrowUp', 'PageDown', 'PageUp', 'Home', 'End', ' ', 'Escape']);
    const cleanup = () => {
      cancelAnimationFrame(frame);
      document.documentElement.style.scrollBehavior = oldBehavior;
      window.removeEventListener('wheel', cancel);
      window.removeEventListener('touchstart', cancel);
      window.removeEventListener('keydown', onKey);
    };
    const cancel = () => { stopped = true; cleanup(); };
    const onKey = keyEvent => { if (cancelKeys.has(keyEvent.key)) cancel(); };
    window.addEventListener('wheel', cancel, {passive: true, once: true});
    window.addEventListener('touchstart', cancel, {passive: true, once: true});
    window.addEventListener('keydown', onKey);
    const step = now => {
      if (stopped) return;
      started ??= now;
      const t = Math.min((now - started) / duration, 1);
      const eased = (1 - Math.cos(Math.PI * t)) / 2;
      window.scrollTo(0, start + (end - start) * eased);
      if (t < 1) frame = requestAnimationFrame(step);
      else {
        cleanup();
        destination.focus({preventScroll: true});
        history.replaceState(null, '', '#first-content');
      }
    };
    frame = requestAnimationFrame(step);
  });
}

// Keep one set of links on inner pages; reserve the second, floating set for Home's long scene.
const probe = typeof CSS !== 'undefined' && CSS.supports('background', 'paint(gg-glass-probe)') && CSS.supports('backdrop-filter', 'url(#gg-glass-probe)');
document.documentElement?.classList.toggle('gg-refraction-ready', probe);
const scrollNav = document.querySelector('.floating-nav');
const topHeader = document.querySelector('.header');
const headerNav = document.querySelector('.inner-page .header .nav');
if (topHeader && (scrollNav || headerNav)) {
  const journey = document.querySelector('.journey');
  const lightBoundary = document.querySelector('.content-flow') || document.querySelector('.page-hero');
  const wordmark = topHeader.querySelector('.wordmark');
  let scrollFrame = 0;
  const updateScrollNav = () => {
    scrollFrame = 0;
    const desktop = window.innerWidth > 700;
    if (scrollNav) {
      const bounds = journey?.getBoundingClientRect();
      const journeyProgress = bounds ? Math.max(0, Math.min(1, -bounds.top / Math.max(1, bounds.height - window.innerHeight))) : 0;
      const afterScene = bounds ? journeyProgress >= .8 : topHeader.getBoundingClientRect().bottom <= 0;
      const reducedScene = document.documentElement.classList.contains('sky-fallback') || window.matchMedia('(prefers-reduced-motion: reduce)').matches;
      const show = desktop && !document.body.classList.contains('menu-open') && (reducedScene ? (lightBoundary?.getBoundingClientRect().top ?? Infinity) <= window.innerHeight : afterScene);
      topHeader.inert = show;
      if (!show && scrollNav.contains(document.activeElement)) {
        topHeader.querySelector('.nav a[aria-current="page"]')?.focus({preventScroll:true});
      }
      scrollNav.classList.toggle('is-visible', show);
      scrollNav.setAttribute('aria-hidden', String(!show));
      scrollNav.inert = !show;
      if (lightBoundary) scrollNav.classList.toggle('is-over-light', lightBoundary.getBoundingClientRect().top <= 145);
    }
    if (headerNav) {
      const glass = desktop && window.scrollY > 8;
      headerNav.classList.toggle('is-glass', glass);
      headerNav.classList.toggle('is-over-light', glass && (lightBoundary?.getBoundingClientRect().bottom ?? Infinity) <= 175);
      if (wordmark) wordmark.inert = desktop && topHeader.getBoundingClientRect().bottom <= 0;
    }
  };
  const scheduleScrollNav = () => { if (!scrollFrame) scrollFrame = requestAnimationFrame(updateScrollNav); };
  window.addEventListener('scroll', scheduleScrollNav, {passive:true});
  window.addEventListener('resize', scheduleScrollNav);
  navToggle?.addEventListener('click', scheduleScrollNav);
  document.addEventListener('keydown', event => { if (event.key === 'Escape') scheduleScrollNav(); });
  updateScrollNav();
}

// Let the selected capsule travel to the clicked route before a desktop page change.
for (const bar of [scrollNav, headerNav]) {
  const highlight = bar?.querySelector?.('.glass-nav-highlight');
  const current = bar?.querySelector?.('a[aria-current="page"]');
  if (!highlight || !current) continue;

  const placeHighlight = link => {
    const barBounds = bar.getBoundingClientRect();
    const linkBounds = link.getBoundingClientRect();
    highlight.style.setProperty('--highlight-x', `${linkBounds.left - barBounds.left}px`);
    highlight.style.setProperty('--highlight-width', `${linkBounds.width}px`);
  };
  placeHighlight(current);
  bar.classList.add('has-highlight');
  requestAnimationFrame(() => highlight.classList.add('is-ready'));
  document.fonts?.ready.then(() => placeHighlight(current));
  window.addEventListener('resize', () => placeHighlight(current));

  let routeTimer;
  bar.addEventListener('click', event => {
    const link = event.target.closest?.('a[href]');
    if (!link || event.defaultPrevented || event.button !== 0 || event.detail === 0 || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;
    if (window.innerWidth <= 700 || !(bar.classList.contains('is-visible') || bar.classList.contains('is-glass'))) return;
    if (link.getAttribute('href') === currentPath || link.origin !== location.origin || window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    event.preventDefault();
    placeHighlight(link);
    clearTimeout(routeTimer);
    routeTimer = setTimeout(() => { window.location.assign(link.href); }, 280);
  });
}
