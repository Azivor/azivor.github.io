import {cp,mkdir,writeFile,copyFile,readFile,rm} from 'node:fs/promises';
import {fileURLToPath} from 'node:url';
import {join} from 'node:path';
import {createHash} from 'node:crypto';
import Home from '../src/pages/home.mjs';
import Catalog from '../src/pages/components.mjs';
import Explore from '../src/pages/explore.mjs';
import Builds from '../src/pages/builds.mjs';
import About from '../src/pages/about.mjs';
import EarthDescent from '../src/pages/earth-descent.mjs';
const root=fileURLToPath(new URL('../',import.meta.url));
const out=join(root,'dist');await mkdir(join(out,'ui'),{recursive:true});await mkdir(join(out,'components'),{recursive:true});
await writeFile(join(out,'index.html'),Home());
for(const [route,render] of [['explore',Explore],['builds',Builds],['about',About],['builds/earth-descent',EarthDescent]]){await mkdir(join(out,route),{recursive:true});await writeFile(join(out,route,'index.html'),render());}
await mkdir(join(out,'scene-test'),{recursive:true});
await writeFile(join(out,'scene-test/index.html'),Home({study:true}));
await writeFile(join(out,'components/index.html'),Catalog());
await copyFile(join(root,'src/assets/earth-descent-preview.jpg'),join(out,'earth-descent-preview.jpg'));
for(const name of ['creation-craft','creation-industry','creation-computer','creation-ai'])await copyFile(join(root,'src/assets/'+name+'.jpg'),join(out,name+'.jpg'));
await copyFile(join(root,'src/assets/creation-sakura-preview.png'),join(out,'creation-sakura-preview.png'));
await cp(join(root,'src/assets/ai-icons'),join(out,'ai-icons'),{recursive:true});
await copyFile(join(root,'src/assets/information-fade.svg'),join(out,'information-fade.svg'));
for(const name of ['hero-blue-fade','editorial-footer-fade'])await copyFile(join(root,'src/assets/'+name+'.svg'),join(out,name+'.svg'));
await copyFile(join(root,'src/assets/footer-fade.svg'),join(out,'footer-fade.svg'));
await copyFile(join(root,'src/assets/social-preview.jpg'),join(out,'social-preview.jpg'));
await copyFile(join(root,'src/assets/azivor-logo.png'),join(out,'azivor-logo.png'));
await copyFile(join(root,'src/assets/earth-surface.jpg'),join(out,'earth-surface.jpg'));
await copyFile(join(root,'src/assets/earth-clouds.jpg'),join(out,'earth-clouds.jpg'));
await copyFile(join(root,'src/assets/earth-clouds-detail.webp'),join(out,'earth-clouds-detail.webp'));
await copyFile(join(root,'src/assets/space-orbit.webp'),join(out,'space-orbit.webp'));
for(const name of ['tokens','base','components'])await copyFile(join(root,`src/styles/${name}.css`),join(out,`ui/${name}.css`));
for(const name of ['home','content','catalog','category-cards','discovery','creation-story'])await copyFile(join(root,`src/styles/${name}.css`),join(out,`${name}.css`));
// One stylesheet request keeps the shared layout and its page composition atomic.
const styleSources=['tokens','base','components','home','content','category-cards','discovery','creation-story'];
await writeFile(join(out,'site.css'),(await Promise.all(styleSources.map(name=>readFile(join(root,`src/styles/${name}.css`),'utf8')))).join('\n'));
await copyFile(join(root,'src/navigation.js'),join(out,'script.js'));
await copyFile(join(root,'src/exercise.js'),join(out,'exercise.js'));
await copyFile(join(root,'src/discovery.js'),join(out,'discovery.js'));
await copyFile(join(root,'src/sky-scene.js'),join(out,'sky-scene.js'));
await copyFile(join(root,'src/hero-roles.js'),join(out,'hero-roles.js'));
await copyFile(join(root,'src/creation-story.js'),join(out,'creation-story.js'));
await copyFile(join(root,'src/descent-study.js'),join(out,'descent-study.js'));
for(const name of ['style.css','refinements.css','cloud-descent.webp'])await rm(join(out,name),{force:true});
// Content versions let returning visitors keep caching without retaining old styles or navigation logic.
const assetVersions=new Map();
for(const page of ['index.html','explore/index.html','builds/index.html','builds/earth-descent/index.html','about/index.html','scene-test/index.html','components/index.html']){
  const path=join(out,page);
  let html=await readFile(path,'utf8');
  for(const [,href] of html.matchAll(/(?:href|src)="(\/[^"?]+\.(?:css|js))"/g)){
    if(!assetVersions.has(href)){
      const bytes=await readFile(join(out,href));
      assetVersions.set(href,createHash('sha256').update(bytes).digest('hex').slice(0,12));
    }
    html=html.replaceAll(`"${href}"`,`"${href}?v=${assetVersions.get(href)}"`);
  }
  await writeFile(path,html);
}
console.log('Built Home, Explore, Builds, About, and /components/.');
