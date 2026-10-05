// Public GA4 measurement ID; this is not a secret.
export const measurementId = 'G-7E6HW5VEPF';

export function analyticsTag() {
  return `<script>
if (location.hostname === 'azivor.github.io') {
  window.dataLayer = window.dataLayer || [];
  function gtag(){window.dataLayer.push(arguments);}
  gtag('js', new Date());
  gtag('config', '${measurementId}');
  const tag = document.createElement('script');
  tag.async = true;
  tag.src = 'https://www.googletagmanager.com/gtag/js?id=${measurementId}';
  document.head.appendChild(tag);
}
</script>`;
}
