import test from 'node:test';
import assert from 'node:assert/strict';
import vm from 'node:vm';
import {readFileSync} from 'node:fs';
function harness() {
 const classes=new Set(),events={},observers=[];
 const heading={top:1000,classList:{add:x=>classes.add(x),remove:x=>classes.delete(x)},getBoundingClientRect(){return {top:this.top};},addEventListener(name,fn){events[name]=fn;}};
 const timeline={querySelectorAll:()=>[],querySelector:()=>null,classList:{toggle(){}}};
 const motion={matches:false,listeners:[],addEventListener(name,fn){this.listeners.push(fn);}};
 const desktop={matches:false,addEventListener(){}};
 const document={querySelector:s=>s==='.creation-timeline'?timeline:null,querySelectorAll:s=>s.startsWith('.creation-story')?[heading]:s==='.is-text-pending'?classes.has('is-text-pending')?[heading]:[]:classes.has('is-text-revealing')?[heading]:[],documentElement:{classList:{contains:()=>false}}};
 class IntersectionObserver {constructor(fn,options){this.fn=fn;this.options=options;observers.push(this);}observe(){}disconnect(){}}
 const window={innerHeight:800,matchMedia:s=>s.includes('reduced')?motion:desktop,IntersectionObserver,addEventListener(){}};
 vm.runInNewContext(readFileSync('src/creation-story.js','utf8'),{document,window,IntersectionObserver});
 const enter=()=>observers.findLast(o=>o.options.threshold===.2).fn([{isIntersecting:true,target:heading}]);
 const exitAt=top=>observers.findLast(o=>o.options.threshold===0).fn([{isIntersecting:false,target:heading,boundingClientRect:{top}}]);
 return {classes,enter,exitAt,finish:()=>events.animationend(),reduce(on){motion.matches=on;motion.listeners.forEach(fn=>fn());}};
}
test('text replays after returning above it and scrolling down again',()=>{
 const h=harness();h.enter();assert.ok(h.classes.has('is-text-revealing'));h.finish();
 h.exitAt(1000);assert.ok(h.classes.has('is-text-pending'));
 h.enter();assert.ok(h.classes.has('is-text-revealing'));assert.ok(!h.classes.has('is-text-pending'));
});
test('passing text upward or hovering near the viewport edge does not rearm it',()=>{
 const h=harness();h.enter();h.finish();
 for(const top of [-400,750]){h.exitAt(top);h.enter();assert.ok(!h.classes.has('is-text-revealing'));assert.ok(!h.classes.has('is-text-pending'));}
});
test('reduced motion clears pending text and prevents replay',()=>{
 const h=harness();h.enter();h.finish();h.exitAt(1000);h.reduce(true);
 assert.ok(!h.classes.has('is-text-pending'));h.exitAt(1000);h.enter();assert.ok(!h.classes.has('is-text-revealing'));
});
