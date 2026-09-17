import test from 'node:test';import assert from 'node:assert/strict';import vm from 'node:vm';import {readFileSync} from 'node:fs';
test('navigation follows deep links, scrolling, and history changes',()=>{
 const events={};const tops={top:0,possibilities:600,about:1200};
 const links=Object.keys(tops).map(id=>({hash:'#'+id,attributes:{},classList:{toggle(){}},setAttribute(k,v){this.attributes[k]=v;},removeAttribute(k){delete this.attributes[k];}}));
 const location={hash:'#about'};const context={document:{querySelectorAll:()=>links,getElementById:id=>({getBoundingClientRect:()=>({top:tops[id]})})},window:{innerHeight:800,addEventListener:(name,fn)=>events[name]=fn},location,requestAnimationFrame:fn=>fn()};
 vm.runInNewContext(readFileSync('src/navigation.js','utf8'),context);
 const current=()=>links.filter(l=>l.attributes['aria-current']).map(l=>l.hash);
 assert.deepEqual(current(),['#about']);tops.possibilities=100;events.scroll();assert.deepEqual(current(),['#possibilities']);tops.about=180;events.scroll();assert.deepEqual(current(),['#about']);location.hash='#top';events.hashchange();assert.deepEqual(current(),['#top']);
});
