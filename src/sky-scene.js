const section = document.querySelector('.journey');
const canvas = document.querySelector('#sky-scene');
const stage = document.querySelector('.journey-stage');
const reducedMotion = matchMedia('(prefers-reduced-motion: reduce)');
const clamp = (x, a = 0, b = 1) => Math.min(b, Math.max(a, x));
const vertex = `#version 300 es
in vec2 position;
out vec2 uv;
void main(){uv=position*.5+.5;gl_Position=vec4(position,0.,1.);}`;
const fragment = `#version 300 es
precision highp float;
in vec2 uv;
out vec4 outColor;
uniform vec2 resolution;
uniform float progress;
#define PI 3.14159265
const float R=100.;
float hash(vec3 p){p=fract(p*.1031);p+=dot(p,p.yzx+33.33);return fract((p.x+p.y)*p.z);}
float noise(vec3 p){vec3 i=floor(p),f=fract(p);f=f*f*(3.-2.*f);return mix(mix(mix(hash(i),hash(i+vec3(1,0,0)),f.x),mix(hash(i+vec3(0,1,0)),hash(i+vec3(1,1,0)),f.x),f.y),mix(mix(hash(i+vec3(0,0,1)),hash(i+vec3(1,0,1)),f.x),mix(hash(i+vec3(0,1,1)),hash(i+vec3(1,1,1)),f.x),f.y),f.z);}
float fbm(vec3 p){return .55*noise(p)+.3*noise(p*2.03)+.15*noise(p*4.1);}
vec2 sphere(vec3 ro,vec3 rd,float radius){float b=dot(ro,rd);float c=dot(ro,ro)-radius*radius;float h=b*b-c;if(h<0.)return vec2(-1.);h=sqrt(h);return vec2(-b-h,-b+h);}
float cloud(vec3 p){float h=length(p)-R;float envelope=smoothstep(.43,.75,h)*(1.-smoothstep(2.15,2.6,h));float n=fbm(p*.39+vec3(0.,0.,5.));float macro=noise(p*.085);return envelope*smoothstep(.49,.62,n*.70+macro*.30);}
vec3 stars(vec3 rd){vec3 p=rd*230.;vec3 cell=floor(p);float seed=hash(cell);float star=step(.996,seed)*pow(1.-length(fract(p)-.5)*1.8,15.);return vec3(star)*(.45+.55*hash(cell+13.));}
void main(){
 float p=clamp(progress,0.,1.);
 float altitude=exp(mix(log(19.),log(.33),smoothstep(.12,.94,p)));
 float pitch=mix(radians(16.),radians(36.),smoothstep(.08,.7,p));
 pitch=mix(pitch,radians(-8.),smoothstep(.70,1.,p));
 float travel=mix(0.,24.,p);
 vec3 ro=vec3(travel,0.,R+altitude);
 vec3 forward=normalize(vec3(.84,0.,-sin(pitch)));
 vec3 right=vec3(0.,1.,0.);
 vec3 up=normalize(cross(forward,right));
 vec2 xy=(uv*2.-1.)*vec2(resolution.x/resolution.y,1.);
 vec3 rd=normalize(forward+xy.x*right*.7+xy.y*up*.7);
 float groundT=sphere(ro,rd,R).x;
 float closest=length(ro+rd*max(0.,-dot(ro,rd)))-R;
 float air=exp(-altitude/4.6);
 vec3 col=vec3(.009,.019,.073)+stars(rd)*(1.-smoothstep(2.,10.,altitude)*.3);
 float limb=exp(-pow(max(closest,0.)/2.2,1.3));
 col+=vec3(.08,.25,.62)*limb*(1.-air*.5);
 col+=vec3(.13,.33,.74)*pow(limb,3.)*.8;
 vec3 skyTop=mix(vec3(.035,.19,.48),vec3(.12,.39,.70),smoothstep(.7,1.,p)),skyLow=mix(vec3(.25,.59,.88),vec3(.51,.79,.96),smoothstep(.7,1.,p));
 float horizon=smoothstep(-.43,.18,rd.z);
 vec3 sky=mix(skyLow,skyTop,horizon);
 sky+=vec3(.11,.18,.20)*pow(max(dot(rd,normalize(vec3(.6,.1,.6))),0.),24.);
 col=mix(col,sky,air*(.76+.24*smoothstep(-.3,.3,rd.z)));
 if(groundT>0.){
  vec3 hit=ro+rd*groundT;
  float surface=fbm(hit*.075);
  vec3 ocean=mix(vec3(.018,.083,.23),vec3(.055,.24,.51),surface);
  float groundCloud=smoothstep(.48,.69,fbm(hit*.17+vec3(0,0,5.)));
  ocean=mix(ocean,vec3(.39,.58,.77),groundCloud*.35);
  float haze=exp(-max(groundT,0.)*.012)*(.65+.35*air);
  col=mix(col,ocean,haze);
 }
 vec2 outer=sphere(ro,rd,R+2.6);
 if(outer.y>0.){
  float start=max(0.,outer.x),end=outer.y;
  if(groundT>0.)end=min(end,groundT);
  float span=max(0.,end-start);
  float alpha=0.;vec3 clouds=vec3(0.);
  float jitter=hash(vec3(gl_FragCoord.xy,17.));
  for(int i=0;i<32;i++){
   float t=start+(float(i)+jitter)*span/32.;
   vec3 pos=ro+rd*t;
   float d=cloud(pos);
   float localAlpha=1.-exp(-d*span*1.55/32.);
   float shadow=cloud(pos+normalize(vec3(.6,.1,.6))*.85);
   float lit=clamp(.47+(d-shadow)*2.3+dot(normalize(pos),normalize(vec3(.6,.1,.6)))*.23,0.,1.);
   vec3 cloudColor=mix(vec3(.18,.34,.56),vec3(.94,.97,1.),lit);
   cloudColor+=vec3(.06,.10,.12)*pow(max(dot(rd,normalize(vec3(.6,.1,.6))),0.),6.);
   clouds+=(1.-alpha)*localAlpha*cloudColor;
   alpha+=(1.-alpha)*localAlpha;
  }
  col=mix(col,clouds/max(alpha,.0001),alpha);
 }
 col=mix(col,vec3(.39,.69,.90),smoothstep(.83,1.,p)*.13);
 col=pow(max(col,0.),vec3(.93));
 outColor=vec4(col,1.);
}`;
function shader(gl, type, source) {
  const item = gl.createShader(type);
  gl.shaderSource(item, source);
  gl.compileShader(item);
  if (!gl.getShaderParameter(item, gl.COMPILE_STATUS)) throw new Error(gl.getShaderInfoLog(item));
  return item;
}
let gl, program, progressLocation, resolutionLocation;
try {
  gl = canvas.getContext('webgl2', {alpha:false,antialias:false,powerPreference:'low-power'});
  if (!gl) throw new Error('WebGL2 unavailable');
  program = gl.createProgram();
  gl.attachShader(program, shader(gl, gl.VERTEX_SHADER, vertex));
  gl.attachShader(program, shader(gl, gl.FRAGMENT_SHADER, fragment));
  gl.linkProgram(program);
  if (!gl.getProgramParameter(program, gl.LINK_STATUS)) throw new Error(gl.getProgramInfoLog(program));
  gl.useProgram(program);
  const buffer = gl.createBuffer();
  gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
  gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1,-1,1,-1,-1,1,1,1]), gl.STATIC_DRAW);
  const location = gl.getAttribLocation(program, 'position');
  gl.enableVertexAttribArray(location);
  gl.vertexAttribPointer(location, 2, gl.FLOAT, false, 0, 0);
  progressLocation = gl.getUniformLocation(program, 'progress');
  resolutionLocation = gl.getUniformLocation(program, 'resolution');
  document.documentElement.classList.add('sky-ready');
} catch (error) {
  console.warn('Sky scene fallback:', error);
  document.documentElement.classList.add('sky-fallback');
}
let scheduled = false;
function render() {
  scheduled = false;
  if (!section || !stage || !gl) return;
  const rect = section.getBoundingClientRect();
  const range = Math.max(1, rect.height - innerHeight);
  const p = reducedMotion.matches ? 0 : clamp(-rect.top/range);
  stage.style.setProperty('--journey-progress', p.toFixed(4));
  stage.classList.toggle('scene-reveal', p >= .78);
  const scale = Math.min(devicePixelRatio || 1, innerWidth < 700 ? 1 : 1.2);
  const maxPixels = 1350000;
  const fit = Math.min(1, Math.sqrt(maxPixels/(innerWidth*innerHeight*scale*scale)));
  const width = Math.max(1, Math.round(innerWidth*scale*fit));
  const height = Math.max(1, Math.round(innerHeight*scale*fit));
  if (canvas.width !== width || canvas.height !== height) {
    canvas.width = width; canvas.height = height;
    gl.viewport(0,0,width,height);
  }
  gl.uniform2f(resolutionLocation,width,height);
  gl.uniform1f(progressLocation,p);
  gl.drawArrays(gl.TRIANGLE_STRIP,0,4);
}
function schedule(){if(!scheduled){scheduled=true;requestAnimationFrame(render);}}
addEventListener('scroll',schedule,{passive:true});
addEventListener('resize',schedule);
reducedMotion.addEventListener?.('change',schedule);
addEventListener('pageshow',schedule);
schedule();
