const links = Array.from(document.querySelectorAll('.nav a'));
function updateNavigation() {
  const hash = location.hash || '#top';
  for (const link of links) {
    const active = link.getAttribute('href') === hash;
    link.classList.toggle('selected', active);
    if (active) link.setAttribute('aria-current', 'location');
    else link.removeAttribute('aria-current');
  }
}
window.addEventListener('hashchange', updateNavigation);
updateNavigation();
