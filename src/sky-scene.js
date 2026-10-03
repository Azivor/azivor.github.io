// Camera ray intersections with a real spherical Earth and a separate cloud shell.
// Texture-mapped globe, cloud shell, and near-camera cloud volume.
const journey=document.querySelector('.journey');
const stage=document.querySelector('.journey-stage');
const canvas=document.querySelector('#sky-scene');
const reduceMotion=matchMedia('(prefers-reduced-motion: reduce)');
const clamp=x=>Math.max(0,Math.min(1,x));
const vertexSource=`#version 300 es
in vec2 position;
out vec2 uv;
void main(){uv=position*.5+.5;gl_Position=vec4(position,0.,1.);}`;
const fragmentSource=`#version 300 es
precision highp float;
in vec2 uv;
out vec4 outColor;
uniform vec2 resolution;
uniform float progress;
uniform sampler2D surfaceMap;
uniform sampler2D cloudMap;
const float PI=3.141592653589793;
const float R=6.371;
float hash(vec2 p){return fract(sin(dot(p,vec2(127.1,311.7)))*43758.5453);}
float hash3(vec3 p){return fract(sin(dot(p,vec3(127.1,311.7,74.7)))*43758.5453);}
float noise3(vec3 p){
 vec3 i=floor(p),f=fract(p);f=f*f*(3.-2.*f);
 float a=mix(hash3(i),hash3(i+vec3(1,0,0)),f.x);
 float b=mix(hash3(i+vec3(0,1,0)),hash3(i+vec3(1,1,0)),f.x);
 float c=mix(hash3(i+vec3(0,0,1)),hash3(i+vec3(1,0,1)),f.x);
 float d=mix(hash3(i+vec3(0,1,1)),hash3(i+vec3(1,1,1)),f.x);
 return mix(mix(a,b,f.y),mix(c,d,f.y),f.z);
}
float hitSphere(vec3 ro,vec3 rd,float radius){
 vec3 q=ro-vec3(0.,-R,0.);
 float b=dot(q,rd),c=dot(q,q)-radius*radius,d=b*b-c;
 if(d<0.)return -1.;
 float t=-b-sqrt(d);
 return t>0.?t:-b+sqrt(d);
}
vec2 earthUv(vec3 normal){
 vec3 center=normalize(vec3(-.925,-.10,-.337));
 vec3 east=normalize(vec3(-center.z,0.,center.x));
 vec3 north=cross(center,east);
 vec3 n=normal.x*east+normal.y*center+normal.z*north;
 return vec2(fract(atan(n.z,n.x)/(2.*PI)+.5),asin(clamp(n.y,-1.,1.))/PI+.5);
}
float cloudSample(vec2 coords){
 // Mirror the latitude within temperate bands to avoid polar-map seams.
 vec2 tile=vec2(fract(coords.x),.18+.64*(1.-abs(fract(coords.y)*2.-1.)));
 return texture(cloudMap,tile).r;
}
vec3 spaceColor(vec3 rd,float descent){
 // Angular positions keep the stars fixed in space while the camera moves.
 vec2 sky=vec2(atan(rd.x,rd.z),asin(rd.y))*110.;
 vec2 cell=floor(sky),within=fract(sky);
 vec2 starPoint=.15+.7*vec2(hash(cell+vec2(4.1,9.3)),hash(cell+vec2(8.7,2.5)));
 float distanceToStar=length(within-starPoint);
 float starShape=1.-smoothstep(.055,.19,distanceToStar);
 float brightness=.31+.48*hash(cell+vec2(13.7,6.2));
 float stars=step(.990,hash(cell))*starShape*brightness;
 stars+=step(.997,hash(cell))*exp(-distanceToStar*distanceToStar*42.)*.08;
 float low=1.-smoothstep(-.22,.22,rd.y);
 stars*=1.-smoothstep(.08,.42,descent);
 stars*=1.-low*.65;
 vec3 atmosphere=mix(vec3(.004,.019,.068),vec3(.035,.09,.26),low);
 atmosphere+=vec3(.08,.12,.23)*smoothstep(.14,.42,descent)*(1.-smoothstep(.18,.7,rd.y));
 return atmosphere+vec3(stars*.78,stars*.87,stars);
}
void main(){
 float p=clamp(progress,0.,1.);
 float altitude=.005+.19*pow(1.-p,2.);
 // Keep the opening globe aligned with its photographic reference, then tip
 // the real camera toward the surface as the scroll begins.
 float pitch=.035+.38*smoothstep(.10,.42,p)+.23*smoothstep(.42,.86,p);
 vec3 ro=vec3(p*.002,altitude,p*.035);
 vec2 screen=(uv-.5)*vec2(resolution.x/resolution.y,1.)*.84;
 vec3 rd=normalize(vec3(screen.x,screen.y-pitch,1.));
 vec3 color=spaceColor(rd,p);
 float groundT=hitSphere(ro,rd,R);
 float cloudT=hitSphere(ro,rd,R+.012);
 vec3 center=vec3(0.,-R,0.);
 if(groundT>0.){
  vec3 normal=normalize(ro+rd*groundT-center);
  vec3 earthData=texture(surfaceMap,earthUv(normal)).rgb;
  float sun=max(0.,dot(normal,normalize(vec3(.85,.42,.32))));
  float land=smoothstep(.09,.22,dot(earthData,vec3(.30,.59,.11)));
  vec3 ocean=mix(vec3(.016,.058,.18),vec3(.057,.205,.48),sun);
  ocean+=vec3(.012,.018,.025)*(noise3(normal*185.)-.5);
  vec3 earth=mix(ocean,earthData*mix(.42,.82,sun),land);
  float distanceHaze=pow(1.-max(0.,dot(normal,-rd)),3.);
  color=mix(earth,vec3(.14,.32,.68),distanceHaze*.66);
 }
 // Multiple curved cloud decks retain the fine satellite structure during
 // approach; displaced samples provide directional self-shadow and parallax.
 for(int layer=0;layer<3;layer++){
  float shell=R+.009+float(layer)*.004;
  float t=hitSphere(ro,rd,shell);
  if(t>0.&&(groundT<0.||t<groundT)){
   vec3 normal=normalize(ro+rd*t-center);
   vec2 world=earthUv(normal);
   vec2 coords=fract(world*vec2(2.6,2.6)+vec2(.413,.173)+float(layer)*vec2(.002,-.001));
   float broad=cloudSample(coords);
   float detail=cloudSample(world*64.+vec2(.21,.37));
   float micro=cloudSample(world*213.+vec2(.53,.29));
   float coverage=clamp(broad*.72+detail*.56+micro*.10,0.,1.);
   float shadow=cloudSample(world*64.+vec2(.211,.369));
   float relief=clamp(.5+(detail-shadow)*2.4,0.,1.);
   float density=smoothstep(.15,.76,coverage);
   density*=mix(.48,.77,smoothstep(.10,.65,p));
   density*=layer==0?1.:.26;
   float light=.27+.46*relief+.18*coverage;
   vec3 cloudColor=mix(vec3(.09,.19,.37),vec3(.87,.93,1.),light);
   cloudColor=mix(cloudColor,vec3(.12,.27,.55),min(.45,t*.10));
   color=mix(color,cloudColor,density);
  }
 }
 vec3 q=ro-center;
 float nearest=length(q+rd*max(0.,-dot(q,rd)));
 float edge=1.-smoothstep(-max(.004,2.*fwidth(nearest)),max(.004,2.*fwidth(nearest)),nearest-R);
 color=mix(spaceColor(rd,p),color,edge);
 float offset=nearest-R;
 float rim=exp(-abs(offset)/.024);
 float glow=exp(-max(0.,offset)/.15);
 vec3 limbColor=mix(vec3(.47,.25,.70),vec3(.53,.80,.99),smoothstep(.02,.96,uv.x));
 float rimBoost=mix(1.,1.4,smoothstep(.48,1.,uv.x));
 color+=limbColor*rimBoost*mix(glow*.16+rim*.28,rim*.16,edge);
 // A restrained atmospheric veil preserves contrast in the cloud deck.
 float air=1.-smoothstep(.012,.085,altitude);
 color=mix(color,vec3(.28,.52,.77),air*.15);
 outColor=vec4(pow(max(color,vec3(0.)),vec3(.94)),1.);
}`;
function makeShader(gl,kind,source){
 const shader=gl.createShader(kind);
 gl.shaderSource(shader,source);
 gl.compileShader(shader);
 if(!gl.getShaderParameter(shader,gl.COMPILE_STATUS)){const message=gl.getShaderInfoLog(shader);gl.deleteShader(shader);throw new Error(message);}
 return shader;
}
let gl,program,progressUniform,resolutionUniform,ready=false,queued=false;
let generation=0,startedAt=0,baseLoadMs=Infinity,detailRequested=false,resources=[];
const pendingImages=new Set();
const sceneStatus=document.querySelector('.scene-status');
const statusText=document.querySelector('.scene-status-text');
const retryButton=document.querySelector('.scene-retry');
const themeColor=document.querySelector('meta[name="theme-color"]');
let lastBackdrop='';
function updateBrowserBackdrop(p){
 // Safari may show the document background behind its translucent controls.
 const amount=Math.round(clamp((p-.78)/.22)*20)/20;
 const from=[8,20,50],to=[217,238,248];
 let color='#'+from.map((start,index)=>Math.round(start+(to[index]-start)*amount).toString(16).padStart(2,'0')).join('');
 if(document.querySelector('footer')?.getBoundingClientRect().top<innerHeight)color='#ffffff';
 if(color===lastBackdrop)return;
 lastBackdrop=color;
 document.documentElement.style.backgroundColor=color;
 document.body.style.backgroundColor=color;
 themeColor?.setAttribute('content',color);
}

