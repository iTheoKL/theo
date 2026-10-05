(() => {
  'use strict';
  const archivedWorkIds = ['threatlens', 'medbridge', 'aether-l3'];
  const archivedIds = [...archivedWorkIds, 'medbridge-post-mortem', 'ravenclaw-creed-intellectual-moat'];
  if (!document.body.classList.contains('archive-page') && archivedIds.includes(location.hash.slice(1))) {
    const hash = location.hash === '#aether-l3' ? '#work' : location.hash;
    location.replace((archivedWorkIds.includes(location.hash.slice(1)) ? 'systems.html' : 'papers.html') + hash);
    return;
  }
  const canvas = document.getElementById('toxin-field');
  const gl = canvas.getContext('webgl', { alpha: false, antialias: false, powerPreference: 'low-power' });
  const name = document.querySelector('.name');
  let pointer = [0, 0], scroll = window.scrollY, active = true;
  addEventListener('pointermove', e => { pointer = [e.clientX / innerWidth - .5, e.clientY / innerHeight - .5]; }, { passive: true });
  addEventListener('scroll', () => {
    scroll = window.scrollY;
    if (name) { name.style.setProperty('--name-y', `${Math.min(scroll, innerHeight) * .18}px`); name.style.setProperty('--name-opacity', Math.max(0, 1 - scroll / innerHeight).toFixed(3)); }
  }, { passive: true });
  const links = [...document.querySelectorAll('nav a')];
  const observer = new IntersectionObserver(entries => {
    entries.forEach(entry => { if (entry.isIntersecting) links.forEach(link => { if (link.hash === '#' + entry.target.id) link.setAttribute('aria-current', 'location'); else link.removeAttribute('aria-current'); }); });
  }, { rootMargin: '-15% 0px -50% 0px' });
  if (!document.body.classList.contains('archive-page')) document.querySelectorAll('main>section[id]').forEach(section => observer.observe(section));
  if (!gl) { canvas.hidden = true; return; }
  const vertex = `attribute vec2 position;void main(){gl_Position=vec4(position,0.,1.);}`;
  const fragment = `precision mediump float;
uniform vec2 size;uniform float time;uniform float travel;uniform vec2 pointer;
float hash(vec2 p){return fract(sin(dot(p,vec2(127.1,311.7)))*43758.5453);}
float noise(vec2 p){vec2 i=floor(p),f=fract(p);f=f*f*(3.-2.*f);return mix(mix(hash(i),hash(i+vec2(1,0)),f.x),mix(hash(i+vec2(0,1)),hash(i+vec2(1,1)),f.x),f.y);}
float fbm(vec2 p){float n=0.;float a=.5;for(int i=0;i<5;i++){n+=a*noise(p);p=mat2(.8,-.6,.6,.8)*p*2.03+3.7;a*=.5;}return n;}
void main(){vec2 uv=gl_FragCoord.xy/size;vec2 p=(uv-.5)*vec2(size.x/size.y,1.);p+=pointer*.025;float t=time*.075;float s=travel*.22;
vec3 col=vec3(.011,.020,.017);float haze=0.;float edge=0.;
for(int i=0;i<3;i++){float k=float(i);vec2 q=p*(1.+k*.35);q.y+=s*(.25+k*.15);q.x+=sin(t*.5+k)*.05;
float warp=fbm(q*3.+vec2(t*.3,-t*.5)+k*5.);float path=.42*sin(q.y*3.8+s*.5+k*1.9+t*.22)+.2*cos(q.y*7.-t*.4+k)+.28;
float d=abs(q.x-path+(warp-.5)*.19);float width=.12+.09*fbm(q*4.+t);float band=exp(-d*d/(width*width));float f=fbm(q*8.+vec2(warp*2.-t,t*.6));float folds=fbm(q*16.+vec2(f*3.,-t*.8));
haze+=band*f*(.42+k*.13);edge+=exp(-pow((d-width*.66)*25.,2.))*pow(folds,2.)*.75;
}
float clear=1.-.86*exp(-dot(p-vec2(-.23,0),p-vec2(-.23,0))*4.5);haze*=clear;
col+=vec3(.12,.245,.15)*haze;col+=vec3(.27,.43,.22)*edge*clear;
float mist=fbm(p*2.+vec2(t*.13,-s*.3));col+=vec3(.009,.020,.014)*mist;
float vignette=1.-smoothstep(.12,1.1,length((uv-.5)*vec2(.9,1.)));col*=.65+.35*vignette;
gl_FragColor=vec4(col,1.);}`;
  function shader(type, source) { const result = gl.createShader(type); gl.shaderSource(result, source); gl.compileShader(result); if (!gl.getShaderParameter(result, gl.COMPILE_STATUS)) throw Error(gl.getShaderInfoLog(result)); return result; }
  let program;
  try { program = gl.createProgram(); gl.attachShader(program, shader(gl.VERTEX_SHADER, vertex)); gl.attachShader(program, shader(gl.FRAGMENT_SHADER, fragment)); gl.linkProgram(program); if (!gl.getProgramParameter(program, gl.LINK_STATUS)) throw Error('Atmosphere unavailable'); }
  catch (error) { canvas.hidden = true; return; }
  gl.useProgram(program);
  const buffer = gl.createBuffer(); gl.bindBuffer(gl.ARRAY_BUFFER, buffer); gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1,-1,1,-1,-1,1,-1,1,1,-1,1,1]),gl.STATIC_DRAW);
  const position = gl.getAttribLocation(program,'position'); gl.enableVertexAttribArray(position); gl.vertexAttribPointer(position,2,gl.FLOAT,false,0,0);
  const uniforms = Object.fromEntries(['size','time','travel','pointer'].map(key=>[key,gl.getUniformLocation(program,key)]));
  function resize(){const ratio=Math.min(devicePixelRatio,1);const scale=Math.min(1,1400/innerWidth);canvas.width=Math.round(innerWidth*ratio*scale);canvas.height=Math.round(innerHeight*ratio*scale);gl.viewport(0,0,canvas.width,canvas.height);}
  addEventListener('resize',resize);resize();let previous=0;let animation;
  function frame(now){if(!active)return;animation=requestAnimationFrame(frame);if(now-previous<32)return;previous=now;gl.uniform2f(uniforms.size,canvas.width,canvas.height);gl.uniform1f(uniforms.time,now*.001);gl.uniform1f(uniforms.travel,scroll/innerHeight);gl.uniform2f(uniforms.pointer,...pointer);gl.drawArrays(gl.TRIANGLES,0,6);}
  animation=requestAnimationFrame(frame);
  document.addEventListener('visibilitychange',()=>{active=!document.hidden;cancelAnimationFrame(animation);if(active)animation=requestAnimationFrame(frame);});
  canvas.addEventListener('webglcontextlost',event=>{event.preventDefault();active=false;cancelAnimationFrame(animation);canvas.hidden=true;});
})();
