// Bounded descent study: image-matched opening, then a camera passing through
// several small procedural cloud volumes. Kept separate from the homepage.
const journey = document.querySelector('.journey');
const stage = document.querySelector('.journey-stage');
const canvas = document.querySelector('#sky-scene');
const reduceMotion = matchMedia('(prefers-reduced-motion: reduce)');
const clamp = x => Math.max(0, Math.min(1, x));
const vertexSource = `#version 300 es
in vec2 position;
out vec2 uv;
void main(){uv=position*.5+.5;gl_Position=vec4(position,0.,1.);}`;
const fragmentSource = `#version 300 es
precision highp float;
in vec2 uv;
out vec4 outColor;
uniform vec2 resolution;
uniform float progress;
uniform sampler2D opening;
float hash(vec3 p){p=fract(p*.1031);p+=dot(p,p.yzx+33.33);return fract((p.x+p.y)*p.z);}
float noise(vec3 p){vec3 i=floor(p),f=fract(p);f=f*f*(3.-2.*f);return mix(mix(mix(hash(i),hash(i+vec3(1,0,0)),f.x),mix(hash(i+vec3(0,1,0)),hash(i+vec3(1,1,0)),f.x),f.y),mix(mix(hash(i+vec3(0,0,1)),hash(i+vec3(1,0,1)),f.x),mix(hash(i+vec3(0,1,1)),hash(i+vec3(1,1,1)),f.x),f.y),f.z);}
float fbm(vec3 p){return .55*noise(p)+.3*noise(p*2.04)+.15*noise(p*4.12);}
float cloud(vec3 p){
 float s=1.-length((p-vec3(-3.05,-1.95,4.95))/vec3(1.25,.8,1.0));
 s=max(s,1.-length((p-vec3(-2.0,-1.62,4.65))/vec3(1.35,.95,1.15)));
 s=max(s,1.-length((p-vec3(-.98,-2.06,4.25))/vec3(1.15,.7,1.0)));
 s=max(s,1.-length((p-vec3(1.35,-1.85,4.85))/vec3(1.2,.9,1.1)));
 s=max(s,1.-length((p-vec3(2.35,-1.48,4.45))/vec3(1.35,.9,1.05)));
 s=max(s,1.-length((p-vec3(3.25,-1.9,4.15))/vec3(1.05,.7,.95)));
 s=max(s,1.-length((p-vec3(-1.65,-1.35,1.2))/vec3(1.55,1.05,1.25)));
 s=max(s,1.-length((p-vec3(1.7,-1.1,-.8))/vec3(1.6,1.05,1.3)));
 return smoothstep(.04,.26,s+(fbm(p*1.65)-.5)*.65);
}
vec3 photograph(vec2 point){
 float ratio=resolution.x/resolution.y;
 vec2 crop=point;
 if(ratio<1.7768)crop.x=(point.x-.5)*ratio/1.7768+.5;
 else crop.y=(point.y-.5)*1.7768/ratio+.5;
 float approach=smoothstep(.24,.66,progress);
 crop=(crop-vec2(.5,.25))/(1.+approach*.34)+vec2(.5,.25);
 crop.y-=approach*.105;
 vec3 photo=texture(opening,clamp(crop,vec2(.001),vec2(.999))).rgb;
 float fromTop=1.-point.y;
 float shade=mix(.26,.055,smoothstep(0.,.56,fromTop));
 shade=mix(shade,.35,smoothstep(.56,.86,fromTop));
 shade=mix(shade,.97,smoothstep(.86,1.,fromTop));
 vec3 veil=mix(vec3(.02,.05,.15),vec3(.08,.20,.44),smoothstep(.56,1.,fromTop));
 return mix(photo,veil,shade);
}
void main(){
 float p=clamp(progress,0.,1.);
 vec3 image=photograph(uv);
 float skyBlend=smoothstep(.55,.83,p);
 vec3 sky=mix(vec3(.08,.29,.58),vec3(.43,.72,.91),smoothstep(0.,1.,uv.y));
 sky+=vec3(.1,.12,.13)*pow(max(0.,1.-abs(uv.y-.44)*2.),4.);
 vec3 base=mix(image,sky,skyBlend);
 float travel=smoothstep(.32,.94,p);
 vec3 ro=vec3(travel*.55,-travel*.8,10.5-travel*12.5);
 vec2 screen=(uv-.5)*vec2(resolution.x/resolution.y,1.);
 vec3 rd=normalize(vec3(screen.x*.9,screen.y*.9,-1.5));
 float transmittance=1.;vec3 clouds=vec3(0.);
 float jitter=.5;
 for(int i=0;i<28;i++){
  float t=(float(i)+jitter)*.48;
  vec3 pos=ro+rd*t;
  float density=cloud(pos);
  float shadow=cloud(pos+vec3(.44,.27,.62));
  float light=clamp(.52+(density-shadow)*1.35+pos.y*.015,.16,.95);
  vec3 color=mix(vec3(.17,.34,.58),vec3(.82,.91,.98),light);
  float stepAlpha=1.-exp(-density*.22);
  clouds+=transmittance*stepAlpha*color;
  transmittance*=1.-stepAlpha;
 }
 float cloudCeiling=mix(.51,1.2,smoothstep(.42,.7,p));
 float cloudsVisible=smoothstep(.27,.43,p)*(1.-smoothstep(cloudCeiling-.12,cloudCeiling+.12,uv.y));
 base=mix(base,clouds+base*transmittance,cloudsVisible);
 float atmosphericHaze=smoothstep(.39,.61,p)*(1.-smoothstep(.73,.9,p))*.10;
 base=mix(base,vec3(.56,.73,.89),atmosphericHaze);
 outColor=vec4(base,1.);
}`;
function makeShader(gl, kind, source) {
 const item = gl.createShader(kind);
 gl.shaderSource(item, source);
 gl.compileShader(item);
 if (!gl.getShaderParameter(item,gl.COMPILE_STATUS)) throw new Error(gl.getShaderInfoLog(item));
 return item;
}
let gl, progressUniform, resolutionUniform, photo;
let ready = false;
try {
 gl=canvas.getContext('webgl2',{alpha:false,antialias:false,powerPreference:'low-power'});
 if(!gl) throw new Error('WebGL2 unavailable');
 const program=gl.createProgram();
 gl.attachShader(program,makeShader(gl,gl.VERTEX_SHADER,vertexSource));
 gl.attachShader(program,makeShader(gl,gl.FRAGMENT_SHADER,fragmentSource));
 gl.linkProgram(program);
 if(!gl.getProgramParameter(program,gl.LINK_STATUS)) throw new Error(gl.getProgramInfoLog(program));
 gl.useProgram(program);
 const buffer=gl.createBuffer();
 gl.bindBuffer(gl.ARRAY_BUFFER,buffer);
 gl.bufferData(gl.ARRAY_BUFFER,new Float32Array([-1,-1,1,-1,-1,1,1,1]),gl.STATIC_DRAW);
 const location=gl.getAttribLocation(program,'position');
 gl.enableVertexAttribArray(location);
 gl.vertexAttribPointer(location,2,gl.FLOAT,false,0,0);
 progressUniform=gl.getUniformLocation(program,'progress');
 resolutionUniform=gl.getUniformLocation(program,'resolution');
 gl.uniform1i(gl.getUniformLocation(program,'opening'),0);
 photo=gl.createTexture();
 gl.activeTexture(gl.TEXTURE0);
 gl.bindTexture(gl.TEXTURE_2D,photo);
 gl.texParameteri(gl.TEXTURE_2D,gl.TEXTURE_MIN_FILTER,gl.LINEAR);
 gl.texParameteri(gl.TEXTURE_2D,gl.TEXTURE_MAG_FILTER,gl.LINEAR);
 gl.texParameteri(gl.TEXTURE_2D,gl.TEXTURE_WRAP_S,gl.CLAMP_TO_EDGE);
 gl.texParameteri(gl.TEXTURE_2D,gl.TEXTURE_WRAP_T,gl.CLAMP_TO_EDGE);
 const image=new Image();
 image.onload=()=>{
  gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL,true);
  gl.texImage2D(gl.TEXTURE_2D,0,gl.RGBA,gl.RGBA,gl.UNSIGNED_BYTE,image);
  ready=true;
  document.body.classList.add('scene-photo-ready');
  schedule();
 };
 image.onerror=()=>console.warn('Descent study: opening image unavailable');
 image.src='/space-orbit.webp';
} catch(error) {
 console.warn('Descent study fallback:',error);
 document.documentElement.classList.add('sky-fallback');
}
let queued=false;
function render(){
 queued=false;
 if(!ready||!journey||!stage)return;
 const bounds=journey.getBoundingClientRect();
 const range=Math.max(1,bounds.height-innerHeight);
 const p=reduceMotion.matches?0:clamp(-bounds.top/range);
 stage.style.setProperty('--journey-progress',p.toFixed(4));
 const scale=Math.min(devicePixelRatio||1,innerWidth<700?.8:1);
 const fit=Math.min(1,Math.sqrt(850000/(innerWidth*innerHeight*scale*scale)));
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
