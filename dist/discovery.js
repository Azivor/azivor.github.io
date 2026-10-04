// Older case-study fragments continue to reach their new notebook destination.
const legacyProjectSections = new Set(['the-scene','the-decisions','the-limits','try-it']);
if (location.pathname === '/builds/' && legacyProjectSections.has(location.hash.slice(1))) {
  location.replace('/builds/earth-descent/' + location.hash);
}
// Native details work without JavaScript. Deep links also reveal their destination.
function revealTopic(hash, moveFocus = false) {
  let id;
  try { id = decodeURIComponent(hash.slice(1)); } catch { return; }
  const target = document.getElementById(id);
  if (!target) return;
  const topic = target.closest('details');
  if (!topic) return;
  topic.open = true;
  if (moveFocus) topic.querySelector('summary')?.focus({preventScroll:true});
  target.scrollIntoView({block:'start',behavior:'instant'});
}
window.addEventListener('hashchange', () => revealTopic(location.hash, true));
document.addEventListener('click', event => {
  const link = event.target.closest('a[href]');
  if (!link || event.button !== 0 || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;
  const url = new URL(link.href);
  if (url.origin === location.origin && url.pathname === location.pathname && url.hash) {
    // Also reopen a topic when its hash is already the current address.
    revealTopic(url.hash, true);
  }
});
revealTopic(location.hash);