// Clip the stationary opening copy at the same spherical limb drawn by the shader.
// The canvas remains behind the HTML so the text and Explore link stay accessible.
function earthCovers(screenX,screenY,p,rect){
 const uvX=(screenX-rect.left)/rect.width;
 const uvY=1-(screenY-rect.top)/rect.height;
 const altitude=.005+.19*(1-p)**2;
 const smooth=(a,b,x)=>{const t=clamp((x-a)/(b-a));return t*t*(3-2*t)};
 const pitch=.035+.38*smooth(.10,.42,p)+.23*smooth(.42,.86,p);
 const dx=(uvX-.5)*(rect.width/rect.height)*.84;
 const dy=(uvY-.5)*.84-pitch;
 const length=Math.hypot(dx,dy,1);
 const ray=[dx/length,dy/length,1/length];
 const q=[p*.002,altitude+6.371,p*.035];
 const b=q[0]*ray[0]+q[1]*ray[1]+q[2]*ray[2];
 const c=q[0]**2+q[1]**2+q[2]**2-6.371**2;
 const discriminant=b*b-c;
 return discriminant>=0&&-b+Math.sqrt(discriminant)>0;
}
function coverHeroWithEarth(hero,p){
 const action=hero.querySelector('.descent-link');
 if(reduceMotion.matches){hero.style.clipPath='';hero.inert=false;if(action)action.inert=false;return;}
 const scene=stage.getBoundingClientRect();
 const box=hero.getBoundingClientRect();
 const horizon=x=>{
  if(!earthCovers(x,scene.bottom,p,scene))return scene.bottom;
  if(earthCovers(x,scene.top,p,scene))return scene.top;
  let upper=scene.top,lower=scene.bottom;
  for(let i=0;i<12;i++){
   const middle=(upper+lower)/2;
   if(earthCovers(x,middle,p,scene))lower=middle;
   else upper=middle;
  }
  return lower;
 };
 const cuts=Array.from({length:49},(_,i)=>clamp((horizon(box.left+box.width*i/48)-box.top-2)/box.height));
 const fullyCovered=cuts.every(y=>y<=0);
 if(cuts.every(y=>y>=1))hero.style.clipPath='';
 else if(fullyCovered)hero.style.clipPath='inset(0 0 100% 0)';
 else hero.style.clipPath=`polygon(0 0,100% 0,${cuts.map((y,i)=>`${(i/48*100).toFixed(2)}% ${(y*100).toFixed(2)}%`).reverse().join(',')})`;
 hero.inert=fullyCovered;
 if(action){
  const button=action.getBoundingClientRect();
  action.inert=fullyCovered||horizon(button.left+button.width/2)<=button.bottom;
 }
}

