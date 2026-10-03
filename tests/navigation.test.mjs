import test from 'node:test';import assert from 'node:assert/strict';import vm from 'node:vm';import {readFileSync} from 'node:fs';
test('navigation marks only the current page',()=>{
 const routes=['/','/explore/','/builds/','/about/'];
 const links=routes.map(href=>({href,attributes:{},classList:{toggle(){}},getAttribute(){return href;},setAttribute(k,v){this.attributes[k]=v;},removeAttribute(k){delete this.attributes[k];}}));
 const context={document:{querySelectorAll:()=>links,querySelector:()=>null},window:{addEventListener(){}},location:{pathname:'/builds/'}};
 vm.runInNewContext(readFileSync('src/navigation.js','utf8'),context);
 assert.deepEqual(links.filter(l=>l.attributes['aria-current']).map(l=>l.href),['/builds/']);
 assert.equal(links[2].attributes['aria-current'],'page');
});

function mobileMenuHarness({home = false} = {}) {
 const documentEvents = {}; const windowEvents = {}; const frames = [];
 const element = (attributes = {}) => {
  const classes = new Set(); const events = {};
  return {attributes, inert:false, hidden:false, events,
   classList:{add:name=>classes.add(name),remove:name=>classes.delete(name),contains:name=>classes.has(name),toggle(name,on){if(on)classes.add(name);else classes.delete(name);}},
   getAttribute:name=>attributes[name]??null,setAttribute:(name,value)=>attributes[name]=value,removeAttribute:name=>delete attributes[name],
   addEventListener(name,fn){(events[name]??=[]).push(fn);},
   focus(){document.activeElement=this;},contains(){return false;},querySelector(){return null;}};
 };
 const toggle=element({'aria-controls':'site-navigation','aria-expanded':'false'});
 const links=['/','/explore/','/builds/','/about/'].map(href=>element({href}));
 const floatingLinks=['/','/explore/','/builds/','/about/'].map(href=>element({href}));
 floatingLinks[0].setAttribute('aria-current','page');
 const menu=element();menu.querySelectorAll=()=>links;
 menu.querySelector=selector=>selector==='a[aria-current="page"]'?links.find(link=>link.attributes['aria-current']):selector==='a'?links[0]:null;
 menu.contains=node=>links.includes(node);
 const main=element();const footer=element();footer.inert=true;const wordmark=element();const skip=element();
 const floating=element();floating.inert=true;floating.contains=node=>floatingLinks.includes(node);
 floating.querySelector=selector=>selector==='a[aria-current="page"]'?floatingLinks[0]:null;
 let sceneTop=0;
 const header=element();header.querySelector=selector=>selector==='.wordmark'?wordmark:selector==='.nav a[aria-current="page"]'?links.find(link=>link.attributes['aria-current']):null;
 header.getBoundingClientRect=()=>({bottom:-20});
 const journey={getBoundingClientRect:()=>({top:sceneTop,height:2400})};
 const content={getBoundingClientRect:()=>({top:100,bottom:300})};
 const background=[main,footer,wordmark,skip,...(home?[floating]:[])];
 const document={activeElement:toggle,body:element(),documentElement:element(),
  querySelectorAll:selector=>selector==='.nav a'?links:background,
  querySelector:selector=>({'.nav-toggle':toggle,'.header':header,'.inner-page .header .nav':home?null:menu,'.floating-nav':home?floating:null,'.floating-nav.is-visible':home&&floating.classList.contains('is-visible')?floating:null,'.journey':home?journey:null,'.content-flow':home?content:null,'.page-hero':home?null:content}[selector]??null),
  getElementById:id=>id==='site-navigation'?menu:null,
  addEventListener(name,fn){(documentEvents[name]??=[]).push(fn);}};
 const window={innerWidth:390,innerHeight:800,scrollY:0,matchMedia:()=>({matches:false}),addEventListener(name,fn){(windowEvents[name]??=[]).push(fn);}};
 const dispatch=(events,name,event={})=>{for(const fn of events[name]??[])fn(event);};
 const flush=()=>{while(frames.length)frames.shift()();};
 vm.runInNewContext(readFileSync('src/navigation.js','utf8'),{document,window,location:{pathname:'/'},requestAnimationFrame:fn=>{frames.push(fn);return frames.length;}});
 return {document,window,toggle,menu,links,floating,floatingLinks,header,background,main,footer,wordmark,skip,
  clickToggle(){dispatch(toggle.events,'click');flush();},
  clickLink(){dispatch(menu.events,'click',{target:{closest:()=>links[0]}});flush();},
  key(key,shiftKey=false){let prevented=false;dispatch(documentEvents,'keydown',{key,shiftKey,preventDefault(){prevented=true;}});flush();return prevented;},
  resize(width){window.innerWidth=width;dispatch(windowEvents,'resize');flush();},
  scroll(top=sceneTop){sceneTop=top;dispatch(windowEvents,'scroll');flush();}};
}

