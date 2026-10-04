(() => {
  const timeline = document.querySelector('.creation-timeline');
  if (!timeline || !('IntersectionObserver' in window)) return;
  const chapters = [...timeline.querySelectorAll('[data-creation-chapter]')];
  const images = [...timeline.querySelectorAll('.creation-stage-image')];
  const markers = [...timeline.querySelectorAll('.creation-progress span')];
  const desktop = window.matchMedia('(min-width: 901px)');
  const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
  let observer;
  const ratios = new Map();
  function activate(index) {
    timeline.style.setProperty('--chapter-bg', chapters[index].dataset.chapterColor);
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
