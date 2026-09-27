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

// The reference header belongs to the top of each page; the pill takes over once it leaves view.
const probe = typeof CSS !== 'undefined' && CSS.supports('background', 'paint(gg-glass-probe)') && CSS.supports('backdrop-filter', 'url(#gg-glass-probe)');
document.documentElement?.classList.toggle('gg-refraction-ready', probe);
const scrollNav = document.querySelector('.floating-nav');
const topHeader = document.querySelector('.header');
if (scrollNav && topHeader) {
  const lightBoundary = document.querySelector('.content-flow') || document.querySelector('.page-hero');
  let scrollFrame = 0;
  const updateScrollNav = () => {
    scrollFrame = 0;
    const show = topHeader.getBoundingClientRect().bottom <= 0 && !document.body.classList.contains('menu-open');
    if (!show && scrollNav.contains(document.activeElement)) {
      const replacement = window.innerWidth <= 700 ? navToggle : document.querySelector('.header .nav a[aria-current="page"]');
      replacement?.focus({preventScroll:true});
    }
    scrollNav.classList.toggle('is-visible', show);
    scrollNav.setAttribute('aria-hidden', String(!show));
    scrollNav.inert = !show;
    if (lightBoundary) {
      const bounds = lightBoundary.getBoundingClientRect();
      const overLight = lightBoundary.classList.contains('content-flow') ? bounds.top <= 145 : bounds.bottom <= 175;
      scrollNav.classList.toggle('is-over-light', overLight);
    }
  };
  const scheduleScrollNav = () => { if (!scrollFrame) scrollFrame = requestAnimationFrame(updateScrollNav); };
  window.addEventListener('scroll', scheduleScrollNav, {passive:true});
  window.addEventListener('resize', scheduleScrollNav);
  navToggle?.addEventListener('click', scheduleScrollNav);
  document.addEventListener('keydown', event => { if (event.key === 'Escape') scheduleScrollNav(); });
  updateScrollNav();
}
