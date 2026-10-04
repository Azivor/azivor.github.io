(() => {
// Native HTML keeps a readable headline without JavaScript or motion.
const roles = [...document.querySelectorAll('.hero-role')];
const toggle = document.querySelector('.role-toggle');
const hero = document.querySelector('.hero-content');
const action = document.querySelector('.descent-link');
const reducedMotion = matchMedia('(prefers-reduced-motion: reduce)');
let current = 0;
let paused = false;
let inViewport = true;
let covered = false;
let timer;
function syncArticle() {
  hero?.classList.toggle('uses-an', roles[current]?.textContent === 'animator.');
}
function schedule() {
  clearTimeout(timer);
  if (roles.length < 2 || reducedMotion.matches || paused || !inViewport || covered || document.hidden) return;
  timer = setTimeout(() => {
    roles.forEach(role => role.classList.remove('is-leaving'));
    roles[current].classList.replace('is-current', 'is-leaving');
    current = (current + 1) % roles.length;
    roles[current].classList.add('is-current');
    syncArticle();
    schedule();
  }, 3400);
}
function syncMotion() {
  if (reducedMotion.matches) {
    current = 0;
    roles.forEach((role, index) => {
      role.classList.remove('is-leaving');
      role.classList.toggle('is-current', index === 0);
    });
    syncArticle();
  }
  if (toggle) toggle.hidden = reducedMotion.matches || roles.length < 2;
  schedule();
}
if (toggle && roles.length > 1) {
  toggle.addEventListener('click', () => {
    paused = !paused;
    toggle.classList.toggle('is-paused', paused);
    toggle.setAttribute('aria-label', paused ? 'Resume role rotation' : 'Pause role rotation');
    toggle.title = paused ? 'Resume role rotation' : 'Pause role rotation';
    schedule();
  });
}
if (hero && 'IntersectionObserver' in window) {
  new IntersectionObserver(([entry]) => {
    if (inViewport !== entry.isIntersecting) {
      inViewport = entry.isIntersecting;
      schedule();
    }
  }, {threshold: 0}).observe(hero);
}
// The Earth scene clips the fixed hero and removes covered controls from Tab order.
if (hero && 'MutationObserver' in window) {
  new MutationObserver(() => {
    const nextCovered = hero.inert;
    if (toggle) {
      const hiddenControl = nextCovered || Boolean(action?.inert);
      if (toggle.inert !== hiddenControl) toggle.inert = hiddenControl;
    }
    if (covered !== nextCovered) {
      covered = nextCovered;
      schedule();
    }
  }).observe(hero, {attributes: true, subtree: true, attributeFilter: ['inert']});
}
reducedMotion.addEventListener('change', syncMotion);
document.addEventListener('visibilitychange', schedule);
syncMotion();
})();
