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
 float stars=step(.9987,hash(cell))*pow(hash(cell+13.7),2.)*.55*(1.-smoothstep(.08,.38,descent));
 float low=smoothstep(.11,-.6,rd.y);
 return mix(vec3(.002,.006,.025),vec3(.014,.035,.102),low)+vec3(stars);
}
void main(){
 float p=clamp(progress,0.,1.);
 float altitude=mix(.15,.007,pow(p,1.27));
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
  earth*=mix(.34,.96,sun);
  earth=mix(earth,vec3(.025,.13,.33),.18);
  float distanceHaze=pow(1.-max(0.,dot(normal,-rd)),3.);
  color=mix(earth,vec3(.19,.39,.73),distanceHaze*.64);
 }
 if(cloudT>0.&&(groundT<0.||cloudT<groundT)){
  vec3 normal=normalize(ro+rd*cloudT-center);
  vec2 coords=earthUv(normal)+vec2(p*.0006,0.);
  float coverage=texture(cloudMap,coords).r;
  float density=smoothstep(.16,.88,coverage)*.78;
  float light=.40+.55*max(0.,dot(normal,normalize(vec3(-.22,.77,.58))));
  vec3 cloudColor=mix(vec3(.21,.38,.65),vec3(.88,.94,1.),light);
  color=mix(color,cloudColor,density);
 }
 vec3 q=ro-center;
 float nearest=length(q+rd*max(0.,-dot(q,rd)));
 float heightAbove=max(0.,nearest-R);
 float limb=exp(-heightAbove/.028)*step(0.,atmosphereT);
 vec3 limbColor=mix(vec3(.35,.27,.68),vec3(.30,.67,.97),smoothstep(-.7,.8,rd.x));
 color+=limbColor*limb*(groundT>0.?.32:.45);
 float air=smoothstep(.11,.028,altitude);
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
 gl.bufferData(gl.ARRAY_BUFFER,new Float32Array([-1,-1,1,-1,-1,1,1]),gl.STATIC_DRAW);
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
   canvas.dataset.textureError=String(gl.getError());
   resolve();
  };
  image.onerror=()=>reject(new Error(`${url} unavailable`));
  image.src=url;
 });
 Promise.all([loadTexture(0,'/earth-surface.jpg','surfaceMap'),loadTexture(1,'/earth-clouds.jpg','cloudMap')]).then(()=>{
  gl.validateProgram(program);
  canvas.dataset.validation=String(gl.getProgramParameter(program,gl.VALIDATE_STATUS));
  canvas.dataset.programLog=gl.getProgramInfoLog(program)||'';
  canvas.dataset.samplers=JSON.stringify([gl.getUniform(program,gl.getUniformLocation(program,'surfaceMap')),gl.getUniform(program,gl.getUniformLocation(program,'cloudMap'))]);
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
 canvas.dataset.uniformError=String(gl.getError());
 gl.drawArrays(gl.TRIANGLE_STRIP,0,4);
 canvas.dataset.glError=String(gl.getError());
 canvas.dataset.progress=p.toFixed(4);
}
function schedule(){if(!queued){queued=true;requestAnimationFrame(render);}}
addEventListener('scroll',schedule,{passive:true});
addEventListener('resize',schedule);
addEventListener('pageshow',schedule);
reduceMotion.addEventListener?.('change',schedule);
