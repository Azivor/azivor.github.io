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
 if(!gl.getShaderParameter(shader,gl.COMPILE_STATUS))throw new Error(gl.getShaderInfoLog(shader));
 return shader;
}
let gl,progressUniform,resolutionUniform,ready=false,queued=false;
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

try{
 gl=canvas.getContext('webgl2',{alpha:false,antialias:false,powerPreference:'low-power'});
 if(!gl)throw new Error('WebGL2 unavailable');
 const program=gl.createProgram();
 gl.attachShader(program,makeShader(gl,gl.VERTEX_SHADER,vertexSource));
 gl.attachShader(program,makeShader(gl,gl.FRAGMENT_SHADER,fragmentSource));
 gl.linkProgram(program);
 if(!gl.getProgramParameter(program,gl.LINK_STATUS))throw new Error(gl.getProgramInfoLog(program));
 gl.useProgram(program);
 const vao=gl.createVertexArray();
 gl.bindVertexArray(vao);
 const buffer=gl.createBuffer();
 gl.bindBuffer(gl.ARRAY_BUFFER,buffer);
 gl.bufferData(gl.ARRAY_BUFFER,new Float32Array([-1,-1,1,-1,-1,1,1,1]),gl.STATIC_DRAW);
 const location=gl.getAttribLocation(program,'position');
 gl.enableVertexAttribArray(location);
 gl.vertexAttribPointer(location,2,gl.FLOAT,false,0,0);
 progressUniform=gl.getUniformLocation(program,'progress');
 resolutionUniform=gl.getUniformLocation(program,'resolution');
 const loadTexture=(unit,url,name)=>new Promise((resolve,reject)=>{
  const image=new Image();
  image.onload=()=>{
   const texture=gl.createTexture();
   gl.activeTexture(gl.TEXTURE0+unit);
   gl.bindTexture(gl.TEXTURE_2D,texture);
   gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL,true);
   gl.texImage2D(gl.TEXTURE_2D,0,gl.RGB,gl.RGB,gl.UNSIGNED_BYTE,image);
   gl.generateMipmap(gl.TEXTURE_2D);
   gl.texParameteri(gl.TEXTURE_2D,gl.TEXTURE_MIN_FILTER,gl.LINEAR_MIPMAP_LINEAR);
   gl.texParameteri(gl.TEXTURE_2D,gl.TEXTURE_MAG_FILTER,gl.LINEAR);
   gl.texParameteri(gl.TEXTURE_2D,gl.TEXTURE_WRAP_S,gl.REPEAT);
   gl.texParameteri(gl.TEXTURE_2D,gl.TEXTURE_WRAP_T,gl.CLAMP_TO_EDGE);
   const anisotropy=gl.getExtension('EXT_texture_filter_anisotropic');
   if(anisotropy){
    const maximum=gl.getParameter(anisotropy.MAX_TEXTURE_MAX_ANISOTROPY_EXT);
    gl.texParameterf(gl.TEXTURE_2D,anisotropy.TEXTURE_MAX_ANISOTROPY_EXT,Math.min(8,maximum));
   }
   gl.uniform1i(gl.getUniformLocation(program,name),unit);
   resolve();
  };
  image.onerror=()=>reject(new Error(`${url} unavailable`));
  image.src=url;
 });
 const cloudAsset=gl.getParameter(gl.MAX_TEXTURE_SIZE)>=6144
  ?'/earth-clouds-detail.webp':'/earth-clouds.jpg';
 Promise.all([loadTexture(0,'/earth-surface.jpg','surfaceMap'),loadTexture(1,cloudAsset,'cloudMap')]).then(()=>{
  ready=true;document.body.classList.add('scene-model-ready');schedule();
 }).catch(error=>{console.warn('Earth scene:',error);document.documentElement.classList.add('sky-fallback');});
}catch(error){console.warn('Earth scene fallback:',error);document.documentElement.classList.add('sky-fallback');}
function render(){
 queued=false;
 if(!ready||!journey||!stage)return;
 const bounds=journey.getBoundingClientRect();
 const p=reduceMotion.matches?0:clamp(-bounds.top/Math.max(1,bounds.height-innerHeight));
 stage.style.setProperty('--journey-progress',p.toFixed(4));
 updateBrowserBackdrop(p);
 stage.classList.toggle('scene-reveal',p>=.78);
 const hero=document.querySelector('.hero-content');
 if(hero)hero.inert=p>.24&&!reduceMotion.matches;
 const showcase=document.querySelector('.showcase');
 if(showcase)showcase.inert=p<.78&&!reduceMotion.matches;
 const scale=Math.min(devicePixelRatio||1,1);
 const fit=Math.min(1,Math.sqrt(950000/(innerWidth*innerHeight*scale*scale)));
 const width=Math.max(1,Math.round(innerWidth*scale*fit));
 const height=Math.max(1,Math.round(innerHeight*scale*fit));
 if(canvas.width!==width||canvas.height!==height){canvas.width=width;canvas.height=height;gl.viewport(0,0,width,height);}
 gl.uniform2f(resolutionUniform,width,height);
 gl.uniform1f(progressUniform,p);
 gl.drawArrays(gl.TRIANGLE_STRIP,0,4);
}
function schedule(){if(!queued){queued=true;requestAnimationFrame(render);}}
addEventListener('scroll',schedule,{passive:true});
addEventListener('resize',schedule);
addEventListener('pageshow',schedule);
reduceMotion.addEventListener?.('change',schedule);

// Occasional, non-looping meteors, only while the opening is visible.
const meteor=document.querySelector('.shooting-star');
let meteorTimer;
let firstMeteor=true;
function planMeteor(){
 clearTimeout(meteorTimer);
 if(reduceMotion.matches||document.hidden||!meteor)return;
 const delay=firstMeteor?2500+Math.random()*2000:6000+Math.random()*5000;
 firstMeteor=false;
 meteorTimer=setTimeout(()=>{
  const p=Number(stage?.style.getPropertyValue('--journey-progress')||0);
  if(p<.08){
   meteor.style.setProperty('--meteor-x',`${18+Math.random()*52}%`);
   meteor.style.setProperty('--meteor-y',`${8+Math.random()*20}%`);
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
