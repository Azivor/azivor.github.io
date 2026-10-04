import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync,existsSync} from 'node:fs';
import {join} from 'node:path';
import {createHash} from 'node:crypto';

const pages=['dist/index.html','dist/explore/index.html','dist/builds/index.html','dist/builds/earth-descent/index.html','dist/about/index.html','dist/scene-test/index.html','dist/components/index.html'];

test('generated pages reference existing local assets and routes',()=>{
  for(const file of pages){
    const html=readFileSync(file,'utf8');
    for(const [,href] of html.matchAll(/(?:href|src)="(\/[^"#]*)[^" ]*"/g)){
      const path=join('dist',new URL(href,'https://azivor.github.io').pathname);
      assert.ok(existsSync(path)||existsSync(join(path,'index.html')),`${file}: ${href}`);
    }
    assert.doesNotMatch(html,/refinements\.css|href="\/style\.css"/);
  }
});

test('every local style and script has a version matching its published content',()=>{
  for(const file of pages){
    const html=readFileSync(file,'utf8');
    const links=[...html.matchAll(/(?:href|src)="(\/[^"?]+\.(?:css|js)(?:\?[^"]+)?)"/g)];
    assert.ok(links.length>0,`${file}: no local styles or scripts`);
    for(const [,href] of links){
      const url=new URL(href,'https://azivor.github.io');
      const bytes=readFileSync(join('dist',url.pathname));
      const version=createHash('sha256').update(bytes).digest('hex').slice(0,12);
      assert.equal(url.searchParams.get('v'),version,`${file}: ${href}`);
    }
  }
});

// Visitors can follow every published local fragment into an actual destination.
test('local fragment links have unique and reachable destinations',()=>{
 const idsByPage=new Map();
 for(const file of pages){
  const html=readFileSync(file,'utf8');
  const ids=[...html.matchAll(/\bid="([^"]+)"/g)].map(x=>x[1]);
  assert.equal(ids.length,new Set(ids).size,`${file}: duplicate destination`);
  idsByPage.set(file,new Set(ids));
 }
 for(const file of pages){
  const html=readFileSync(file,'utf8');
  const path=file.slice(4).replace(/index\.html$/,'');
  for(const [,href] of html.matchAll(/href="([^" ]*#[^" ]+)"/g)){
   const url=new URL(href,`https://azivor.github.io${path}`);
   if(url.origin!=='https://azivor.github.io')continue;
   const target=`dist${url.pathname.endsWith('/')?url.pathname+'index.html':url.pathname}`;
   assert.ok(idsByPage.get(target)?.has(decodeURIComponent(url.hash.slice(1))),`${file}: ${href}`);
  }
 }
});
