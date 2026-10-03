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
 const stage={getBoundingClientRect:()=>({height:700})};
 const document={querySelectorAll:()=>[],querySelector:selector=>({'.floating-nav':pill,'.header':header,'.journey':journey,'.journey-stage':stage,'.content-flow':content}[selector]??null),documentElement:{classList:{toggle(){},contains:()=>false}},body:{classList:{contains:()=>false}},addEventListener(){}};
 const window={innerWidth:1200,innerHeight:800,matchMedia:()=>({matches:false}),addEventListener:(name,fn)=>events[name]=fn};
 vm.runInNewContext(readFileSync('src/navigation.js','utf8'),{document,window,location:{pathname:'/'},requestAnimationFrame:fn=>{fn();return 0}});
 assert.equal(pill.inert,true);assert.equal(pill.attributes['aria-hidden'],'true');assert.equal(header.inert,false);
 sceneTop=-1120;events.scroll();assert.equal(pill.inert,true);
 sceneTop=-1280;events.scroll();assert.equal(pill.inert,true,'stage height controls the reveal threshold');
 sceneTop=-1360;events.scroll();assert.equal(pill.inert,false);assert.equal(pill.attributes['aria-hidden'],'false');assert.equal(classes.has('is-visible'),true);assert.equal(header.inert,true);
 window.innerHeight=900;events.resize();assert.equal(pill.inert,false,'browser chrome must not change a stable stage reveal');
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

function descentHarness({ready=true,fallback=false,reduced=false}={}){
 const listeners=new Map(),frames=new Map(),scrolls=[],sceneFrames=[],historyChanges=[];
 let nextFrame=0,destinationY=2200,stageHeight=800;
 const eventTarget=()=>({
  addEventListener(name,fn,options={}){const items=listeners.get(name)||[];items.push({fn,once:options.once});listeners.set(name,items);},
  removeEventListener(name,fn){listeners.set(name,(listeners.get(name)||[]).filter(item=>item.fn!==fn));},
  dispatchEvent(event){for(const item of [...(listeners.get(event.type)||[])]){if(item.once)this.removeEventListener(event.type,item.fn);item.fn(event);}return !event.defaultPrevented;}
 });
 const clickListeners=[];
 const link={addEventListener(name,fn){if(name==='click')clickListeners.push(fn);}};
 const stage={getBoundingClientRect:()=>({height:stageHeight})};
 const destination={getBoundingClientRect:()=>({top:destinationY-window.scrollY}),focus(){document.activeElement=this;},scrollIntoView(){window.scrollY=destinationY;}};
 const document={activeElement:null,body:{classList:{contains:name=>name==='scene-model-ready'&&ready}},documentElement:{style:{scrollBehavior:'smooth'},classList:{contains:name=>name==='sky-fallback'&&fallback,toggle(){}}},
  querySelectorAll:()=>[],querySelector:selector=>selector==='.descent-link'?link:selector==='.journey-stage'?stage:null,getElementById:id=>id==='first-content'?destination:null,addEventListener(){}};
 const window={...eventTarget(),innerWidth:1200,innerHeight:800,scrollY:0,matchMedia:()=>({matches:reduced}),
  scrollTo(options){assert.equal(typeof options,'object');assert.equal(options.behavior,'instant');scrolls.push({...options});this.scrollY=options.top;}};
 window.addEventListener('azivor:descent-frame',()=>sceneFrames.push(window.scrollY));
 const requestAnimationFrame=fn=>{const id=++nextFrame;frames.set(id,fn);return id;};
 const cancelAnimationFrame=id=>frames.delete(id);
 vm.runInNewContext(readFileSync('src/navigation.js','utf8'),{document,window,location:{pathname:'/'},Event,requestAnimationFrame,cancelAnimationFrame,history:{replaceState(...args){historyChanges.push(args);}}});
 return {document,window,destination,scrolls,sceneFrames,historyChanges,
  click(extra={}){const event={button:0,defaultPrevented:false,preventDefault(){this.defaultPrevented=true;},...extra};clickListeners.forEach(fn=>fn(event));return event;},
  frame(now){const batch=[...frames];frames.clear();for(const [,fn] of batch)fn(now);},
  interrupt(type,extra={}){window.dispatchEvent({type,...extra});},
  resize({width=window.innerWidth,height=window.innerHeight,stage=stageHeight}={}){window.innerWidth=width;window.innerHeight=height;stageHeight=stage;window.dispatchEvent({type:'resize'});},
  loseScene(){ready=false;fallback=true;},
  moveDestination(top){destinationY=top;},pendingFrames:()=>frames.size,
  cancellationListeners:()=>['wheel','touchstart','keydown','resize','pointerdown'].reduce((count,name)=>count+(listeners.get(name)||[]).length,0)};
}

