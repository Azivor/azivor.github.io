import test from 'node:test';
import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';
const read = name => readFile(new URL('../src/' + name, import.meta.url), 'utf8');
function endpoints(svg) {
  const gradient = svg.match(/<linearGradient[^>]*>[\s\S]*?<\/linearGradient>/)[0];
  const colors = [...gradient.matchAll(/stop-color="(#[\da-f]+)"/g)].map(match => match[1]);
  return [colors[0], colors.at(-1)];
}
test('interior hero and footer gradients share their actual adjacent surface colors', async () => {
  const [styles, upper, cloud, footer] = await Promise.all([
    read('styles/discovery.css'), read('assets/hero-blue-fade.svg'),
    read('assets/information-fade.svg'), read('assets/editorial-footer-fade.svg')
  ]);
  const ground = styles.match(/--discovery-ground:(#[\da-f]+)/)[1];
  assert.equal(endpoints(upper)[1], endpoints(cloud)[0]);
  assert.equal(endpoints(cloud)[1], ground);
  assert.equal(endpoints(footer)[0], ground);
  assert.match(styles, /\.discovery-page footer\{background-image:url\('\/editorial-footer-fade.svg'\)/);
});
test('Home keeps its own white footer seam and all footer variants share the cloud endpoint', async () => {
  const [styles, tokens, home, editorial] = await Promise.all([
    read('styles/content.css'), read('styles/tokens.css'),
    read('assets/footer-fade.svg'), read('assets/editorial-footer-fade.svg')
  ]);
  const homeGround = styles.match(/\.content-flow,\.editorial-main\{background:linear-gradient\([^;]+/)[0];
  assert.match(homeGround, /#fff 100%/);
  assert.equal(endpoints(home)[0], '#ffffff');
  const footerGround = tokens.match(/--footer-background:(#[\da-f]+)/)[1];
  assert.equal(endpoints(home)[1], footerGround);
  assert.equal(endpoints(editorial)[1], footerGround);
});
