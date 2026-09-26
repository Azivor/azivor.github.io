const links = Array.from(document.querySelectorAll('.nav a'));
const destinations = links.map(link => ({link, target: document.getElementById(link.hash.slice(1))})).filter(item => item.target);
const heroScene = document.querySelector?.('.hero-scene');
const descent = document.querySelector?.('.descent');
const descentClouds = document.querySelector?.('.descent-clouds');
const flightPath = document.querySelector?.('.flight-path');
const reducedMotion = window.matchMedia?.('(prefers-reduced-motion: reduce)') ?? {matches:false};
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
function moveAtmosphere() {
  if (!heroScene || !descent || !descentClouds || !flightPath) return;
  if (reducedMotion.matches) {
    heroScene.style.removeProperty('--hero-shift');
    descentClouds.style.removeProperty('--cloud-x');
    descentClouds.style.removeProperty('--cloud-y');
    flightPath.style.removeProperty('--flight-x');
    flightPath.style.removeProperty('--flight-y');
    return;
  }
  const viewport = window.innerHeight;
  const heroProgress = Math.min(1, Math.max(0, window.scrollY / viewport));
  heroScene.style.setProperty('--hero-shift', `${Math.round(heroProgress * 26)}px`);
  const bounds = descent.getBoundingClientRect();
  if (bounds.top > viewport || bounds.bottom < 0) return;
  const progress = Math.min(1, Math.max(0, (viewport - bounds.top) / (viewport + bounds.height)));
  descentClouds.style.setProperty('--cloud-x', `${Math.round((progress - .5) * 18)}px`);
  descentClouds.style.setProperty('--cloud-y', `${Math.round((progress - .5) * 55)}px`);
  flightPath.style.setProperty('--flight-x', `${Math.round(progress * 22)}px`);
  flightPath.style.setProperty('--flight-y', `${Math.round(progress * 38)}px`);
}
let scheduled = false;
function scheduleUpdate() {
  if (scheduled) return;
  scheduled = true;
  requestAnimationFrame(() => { scheduled = false; trackSection(); moveAtmosphere(); });
}
window.addEventListener('scroll', scheduleUpdate, {passive:true});
window.addEventListener('resize', scheduleUpdate);
window.addEventListener('hashchange', () => { selectLink(location.hash || '#top'); });
window.addEventListener('load', scheduleUpdate);
reducedMotion.addEventListener?.('change', scheduleUpdate);
selectLink(location.hash || '#top');
