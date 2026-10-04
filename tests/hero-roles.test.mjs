import test from 'node:test';
import assert from 'node:assert/strict';
import vm from 'node:vm';
import {readFileSync} from 'node:fs';
const source = readFileSync('src/hero-roles.js', 'utf8');
function harness({reduced=false}={}) {
  const node = textContent => {
    const classes=new Set(); const events={};
    return {textContent,events,inert:false,hidden:true,attributes:{},
      classList:{add:x=>classes.add(x),remove:x=>classes.delete(x),contains:x=>classes.has(x),
        replace(a,b){if(classes.delete(a))classes.add(b);},
        toggle(x,on){if(on)classes.add(x);else classes.delete(x);}},
      addEventListener:(name,fn)=>events[name]=fn,setAttribute(name,value){this.attributes[name]=value;}};
  };
  const roles=['designer','developer','filmmaker','writer','researcher','animator','builder','creator'].map(x=>node(x+'.'));
  roles[0].classList.add('is-current');
  const toggle=node(),hero=node(),action=node();
  const events={},timers=new Map(); let id=0,intersection,mutation;
  const motion={matches:reduced,addEventListener(name,fn){this.change=fn;}};
  const document={hidden:false,querySelectorAll:()=>roles,querySelector:s=>({'.role-toggle':toggle,'.hero-content':hero,'.descent-link':action}[s]),addEventListener:(name,fn)=>events[name]=fn};
  class IntersectionObserver {constructor(fn){intersection=fn;}observe(){}}
  class MutationObserver {constructor(fn){mutation=fn;}observe(){}}
  vm.runInNewContext(source,{document,window:{IntersectionObserver,MutationObserver},IntersectionObserver,MutationObserver,matchMedia:()=>motion,
    setTimeout(fn){timers.set(++id,fn);return id;},clearTimeout:x=>timers.delete(x)});
  return {roles,toggle,hero,action,motion,timers,
    current:()=>roles.findIndex(x=>x.classList.contains('is-current')),
    tick(){const fn=[...timers.values()][0];timers.clear();fn?.();},
    click(){toggle.events.click();},reduced(on){motion.matches=on;motion.change();},
    hidden(on){document.hidden=on;events.visibilitychange();},
    visible(on){intersection([{isIntersecting:on}]);},
    cover(on){hero.inert=on;mutation();},coverAction(on){action.inert=on;mutation();},mutate(){mutation();}};
}
test('roles complete the curated cycle, including the correct article, and wrap',()=>{
 const h=harness();assert.equal(h.current(),0);assert.equal(h.toggle.hidden,false);
 for(let i=1;i<=8;i++){h.tick();assert.equal(h.current(),i%8);assert.equal(h.hero.classList.contains('uses-an'),i===5);assert.equal(h.roles.filter(x=>x.classList.contains('is-current')).length,1);}
});
test('pause retains the selected role and resume schedules the next role',()=>{
 const h=harness();h.tick();h.click();assert.equal(h.timers.size,0);assert.equal(h.current(),1);assert.equal(h.toggle.attributes['aria-label'],'Resume role rotation');
 h.tick();assert.equal(h.current(),1);h.click();h.tick();assert.equal(h.current(),2);assert.equal(h.toggle.attributes['aria-label'],'Pause role rotation');
});
test('reduced motion starts static and a preference change settles an active transition',()=>{
 const initial=harness({reduced:true});assert.equal(initial.timers.size,0);assert.equal(initial.toggle.hidden,true);
 const h=harness();for(let i=0;i<5;i++)h.tick();h.reduced(true);
 assert.equal(h.current(),0);assert.equal(h.hero.classList.contains('uses-an'),false);assert.equal(h.timers.size,0);assert.equal(h.toggle.hidden,true);
 assert.ok(h.roles.every(x=>!x.classList.contains('is-leaving')));h.reduced(false);assert.equal(h.timers.size,1);
});
test('hidden page, offscreen hero, and Earth coverage independently suspend rotation',()=>{
 const h=harness();h.hidden(true);assert.equal(h.timers.size,0);h.hidden(false);assert.equal(h.timers.size,1);
 h.visible(false);h.cover(true);h.cover(false);assert.equal(h.timers.size,0,'uncovering must not resume an offscreen hero');
 h.visible(true);assert.equal(h.timers.size,1);h.cover(true);assert.equal(h.timers.size,0);h.cover(false);assert.equal(h.timers.size,1);
 const timer=[...h.timers.keys()][0];h.mutate();assert.equal([...h.timers.keys()][0],timer,'unchanged inert notifications must not restart the hold');
});
test('the pause control follows the CTA when Earth clips controls',()=>{
 const h=harness();h.coverAction(true);assert.equal(h.toggle.inert,true);h.coverAction(false);assert.equal(h.toggle.inert,false);
 h.cover(true);assert.equal(h.toggle.inert,true);h.cover(false);assert.equal(h.toggle.inert,false);
});
