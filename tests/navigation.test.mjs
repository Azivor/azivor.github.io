import test from 'node:test';import assert from 'node:assert/strict';import vm from 'node:vm';import {readFileSync} from 'node:fs';
test('navigation follows deep links, scrolling, and history changes',()=>{
 const events={};const tops={top:0,possibilities:600,about:1200};
 const links=Object.keys(tops).map(id=>({hash:'#'+id,attributes:{},classList:{toggle(){}},setAttribute(k,v){this.attributes[k]=v;},removeAttribute(k){delete this.attributes[k];}}));
 const location={hash:'#about'};const context={document:{querySelectorAll:()=>links,getElementById:id=>({getBoundingClientRect:()=>({top:tops[id]})})},window:{innerHeight:800,addEventListener:(name,fn)=>events[name]=fn},location,requestAnimationFrame:fn=>fn()};
 vm.runInNewContext(readFileSync('src/navigation.js','utf8'),context);
 const current=()=>links.filter(l=>l.attributes['aria-current']).map(l=>l.hash);
 assert.deepEqual(current(),['#about']);tops.possibilities=100;events.scroll();assert.deepEqual(current(),['#possibilities']);tops.about=180;events.scroll();assert.deepEqual(current(),['#about']);location.hash='#top';events.hashchange();assert.deepEqual(current(),['#top']);
});

test('mobile menu opens, closes on navigation, and supports Escape',()=>{
 const callbacks={};const documentEvents={};let menuOpen=false;let focused=false;
 const toggle={attributes:{'aria-controls':'site-navigation','aria-expanded':'false'},getAttribute(k){return this.attributes[k];},setAttribute(k,v){this.attributes[k]=v;},addEventListener(k,fn){callbacks['toggle-'+k]=fn;},contains(){return false;},focus(){focused=true;}};
 const menu={classList:{toggle(_name,value){menuOpen=value;},remove(){menuOpen=false;}},addEventListener(k,fn){callbacks['menu-'+k]=fn;},contains(){return false;}};
 const links=['top','possibilities','about'].map(id=>({hash:'#'+id,classList:{toggle(){}},setAttribute(){},removeAttribute(){}}));
 const document={querySelectorAll:()=>links,querySelector:()=>toggle,getElementById:id=>id==='site-navigation'?menu:{getBoundingClientRect:()=>({top:1000})},addEventListener:(k,fn)=>documentEvents[k]=fn};
 const window={innerHeight:800,innerWidth:390,addEventListener(){}};
 vm.runInNewContext(readFileSync('src/navigation.js','utf8'),{document,window,location:{hash:''},requestAnimationFrame:fn=>fn()});
 callbacks['toggle-click']();assert.equal(menuOpen,true);assert.equal(toggle.getAttribute('aria-expanded'),'true');
 callbacks['menu-click']({target:{closest:()=>true}});assert.equal(menuOpen,false);
 callbacks['toggle-click']();documentEvents.keydown({key:'Escape'});assert.equal(menuOpen,false);assert.equal(focused,true);
});
