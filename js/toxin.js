/* A perspective toxin field around a normal HTML reading layer. */
(() => {
  const root=document.documentElement, home=document.body.classList.contains('is-index');
  const fine=matchMedia('(pointer: fine)');
  const track=document.querySelector('.journey-track'), stage=document.querySelector('.journey-stage');
  const hero=document.querySelector('.spatial-hero'), field=document.querySelector('.index-selections');
  const entries=[...document.querySelectorAll('.spatial-entry')];
  const world=document.createElement('div'); world.className='spatial-world'; world.setAttribute('aria-hidden','true');
  world.innerHTML='<div class="field-horizon"></div><div class="field-floor"></div>';
  const canvas=document.createElement('canvas'); canvas.className='toxin-volume'; canvas.setAttribute('aria-hidden','true');
  document.body.prepend(world,canvas);
  let width=innerWidth,height=innerHeight,start=0,distance=1;
  let targetScroll=scrollY,currentScroll=scrollY,px=0,py=0,tx=0,ty=0;
  let progress=home?0:1,elapsed=0,previous=performance.now(),frame=0;
  let gl,program,uniforms,contextLost=false,selectionActive=false;
  const clarity=[0,0],clarityTarget=[0,0];
  const clamp=(n,min=0,max=1)=>Math.max(min,Math.min(max,n));
  const smooth=(a,b,n)=>{const t=clamp((n-a)/(b-a));return t*t*(3-2*t);};
  const vertex='attribute vec2 position; void main(){gl_Position=vec4(position,0.,1.);}';
  const fragment=`precision highp float;
    uniform vec2 resolution; uniform vec2 pointer; uniform vec2 clarity;
    uniform float time; uniform float passage; uniform float homepage;
    float hash(vec3 p){p=fract(p*.1031);p+=dot(p,p.yzx+33.33);return fract((p.x+p.y)*p.z);}
    float noise(vec3 p){
      vec3 i=floor(p),f=fract(p);f=f*f*(3.-2.*f);
      return mix(mix(mix(hash(i),hash(i+vec3(1,0,0)),f.x),mix(hash(i+vec3(0,1,0)),hash(i+vec3(1,1,0)),f.x),f.y),
        mix(mix(hash(i+vec3(0,0,1)),hash(i+vec3(1,0,1)),f.x),mix(hash(i+vec3(0,1,1)),hash(i+vec3(1,1,1)),f.x),f.y),f.z);
    }
    float fbm(vec3 p){return noise(p)*.57+noise(p*2.03+8.1)*.28+noise(p*4.09-5.2)*.15;}
    void main(){
      vec2 uv=gl_FragCoord.xy/resolution;
      vec2 screen=(uv-.5)*vec2(resolution.x/resolution.y,1.);
      float travel=smoothstep(0.,.68,passage);
      vec3 eye=vec3(1.95*travel,1.25,6.-8.3*travel);
      eye.xy+=pointer*vec2(.12,.06);
      vec3 ray=normalize(vec3(screen.x,screen.y-.035,-.9));
      float speed=time*.14;
      vec3 normal=normalize(vec3(1.,0.,-.45));
      float denom=dot(ray,normal);
      float hit=(1.3/length(vec2(1.,.45))-dot(eye,normal))/denom;
      float density=0.;vec3 color=vec3(0.);
      float center=clamp(hit,0.,22.);
      float thickness=min(2.8,.72/max(abs(denom),.12));
      float stepSize=thickness/18.;
      float begin=max(.025,center-thickness*.5);
      if(homepage>.5 && passage<.77){for(int i=0;i<18;i++){
        float depth=begin+(float(i)+.5)*stepSize;
        vec3 p=eye+ray*depth;
        float n=fbm(p*vec3(2.1,1.05,1.7)+vec3(0.,-speed,.12*time));
        float curl=noise(p*3.3+vec3(speed,0.,-speed));
        float wall=abs(p.x-.45*p.z-1.3+(n-.5)*.45);
        float edge=1.-smoothstep(.08,.5,wall);
        float top=2.65+(n-.5)*.45;
        float bounds=smoothstep(-.38,-.18,p.y)*(1.-smoothstep(top-.28,top,p.y));
        bounds*=smoothstep(-5.,-4.,p.z)*(1.-smoothstep(1.75,2.15,p.z));
        float d=edge*bounds*smoothstep(.22,.8,n)*stepSize*3.5;
        float light=.32+n*.76+curl*.16;
        vec3 shade=mix(vec3(.045,.095,.052),vec3(.30,.43,.22),light);
        float rim=pow(1.-smoothstep(.0,.20,abs(p.y-top+.16)),2.);
        shade+=vec3(.11,.16,.06)*rim;
        float alpha=(1.-exp(-d))*(1.-density);
        color+=shade*alpha;density+=alpha;
      }}
      float crossing=exp(-pow((passage-.43)*10.,2.))*homepage;
      float local=fbm(vec3(screen*2.5,time*.09));
      float veil=crossing*(.58+local*.35);
      color=mix(color,vec3(.10,.17,.085)*(.7+local),veil);
      density=mix(density,.97,veil);
      float cleared=1.-smoothstep(.53,.77,passage);
      color*=cleared*homepage;density*=cleared*homepage;
      // Local volumes gather at the edges of the two content surfaces.
      float field=smoothstep(.62,.86,passage)*homepage;
      float cloudA=1.-smoothstep(.12,1.,length((uv-vec2(.46,.31))/vec2(.19,.25)));
      float cloudB=1.-smoothstep(.12,1.,length((uv-vec2(.86,.29))/vec2(.18,.23)));
      float wisp=fbm(vec3(screen*6.,time*.13));
      float cloud=(cloudA*(1.-clarity.x*.95)+cloudB*(1.-clarity.y*.95))*field*wisp*.64;
      color+=mix(vec3(.11,.18,.085),vec3(.16,.11,.20),uv.x)*cloud*(1.-density);
      density+=cloud*(1.-density);
      float floorFog=pow(1.-uv.y,4.)*(.2+.35*local);
      vec3 floorColor=mix(vec3(.075,.14,.09),vec3(.12,.08,.17),uv.x);
      color+=floorColor*floorFog*(1.-density);density+=floorFog*(1.-density)*.65;
      vec2 motes=uv*vec2(75.,48.)+vec2(time*.018,time*.10);
      float seed=hash(vec3(floor(motes),3.));
      float dotShape=1.-smoothstep(.015,.055,length(fract(motes)-.5));
      float dust=dotShape*step(.988,seed)*.22;
      color+=vec3(.50,.57,.44)*dust;density=max(density,dust);
      if(density<.001)discard;
      gl_FragColor=vec4(color/max(density,.001),clamp(density,0.,.98));
    }`;
  function initializeGL(){
    gl=canvas.getContext('webgl',{alpha:true,premultipliedAlpha:false,antialias:false,powerPreference:'low-power'});
    if(!gl)throw new Error('WebGL unavailable');
    const shaders=[];
    for(const [type,source] of [[gl.VERTEX_SHADER,vertex],[gl.FRAGMENT_SHADER,fragment]]){
      const s=gl.createShader(type);gl.shaderSource(s,source);gl.compileShader(s);
      if(!gl.getShaderParameter(s,gl.COMPILE_STATUS))throw new Error(gl.getShaderInfoLog(s));
      shaders.push(s);
    }
    program=gl.createProgram();shaders.forEach(s=>gl.attachShader(program,s));gl.linkProgram(program);shaders.forEach(s=>gl.deleteShader(s));
    if(!gl.getProgramParameter(program,gl.LINK_STATUS))throw new Error(gl.getProgramInfoLog(program));
    gl.useProgram(program);
    const buffer=gl.createBuffer();gl.bindBuffer(gl.ARRAY_BUFFER,buffer);
    gl.bufferData(gl.ARRAY_BUFFER,new Float32Array([-1,-1,1,-1,-1,1,-1,1,1,-1,1,1]),gl.STATIC_DRAW);
    const a=gl.getAttribLocation(program,'position');gl.enableVertexAttribArray(a);gl.vertexAttribPointer(a,2,gl.FLOAT,false,0,0);
    uniforms=Object.fromEntries(['resolution','pointer','clarity','time','passage','homepage'].map(k=>[k,gl.getUniformLocation(program,k)]));
    root.classList.add('has-volume');
  }
  function renderVolume(){
    if(!gl||contextLost)return;
    gl.clearColor(0,0,0,0);gl.clear(gl.COLOR_BUFFER_BIT);
    gl.uniform2f(uniforms.resolution,canvas.width,canvas.height);gl.uniform2f(uniforms.pointer,px,py);gl.uniform2f(uniforms.clarity,clarity[0],clarity[1]);
    gl.uniform1f(uniforms.time,elapsed);gl.uniform1f(uniforms.passage,progress);gl.uniform1f(uniforms.homepage,home?1:0);
    gl.drawArrays(gl.TRIANGLES,0,6);
  }
  function measure(){
    width=innerWidth;height=innerHeight;
    if(track){start=track.getBoundingClientRect().top+scrollY;distance=Math.max(1,track.offsetHeight-height);}
    const scale=Math.min(1,900/width);canvas.width=Math.round(width*scale);canvas.height=Math.round(height*scale);
    if(gl)gl.viewport(0,0,canvas.width,canvas.height);renderVolume();
  }
  function updateScene(){
    progress=home?clamp((currentScroll-start)/distance):1;
    const crossing=smooth(.13,.48,progress),reveal=smooth(.50,.83,progress);
    root.style.setProperty('--passage',progress.toFixed(4));
    root.style.setProperty('--field-reveal',reveal.toFixed(4));
    root.style.setProperty('--field-x',`${px*9}px`);root.style.setProperty('--field-y',`${py*5}px`);
    world.style.setProperty('--floor-shift',`${progress*160}px`);
    if(!home||!stage)return;
    hero.style.opacity=String(1-smooth(.14,.40,progress));
    hero.style.transform=`translate3d(${-crossing*width*.25-px*12}px,${crossing*-70-py*8}px,${-crossing*450}px) rotateY(${crossing*-16}deg)`;
    field.style.opacity=String(reveal);
    field.style.transform=`translate3d(${(1-reveal)*width*.22}px,${(1-reveal)*90}px,${(1-reveal)*-700}px) rotateY(${(1-reveal)*-18}deg)`;
    const active=progress>.6;
    if(active!==selectionActive){selectionActive=active;field.inert=!active;hero.inert=active;field.setAttribute('aria-hidden',String(!active));hero.setAttribute('aria-hidden',String(active));}
    stage.classList.toggle('field-arrived',progress>.83);
  }
  function tick(now){
    frame=0;if(document.hidden)return;
    const dt=Math.min((now-previous)/1000,.05);
    if(now-previous>=30){previous=now;elapsed+=dt;px+=(tx-px)*.1;py+=(ty-py)*.1;clarity.forEach((v,i)=>{clarity[i]+=(clarityTarget[i]-v)*.12;});currentScroll+=(targetScroll-currentScroll)*.19;updateScene();renderVolume();}
    frame=requestAnimationFrame(tick);
  }
  function wake(){cancelAnimationFrame(frame);previous=performance.now();if(!document.hidden)frame=requestAnimationFrame(tick);}
  try{initializeGL();}catch(_){gl=null;canvas.hidden=true;}
  if(home&&track){
    root.classList.add('has-passage');field.inert=true;field.setAttribute('aria-hidden','true');
    document.querySelector('.hero-baseline a')?.addEventListener('click',e=>{e.preventDefault();window.scrollTo({top:start+distance*.94,behavior:'smooth'});});
  }
  measure();updateScene();wake();
  function restoreFieldAnchor(){
    if(!home||location.hash!=='#selected')return;
    measure();window.scrollTo({top:start+distance*.94,behavior:'instant'});
    targetScroll=currentScroll=scrollY;updateScene();renderVolume();
  }
  window.addEventListener('load',restoreFieldAnchor,{once:true});
  window.addEventListener('hashchange',restoreFieldAnchor);
  window.addEventListener('resize',measure,{passive:true});
  window.addEventListener('scroll',()=>{targetScroll=scrollY;},{passive:true});
  window.addEventListener('pointermove',e=>{if(fine.matches){tx=e.clientX/width*2-1;ty=e.clientY/height*2-1;}},{passive:true});
  document.addEventListener('pointerleave',()=>{tx=ty=0;});document.addEventListener('visibilitychange',wake);
  canvas.addEventListener('webglcontextlost',e=>{e.preventDefault();contextLost=true;canvas.hidden=true;root.classList.remove('has-volume');});
  canvas.addEventListener('webglcontextrestored',()=>{try{initializeGL();contextLost=false;canvas.hidden=false;measure();}catch(_){gl=null;}});
  document.fonts?.ready.then(measure);

  // Original links remain available without JS and for opening in a new tab.
  if(!entries.length||typeof HTMLDialogElement==='undefined')return;
  const language=root.lang;
  const labels=language==='fr'?{back:'Retour',open:'Ouvrir la page complète',loading:'Chargement…',error:'La lecture intégrée est indisponible. Ouvrez la page complète.'}:language.startsWith('zh')?{back:'返回',open:'打开完整页面',loading:'正在加载…',error:'无法加载预览。请打开完整页面。'}:{back:'Return',open:'Open full page',loading:'Loading…',error:'The preview could not load. Open the full page to continue.'};
  const dialog=document.createElement('dialog');dialog.className='reading-plane';dialog.setAttribute('aria-label',labels.open);
  dialog.innerHTML=`<div class="reading-bar"><button type="button" class="reading-return">${labels.back}</button><a class="reading-source">${labels.open}</a></div><div class="reading-content"></div>`;
  document.body.append(dialog);
  const body=dialog.querySelector('.reading-content'),source=dialog.querySelector('.reading-source');
  let trigger=null,request=null,closing=false;
  function close(){
    if(closing||!dialog.open)return;
    closing=true;request?.abort();dialog.classList.add('departing');
    setTimeout(()=>{dialog.close();dialog.classList.remove('departing');closing=false;},300);
  }
  dialog.querySelector('button').addEventListener('click',close);
  dialog.addEventListener('cancel',e=>{e.preventDefault();close();});
  dialog.addEventListener('click',e=>{if(e.target===dialog){const r=dialog.getBoundingClientRect();if(e.clientX<r.left||e.clientX>r.right||e.clientY<r.top||e.clientY>r.bottom)close();}});
  dialog.addEventListener('close',()=>{document.body.classList.remove('is-reading');trigger?.focus({preventScroll:true});});
  entries.forEach((entry,index)=>{
    entry.addEventListener('pointerenter',()=>{clarityTarget[index]=1;});
    entry.addEventListener('pointerleave',()=>{clarityTarget[index]=entry.contains(document.activeElement)?1:0;});
    entry.addEventListener('focusin',()=>{clarityTarget[index]=1;});
    entry.addEventListener('focusout',e=>{if(!entry.contains(e.relatedTarget))clarityTarget[index]=0;});
    const link=entry.querySelector('h3 a');
    link?.addEventListener('click',async e=>{
      if(e.metaKey||e.ctrlKey||e.shiftKey||e.altKey||e.button!==0)return;
      const url=new URL(link.href);if(url.origin!==location.origin||!url.hash)return;
      e.preventDefault();trigger=link;source.href=link.href;body.textContent=labels.loading;body.setAttribute('aria-busy','true');
      dialog.setAttribute('aria-label',link.textContent.trim());document.body.classList.add('is-reading');dialog.showModal();
      request?.abort();const currentRequest=new AbortController();request=currentRequest;
      try{
        const response=await fetch(url.pathname,{signal:currentRequest.signal});if(!response.ok)throw new Error('Page unavailable');
        const doc=new DOMParser().parseFromString(await response.text(),'text/html');
        const section=doc.getElementById(decodeURIComponent(url.hash.slice(1)));if(!section)throw new Error('Section unavailable');
        section.querySelectorAll('script').forEach(s=>s.remove());
        section.querySelectorAll('a[href]').forEach(a=>{a.href=new URL(a.getAttribute('href'),url).href;});section.removeAttribute('style');
        if(!dialog.open||currentRequest.signal.aborted)return;
        body.replaceChildren(document.importNode(section,true));
        if(window.renderMathInElement)window.renderMathInElement(body,{delimiters:[{left:'$$',right:'$$',display:true},{left:'$',right:'$',display:false}]});
      }catch(error){if(error.name!=='AbortError')body.textContent=labels.error;}
      finally{if(request===currentRequest)body.removeAttribute('aria-busy');}
    });
  });
})();
