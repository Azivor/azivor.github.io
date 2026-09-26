// Camera ray intersections with a real spherical Earth and a separate cloud shell.
// NASA global maps provide surface detail; the opening photo is never sampled.
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
vec3 spaceColor(vec3 rd,float descent){
 vec2 cell=floor(vec2(atan(rd.x,rd.z),asin(rd.y))*vec2(820.,720.));
 float stars=step(.99915,hash(cell))*pow(hash(cell+13.7),2.)*.42*(1.-smoothstep(.08,.38,descent));
 float low=1.-smoothstep(-.6,.11,rd.y);
 return mix(vec3(.002,.006,.025),vec3(.014,.035,.102),low)+vec3(stars);
}
void main(){
 float p=clamp(progress,0.,1.);
 float altitude=.004+.146*pow(1.-p,2.);
 float pitch=mix(.004,.63,smoothstep(.07,.94,p));
 vec3 ro=vec3(0.,altitude,0.);
 vec2 screen=(uv-.5)*vec2(resolution.x/resolution.y,1.)*.84;
 vec3 rd=normalize(vec3(screen.x,screen.y-pitch,1.));
 vec3 color=spaceColor(rd,p);
 float groundT=hitSphere(ro,rd,R);
 float cloudT=hitSphere(ro,rd,R+.012);
 float atmosphereT=hitSphere(ro,rd,R+.075);
 vec3 center=vec3(0.,-R,0.);
 if(groundT>0.){
  vec3 normal=normalize(ro+rd*groundT-center);
  vec3 earth=texture(surfaceMap,earthUv(normal)).rgb;
  float sun=max(0.,dot(normal,normalize(vec3(-.22,.77,.58))));
  earth*=mix(.25,.72,sun);
  earth=mix(earth,vec3(.018,.075,.22),.32);
  float distanceHaze=pow(1.-max(0.,dot(normal,-rd)),3.);
  color=mix(earth,vec3(.055,.17,.42),distanceHaze*.52);
 }
 if(cloudT>0.&&(groundT<0.||cloudT<groundT)){
  vec3 normal=normalize(ro+rd*cloudT-center);
  vec2 coords=earthUv(normal)+vec2(p*.0006,0.);
  float coverage=texture(cloudMap,coords).r;
  float density=smoothstep(.29,.92,coverage)*mix(.16,.55,smoothstep(.12,.72,p));
  float light=.40+.55*max(0.,dot(normal,normalize(vec3(-.22,.77,.58))));
  vec3 cloudColor=mix(vec3(.14,.27,.49),vec3(.72,.84,.95),light);
  color=mix(color,cloudColor,density);
 }
 vec3 q=ro-center;
 float nearest=length(q+rd*max(0.,-dot(q,rd)));
 float edge=1.-smoothstep(-2.*fwidth(nearest),2.*fwidth(nearest),nearest-R);
 color=mix(spaceColor(rd,p),color,edge);
 float heightAbove=max(0.,nearest-R);
 float limb=exp(-heightAbove/.028)*step(0.,atmosphereT);
 vec3 limbColor=mix(vec3(.35,.27,.68),vec3(.30,.67,.97),smoothstep(-.7,.8,rd.x));
 color+=limbColor*limb*(groundT>0.?.32:.45);
 // Small volume within the cloud altitude band. World-space samples create
 // proper occlusion and near/far parallax as the camera passes through it.
 if(p>.43){
  float distanceLimit=min(groundT>0.?groundT:.8,.8);
  float visibility=smoothstep(.43,.68,p);
  float transmittance=1.;
  vec3 scattered=vec3(0.);
  for(int i=0;i<10;i++){
   float t=(float(i)+.5)*distanceLimit/10.;
   vec3 pos=ro+rd*t;
   float height=length(pos-center)-R;
   float band=smoothstep(.006,.014,height)*(1.-smoothstep(.031,.044,height));
   float shape=.48*noise3(pos*28.)+.35*noise3(pos*57.)+.17*noise3(pos*117.);
   float density=smoothstep(.49,.67,shape)*band*visibility;
   float alpha=1.-exp(-density*.42);
   float light=.47+.48*noise3(pos*19.+vec3(.7,1.5,.4));
   vec3 cloudLight=mix(vec3(.28,.48,.72),vec3(.91,.96,1.),light);
   scattered+=transmittance*alpha*cloudLight;
   transmittance*=1.-alpha;
  }
  color=scattered+transmittance*color;
 }
 float air=1.-smoothstep(.028,.11,altitude);
 color=mix(color,vec3(.12,.34,.70),air*.25);
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
   gl.texParameteri(gl.TEXTURE_2D,gl.TEXTURE_MIN_FILTER,gl.LINEAR);
   gl.texParameteri(gl.TEXTURE_2D,gl.TEXTURE_MAG_FILTER,gl.LINEAR);
   gl.texParameteri(gl.TEXTURE_2D,gl.TEXTURE_WRAP_S,gl.REPEAT);
   gl.texParameteri(gl.TEXTURE_2D,gl.TEXTURE_WRAP_T,gl.CLAMP_TO_EDGE);
   gl.uniform1i(gl.getUniformLocation(program,name),unit);
   resolve();
  };
  image.onerror=()=>reject(new Error(`${url} unavailable`));
  image.src=url;
 });
 Promise.all([loadTexture(0,'/earth-surface.jpg','surfaceMap'),loadTexture(1,'/earth-clouds.jpg','cloudMap')]).then(()=>{
  ready=true;document.body.classList.add('scene-model-ready');schedule();
 }).catch(error=>console.warn('Earth scene:',error));
}catch(error){console.warn('Earth scene fallback:',error);document.documentElement.classList.add('sky-fallback');}
function render(){
 queued=false;
 if(!ready||!journey||!stage)return;
 const bounds=journey.getBoundingClientRect();
 const p=reduceMotion.matches?0:clamp(-bounds.top/Math.max(1,bounds.height-innerHeight));
 stage.style.setProperty('--journey-progress',p.toFixed(4));
 const scale=Math.min(devicePixelRatio||1,innerWidth<700?.8:1);
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
