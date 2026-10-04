import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync,existsSync} from 'node:fs';
import {join} from 'node:path';
import {createHash} from 'node:crypto';

const pages=['dist/index.html','dist/explore/index.html','dist/builds/index.html','dist/about/index.html','dist/scene-test/index.html','dist/components/index.html'];

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

test('every local stylesheet has a version matching its published content',()=>{
  for(const file of pages){
    const html=readFileSync(file,'utf8');
    const links=[...html.matchAll(/<link rel="stylesheet" href="(\/[^"]+)"/g)];
    assert.ok(links.length>0,`${file}: no local stylesheets`);
    for(const [,href] of links){
      const url=new URL(href,'https://azivor.github.io');
      const bytes=readFileSync(join('dist',url.pathname));
      const version=createHash('sha256').update(bytes).digest('hex').slice(0,12);
      assert.equal(url.searchParams.get('v'),version,`${file}: ${href}`);
    }
  }
});
