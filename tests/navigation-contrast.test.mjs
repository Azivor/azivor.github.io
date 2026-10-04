import test from 'node:test';
import assert from 'node:assert/strict';
import vm from 'node:vm';
import {readFileSync} from 'node:fs';

function contrastHarness(){
  let surfaces=[];
  const document={querySelector:()=>null,querySelectorAll:()=>[],elementsFromPoint:()=>surfaces,documentElement:{classList:{toggle(){}}}};
  const context=vm.createContext({document,window:{innerWidth:390,matchMedia:()=>({matches:false})},location:{pathname:'/'},getComputedStyle:element=>element.style});
  vm.runInContext(readFileSync('src/navigation.js','utf8'),context);
  const control={getBoundingClientRect:()=>({left:18,top:8,width:100,height:44}),classList:{contains:()=>false}};
  const surface=(color,{hero=false,bottom=150}={})=>({closest:()=>false,matches:selector=>hero&&selector==='.page-hero',style:{backgroundColor:color,getPropertyValue:()=> '150px'},getBoundingClientRect:()=>({bottom})});
  return {context,control,surface,setSurfaces:value=>surfaces=value,read(fallback=false){context.control=control;context.fallback=fallback;return vm.runInContext('foregroundOverLight(control,fallback)',context);}};
}

test('navigation contrast follows the painted background rather than a section boundary',()=>{
  const h=contrastHarness();
  h.setSurfaces([h.surface('rgb(244, 248, 252)')]);assert.equal(h.read(false),true);
  h.setSurfaces([h.surface('rgb(8, 20, 50)')]);assert.equal(h.read(true),false);
  h.setSurfaces([{closest:()=>true},h.surface('rgb(244, 248, 252)')]);assert.equal(h.read(false),true,'the header itself cannot contaminate the probe');
});

test('the actual cached hero fade determines foreground before the next section',()=>{
  const h=contrastHarness();h.setSurfaces([h.surface('rgb(35, 79, 120)',{hero:true,bottom:75})]);
  vm.runInContext('heroFadePixels=new Uint8ClampedArray(1024).fill(245)',h.context);
  assert.equal(h.read(false),true);
  vm.runInContext('heroFadePixels=new Uint8ClampedArray(1024).fill(20)',h.context);
  assert.equal(h.read(true),false);
});

test('a small luminance dead band prevents repeated icon flips near the contrast threshold',()=>{
  const h=contrastHarness();h.setSurfaces([h.surface('rgb(130, 130, 130)')]);
  h.control.classList.contains=()=>false;assert.equal(h.read(),false);
  h.control.classList.contains=()=>true;assert.equal(h.read(),true);
});

test('reduced transparency keeps white controls at the dark top and dark controls on its solid scrolled backing',()=>{
  const h=contrastHarness();
  vm.runInContext("window.matchMedia=()=>({matches:true});window.scrollY=0",h.context);
  h.setSurfaces([h.surface('rgb(8, 20, 50)')]);assert.equal(h.read(),false);
  vm.runInContext('window.scrollY=30',h.context);assert.equal(h.read(),true);
});

test('late Home descent keeps white ink across the blue landing wash',()=>{
  const h=contrastHarness();
  h.setSurfaces([{closest:()=>false,matches:selector=>selector==='.journey, .journey-stage',style:{backgroundColor:'rgba(0, 0, 0, 0)'}}]);
  vm.runInContext("let stageTop=0;document.querySelector=selector=>selector==='.journey'?{getBoundingClientRect:()=>({top:-1600,height:2400})}:selector==='.journey-stage'?{getBoundingClientRect:()=>({top:stageTop,height:800})}:null;document.documentElement.classList.contains=()=>false",h.context);
  assert.equal(h.read(),false);
  vm.runInContext('stageTop=-650',h.context);assert.equal(h.read(),false);
  vm.runInContext("window.matchMedia=query=>({matches:query.includes('prefers-reduced-motion')})",h.context);assert.equal(h.read(),false);
  const css=readFileSync('src/styles/home.css','utf8');
  assert.match(css,/#244c80 0%,#305b8a 48%,#244c80 100%/,'contrast estimate must track the rendered landing wash');
});


test('desktop and mobile navigation follow the visible timeline gradient above its cream backing',()=>{
  const h=contrastHarness();
  const css=readFileSync('src/styles/creation-story.css','utf8');
  const source=css.match(/background:linear-gradient\(180deg,(#244c80 0px.*?)\)}/)[1];
  const gradient=source.replace(/#([0-9a-f]{6})/g,(_,hex)=>`rgb(${parseInt(hex.slice(0,2),16)}, ${parseInt(hex.slice(2,4),16)}, ${parseInt(hex.slice(4,6),16)})`);
  h.context.gradient=gradient;
  h.setSurfaces([h.surface('rgb(237, 232, 222)')]);
  vm.runInContext("let timelinePosition=0;document.querySelector=selector=>selector==='.creation-atmosphere'?{style:{backgroundImage:gradient},getBoundingClientRect:()=>({top:30-timelinePosition,bottom:4030-timelinePosition,height:4000})}:null",h.context);
  for(const width of [390,1440]){
    h.context.window.innerWidth=width;
    for(const position of [0,300,1680,2240,2800]){
      vm.runInContext(`timelinePosition=${position}`,h.context);
      assert.equal(h.read(true),width===1440 && position===2240,`ink follows the visible gradient and glass tint at ${position}px, viewport ${width}`);
    }
    vm.runInContext('timelinePosition=3990',h.context);
    assert.equal(h.read(false),true,'dark ink returns as the exit reaches cream');
  }
});

test('browser backdrop follows the timeline gradient and clears its old tint on white content',()=>{
 const h=contrastHarness();
 vm.runInContext(`
 document.documentElement.style={};document.body={style:{}};
 const atmosphere={style:{backgroundImage:'linear-gradient(rgb(16, 43, 64) 0px, rgb(120, 55, 46) 1000px)'},getBoundingClientRect:()=>({top:-499,bottom:501,height:1000})};
 let theme='';document.querySelector=selector=>selector==='.creation-atmosphere'?atmosphere:selector==='meta[name="theme-color"]'?{setAttribute:(name,value)=>theme=value}:null;
 syncBrowserBackdrop();
 `,h.context);
 assert.equal(h.context.document.documentElement.style.backgroundColor,'rgb(68,49,55)');
 assert.equal(h.context.document.body.style.backgroundColor,'rgb(68,49,55)');
 assert.equal(vm.runInContext('theme',h.context),'rgb(68,49,55)');
 h.setSurfaces([h.surface('rgb(255, 255, 255)')]);
 vm.runInContext("document.querySelector=()=>null;syncBrowserBackdrop()",h.context);
 assert.equal(h.context.document.documentElement.style.backgroundColor,'rgb(255,255,255)');
});
