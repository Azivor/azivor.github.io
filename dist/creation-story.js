(() => {
  const timeline = document.querySelector('.creation-timeline');
  if (!timeline || !('IntersectionObserver' in window)) return;
  const chapters = [...timeline.querySelectorAll('[data-creation-chapter]')];
  const images = [...timeline.querySelectorAll('.creation-stage-image')];
  const markers = [...timeline.querySelectorAll('.creation-progress span')];
  const desktop = window.matchMedia('(min-width: 901px)');
  const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
  // Only editorial statements reveal; captions, source labels and controls stay still.
  const statements = [...document.querySelectorAll('.creation-story h2, .creation-story h3, .creation-chapter-description, .creation-access-heading > p, .creation-proof-note, .creation-invitation > p,  .creation-turn, .creation-ai-thesis, .creation-ai-description')];
  const landingTitle = document.querySelector('.creation-timeline-heading--scene h2');
  const stage = document.querySelector('.journey-stage');
  const revealed = new WeakSet();
  let textObserver;
  let resetObserver;
  const animationBound = new WeakSet();
  function resetText(element) {
    if (!element || reducedMotion.matches) return;
    revealed.delete(element);
    element.classList.remove('is-text-revealing');
    element.classList.add('is-text-pending');
  }
  function revealText(element) {
    if (!element || revealed.has(element) || reducedMotion.matches) return;
    revealed.add(element);
    element.classList.remove('is-text-pending');
    element.classList.add('is-text-revealing');
    if (!animationBound.has(element)) {
      animationBound.add(element);
      element.addEventListener('animationend', () => element.classList.remove('is-text-revealing'));
    }
  }
  function revealLandingTitle() {
    if (stage?.classList.contains('scene-reveal') || document.documentElement.classList.contains('sky-fallback')) revealText(landingTitle);
    else resetText(landingTitle);
  }
  function configureText() {
    textObserver?.disconnect();
    resetObserver?.disconnect();
    document.querySelectorAll('.is-text-revealing').forEach(element => element.classList.remove('is-text-revealing'));
    if (reducedMotion.matches) {
      document.querySelectorAll('.is-text-pending').forEach(element => element.classList.remove('is-text-pending'));
      return;
    }
    statements.forEach(element => {
      if (!revealed.has(element) && element.getBoundingClientRect().top >= window.innerHeight * .88) element.classList.add('is-text-pending');
    });
    textObserver = new IntersectionObserver(entries => {
      entries.forEach(entry => {
        if (!entry.isIntersecting) return;
        revealText(entry.target);

      });
    }, {rootMargin:'0px 0px -12% 0px', threshold:.2});
    statements.forEach(element => textObserver.observe(element));
    // Rearm only after scrolling upward far enough to put the whole statement
    // below the viewport. A buffer prevents edge jitter or an upward replay.
    resetObserver = new IntersectionObserver(entries => {
      entries.forEach(entry => {
        if (!entry.isIntersecting && entry.boundingClientRect.top >= window.innerHeight) resetText(entry.target);
      });
    }, {rootMargin:'0px 0px 15% 0px', threshold:0});
    statements.forEach(element => resetObserver.observe(element));
    revealLandingTitle();
  }
  if (stage && landingTitle) new MutationObserver(revealLandingTitle).observe(stage, {attributes:true, attributeFilter:['class']});
  reducedMotion.addEventListener('change', configureText);
  let observer;
  const ratios = new Map();
  function activate(index) {
    images.forEach((image,i) => image.classList.toggle('is-active',i === index));
    markers.forEach((marker,i) => marker.classList.toggle('is-active',i === index));
  }
  // Tie color plateaus to the actual chapter bounds, not percentages of the
  // entire story. Text wrapping and viewport changes can resize any chapter.
  function fitAtmosphere() {
    const atmosphere = timeline.querySelector('.creation-atmosphere');
    const payoff = timeline.querySelector('.creation-ai-payoff');
    if (!atmosphere || !payoff || chapters.length !== 3) return;
    const bounds = timeline.getBoundingClientRect();
    const visualStage = timeline.querySelector('.creation-visual-stage');
    const stack = timeline.querySelector('.creation-visual-stack');
    if (visualStage && stack) {
      if (desktop.matches && !reducedMotion.matches) {
        const copy = chapters[2].querySelector('.creation-chapter-copy');
        // End the sticky track with the photograph centered on the final copy.
        const stopBottom = copy.getBoundingClientRect().top - visualStage.getBoundingClientRect().top + (copy.offsetHeight + stack.offsetHeight) / 2;
        visualStage.style.height = `${Math.round(stopBottom)}px`;
      } else visualStage.style.height = '';
    }
    const topOf = element => element.getBoundingClientRect().top - bounds.top;
    const transition = Math.min(window.innerHeight * .16, 180);
    const first = topOf(chapters[1]);
    const second = topOf(chapters[2]);
    const finale = topOf(payoff);
    const end = payoff.getBoundingClientRect().bottom - bounds.top;
    const tail = bounds.height - end;
    const stops = [
      ['#244c80',0], ['#244c80',96], ['#102b40',Math.min(460,first*.4)],
      ['#102b40',first-transition], ['#2a526c',first+transition],
      ['#2a526c',second-transition], ['#78372e',second+transition],
      ['#78372e',finale-transition], ['#2b1e24',finale+transition],
      ['#12171c',finale+payoff.offsetHeight*.4], ['#12171c',end],
      ['#354650',end+tail*.3], ['#6b797b',end+tail*.55],
      ['#ccd1d4',end+tail*.8], ['#ffffff',bounds.height]
    ];
    atmosphere.style.backgroundImage = `linear-gradient(180deg,${stops.map(([color,position]) => `${color} ${Math.max(0,Math.round(position+96))}px`).join(',')})`;
    window.dispatchEvent(new Event('azivor:surface-change'));
  }
  function configure() {
    observer?.disconnect();
    ratios.clear();
    const enabled = desktop.matches && !reducedMotion.matches;
    timeline.classList.toggle('is-scroll-story',enabled);
    fitAtmosphere();
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
  configureText();
  if ('ResizeObserver' in window) new ResizeObserver(fitAtmosphere).observe(timeline);
  document.fonts?.ready.then(fitAtmosphere);
})();

(() => {
  const apps = document.querySelector('.creation-apps');
  if (!apps) return;
  const motion = window.matchMedia('(prefers-reduced-motion: reduce)');
  const desktopOrder = ['codex','grok','cursor','deepseek','midjourney','perplexity','runway','gemini','elevenlabs'];
  const phoneOrder = ['perplexity','deepseek','gemini','elevenlabs','midjourney','cursor','grok','runway','codex'];
  const icons = new Map(desktopOrder.map(slug => [slug,apps.querySelector('.creation-app--'+slug)]));
  let frame, timer, started = false;
  function revealMore() {
    timer = null;
    apps.classList.toggle('has-more',true);
    const order = window.innerWidth <= 700 ? phoneOrder : desktopOrder;
    order.forEach((slug,index) => {
      const icon = icons.get(slug);
      if (!icon) return;
      icon.style.setProperty('--app-delay',motion.matches ? '0ms' : `${index * 80}ms`);
      icon.classList.toggle('is-app-visible',true);
    });
  }
  function reset() {
    clearTimeout(timer);
    timer = null;
    started = false;
    apps.classList.toggle('has-lead',false);
    apps.classList.toggle('has-more',false);
    icons.forEach(icon => {
      icon?.style.setProperty('--app-delay','0ms');
      icon?.classList.toggle('is-app-visible',false);
    });
  }
  function updateApps() {
    frame = null;
    const top = apps.getBoundingClientRect().top;
    apps.classList.toggle('is-scroll-apps', !motion.matches);
    if (motion.matches) {
      clearTimeout(timer);
      started = true;
      apps.classList.toggle('has-lead',true);
      revealMore();
    } else if (top > window.innerHeight * 1.1) {
      reset();
    } else if (!started && top <= window.innerHeight * .82) {
      started = true;
      apps.classList.toggle('has-lead',true);
      // Once in view, the complete outward sequence runs without more scrolling.
      timer = setTimeout(revealMore,350);
    }
  }
  function queue() { if (!frame) frame = requestAnimationFrame(updateApps); }
  window.addEventListener('scroll',queue,{passive:true});
  window.addEventListener('resize',queue,{passive:true});
  motion.addEventListener('change',updateApps);
  updateApps();
})();
