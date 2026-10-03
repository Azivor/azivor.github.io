import test from 'node:test';
import assert from 'node:assert/strict';
import vm from 'node:vm';
import {readFileSync} from 'node:fs';

const source=readFileSync(new URL('../src/sky-scene.js',import.meta.url),'utf8');

function eventTarget(){
 const listeners=new Map();
 return {
  addEventListener(name,fn){const list=listeners.get(name)||[];list.push(fn);listeners.set(name,list);},
  removeEventListener(name,fn){listeners.set(name,(listeners.get(name)||[]).filter(item=>item!==fn));},
  dispatch(name,extra={}){const event={type:name,preventDefault(){this.defaultPrevented=true;},...extra};for(const fn of [...(listeners.get(name)||[])])fn(event);return event;}
 };
}
function element(rect={left:0,top:0,width:1200,height:800}){
 const classes=new Set(),properties=new Map(),attributes=new Map();
 return {...eventTarget(),hidden:false,inert:false,disabled:false,textContent:'',dataset:{},
  style:{visibility:'',display:'',clipPath:'',setProperty:(key,value)=>properties.set(key,String(value)),getPropertyValue:key=>properties.get(key)||'',removeProperty:key=>properties.delete(key)},
  classList:{add(...names){names.forEach(name=>classes.add(name));},remove(...names){names.forEach(name=>classes.delete(name));},contains:name=>classes.has(name),toggle(name,force){const on=force??!classes.has(name);if(on)classes.add(name);else classes.delete(name);return on;}},
  setAttribute:(key,value)=>attributes.set(key,String(value)),getAttribute:key=>attributes.get(key)??null,removeAttribute:key=>attributes.delete(key),
  getBoundingClientRect:()=>({...rect,right:rect.left+rect.width,bottom:rect.top+rect.height}),querySelector:()=>null,querySelectorAll:()=>[]};
}

