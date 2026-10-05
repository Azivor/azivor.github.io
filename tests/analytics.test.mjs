import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {runInNewContext} from 'node:vm';
import {analyticsTag, measurementId} from '../src/analytics.mjs';

test('analytics sends one configuration only on the production hostname', () => {
  const source = analyticsTag().replace(/^<script>\n|\n<\/script>$/g, '');
  for (const hostname of ['azivor.github.io', 'localhost', '127.0.0.1', 'preview.example.com']) {
    const scripts = [];
    const context = {location: {hostname}, window: {}, document: {
      createElement: () => ({}), head: {appendChild: tag => scripts.push(tag)}
    }};
    runInNewContext(source, context);
    if (hostname === 'azivor.github.io') {
      assert.equal(scripts.length, 1);
      assert.equal(scripts[0].async, true);
      assert.equal(scripts[0].src, `https://www.googletagmanager.com/gtag/js?id=${measurementId}`);
      assert.equal(context.window.dataLayer.filter(event => event[0] === 'config').length, 1);
      assert.equal(context.window.dataLayer[1][1], measurementId);
    } else {
      assert.equal(scripts.length, 0);
      assert.equal(context.window.dataLayer, undefined);
    }
  }
});

test('public routes have one tag and developer references have none', () => {
  for (const route of ['', 'explore', 'builds', 'builds/earth-descent', 'about', 'scene-test', 'components']) {
    const html = readFileSync(`dist/${route ? route + '/' : ''}index.html`, 'utf8');
    const internal = ['scene-test', 'components'].includes(route);
    assert.equal((html.match(/googletagmanager\.com\/gtag\/js/g) || []).length, internal ? 0 : 1, route);
  }
});