function resetCopy(){
 const hero=document.querySelector('.hero-content');
 if(hero){hero.style.clipPath='';hero.inert=false;const action=hero.querySelector('.descent-link');if(action)action.inert=false;}
 const showcase=document.querySelector('.showcase');
 if(showcase)showcase.inert=false;
}
function cancelImages(){for(const cancel of [...pendingImages])cancel();}
function releaseResources(){
 if(gl&&!gl.isContextLost())for(const [kind,item] of resources)gl[kind](item);
 resources=[];
}
function failScene(error,attempt=generation){
 if(attempt!==generation)return;
 generation++;ready=false;cancelImages();releaseResources();
 canvas.style.visibility='hidden';
 document.body.classList.remove('scene-model-ready');
 document.documentElement.classList.add('sky-fallback');
 resetCopy();
 if(sceneStatus)sceneStatus.hidden=false;
 if(statusText)statusText.textContent='Earth couldn’t load. You can retry or keep exploring.';
 if(retryButton)retryButton.hidden=false;
 console.warn('Earth scene:',error);
}
function loadImage(url,priority='high'){
 return new Promise((resolve,reject)=>{
  const image=new Image();
  image.fetchPriority=priority;
  const finish=error=>{
   clearTimeout(timer);pendingImages.delete(cancel);
   image.onload=null;image.onerror=null;
   if(error){image.src='';reject(error);}else resolve(image);
  };
  const cancel=()=>finish(new Error('Earth load cancelled'));
  // Allow a slow transfer to complete, but never leave an indefinite blank scene.
  const timer=setTimeout(()=>finish(new Error(`${url} timed out`)),20000);
  pendingImages.add(cancel);
  image.onload=()=>finish();
  image.onerror=()=>finish(new Error(`${url} unavailable`));
  image.src=url;
 });
}
function uploadTexture(unit,image,name){
 let source=image;
 const maximum=gl.getParameter(gl.MAX_TEXTURE_SIZE);
 if(image.width>maximum||image.height>maximum){
  const resized=document.createElement('canvas');
  const ratio=maximum/Math.max(image.width,image.height);
  resized.width=Math.max(1,Math.floor(image.width*ratio));
  resized.height=Math.max(1,Math.floor(image.height*ratio));
  const context=resized.getContext('2d');
  if(!context)throw new Error('Texture resizing unavailable');
  context.drawImage(image,0,0,resized.width,resized.height);source=resized;
 }
 const texture=gl.createTexture();
 if(!texture)throw new Error('Earth texture allocation failed');
 resources.push(['deleteTexture',texture]);
 gl.activeTexture(gl.TEXTURE0+unit);
 gl.bindTexture(gl.TEXTURE_2D,texture);
 gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL,true);
 gl.texImage2D(gl.TEXTURE_2D,0,gl.RGB,gl.RGB,gl.UNSIGNED_BYTE,source);
 gl.generateMipmap(gl.TEXTURE_2D);
 gl.texParameteri(gl.TEXTURE_2D,gl.TEXTURE_MIN_FILTER,gl.LINEAR_MIPMAP_LINEAR);
 gl.texParameteri(gl.TEXTURE_2D,gl.TEXTURE_MAG_FILTER,gl.LINEAR);
 gl.texParameteri(gl.TEXTURE_2D,gl.TEXTURE_WRAP_S,gl.REPEAT);
 gl.texParameteri(gl.TEXTURE_2D,gl.TEXTURE_WRAP_T,gl.CLAMP_TO_EDGE);
 const anisotropy=gl.getExtension('EXT_texture_filter_anisotropic');
 if(anisotropy)gl.texParameterf(gl.TEXTURE_2D,anisotropy.TEXTURE_MAX_ANISOTROPY_EXT,Math.min(8,gl.getParameter(anisotropy.MAX_TEXTURE_MAX_ANISOTROPY_EXT)));
 if(gl.isContextLost()||gl.getError()!==gl.NO_ERROR)throw new Error('Earth texture upload failed');
 gl.uniform1i(gl.getUniformLocation(program,name),unit);
 return texture;
}
function startScene(){
 const attempt=++generation;
 ready=false;cancelImages();releaseResources();detailRequested=false;baseLoadMs=Infinity;
 startedAt=performance.now();
 canvas.style.visibility='hidden';
 document.body.classList.remove('scene-model-ready');
 document.documentElement.classList.remove('sky-fallback');
 resetCopy();
 if(sceneStatus)sceneStatus.hidden=false;
 if(statusText)statusText.textContent='Preparing Earth…';
 if(retryButton)retryButton.hidden=true;
 // Start both real texture requests in parallel, before compiling the shader.
 const images=Promise.all([loadImage('/earth-surface.jpg'),loadImage('/earth-clouds.jpg')]);
 images.then(([surface,clouds])=>{
  if(attempt!==generation)return;
  uploadTexture(0,surface,'surfaceMap');uploadTexture(1,clouds,'cloudMap');
  baseLoadMs=performance.now()-startedAt;ready=true;schedule();
 }).catch(error=>failScene(error,attempt));
 try{
  gl=canvas.getContext('webgl2',{alpha:false,antialias:false,powerPreference:'low-power'});
  if(!gl||gl.isContextLost())throw new Error('WebGL2 unavailable');
  program=gl.createProgram();resources.push(['deleteProgram',program]);
  for(const [kind,source] of [[gl.VERTEX_SHADER,vertexSource],[gl.FRAGMENT_SHADER,fragmentSource]]){
   const shader=makeShader(gl,kind,source);resources.push(['deleteShader',shader]);gl.attachShader(program,shader);
  }
  gl.linkProgram(program);
  if(!gl.getProgramParameter(program,gl.LINK_STATUS))throw new Error(gl.getProgramInfoLog(program));
  gl.useProgram(program);
  const vao=gl.createVertexArray();resources.push(['deleteVertexArray',vao]);gl.bindVertexArray(vao);
  const buffer=gl.createBuffer();resources.push(['deleteBuffer',buffer]);gl.bindBuffer(gl.ARRAY_BUFFER,buffer);
  gl.bufferData(gl.ARRAY_BUFFER,new Float32Array([-1,-1,1,-1,-1,1,1,1]),gl.STATIC_DRAW);
  const location=gl.getAttribLocation(program,'position');
  gl.enableVertexAttribArray(location);gl.vertexAttribPointer(location,2,gl.FLOAT,false,0,0);
  progressUniform=gl.getUniformLocation(program,'progress');resolutionUniform=gl.getUniformLocation(program,'resolution');
  gl.viewport(0,0,canvas.width,canvas.height);
 }catch(error){failScene(error,attempt);}
}
function requestCloudDetail(p){
 const connection=navigator.connection;
 if(detailRequested||p<.18||innerWidth<1000||gl.getParameter(gl.MAX_TEXTURE_SIZE)<6144)return;
 if(connection?.saveData||['slow-2g','2g','3g'].includes(connection?.effectiveType))return;
 if(baseLoadMs>1800)return;
 detailRequested=true;
 const attempt=generation;
 // Detail is optional: the same 3D Earth is already visible and usable.
 gl.activeTexture(gl.TEXTURE0+1);
 const previous=gl.getParameter(gl.TEXTURE_BINDING_2D);
 loadImage('/earth-clouds-detail.webp','low').then(image=>{
  if(attempt!==generation||!ready)return;
  try{
   uploadTexture(1,image,'cloudMap');
   if(previous){gl.deleteTexture(previous);resources=resources.filter(([,item])=>item!==previous);}
   schedule();
  }catch(error){
   if(gl.isContextLost()){failScene(error,attempt);return;}
   // Keep the working base texture if the optional enhancement cannot upload.
   gl.activeTexture(gl.TEXTURE0+1);gl.bindTexture(gl.TEXTURE_2D,previous);
   console.warn('Earth detail:',error);
  }
 }).catch(error=>{if(attempt===generation)console.warn('Earth detail:',error);});
}
canvas.addEventListener('webglcontextlost',event=>{
 event.preventDefault();failScene(new Error('Graphics context lost'));
});
canvas.addEventListener('webglcontextrestored',startScene);
retryButton?.addEventListener('click',()=>{
 if(gl?.isContextLost()){
  const recovery=gl.getExtension('WEBGL_lose_context');
  if(recovery){recovery.restoreContext();return;}
 }
 startScene();
});
startScene();

