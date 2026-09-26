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