function sceneHarness({fast=false,width=1200,height=800,maximumTexture=8192,saveData=false,unavailable=false,throwUpload=false,uploadError=false,throwDraw=false,drawError=false}={}){
 const images=[],frames=[],timers=new Map(),uploads=[],draws=[],warnings=[],resizes=[];
 let time=0,nextTimer=0,nextFrame=0,sceneTop=0,gpuError=0,lost=false,textureId=0,activeUnit=33984;
 const bindings=new Map(),queries={errors:0,parameters:0};let progress=0;
 const canvas=element(),stage=element(),journey=element(),hero=element({left:100,top:100,width:600,height:300});
 const action=element({left:100,top:300,width:200,height:50}),showcase=element(),status=element(),retry=element();
 retry.hidden=true;
 let stageWidth=width,stageHeight=height;
 stage.getBoundingClientRect=()=>({left:0,top:0,width:stageWidth,height:stageHeight,right:stageWidth,bottom:stageHeight});
 hero.querySelector=selector=>selector==='.descent-link'?action:null;
 journey.getBoundingClientRect=()=>({top:sceneTop,height:2400,left:0,width:1200,bottom:sceneTop+2400,right:1200});
 const gl={
  NO_ERROR:0,INVALID_OPERATION:1282,CONTEXT_LOST_WEBGL:37442,MAX_TEXTURE_SIZE:3379,TEXTURE_BINDING_2D:32873,
  COMPILE_STATUS:35713,LINK_STATUS:35714,TEXTURE0:33984,TEXTURE_2D:3553,RGB:6407,UNSIGNED_BYTE:5121,
  VERTEX_SHADER:35633,FRAGMENT_SHADER:35632,ARRAY_BUFFER:34962,STATIC_DRAW:35044,FLOAT:5126,TRIANGLE_STRIP:5,
  UNPACK_FLIP_Y_WEBGL:37440,TEXTURE_MIN_FILTER:10241,TEXTURE_MAG_FILTER:10240,LINEAR_MIPMAP_LINEAR:9987,LINEAR:9729,TEXTURE_WRAP_S:10242,TEXTURE_WRAP_T:10243,REPEAT:10497,CLAMP_TO_EDGE:33071,
  createShader:()=>({}),shaderSource(){},compileShader(){},getShaderParameter:()=>true,getShaderInfoLog:()=>'',
  createProgram:()=>({}),attachShader(){},linkProgram(){},getProgramParameter:()=>true,getProgramInfoLog:()=>'',useProgram(){},
  createVertexArray:()=>({}),bindVertexArray(){},createBuffer:()=>({}),bindBuffer(){},bufferData(){},getAttribLocation:()=>0,enableVertexAttribArray(){},vertexAttribPointer(){},
  getUniformLocation:(_,name)=>name,uniform1i(){},uniform1f(name,value){if(name==='progress')progress=value;},uniform2f(){},viewport(){},
  createTexture:()=>({id:++textureId}),activeTexture(unit){activeUnit=unit;},bindTexture(_,texture){bindings.set(activeUnit,texture);},pixelStorei(){},
  texImage2D(...args){if(throwUpload)throw new Error('upload failed');uploads.push(args.at(-1));if(uploadError)gpuError=1282;},
  generateMipmap(){},texParameteri(){},texParameterf(){},getExtension:()=>null,
  getParameter(key){queries.parameters++;return key===3379?maximumTexture:key===32873?bindings.get(activeUnit):8;},getError(){queries.errors++;const error=gpuError;gpuError=0;return error;},
  isContextLost:()=>lost,deleteTexture(){},deleteShader(){},deleteProgram(){},deleteBuffer(){},deleteVertexArray(){},
  drawArrays(){if(throwDraw)throw new Error('draw failed');draws.push({progress,uploads:uploads.length,ready:document.body.classList.contains('scene-model-ready')});if(drawError)gpuError=1282;}
 };
 canvas.getContext=()=>unavailable?null:gl;
 const nodes={'.journey':journey,'.journey-stage':stage,'#sky-scene':canvas,'.hero-content':hero,'.showcase':showcase,'meta[name="theme-color"]':element()};
 const statusText=element();
 const document={...eventTarget(),hidden:false,documentElement:element(),body:element(),
  querySelector(selector){if(selector==='.scene-retry')return retry;if(selector==='.scene-status')return status;if(selector==='.scene-status-text')return statusText;return nodes[selector]??null;},
  createElement(tag){assert.equal(tag,'canvas');const resized=element();resized.getContext=kind=>{assert.equal(kind,'2d');return {drawImage(...args){resizes.push(args);}};};return resized;},
  querySelectorAll:()=>[],getElementById:id=>/retry/.test(id)?retry:/status/.test(id)?status:id==='sky-scene'?canvas:null};
 const window={...eventTarget(),innerWidth:width,innerHeight:height,devicePixelRatio:1};
 const context={document,window,innerWidth:width,innerHeight:height,devicePixelRatio:1,navigator:{hardwareConcurrency:8,deviceMemory:8,connection:{saveData,effectiveType:fast?'4g':'3g',downlink:fast?20:.8}},
  console:{warn:(...args)=>warnings.push(args),error:(...args)=>warnings.push(args),log(){}},
  Image:class {constructor(){images.push(this);}set src(value){this.url=value;if(value){this.width=this.naturalWidth=/surface/.test(value)?3072:/detail/.test(value)?6144:2048;this.height=this.naturalHeight=this.width/2;}}get src(){return this.url;}decode(){return Promise.resolve();}},
  performance:{now:()=>time},matchMedia:query=>({...eventTarget(),matches:query.includes('min-width')||query.includes('pointer: fine')}),
  setTimeout(fn,delay){const id=++nextTimer;timers.set(id,{fn,at:time+delay});return id;},clearTimeout:id=>timers.delete(id),
  requestAnimationFrame(fn){const id=++nextFrame;frames.push({id,fn});return id;},cancelAnimationFrame(id){const frame=frames.find(frame=>frame.id===id);if(frame)frame.cancelled=true;},
  addEventListener:window.addEventListener.bind(window),removeEventListener:window.removeEventListener.bind(window)};
 Object.assign(window,{navigator:context.navigator,matchMedia:context.matchMedia,requestAnimationFrame:context.requestAnimationFrame});
 vm.runInNewContext(source,context,{filename:'sky-scene.js'});
 const settle=async()=>{for(let i=0;i<16;i++)await Promise.resolve();};
 const load=async(image)=>{image.onload?.();await settle();};
 const loadOpening=async()=>{for(const image of [...images].filter(image=>/earth-surface\.jpg$|earth-clouds\.jpg$/.test(image.src)))await load(image);};
 const frame=async()=>{for(const item of frames.splice(0))if(!item.cancelled)item.fn(time);await settle();};
 const advance=async(milliseconds)=>{time+=milliseconds;for(const [id,timer] of [...timers])if(timer.at<=time){timers.delete(id);timer.fn();}await settle();};
 return {document,canvas,stage,hero,action,showcase,status,statusText,retry,images,uploads,draws,warnings,load,loadOpening,settle,frame,advance,bindings,resizes,queries,
  scroll(progress){sceneTop=-progress*1600;window.dispatch('scroll');},
  scrollTop(top){sceneTop=top;window.dispatch('scroll');},directFrame(){window.dispatch('azivor:descent-frame');},
  viewportHeight(value){context.innerHeight=window.innerHeight=value;window.dispatch('resize');},
  resizeStage(newWidth,newHeight){stageWidth=newWidth;stageHeight=newHeight;window.dispatch('resize');},
  lose(){lost=true;return canvas.dispatch('webglcontextlost');},restore(){lost=false;canvas.dispatch('webglcontextrestored');}};
}
function assertUnavailable(h){
 assert.equal(h.document.body.classList.contains('scene-model-ready'),false);
 assert.equal(h.document.documentElement.classList.contains('sky-fallback'),true);
 assert.ok(h.canvas.hidden||h.canvas.style.visibility==='hidden'||h.canvas.style.display==='none','failed opaque canvas must be hidden');
 assert.equal(h.retry.hidden,false);
 assert.equal(h.hero.style.clipPath,'');assert.equal(h.hero.inert,false);assert.equal(h.action.inert,false);
}
async function makeReady(h){await h.loadOpening();await h.frame();assert.equal(h.document.body.classList.contains('scene-model-ready'),true);}

