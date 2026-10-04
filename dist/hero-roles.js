(() => {
// Native HTML keeps a readable headline without JavaScript or motion.
const roles = [...document.querySelectorAll('.hero-role')];
const hero = document.querySelector('.hero-content');
const reducedMotion = matchMedia('(prefers-reduced-motion: reduce)');
let current = 0;
let inViewport = true;
let covered = false;
let timer;
function syncArticle() {
  hero?.classList.toggle('uses-an', roles[current]?.textContent === 'animator');
}
function schedule() {
  clearTimeout(timer);
  if (roles.length < 2 || reducedMotion.matches || !inViewport || covered || document.hidden) return;
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
  schedule();
}
if (hero && 'IntersectionObserver' in window) {
  new IntersectionObserver(([entry]) => {
    if (inViewport !== entry.isIntersecting) {
      inViewport = entry.isIntersecting;
      schedule();
    }
  }, {threshold: 0}).observe(hero);
}
// Suspend rotation while the Earth scene covers the fixed headline.
if (hero && 'MutationObserver' in window) {
  new MutationObserver(() => {
    const nextCovered = hero.inert;
    if (covered !== nextCovered) {
      covered = nextCovered;
      schedule();
    }
  }).observe(hero, {attributes: true, attributeFilter: ['inert']});
}
reducedMotion.addEventListener('change', syncMotion);
document.addEventListener('visibilitychange', schedule);
syncMotion();
})();
