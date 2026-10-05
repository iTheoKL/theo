/* Ambient depth is progressive enhancement; content never waits for WebGL. */
(() => {
  const finePointer = matchMedia('(pointer: fine)');
  const world = document.createElement('div');
  world.className = 'spatial-world';
  world.setAttribute('aria-hidden', 'true');
  world.innerHTML = '<canvas class="spatial-atmosphere"></canvas><div class="spatial-perspective"><div class="spatial-planes"><i class="glass-plane"></i><i class="glass-plane"></i><i class="glass-plane"></i><i class="spatial-rule"></i></div></div>';
  document.body.prepend(world);
  const canvas = world.querySelector('canvas');
  let frame = 0, last = 0, elapsed = 0;
  let targetX = 0, targetY = 0, x = 0, y = 0, scroll = 0, scrollTarget = window.scrollY;
  let gl, program, resolution, time, pointer, buffer;
  const vertex = 'attribute vec2 a; void main(){gl_Position=vec4(a,0.,1.);}';
  const fragment = `precision mediump float;
    uniform vec2 resolution; uniform float time; uniform vec2 pointer;
    float hash(vec2 p){return fract(sin(dot(p,vec2(127.1,311.7)))*43758.5453);}
    float noise(vec2 p){vec2 i=floor(p),f=fract(p); f=f*f*(3.-2.*f);return mix(mix(hash(i),hash(i+vec2(1.,0.)),f.x),mix(hash(i+vec2(0.,1.)),hash(i+1.),f.x),f.y);}
    float fbm(vec2 p){float a=.5,v=0.;for(int i=0;i<4;i++){v+=a*noise(p);p=mat2(.8,-.6,.6,.8)*p*2.03+13.;a*=.5;}return v;}
    void main(){
      vec2 uv=gl_FragCoord.xy/resolution;
      vec2 p=(uv-.5)*vec2(resolution.x/resolution.y,1.);
      p+=pointer*.025;
      float t=time*.035;
      float n=fbm(p*2.4+vec2(t,-t*.3));
      float m=fbm(p*3.+vec2(n*2.,t*.6));
      float veil=smoothstep(.22,.85,m+n*.25);
      vec3 green=vec3(.12,.20,.155), purple=vec3(.18,.125,.235);
      vec3 tint=mix(green,purple,smoothstep(.25,.9,uv.x));
      float light=exp(-length((uv-vec2(.63,.5))*vec2(1.1,1.5))*2.);
      vec3 color=vec3(.025,.036,.034)+tint*veil*light;
      color+=(hash(gl_FragCoord.xy)-.5)*.008;
      gl_FragColor=vec4(color,1.);
    }`;
  function initGL() {
    gl = canvas.getContext('webgl', { alpha: false, antialias: false, powerPreference: 'low-power' });
    if (!gl) return;
    function shader(type, source) {
      const s = gl.createShader(type); gl.shaderSource(s, source); gl.compileShader(s);
      if (!gl.getShaderParameter(s, gl.COMPILE_STATUS)) { gl.deleteShader(s); throw new Error('Atmosphere unavailable'); }
      return s;
    }
    const v = shader(gl.VERTEX_SHADER, vertex), f = shader(gl.FRAGMENT_SHADER, fragment);
    program = gl.createProgram(); gl.attachShader(program, v); gl.attachShader(program, f); gl.linkProgram(program);
    gl.deleteShader(v); gl.deleteShader(f);
    if (!gl.getProgramParameter(program, gl.LINK_STATUS)) throw new Error('Atmosphere unavailable');
    gl.useProgram(program);
    buffer = gl.createBuffer(); gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1,-1,1,-1,-1,1,-1,1,1,-1,1,1]), gl.STATIC_DRAW);
    const position = gl.getAttribLocation(program, 'a'); gl.enableVertexAttribArray(position); gl.vertexAttribPointer(position, 2, gl.FLOAT, false, 0, 0);
    resolution = gl.getUniformLocation(program, 'resolution'); time = gl.getUniformLocation(program, 'time'); pointer = gl.getUniformLocation(program, 'pointer');
  }
  function draw() {
    if (!gl || gl.isContextLost() || !program) return;
    gl.uniform2f(resolution, canvas.width, canvas.height); gl.uniform1f(time, elapsed); gl.uniform2f(pointer, x, y); gl.drawArrays(gl.TRIANGLES, 0, 6);
  }
  function resize() {
    // Soft atmosphere needs no retina-sized render target.
    const scale = Math.min(1, 1100 / window.innerWidth);
    canvas.width = Math.round(window.innerWidth * scale); canvas.height = Math.round(window.innerHeight * scale);
    if (gl) gl.viewport(0, 0, canvas.width, canvas.height);
    draw();
  }
  try { initGL(); resize(); } catch (_) { gl = null; canvas.hidden = true; }
  const planes = world.querySelector('.spatial-planes');
  const hero = document.querySelector('.hero-name');
  function tick(now) {
    frame = 0;
    if (document.hidden) return;
    if (now - last >= 32) {
      const dt = Math.min((now - last) / 1000, .05); last = now; elapsed += dt;
      x += (targetX - x) * .07; y += (targetY - y) * .07; scroll += (scrollTarget - scroll) * .08;
      planes.style.setProperty('--world-x', `${x * 22}px`);
      planes.style.setProperty('--world-y', `${y * 14 - Math.min(scroll, 1600) * .045}px`);
      planes.style.setProperty('--world-ry', `${x * 2}deg`);
      if (hero) { hero.style.setProperty('--name-x', `${x * -8}px`); hero.style.setProperty('--name-y', `${y * -6 + Math.min(scroll, 900) * .06}px`); }
      draw();
    }
    frame = requestAnimationFrame(tick);
  }
  function sync() {
    cancelAnimationFrame(frame); frame = 0; last = performance.now();
    if (!document.hidden) frame = requestAnimationFrame(tick);
  }
  document.addEventListener('visibilitychange', sync);
  window.addEventListener('pointermove', e => { if (finePointer.matches) { targetX = e.clientX / innerWidth * 2 - 1; targetY = e.clientY / innerHeight * 2 - 1; } }, { passive: true });
  document.addEventListener('pointerleave', () => { targetX = targetY = 0; });
  window.addEventListener('scroll', () => { scrollTarget = window.scrollY; }, { passive: true });
  window.addEventListener('resize', resize, { passive: true });
  canvas.addEventListener('webglcontextlost', e => { e.preventDefault(); canvas.hidden = true; gl = null; });
  canvas.addEventListener('webglcontextrestored', () => { try { initGL(); resize(); canvas.hidden = false; } catch (_) { gl = null; } });
  sync();
})();