function render(){
 queued=false;
 if(!ready||!journey||!stage)return;
 const bounds=journey.getBoundingClientRect();
 const p=reduceMotion.matches?0:clamp(-bounds.top/Math.max(1,bounds.height-innerHeight));
 stage.style.setProperty('--journey-progress',p.toFixed(4));
 updateBrowserBackdrop(p);
 stage.classList.toggle('scene-reveal',p>=.78);
 const hero=document.querySelector('.hero-content');
 if(hero)coverHeroWithEarth(hero,p);
 const showcase=document.querySelector('.showcase');
 if(showcase)showcase.inert=p<.78&&!reduceMotion.matches;
 const scale=Math.min(devicePixelRatio||1,1);
 const fit=Math.min(1,Math.sqrt(950000/(innerWidth*innerHeight*scale*scale)));
 const width=Math.max(1,Math.round(innerWidth*scale*fit));
 const height=Math.max(1,Math.round(innerHeight*scale*fit));
 if(canvas.width!==width||canvas.height!==height){canvas.width=width;canvas.height=height;gl.viewport(0,0,width,height);}
 try{
  gl.uniform2f(resolutionUniform,width,height);
  gl.uniform1f(progressUniform,p);
  gl.drawArrays(gl.TRIANGLE_STRIP,0,4);
  if(gl.isContextLost()||gl.getError()!==gl.NO_ERROR)throw new Error('Earth draw failed');
  if(!document.body.classList.contains('scene-model-ready')){
   // Reveal only a successfully painted frame, never an uninitialized canvas.
   canvas.style.visibility='visible';document.body.classList.add('scene-model-ready');
   if(sceneStatus)sceneStatus.hidden=true;
  }
  requestCloudDetail(p);
 }catch(error){failScene(error);}
}
function schedule(){if(!queued){queued=true;requestAnimationFrame(render);}}
addEventListener('scroll',schedule,{passive:true});
addEventListener('resize',schedule);
addEventListener('pageshow',schedule);
reduceMotion.addEventListener?.('change',schedule);

