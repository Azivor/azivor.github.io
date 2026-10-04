(() => {
  const timeline = document.querySelector('.creation-timeline');
  if (!timeline || !('IntersectionObserver' in window)) return;
  const chapters = [...timeline.querySelectorAll('[data-creation-chapter]')];
  const images = [...timeline.querySelectorAll('.creation-stage-image')];
  const markers = [...timeline.querySelectorAll('.creation-progress span')];
  const desktop = window.matchMedia('(min-width: 901px)');
  const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
  // Only editorial statements reveal; captions, source labels and controls stay still.
  const statements = [...document.querySelectorAll('.creation-story h2, .creation-story h3, .creation-chapter-description, .creation-access-heading > p, .creation-proof-note, .creation-invitation > p, .creation-survey-number strong')];
  const landingTitle = document.querySelector('.creation-timeline-heading--scene h2');
  const stage = document.querySelector('.journey-stage');
  const revealed = new WeakSet();
  let textObserver;
  function revealText(element) {
    if (!element || revealed.has(element) || reducedMotion.matches) return;
    revealed.add(element);
    element.classList.add('is-text-revealing');
    element.addEventListener('animationend', () => element.classList.remove('is-text-revealing'), {once:true});
  }
  function revealLandingTitle() {
    if (stage?.classList.contains('scene-reveal') || document.documentElement.classList.contains('sky-fallback')) revealText(landingTitle);
  }
  function configureText() {
    textObserver?.disconnect();
    document.querySelectorAll('.is-text-revealing').forEach(element => element.classList.remove('is-text-revealing'));
    if (reducedMotion.matches) return;
    textObserver = new IntersectionObserver(entries => {
      entries.forEach(entry => {
        if (!entry.isIntersecting) return;
        revealText(entry.target);
        textObserver.unobserve(entry.target);
      });
    }, {rootMargin:'0px 0px -8% 0px', threshold:.15});
    statements.forEach(element => { if (!revealed.has(element)) textObserver.observe(element); });
    revealLandingTitle();
  }
  if (stage && landingTitle) new MutationObserver(revealLandingTitle).observe(stage, {attributes:true, attributeFilter:['class']});
  reducedMotion.addEventListener('change', configureText);
  configureText();
  let observer;
  const ratios = new Map();
  function activate(index) {
    images.forEach((image,i) => image.classList.toggle('is-active',i === index));
    markers.forEach((marker,i) => marker.classList.toggle('is-active',i === index));
  }
  function configure() {
    observer?.disconnect();
    ratios.clear();
    const enabled = desktop.matches && !reducedMotion.matches;
    timeline.classList.toggle('is-scroll-story',enabled);
    if (!enabled) return;
    observer = new IntersectionObserver(entries => {
      entries.forEach(entry => ratios.set(entry.target,entry.intersectionRatio));
      let active = null;
      let largest = 0;
      chapters.forEach((chapter,index) => {
        const ratio = ratios.get(chapter) || 0;
        if (ratio > largest) {largest = ratio;active = index;}
      });
      if (active !== null) activate(active);
    }, {rootMargin:`-${Math.round(window.innerHeight * .25)}px 0px -${Math.round(window.innerHeight * .25)}px 0px`,threshold:[0,.1,.25,.5,.75,1]});
    chapters.forEach(chapter => observer.observe(chapter));
  }
  desktop.addEventListener('change',configure);
  reducedMotion.addEventListener('change',configure);
  let resizeFrame;
  window.addEventListener('resize',() => {
    cancelAnimationFrame(resizeFrame);
    resizeFrame = requestAnimationFrame(configure);
  },{passive:true});
  configure();
})();
