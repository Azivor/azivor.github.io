import test from 'node:test';
import assert from 'node:assert/strict';
import vm from 'node:vm';
import {readFileSync} from 'node:fs';
function harness() {
 let top=1000, frame; const classes=new Set(), events={};
 const motion={matches:false,addEventListener(name,fn){this.change=fn;}};
 const apps={getBoundingClientRect:()=>({top}),classList:{toggle(name,on){if(on)classes.add(name);else classes.delete(name);}}};
 const window={innerHeight:1000,matchMedia:()=>motion,addEventListener(name,fn){events[name]=fn;}};
 vm.runInNewContext(readFileSync('src/creation-story.js','utf8'),{document:{querySelector:s=>s==='.creation-apps'?apps:null},window,requestAnimationFrame(fn){frame=fn;return 1;}});
 return {classes,scroll(y){top=y;events.scroll();frame();},reduce(on){motion.matches=on;motion.change();}};
}
test('AI apps reveal the familiar pair before the additional group and replay on return',()=>{
 const h=harness();assert.ok(!h.classes.has('has-lead'));
 h.scroll(800);assert.ok(h.classes.has('has-lead'));assert.ok(!h.classes.has('has-more'));
 h.scroll(650);assert.ok(h.classes.has('has-more'));
 h.scroll(1000);assert.ok(!h.classes.has('has-lead'));assert.ok(!h.classes.has('has-more'));
 h.scroll(800);assert.ok(h.classes.has('has-lead'));assert.ok(!h.classes.has('has-more'));
});
test('reduced motion exposes all apps regardless of scroll position',()=>{
 const h=harness();h.reduce(true);assert.ok(h.classes.has('has-lead'));assert.ok(h.classes.has('has-more'));assert.ok(!h.classes.has('is-scroll-apps'));
 h.scroll(1200);assert.ok(h.classes.has('has-more'));
 h.reduce(false);assert.ok(!h.classes.has('has-lead'));assert.ok(!h.classes.has('has-more'));
});