// Occasional, non-looping meteors, only while the opening is visible.
const meteor=document.querySelector('.shooting-star');
let meteorTimer;
function planMeteor(){
 clearTimeout(meteorTimer);
 if(reduceMotion.matches||document.hidden||!meteor)return;
 const delay=3000+Math.random()*1000;
 meteorTimer=setTimeout(()=>{
  const p=Number(stage?.style.getPropertyValue('--journey-progress')||0);
  if(p<.08){
   const direction=Math.random()<.5?1:-1;
   const horizontal=130+Math.random()*60;
   const vertical=25+Math.random()*13;
   const angle=Math.atan2(vertical,horizontal)*180/Math.PI;
   meteor.style.setProperty('--meteor-x',`${direction>0?16+Math.random()*34:50+Math.random()*34}%`);
   meteor.style.setProperty('--meteor-y',`${8+Math.random()*22}%`);
   meteor.style.setProperty('--meteor-dx',`${direction*horizontal}px`);
   meteor.style.setProperty('--meteor-dy',`${vertical}px`);
   meteor.style.setProperty('--meteor-angle',`${direction*angle}deg`);
   meteor.style.setProperty('--meteor-gradient',direction>0?'90deg':'270deg');
   meteor.style.setProperty('--meteor-origin',direction>0?'right center':'left center');
   meteor.style.setProperty('--meteor-length',`${60+Math.random()*55}px`);
   meteor.style.setProperty('--meteor-duration',`${.95+Math.random()*.4}s`);
   meteor.classList.remove('is-shooting');
   requestAnimationFrame(()=>meteor.classList.add('is-shooting'));
  }
  planMeteor();
 },delay);
}
meteor?.addEventListener('animationend',()=>meteor.classList.remove('is-shooting'));
document.addEventListener('visibilitychange',planMeteor);
reduceMotion.addEventListener?.('change',()=>{meteor?.classList.remove('is-shooting');planMeteor();});
planMeteor();