test('opening starts both small textures together and waits for a successful rendered frame',async()=>{
 const h=sceneHarness({fast:true});
 assert.deepEqual(h.images.map(image=>image.src).sort(),['/earth-clouds.jpg','/earth-surface.jpg']);
 assert.equal(h.document.body.classList.contains('scene-model-ready'),false);
 assert.ok(h.canvas.hidden||h.canvas.style.visibility==='hidden'||h.canvas.style.display==='none','loading canvas must stay hidden before its first draw');
 await h.load(h.images[0]);await h.frame();assert.equal(h.draws.length,0);
 await h.load(h.images[1]);assert.equal(h.uploads.length,2);assert.equal(h.document.body.classList.contains('scene-model-ready'),false);
 await h.frame();assert.equal(h.draws.length,1);assert.equal(h.draws[0].uploads,2);assert.equal(h.draws[0].ready,false);
 assert.equal(h.document.body.classList.contains('scene-model-ready'),true);assert.equal(h.canvas.hidden,false);
 assert.equal(h.document.documentElement.classList.contains('sky-fallback'),false);
 assert.equal(h.images.length,2,'detailed clouds must not compete with the opening');
});
test('unavailable WebGL leaves accessible copy and a retry action',()=>assertUnavailable(sceneHarness({unavailable:true})));
test('texture download failure hides the canvas and retry obtains a fresh pair',async()=>{
 const h=sceneHarness();const old=h.images.slice();old[0].onerror?.();await h.settle();assertUnavailable(h);
 h.retry.dispatch('click');assert.equal(h.images.length,4);await h.load(h.images[2]);await h.load(h.images[3]);await h.frame();
 assert.equal(h.document.body.classList.contains('scene-model-ready'),true);assert.equal(h.document.documentElement.classList.contains('sky-fallback'),false);
});
for(const options of [{throwUpload:true},{uploadError:true}])test(`texture upload ${options.throwUpload?'exception':'GPU error'} exits loading safely`,async()=>{
 const h=sceneHarness(options);await h.loadOpening();await h.frame();assertUnavailable(h);assert.equal(h.draws.length,0);
});
for(const options of [{throwDraw:true},{drawError:true}])test(`first-draw ${options.throwDraw?'exception':'GPU error'} never exposes an opaque ready canvas`,async()=>{
 const h=sceneHarness(options);await h.loadOpening();await h.frame();assertUnavailable(h);
});
test('the twenty-second deadline ends loading and late completions cannot reveal the failed scene',async()=>{
 const h=sceneHarness();const handlers=h.images.map(image=>image.onload);
 await h.advance(19999);assert.equal(h.document.documentElement.classList.contains('sky-fallback'),false);
 await h.advance(1);assertUnavailable(h);
 handlers.forEach(handler=>handler?.());await h.settle();await h.frame();assertUnavailable(h);assert.equal(h.draws.length,0);
});
test('retry ignores callbacks belonging to the expired generation',async()=>{
 const h=sceneHarness();const stale=h.images.map(image=>({load:image.onload,error:image.onerror}));await h.advance(20000);h.retry.dispatch('click');
 stale.forEach(item=>{item.load?.();item.error?.();});await h.settle();await h.frame();
 assert.equal(h.document.body.classList.contains('scene-model-ready'),false);assert.equal(h.document.documentElement.classList.contains('sky-fallback'),false);
 assert.equal(h.uploads.length,0);assert.equal(h.draws.length,0);
 await h.load(h.images[2]);await h.load(h.images[3]);await h.frame();assert.equal(h.document.body.classList.contains('scene-model-ready'),true);
});
test('a replacement generation receives its own complete loading deadline',async()=>{
 const h=sceneHarness();await h.advance(5000);h.images[0].onerror?.();await h.settle();h.retry.dispatch('click');
 await h.advance(15000);assert.equal(h.document.documentElement.classList.contains('sky-fallback'),false,'previous deadline must not fail a fresh attempt');
 await h.advance(4999);assert.equal(h.document.documentElement.classList.contains('sky-fallback'),false);
 await h.advance(1);assertUnavailable(h);
});
test('context loss restores accessible hero copy and restoration redraws a fresh generation',async()=>{
 const h=sceneHarness();await makeReady(h);h.hero.style.clipPath='inset(0 0 100% 0)';h.hero.inert=true;h.action.inert=true;
 assert.equal(h.lose().defaultPrevented,true);assertUnavailable(h);const drawCount=h.draws.length;
 h.scroll(.5);await h.frame();assert.equal(h.draws.length,drawCount);
 h.restore();assert.equal(h.images.length,4);assert.equal(h.document.body.classList.contains('scene-model-ready'),false);
 await h.load(h.images[2]);await h.load(h.images[3]);await h.frame();assert.equal(h.draws.length,drawCount+1);assert.equal(h.document.body.classList.contains('scene-model-ready'),true);
});
test('in-flight downloads cannot revive a lost context or contaminate its replacement',async()=>{
 const h=sceneHarness();const stale=h.images.map(image=>image.onload);h.lose();h.restore();
 stale.forEach(handler=>handler?.());await h.settle();await h.frame();assert.equal(h.uploads.length,0);assert.equal(h.draws.length,0);
 await h.load(h.images[2]);await h.load(h.images[3]);await h.frame();assert.equal(h.document.body.classList.contains('scene-model-ready'),true);
});
test('completed startup cancels its timeout and slow connections keep the smaller cloud map',async()=>{
 const h=sceneHarness();await makeReady(h);await h.advance(10000);h.scroll(.6);await h.frame();
 assert.equal(h.document.body.classList.contains('scene-model-ready'),true);assert.equal(h.images.length,2);
});
test('small GPUs resize oversized base textures before uploading and still render Earth',async()=>{
 const h=sceneHarness({maximumTexture:2048});await makeReady(h);
 assert.equal(h.resizes.length,1);assert.equal(h.resizes[0][3],2048);assert.equal(h.resizes[0][4],1024);
 assert.ok(h.uploads.every(source=>source.width<=2048&&source.height<=2048));
});
test('cloud texture stays unchanged throughout the visible descent',async()=>{
 const h=sceneHarness({fast:true});await makeReady(h);const cloud=h.bindings.get(33985);
 for(const progress of [.1,.2,.5,.8,1,.4,0]){h.scroll(progress);await h.frame();}
 assert.equal(h.images.length,2);assert.equal(h.uploads.length,2);assert.equal(h.bindings.get(33985),cloud);
 assert.equal(h.document.body.classList.contains('scene-model-ready'),true);
});
test('ordinary descent frames do not issue synchronous GPU queries',async()=>{
 const h=sceneHarness();await makeReady(h);const initial={...h.queries};
 for(let i=1;i<=20;i++){h.scroll(i/20);await h.frame();}
 assert.deepEqual(h.queries,initial);assert.equal(h.draws.length,21);
});
test('browser chrome height changes leave stage progress and drawing buffer stable',async()=>{
 const h=sceneHarness({width:390,height:700});await makeReady(h);h.scrollTop(-850);await h.frame();
 const initial={width:h.canvas.width,height:h.canvas.height,progress:h.draws.at(-1).progress,errors:h.queries.errors};
 h.viewportHeight(780);await h.frame();
 assert.equal(h.canvas.width,initial.width);assert.equal(h.canvas.height,initial.height);
 assert.equal(h.draws.at(-1).progress,initial.progress);assert.equal(h.queries.errors,initial.errors);
});
test('the camera and buffer use actual stage dimensions including a taller minimum stage',async()=>{
 const h=sceneHarness({width:1000,height:500});h.resizeStage(1000,620);await makeReady(h);h.scrollTop(-890);await h.frame();
 assert.equal(h.canvas.width,1000);assert.equal(h.canvas.height,620);assert.equal(h.draws.at(-1).progress,.5);
 const errors=h.queries.errors;h.resizeStage(900,700);await h.frame();
 assert.equal(h.canvas.width,900);assert.equal(h.canvas.height,700);assert.equal(h.queries.errors,errors+1,'new drawing buffer requires an allocation error check');
});
test('an Explore frame immediately renders current progress and cancels an older queued scene draw',async()=>{
 const h=sceneHarness();await makeReady(h);h.scroll(.4);const before=h.draws.length;
 h.directFrame();assert.equal(h.draws.length,before+1);assert.equal(h.draws.at(-1).progress,.4);
 await h.frame();assert.equal(h.draws.length,before+1,'queued scroll draw must be cancelled after synchronous drawing');
});
test('multiple scroll events coalesce into one draw of the latest position',async()=>{
 const h=sceneHarness();await makeReady(h);h.scroll(.1);h.scroll(.3);h.scroll(.6);const before=h.draws.length;
 await h.frame();assert.equal(h.draws.length,before+1);assert.equal(h.draws.at(-1).progress,.6);
});
