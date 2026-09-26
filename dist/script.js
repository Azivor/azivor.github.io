const links = Array.from(document.querySelectorAll('.nav a'));
const currentPath = location.pathname.replace(/index\.html$/, '') || '/';
for (const link of links) {
  const active = link.getAttribute('href') === currentPath;
  link.classList.toggle('selected', active);
  if (active) link.setAttribute('aria-current', 'page');
  else link.removeAttribute('aria-current');
}

const navToggle = document.querySelector?.('.nav-toggle');
if (navToggle) {
  const menu = document.getElementById(navToggle.getAttribute('aria-controls'));
  const closeMenu = () => {
    navToggle.setAttribute('aria-expanded', 'false');
    navToggle.setAttribute('aria-label', 'Open navigation menu');
    menu?.classList.remove('nav-open');
    document.body.classList.remove('menu-open');
  };
  navToggle.addEventListener('click', () => {
    const open = navToggle.getAttribute('aria-expanded') !== 'true';
    navToggle.setAttribute('aria-expanded', String(open));
    navToggle.setAttribute('aria-label', open ? 'Close navigation menu' : 'Open navigation menu');
    menu?.classList.toggle('nav-open', open);
    document.body.classList.toggle('menu-open', open);
    if (open) menu?.querySelector('a')?.focus();
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
  window.addEventListener('resize', () => {
    if (window.innerWidth > 700) closeMenu();
  });
}