test('mobile menu isolates the background and cycles Tab through links and its toggle',()=>{
 const h=mobileMenuHarness();h.clickToggle();
 assert.equal(h.menu.classList.contains('nav-open'),true);assert.equal(h.document.body.classList.contains('menu-open'),true);
 assert.equal(h.toggle.getAttribute('aria-expanded'),'true');assert.equal(h.toggle.getAttribute('aria-label'),'Close navigation menu');
 assert.equal(h.document.activeElement,h.links[0]);assert.ok(h.background.every(element=>element.inert));
 for(const link of h.links.slice(1)){assert.equal(h.key('Tab'),true);assert.equal(h.document.activeElement,link);}
 h.key('Tab');assert.equal(h.document.activeElement,h.toggle);
 h.key('Tab');assert.equal(h.document.activeElement,h.links[0]);
 h.key('Tab',true);assert.equal(h.document.activeElement,h.toggle);
 h.key('Tab',true);assert.equal(h.document.activeElement,h.links.at(-1));
 h.main.focus();h.key('Tab');assert.equal(h.document.activeElement,h.toggle);
 h.scroll();assert.equal(h.wordmark.inert,true,'scroll updates must keep the background isolated');
 assert.equal(h.key('Escape'),true);assert.equal(h.document.activeElement,h.toggle);
 assert.equal(h.menu.classList.contains('nav-open'),false);assert.equal(h.document.body.classList.contains('menu-open'),false);
 assert.equal(h.toggle.getAttribute('aria-label'),'Open navigation menu');
 assert.equal(h.main.inert,false);assert.equal(h.footer.inert,true);assert.equal(h.wordmark.inert,false);assert.equal(h.skip.inert,false);
 assert.equal(h.key('Tab'),false,'a closed menu must not capture Tab');
});

test('mobile menu restores previous inert states on link and toggle closure',()=>{
 const h=mobileMenuHarness({home:true});
 for(const close of [()=>h.clickLink(),()=>h.clickToggle()]){
  h.clickToggle();assert.ok(h.background.every(element=>element.inert));
  close();assert.equal(h.toggle.getAttribute('aria-expanded'),'false');assert.equal(h.document.activeElement,h.toggle);
  assert.equal(h.main.inert,false);assert.equal(h.footer.inert,true);assert.equal(h.wordmark.inert,false);assert.equal(h.skip.inert,false);
  assert.equal(h.floating.inert,true,'the hidden Home floating navigation must stay inert');
 }
});

test('desktop resize closes the menu and focuses the visible Home navigation',()=>{
 const h=mobileMenuHarness({home:true});h.scroll(-1280);h.clickToggle();
 h.resize(1200);
 assert.equal(h.toggle.getAttribute('aria-expanded'),'false');assert.equal(h.document.body.classList.contains('menu-open'),false);
 assert.equal(h.main.inert,false);assert.equal(h.footer.inert,true);assert.equal(h.skip.inert,false);
 assert.equal(h.floating.classList.contains('is-visible'),true);assert.equal(h.floating.inert,false);assert.equal(h.header.inert,true);
 assert.equal(h.document.activeElement,h.floatingLinks[0]);
 h.resize(390);assert.equal(h.floating.inert,true);assert.equal(h.header.inert,false);
 h.clickToggle();h.key('Escape');assert.equal(h.floating.inert,true);assert.equal(h.document.activeElement,h.toggle);
});

test('desktop resize focuses the header links when floating navigation is unavailable',()=>{
 for(const home of [false,true]){
  const h=mobileMenuHarness({home});h.clickToggle();h.resize(1200);
  assert.equal(h.toggle.getAttribute('aria-expanded'),'false');assert.equal(h.document.activeElement,h.links[0]);
  assert.equal(h.main.inert,false);assert.equal(h.footer.inert,true);
 }
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
