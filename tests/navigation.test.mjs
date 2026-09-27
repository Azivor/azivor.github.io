import test from 'node:test';import assert from 'node:assert/strict';import vm from 'node:vm';import {readFileSync} from 'node:fs';
test('navigation marks only the current page',()=>{
 const routes=['/','/explore/','/builds/','/about/'];
 const links=routes.map(href=>({href,attributes:{},classList:{toggle(){}},getAttribute(){return href;},setAttribute(k,v){this.attributes[k]=v;},removeAttribute(k){delete this.attributes[k];}}));
 const context={document:{querySelectorAll:()=>links,querySelector:()=>null},window:{addEventListener(){}},location:{pathname:'/builds/'}};
 vm.runInNewContext(readFileSync('src/navigation.js','utf8'),context);
 assert.deepEqual(links.filter(l=>l.attributes['aria-current']).map(l=>l.href),['/builds/']);
 assert.equal(links[2].attributes['aria-current'],'page');
});

test('full-screen mobile menu opens, closes on navigation, and supports Escape',()=>{
 const callbacks={};const documentEvents={};let menuOpen=false;let focused=false;let bodyLocked=false;let firstLinkFocused=false;
 const toggle={attributes:{'aria-controls':'site-navigation','aria-expanded':'false'},getAttribute(k){return this.attributes[k];},setAttribute(k,v){this.attributes[k]=v;},addEventListener(k,fn){callbacks['toggle-'+k]=fn;},contains(){return false;},focus(){focused=true;}};
 const menu={classList:{toggle(_name,value){menuOpen=value;},remove(){menuOpen=false;}},addEventListener(k,fn){callbacks['menu-'+k]=fn;},contains(){return false;},querySelector:()=>({focus(){firstLinkFocused=true;}})};
 const links=['/','/explore/','/builds/','/about/'].map(href=>({href,classList:{toggle(){}},getAttribute(){return href;},setAttribute(){},removeAttribute(){}}));
 const document={querySelectorAll:()=>links,querySelector:selector=>selector==='.nav-toggle'?toggle:null,getElementById:id=>id==='site-navigation'?menu:{getBoundingClientRect:()=>({top:1000})},addEventListener:(k,fn)=>documentEvents[k]=fn,body:{classList:{toggle(_name,value){bodyLocked=value;},remove(){bodyLocked=false;}}}};
 const window={innerHeight:800,innerWidth:390,addEventListener(){}};
 vm.runInNewContext(readFileSync('src/navigation.js','utf8'),{document,window,location:{pathname:'/'} });
 callbacks['toggle-click']();assert.equal(menuOpen,true);assert.equal(bodyLocked,true);assert.equal(firstLinkFocused,true);assert.equal(toggle.getAttribute('aria-expanded'),'true');assert.equal(toggle.getAttribute('aria-label'),'Close navigation menu');
 callbacks['menu-click']({target:{closest:()=>true}});assert.equal(menuOpen,false);assert.equal(bodyLocked,false);
 callbacks['toggle-click']();documentEvents.keydown({key:'Escape'});assert.equal(menuOpen,false);assert.equal(focused,true);assert.equal(toggle.getAttribute('aria-label'),'Open navigation menu');
});

test('Home glass navigation waits for the Earth reveal and never appears on mobile',()=>{
 const events={};let sceneTop=0;let sectionTop=500;
 const classes=new Set();
 const pill={attributes:{'aria-hidden':'true'},inert:true,contains:()=>false,classList:{toggle(name,on){if(on)classes.add(name);else classes.delete(name)}},setAttribute(name,value){this.attributes[name]=value}};
 const header={getBoundingClientRect:()=>({bottom:-20}),querySelector:()=>null};
 const journey={getBoundingClientRect:()=>({top:sceneTop,height:2400})};
 const content={classList:{contains:name=>name==='content-flow'},getBoundingClientRect:()=>({top:sectionTop})};
 const document={querySelectorAll:()=>[],querySelector:selector=>({'.floating-nav':pill,'.header':header,'.journey':journey,'.content-flow':content}[selector]??null),documentElement:{classList:{toggle(){},contains:()=>false}},body:{classList:{contains:()=>false}},addEventListener(){}};
 const window={innerWidth:1200,innerHeight:800,matchMedia:()=>({matches:false}),addEventListener:(name,fn)=>events[name]=fn};
 vm.runInNewContext(readFileSync('src/navigation.js','utf8'),{document,window,location:{pathname:'/'},requestAnimationFrame:fn=>{fn();return 0}});
 assert.equal(pill.inert,true);assert.equal(pill.attributes['aria-hidden'],'true');assert.equal(header.inert,false);
 sceneTop=-1120;events.scroll();assert.equal(pill.inert,true);
 sceneTop=-1280;events.scroll();assert.equal(pill.inert,false);assert.equal(pill.attributes['aria-hidden'],'false');assert.equal(classes.has('is-visible'),true);assert.equal(header.inert,true);
 sectionTop=100;events.scroll();assert.equal(classes.has('is-over-light'),true);
 window.innerWidth=390;events.resize();assert.equal(pill.inert,true);assert.equal(classes.has('is-visible'),false);assert.equal(header.inert,false);
});

test('inner pages add glass to the original links after scrolling',()=>{
 const events={};let heroBottom=600;const classes=new Set();let wordmarkInert=false;
 const nav={classList:{toggle(name,on){if(on)classes.add(name);else classes.delete(name)}}};
 const wordmark={set inert(value){wordmarkInert=value}};
 const header={querySelector:()=>wordmark,getBoundingClientRect:()=>({bottom:window.scrollY? -10:70})};
 const hero={getBoundingClientRect:()=>({bottom:heroBottom})};
 const document={querySelectorAll:()=>[],querySelector:selector=>({'.header':header,'.inner-page .header .nav':nav,'.page-hero':hero}[selector]??null),documentElement:{classList:{toggle(){}}},body:{classList:{contains:()=>false}},addEventListener(){}};
 const window={innerWidth:1200,scrollY:0,addEventListener:(name,fn)=>events[name]=fn};
 vm.runInNewContext(readFileSync('src/navigation.js','utf8'),{document,window,location:{pathname:'/explore/'},requestAnimationFrame:fn=>{fn();return 0}});
 assert.equal(classes.has('is-glass'),false);
 window.scrollY=30;events.scroll();assert.equal(classes.has('is-glass'),true);assert.equal(wordmarkInert,true);
 heroBottom=100;events.scroll();assert.equal(classes.has('is-over-light'),true);
 window.innerWidth=390;events.resize();assert.equal(classes.has('is-glass'),false);assert.equal(wordmarkInert,false);
});
