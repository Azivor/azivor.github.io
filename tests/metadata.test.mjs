import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync,existsSync} from 'node:fs';

const routes=['','explore','builds','about','scene-test','components'];
test('every route has intentional social metadata and its own canonical URL',()=>{
 const titles=new Set();
 for(const route of routes){
  const html=readFileSync(`dist/${route?route+'/':''}index.html`,'utf8');
  const url=`https://azivor.github.io/${route?route+'/':''}`;
  assert.ok(html.includes(`<link rel="canonical" href="${url}">`));
  assert.ok(html.includes(`<meta property="og:url" content="${url}">`));
  for(const name of ['og:title','og:description','og:image','og:image:alt'])assert.match(html,new RegExp(`<meta property="${name}" content="[^"]+">`));
  assert.ok(html.includes('<meta name="twitter:card" content="summary_large_image">'));
  assert.ok(html.includes('https://azivor.github.io/social-preview.jpg'));
  const title=html.match(/<meta property="og:title" content="([^"]+)"/)[1];
  assert.ok(!titles.has(title),`duplicate title on ${route}`);titles.add(title);
 }
 assert.ok(existsSync('dist/social-preview.jpg'));
});
test('developer references are excluded from indexing and clearly distinguished from learner pages',()=>{
 for(const route of routes){
  const html=readFileSync(`dist/${route?route+'/':''}index.html`,'utf8');
  const internal=['scene-test','components'].includes(route);
  assert.equal(html.includes('<meta name="robots" content="noindex, follow">'),internal);
  if(!internal)assert.doesNotMatch(html,/href="\/components\/"/);
 }
 const study=readFileSync('dist/scene-test/index.html','utf8');
 assert.match(study,/Developer visual reference/);assert.match(study,/Return to the Earth descent case study/);
 const catalog=readFileSync('dist/components/index.html','utf8');
 assert.match(catalog,/Developer reference/);assert.match(catalog,/Demo fields do not submit or save data/);
});
