const links = Array.from(document.querySelectorAll('.nav a'));
const currentPath = location.pathname.replace(/index\.html$/, '') || '/';
for (const link of links) {
  const href = link.getAttribute('href');
  const active = href === '/' ? currentPath === '/' : currentPath.startsWith(href);
  link.classList.toggle('selected', active);
  if (active) link.setAttribute('aria-current', 'page');
  else link.removeAttribute('aria-current');
}

const navToggle = document.querySelector?.('.nav-toggle');
let refreshScrollNav = () => {};
if (navToggle) {
  const menu = document.getElementById(navToggle.getAttribute('aria-controls'));
  const backgroundInert = new Map();
  const menuLinks = () => Array.from(menu?.querySelectorAll('a[href]') || [])
    .filter(link => !link.hidden && !link.inert && link.getAttribute('tabindex') !== '-1');
  const closeMenu = ({desktop = false} = {}) => {
    if (navToggle.getAttribute('aria-expanded') !== 'true') return;
    const focusWasInside = document.activeElement === navToggle || menu?.contains(document.activeElement);
    navToggle.setAttribute('aria-expanded', 'false');
    navToggle.setAttribute('aria-label', 'Open navigation menu');
    menu?.classList.remove('nav-open');
    document.body.classList.remove('menu-open');
    for (const [element, inert] of backgroundInert) element.inert = inert;
    backgroundInert.clear();
    if (desktop) {
      // Reconcile the Home scene before choosing a visible desktop focus target.
      refreshScrollNav();
      if (focusWasInside) {
        const floating = document.querySelector('.floating-nav.is-visible');
        const destination = floating?.querySelector('a[aria-current="page"]')
          || menu?.querySelector('a[aria-current="page"]') || menuLinks()[0];
        destination?.focus({preventScroll: true});
      }
    } else navToggle.focus({preventScroll: true});
  };
  navToggle.addEventListener('click', () => {
    if (navToggle.getAttribute('aria-expanded') === 'true') {
      closeMenu();
      return;
    }
    if (!menu || window.innerWidth > 700) return;
    for (const element of document.querySelectorAll('main, footer, .header .wordmark, .floating-nav, .skip-link')) {
      backgroundInert.set(element, element.inert);
      element.inert = true;
    }
    navToggle.setAttribute('aria-expanded', 'true');
    navToggle.setAttribute('aria-label', 'Close navigation menu');
    menu.classList.add('nav-open');
    document.body.classList.add('menu-open');
    (menuLinks()[0] || navToggle).focus({preventScroll: true});
  });
  menu?.addEventListener('click', event => {
    if (event.target.closest('a')) closeMenu();
  });
  document.addEventListener('keydown', event => {
    if (navToggle.getAttribute('aria-expanded') !== 'true') return;
    if (event.key === 'Escape') {
      event.preventDefault();
      closeMenu();
    } else if (event.key === 'Tab') {
      const focusable = [navToggle, ...menuLinks()];
      const index = focusable.indexOf(document.activeElement);
      const next = index < 0 ? (event.shiftKey ? focusable.length - 1 : 0)
        : (index + (event.shiftKey ? -1 : 1) + focusable.length) % focusable.length;
      event.preventDefault();
      focusable[next].focus({preventScroll: true});
    }
  });
  window.addEventListener('resize', () => {
    if (window.innerWidth > 700) closeMenu({desktop: true});
  });
}

