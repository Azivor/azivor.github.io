import test from 'node:test';
import assert from 'node:assert/strict';
import vm from 'node:vm';
import {readFileSync} from 'node:fs';
function harness() {
 let top=1200, frame, timer; const classes=new Set(), events={};
 const motion={matches:false,addEventListener(name,fn){this.change=fn;}};
 const icons=new Map(['codex','grok','cursor','deepseek','midjourney','perplexity','runway','gemini','elevenlabs'].map(slug=>{const set=new Set();return [slug,{set,style:{setProperty(){}},classList:{toggle(name,on){if(on)set.add(name);else set.delete(name);}}}];}));
 const apps={querySelector:s=>icons.get(s.replace('.creation-app--','')),getBoundingClientRect:()=>({top}),classList:{toggle(name,on){if(on)classes.add(name);else classes.delete(name);}}};
 const window={innerHeight:1000,matchMedia:()=>motion,addEventListener(name,fn){events[name]=fn;}};
 vm.runInNewContext(readFileSync('src/creation-story.js','utf8'),{document:{querySelector:s=>s==='.creation-apps'?apps:null},window,setTimeout(fn){timer=fn;return 1;},clearTimeout(){timer=null;},requestAnimationFrame(fn){frame=fn;return 1;}});
 return {classes,icons,finish(){timer?.();timer=null;},scroll(y){top=y;events.scroll();frame();},reduce(on){motion.matches=on;motion.change();}};
}
test('entering view starts an automatic reveal without further scroll and rearms on return',()=>{
 const h=harness();assert.ok(!h.classes.has('has-lead'));
 h.scroll(800);assert.ok(h.classes.has('has-lead'));assert.ok(!h.classes.has('has-more'));
 h.finish();assert.ok(h.classes.has('has-more'));assert.ok([...h.icons.values()].every(icon=>icon.set.has('is-app-visible')));
 h.scroll(1200);assert.ok(!h.classes.has('has-lead'));assert.ok(!h.classes.has('has-more'));
 h.scroll(800);assert.ok(h.classes.has('has-lead'));assert.ok(!h.classes.has('has-more'));
});
test('leaving before the automatic reveal cancels its pending animation',()=>{
 const h=harness();h.scroll(800);h.scroll(1200);h.finish();assert.ok(!h.classes.has('has-more'));
});
test('reduced motion exposes all apps regardless of scroll position',()=>{
 const h=harness();h.reduce(true);assert.ok(h.classes.has('has-lead'));assert.ok(h.classes.has('has-more'));assert.ok(!h.classes.has('is-scroll-apps'));
 h.scroll(1200);assert.ok(h.classes.has('has-more'));
 h.reduce(false);assert.ok(!h.classes.has('has-lead'));assert.ok(!h.classes.has('has-more'));
});
