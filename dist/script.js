const links = Array.from(document.querySelectorAll('.nav a'));
const destinations = links.map(link => ({link, target: document.getElementById(link.hash.slice(1))})).filter(item => item.target);
function selectLink(hash) {
  for (const link of links) {
    const active = link.hash === hash;
    link.classList.toggle('selected', active);
    if (active) link.setAttribute('aria-current', 'location');
    else link.removeAttribute('aria-current');
  }
}
function trackSection() {
  const readingLine = Math.min(window.innerHeight * .35, 240);
  let current = destinations[0];
  for (const destination of destinations) {
    if (destination.target.getBoundingClientRect().top <= readingLine) current = destination;
  }
  if (current) selectLink(current.link.hash);
}
let scheduled = false;
function scheduleUpdate() {
  if (scheduled) return;
  scheduled = true;
  requestAnimationFrame(() => { scheduled = false; trackSection(); });
}
window.addEventListener('scroll', scheduleUpdate, {passive:true});
window.addEventListener('resize', scheduleUpdate);
window.addEventListener('hashchange', () => selectLink(location.hash || '#top'));
window.addEventListener('load', scheduleUpdate);
selectLink(location.hash || '#top');

const navToggle = document.querySelector?.('.nav-toggle');
if (navToggle) {
  const menu = document.getElementById(navToggle.getAttribute('aria-controls'));
  const closeMenu = () => {
    navToggle.setAttribute('aria-expanded', 'false');
    menu?.classList.remove('nav-open');
  };
  navToggle.addEventListener('click', () => {
    const open = navToggle.getAttribute('aria-expanded') !== 'true';
    navToggle.setAttribute('aria-expanded', String(open));
    menu?.classList.toggle('nav-open', open);
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
  document.addEventListener('click', event => {
    if (!navToggle.contains(event.target) && !menu?.contains(event.target)) closeMenu();
  });
  window.addEventListener('resize', () => {
    if (window.innerWidth > 700) closeMenu();
  });
}