// Let the homepage action travel through the scroll-driven Earth scene.
const descentLink = document.querySelector('.descent-link');
if (descentLink) {
  let cancelDescent = () => {};
  const destination = document.getElementById('first-content');
  descentLink.addEventListener('click', event => {
    if (!destination || event.defaultPrevented || event.button !== 0 || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;
    event.preventDefault();
    cancelDescent();
    if (!document.body.classList.contains('scene-model-ready') || document.documentElement.classList.contains('sky-fallback') || window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      destination.scrollIntoView({behavior: 'instant', block: 'start'});
      destination.focus({preventScroll: true});
      history.replaceState(null, '', '#first-content');
      return;
    }

    const start = window.scrollY;
    const stage = document.querySelector('.journey-stage');
    const initialWidth = window.innerWidth;
    const initialStageHeight = stage?.getBoundingClientRect().height || window.innerHeight;
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
      window.removeEventListener('pointerdown', cancel);
      window.removeEventListener('resize', onResize);
      cancelDescent = () => {};
    };
    const cancel = () => { stopped = true; cleanup(); };
    cancelDescent = cancel;
    const onKey = keyEvent => { if (cancelKeys.has(keyEvent.key)) cancel(); };
    const onResize = () => {
      // Mobile browser bars change innerHeight without changing the stable stage.
      if (window.innerWidth !== initialWidth || (stage?.getBoundingClientRect().height || window.innerHeight) !== initialStageHeight) cancel();
    };
    window.addEventListener('wheel', cancel, {passive: true, once: true});
    window.addEventListener('touchstart', cancel, {passive: true, once: true});
    window.addEventListener('keydown', onKey);
    window.addEventListener('pointerdown', cancel, {passive: true, once: true});
    window.addEventListener('resize', onResize);
    const step = now => {
      if (stopped) return;
      if (!document.body.classList.contains('scene-model-ready') || document.documentElement.classList.contains('sky-fallback')) { cancel(); return; }
      started ??= now;
      const t = Math.min((now - started) / duration, 1);
      const eased = (1 - Math.cos(Math.PI * t)) / 2;
      const headerClearance = window.innerWidth <= 700 ? (document.querySelector('.header')?.getBoundingClientRect().height || 60) + 16 : 0;
      const end = Math.max(0, destination.getBoundingClientRect().top + window.scrollY - headerClearance);
      window.scrollTo({left: 0, top: start + (end - start) * eased, behavior: 'instant'});
      window.dispatchEvent(new Event('azivor:descent-frame'));
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
// Sample the existing fade once. Scrolling only reads cached colors and DOM surfaces,
// never captures the page or reads pixels from the animated Earth canvas.
let heroFadePixels;
const surfaceLuminance = rgb => {
  const channels=rgb.map(value=>{const c=value/255;return c<=.04045?c/12.92:((c+.055)/1.055)**2.4;});
  return channels[0]*.2126+channels[1]*.7152+channels[2]*.0722;
};
const foregroundOverLight = (control, fallback) => {
  if (!control?.getBoundingClientRect || !document.elementsFromPoint || typeof getComputedStyle !== 'function') return fallback;
  if (window.matchMedia('(prefers-reduced-transparency: reduce)').matches && (window.innerWidth>700 || window.scrollY>8)) return true;
  const tint=window.innerWidth>700 ? .335 : .08;
  const paintedLuminance=rgb=>surfaceLuminance(rgb.map(c=>c*(1-tint)+245*tint));
  const threshold=control.classList?.contains('is-over-light') ? .23 : .27;
  const bounds=control.getBoundingClientRect();
  const x=Math.max(0,Math.min(window.innerWidth-1,bounds.left+bounds.width/2));
  const y=Math.max(0,bounds.top+bounds.height/2);
  for(const surface of document.elementsFromPoint(x,y)){
    if(surface.closest('.header, .floating-nav')) continue;
    const style=getComputedStyle(surface);
    if(surface.matches('.page-hero')){
      const fade=parseFloat(style.getPropertyValue('--hero-fade'))||180;
      const bottom=surface.getBoundingClientRect().bottom;
      const progress=Math.max(0,Math.min(1,1-(bottom-y)/fade));
      if(!heroFadePixels) return progress>.55;
      const offset=Math.round(progress*255)*4;
      const rgb=Array.from(heroFadePixels.slice(offset,offset+3));
      return paintedLuminance(rgb)>threshold;
    }
    const color=style.backgroundColor.match(/[\d.]+/g)?.map(Number);
    if(color && (color[3]??1)>=.6 && !surface.matches('.journey, .journey-stage')){
      return paintedLuminance(color.slice(0,3))>threshold;
    }
    if(surface.matches('.content-flow, .editorial-main, footer')) return true;
    if(surface.matches('.journey, .journey-stage')){
      const journey=document.querySelector('.journey');
      const stage=document.querySelector('.journey-stage');
      if(!journey || !stage) return fallback;
      const rect=stage.getBoundingClientRect(), bounds=journey.getBoundingClientRect();
      const clamp=value=>Math.max(0,Math.min(1,value));
      const p=clamp(-bounds.top/Math.max(1,bounds.height-rect.height));
      const position=clamp((y-rect.top)/rect.height);
      const reduced=window.matchMedia('(prefers-reduced-motion: reduce)').matches || document.documentElement.classList.contains('sky-fallback');
      // Match the existing landing wash; no animated canvas readback is needed.
      const stops=[[0,[36,76,128]],[.36,[83,139,184]],[.72,[153,200,227]],[1,[217,238,248]]];
      let wash=stops[0][1];
      for(let i=1;i<stops.length;i++){
        if(position<=stops[i][0]){
          const [start,a]=stops[i-1], [end,b]=stops[i];
          const t=(position-start)/(end-start);
          wash=a.map((c,index)=>c+(b[index]-c)*t);break;
        }
      }
      const opacity=reduced ? clamp((position-.6)/.4) : clamp((p-.8)*5);
      if(reduced) wash=stops[3][1];
      return paintedLuminance(wash.map((c,index)=>c*opacity+stops[0][1][index]*(1-opacity)))>threshold;
    }
  }
  return fallback;
};
if(document.querySelector('.page-hero') && typeof Image !== 'undefined'){
  const fadeImage=new Image();
  fadeImage.onload=()=>{
    try{
      const sample=document.createElement('canvas');sample.width=1;sample.height=256;
      const context=sample.getContext('2d',{willReadFrequently:true});
      context.drawImage(fadeImage,0,0,1,256);
      heroFadePixels=context.getImageData(0,0,1,256).data;
      refreshScrollNav();
    }catch{/* The geometry-based contrast fallback remains available. */}
  };
  fadeImage.src='/information-fade.svg';
}
if (topHeader && (scrollNav || headerNav)) {
  const journey = document.querySelector('.journey');
  const sceneStage = document.querySelector('.journey-stage');
  const lightBoundary = document.querySelector('.content-flow') || document.querySelector('.page-hero');
  const wordmark = topHeader.querySelector('.wordmark');
  let scrollFrame = 0;
  const updateScrollNav = () => {
    scrollFrame = 0;
    const desktop = window.innerWidth > 700;
    const menuOpen = document.body.classList.contains('menu-open');
    topHeader.classList?.toggle('is-mobile-scrolled', !desktop && window.scrollY > 8);
    const mobileLightEdge = lightBoundary?.getBoundingClientRect()[journey ? 'top' : 'bottom'] ?? Infinity;
    const mobileFallback=mobileLightEdge <= (topHeader.getBoundingClientRect().height || 60);
    const mobileLight=!desktop && foregroundOverLight(topHeader,mobileFallback);
    topHeader.classList?.toggle('is-mobile-over-light',mobileLight);
    if(!desktop){
      for(const control of [wordmark,navToggle]){
        control?.classList?.toggle('is-over-light',!menuOpen && foregroundOverLight(control,mobileLight));
      }
    }
    if (scrollNav) {
      const bounds = journey?.getBoundingClientRect();
      const journeyProgress = bounds ? Math.max(0, Math.min(1, -bounds.top / Math.max(1, bounds.height - (sceneStage?.getBoundingClientRect().height || window.innerHeight)))) : 0;
      const afterScene = bounds ? journeyProgress >= .8 : topHeader.getBoundingClientRect().bottom <= 0;
      const reducedScene = document.documentElement.classList.contains('sky-fallback') || window.matchMedia('(prefers-reduced-motion: reduce)').matches;
      const show = desktop && !menuOpen && (reducedScene ? (lightBoundary?.getBoundingClientRect().top ?? Infinity) <= window.innerHeight : afterScene);
      topHeader.inert = show;
      if (!show && scrollNav.contains(document.activeElement)) {
        topHeader.querySelector('.nav a[aria-current="page"]')?.focus({preventScroll:true});
      }
      scrollNav.classList.toggle('is-visible', show);
      scrollNav.setAttribute('aria-hidden', String(!show));
      scrollNav.inert = !show;
      if (lightBoundary) scrollNav.classList.toggle('is-over-light', foregroundOverLight(scrollNav,lightBoundary.getBoundingClientRect().top <= 145));
    }
    if (headerNav) {
      const glass = desktop && window.scrollY > 8;
      headerNav.classList.toggle('is-glass', glass);
      headerNav.classList.toggle('is-over-light', glass && foregroundOverLight(headerNav,(lightBoundary?.getBoundingClientRect().bottom ?? Infinity) <= 175));
      if (wordmark && !menuOpen) wordmark.inert = desktop && topHeader.getBoundingClientRect().bottom <= 0;
    }
  };
  refreshScrollNav = updateScrollNav;
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
    bar.classList.add('is-switching');
    placeHighlight(link);
    clearTimeout(routeTimer);
    routeTimer = setTimeout(() => { window.location.assign(link.href); }, 280);
  });
}
