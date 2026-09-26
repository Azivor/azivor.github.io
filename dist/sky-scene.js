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
 float altitude=.004+.42*pow(1.-p,2.);
 // Keep the opening globe aligned with its photographic reference, then tip
 // the real camera toward the surface as the scroll begins.
 float pitch=.045+.52*smoothstep(.13,.30,p)+.15*smoothstep(.30,.82,p);
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
 if(cloudT>0.&&(groundT<0.||cloudT<groundT)){
  vec3 normal=normalize(ro+rd*cloudT-center);
  vec2 coords=earthUv(normal)+vec2(.82+p*.0006,.01);
  float coverage=texture(cloudMap,coords).r;
  float fine=noise3(normal*780.);
  coverage=clamp(coverage+(fine-.5)*.22,0.,1.);
  float density=smoothstep(.33,.76,coverage)*mix(.39,.86,smoothstep(.20,.72,p));
  float shadow=texture(cloudMap,coords+vec2(.0016,-.0008)).r;
  float relief=clamp(.5+(coverage-shadow)*1.9,0.,1.);
  float light=clamp(.36+.45*max(0.,dot(normal,normalize(vec3(.85,.42,.32))))+.26*relief,0.,1.);
  vec3 cloudColor=mix(vec3(.055,.14,.32),vec3(.76,.84,.96),light);
  cloudColor*=mix(.82,1.12,smoothstep(.32,.72,fine));
  cloudColor=mix(cloudColor,vec3(.82,.91,.98),smoothstep(.30,.75,p)*.55);
  color=mix(color,cloudColor,density);
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
 // Small volume within the cloud altitude band. World-space samples create
 // proper occlusion and near/far parallax as the camera passes through it.
 if(p>.58){
  float distanceLimit=min(groundT>0.?groundT:.8,.8);
  float visibility=smoothstep(.58,.78,p);
  float transmittance=1.;
  vec3 scattered=vec3(0.);
  for(int i=0;i<10;i++){
   float t=(float(i)+.5)*distanceLimit/10.;
   vec3 pos=ro+rd*t;
   float height=length(pos-center)-R;
   float band=smoothstep(.001,.004,height)*(1.-smoothstep(.028,.042,height));
   float shape=.24*noise3(pos*28.)+.34*noise3(pos*96.)+.27*noise3(pos*210.)+.15*noise3(pos*420.);
   float mass=1.-length((pos-vec3(-.028,.010,.054))/vec3(.023,.014,.029));
   mass=max(mass,1.-length((pos-vec3(.024,.008,.081))/vec3(.029,.013,.037)));
   mass=max(mass,1.-length((pos-vec3(-.012,.007,.070))/vec3(.022,.012,.030)));
   mass=max(mass,1.-length((pos-vec3(.006,.006,.052))/vec3(.016,.010,.022)));
   mass=max(mass,1.-length((pos-vec3(-.030,.012,.136))/vec3(.038,.017,.050)));
   mass=max(mass,1.-length((pos-vec3(.034,.011,.119))/vec3(.037,.016,.045)));
   float density=max(smoothstep(.57,.70,shape)*.10,smoothstep(.43,.68,mass+(shape-.5)*2.0))*band*visibility;
   float alpha=1.-exp(-density*1.2);
   float light=clamp(.28+.36*noise3(pos*37.+vec3(.7,1.5,.4))+.30*clamp((height-.006)/.026,0.,1.)+.22*(shape-.5),0.,1.);
   vec3 cloudLight=mix(vec3(.24,.44,.70),vec3(.94,.97,1.),light);
   scattered+=transmittance*alpha*cloudLight;
   transmittance*=1.-alpha;
  }
  color=scattered+transmittance*color;
 }
 float air=1.-smoothstep(.028,.11,altitude);
 color=mix(color,vec3(.20,.49,.78),air*.43);
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
   gl.generateMipmap(gl.TEXTURE_2D);
   gl.texParameteri(gl.TEXTURE_2D,gl.TEXTURE_MIN_FILTER,gl.LINEAR_MIPMAP_LINEAR);
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
 stage.classList.toggle('scene-reveal',p>=.78);
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