test('Explore uses one animation owner and renders each explicitly instant scroll in the same frame',()=>{
 const h=descentHarness();h.click();h.frame(0);h.frame(1000);const before=h.scrolls.length;
 h.click();assert.equal(h.pendingFrames(),1);h.frame(1016);assert.equal(h.scrolls.length,before+1,'replacement click must not leave two writers');
 h.moveDestination(2400);h.frame(6200);
 assert.equal(h.scrolls.at(-1).top,2400);assert.deepEqual(h.sceneFrames,h.scrolls.map(scroll=>scroll.top));
 assert.equal(h.document.documentElement.style.scrollBehavior,'smooth');assert.equal(h.document.activeElement,h.destination);
 assert.equal(h.pendingFrames(),0);assert.equal(h.cancellationListeners(),0);assert.equal(h.historyChanges.length,1);
});
for(const [type,event] of [['wheel',{}],['touchstart',{}],['pointerdown',{}],['resize',{}],['keydown',{key:'Escape'}]])test(`manual ${type} input cancels Explore and restores scroll behavior`,()=>{
 const h=descentHarness();h.click();h.frame(0);h.frame(1000);const count=h.scrolls.length;
 if(type==='resize')h.resize({width:900});else h.interrupt(type,event);h.frame(6000);assert.equal(h.scrolls.length,count);assert.equal(h.pendingFrames(),0);
 assert.equal(h.cancellationListeners(),0);assert.equal(h.document.documentElement.style.scrollBehavior,'smooth');assert.equal(h.historyChanges.length,0);
});
test('browser toolbar resize preserves Explore while actual stage resizing cancels it',()=>{
 const h=descentHarness();h.click();h.frame(0);h.resize({height:900});h.frame(1000);
 assert.equal(h.scrolls.length,2);assert.equal(h.pendingFrames(),1);assert.equal(h.document.documentElement.style.scrollBehavior,'auto');
 const count=h.scrolls.length;h.resize({stage:850});h.frame(2000);
 assert.equal(h.scrolls.length,count);assert.equal(h.pendingFrames(),0);assert.equal(h.document.documentElement.style.scrollBehavior,'smooth');
});
test('context loss during Explore cancels the trip before another scroll update',()=>{
 const h=descentHarness();h.click();h.frame(0);h.frame(1000);const count=h.scrolls.length;h.loseScene();h.frame(2000);
 assert.equal(h.scrolls.length,count);assert.equal(h.pendingFrames(),0);assert.equal(h.cancellationListeners(),0);
 assert.equal(h.document.documentElement.style.scrollBehavior,'smooth');assert.equal(h.historyChanges.length,0);
});
for(const options of [{ready:false},{fallback:true},{reduced:true}])test(`Explore reaches content immediately when descent is unavailable ${JSON.stringify(options)}`,()=>{
 const h=descentHarness(options);const event=h.click();assert.equal(event.defaultPrevented,true);assert.equal(h.pendingFrames(),0);
 assert.equal(h.window.scrollY,2200);assert.equal(h.document.activeElement,h.destination);assert.equal(h.historyChanges.length,1);
 assert.equal(h.document.documentElement.style.scrollBehavior,'smooth');assert.equal(h.cancellationListeners(),0);
});
test('modified Explore activation preserves ordinary browser navigation',()=>{
 for(const extra of [{ctrlKey:true},{metaKey:true},{button:1},{defaultPrevented:true}]){
  const h=descentHarness();h.click(extra);assert.equal(h.pendingFrames(),0);assert.equal(h.scrolls.length,0);assert.equal(h.historyChanges.length,0);
 }
});
