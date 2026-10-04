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

test('late Home descent keeps white ink at the dark wash top and dark ink as its pale bottom moves underneath',()=>{
  const h=contrastHarness();
  h.setSurfaces([{closest:()=>false,matches:selector=>selector==='.journey, .journey-stage',style:{backgroundColor:'rgba(0, 0, 0, 0)'}}]);
  vm.runInContext("let stageTop=0;document.querySelector=selector=>selector==='.journey'?{getBoundingClientRect:()=>({top:-1600,height:2400})}:selector==='.journey-stage'?{getBoundingClientRect:()=>({top:stageTop,height:800})}:null;document.documentElement.classList.contains=()=>false",h.context);
  assert.equal(h.read(),false);
  vm.runInContext('stageTop=-650',h.context);assert.equal(h.read(),true);
  const css=readFileSync('src/styles/home.css','utf8');
  assert.match(css,/#244c80 0%,#538bb8 36%,#99c8e3 72%,#d9eef8 100%/,'contrast estimate must track the rendered landing wash');
});
