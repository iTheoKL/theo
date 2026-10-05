/* A deforming, lit 3D mesh. No image displacement or video stand-in. */
(() => {
  const vert = `attribute vec3 pos;attribute vec3 normal;attribute vec2 uv;uniform float aspect;uniform float zoom;varying vec3 N;varying vec3 P;varying vec2 U;void main(){P=pos;N=normal;U=uv;gl_Position=vec4(pos.x/(aspect*zoom),pos.y/zoom,-pos.z*.15,1.);}`;
  const frag = `precision mediump float;varying vec3 N;varying vec3 P;varying vec2 U;uniform float material;uniform float time;
void main(){vec3 n=normalize(N);vec3 light=normalize(vec3(-.5,1.,1.5));float diffuse=max(0.,dot(n,light));float rim=pow(1.-max(0.,n.z),2.);vec3 c;
if(material<.5){vec2 tile=U*vec2(155.,24.);tile.x+=mod(floor(tile.y),2.)*.5;vec2 f=fract(tile)-.5;float scale=1.-smoothstep(.39,.47,abs(f.x)+abs(f.y)*.40);float speck=sin(floor(tile.x)*127.1+floor(tile.y)*311.7)*.5+.5;vec3 base=mix(vec3(.016,.10,.045),vec3(.025,.17,.07),scale);c=base*(.18+diffuse*.85)+vec3(.10,.30,.12)*rim*.35;float spec=pow(max(dot(reflect(-light,n),vec3(0,0,1)),0.),30.);c+=vec3(.30,.52,.28)*spec*.3*(.7+speck*.3);}
else if(material<1.5){vec2 f=fract(U*vec2(15.,9.))-.5;float scale=1.-smoothstep(.39,.48,abs(f.x)+abs(f.y)*.45);c=vec3(.023,.14,.052)*(.25+diffuse)*(.85+.15*scale)+vec3(.10,.24,.10)*rim*.2;float spec=pow(max(dot(reflect(-light,n),vec3(0,0,1)),0.),30.);c+=spec*vec3(.13,.28,.12);}
else if(material<2.5){c=vec3(.45,.66,.23)*(.75+diffuse*.2);}
else{c=vec3(.006,.015,.008);}
float fog=clamp((.35-P.z)*.25,0.,.32);c=mix(c,vec3(.015,.09,.035),fog);gl_FragColor=vec4(c,1.);}`;
  const cross=(a,b)=>[a[1]*b[2]-a[2]*b[1],a[2]*b[0]-a[0]*b[2],a[0]*b[1]-a[1]*b[0]];
  const norm=a=>{const l=Math.hypot(...a)||1;return a.map(v=>v/l);};
  function create(canvas){
    const gl=canvas.getContext('webgl',{alpha:true,antialias:true,powerPreference:'low-power'});if(!gl){canvas.parentElement.classList.add('scene-unavailable');return;}
    function shader(type,source){const s=gl.createShader(type);gl.shaderSource(s,source);gl.compileShader(s);if(!gl.getShaderParameter(s,gl.COMPILE_STATUS))throw Error(gl.getShaderInfoLog(s));return s;}
    const program=gl.createProgram();try{gl.attachShader(program,shader(gl.VERTEX_SHADER,vert));gl.attachShader(program,shader(gl.FRAGMENT_SHADER,frag));gl.linkProgram(program);if(!gl.getProgramParameter(program,gl.LINK_STATUS))throw Error('Mesh link failed');}catch(e){canvas.parentElement.classList.add('scene-unavailable');return;}
    gl.useProgram(program);gl.enable(gl.DEPTH_TEST);gl.clearColor(0,0,0,0);
    const buffers=[gl.createBuffer(),gl.createBuffer(),gl.createBuffer()];const attrs=['pos','normal','uv'].map(x=>gl.getAttribLocation(program,x));const uniforms=Object.fromEntries(['aspect','zoom','material','time'].map(x=>[x,gl.getUniformLocation(program,x)]));
    let width=0,height=0,visible=false,raf=0,last=0,mx=0,my=0,px=0,py=0;
    new ResizeObserver(()=>{const r=canvas.getBoundingClientRect();width=r.width;height=r.height;const d=Math.min(devicePixelRatio,1.5);canvas.width=width*d;canvas.height=height*d;gl.viewport(0,0,canvas.width,canvas.height);}).observe(canvas);
    canvas.parentElement.addEventListener('pointermove',e=>{const r=canvas.getBoundingClientRect();mx=((e.clientX-r.left)/r.width-.5)*.13;my=((e.clientY-r.top)/r.height-.5)*-.09;},{passive:true});
    canvas.parentElement.addEventListener('pointerleave',()=>{mx=0;my=0;});
    function submit(mesh,material){gl.uniform1f(uniforms.material,material);[mesh.p,mesh.n,mesh.u].forEach((data,i)=>{gl.bindBuffer(gl.ARRAY_BUFFER,buffers[i]);gl.bufferData(gl.ARRAY_BUFFER,new Float32Array(data),gl.DYNAMIC_DRAW);gl.enableVertexAttribArray(attrs[i]);gl.vertexAttribPointer(attrs[i],i===2?2:3,gl.FLOAT,false,0,0);});gl.drawArrays(gl.TRIANGLES,0,mesh.p.length/3);}
    function triangulate(points,normals,uvs,rows,cols){const out={p:[],n:[],u:[]};for(let j=0;j<rows;j++)for(let k=0;k<cols;k++){const a=j*(cols+1)+k,b=a+cols+1;for(const ix of [a,b,a+1,a+1,b,b+1]){out.p.push(...points[ix]);out.n.push(...normals[ix]);out.u.push(...uvs[ix]);}}return out;}
    function ellipsoid(center,radius,material,angle=0){const p=[],n=[],u=[];const rows=18,cols=28;for(let j=0;j<=rows;j++){const v=j/rows,lat=v*Math.PI;for(let k=0;k<=cols;k++){const a=k/cols*Math.PI*2;const raw=[Math.sin(lat)*Math.cos(a),Math.cos(lat),Math.sin(lat)*Math.sin(a)];let x=raw[0]*radius[0],y=raw[1]*radius[1];p.push([center[0]+x*Math.cos(angle)-y*Math.sin(angle),center[1]+x*Math.sin(angle)+y*Math.cos(angle),center[2]+raw[2]*radius[2]]);n.push(norm([raw[0]/radius[0],raw[1]/radius[1],raw[2]/radius[2]]));u.push([k/cols,j/rows]);}}submit(triangulate(p,n,u,rows,cols),material);}
    function render(now){if(!visible||document.hidden){raf=0;return;}raf=requestAnimationFrame(render);if(now-last<40||!height)return;last=now;px+=(mx-px)*.06;py+=(my-py)*.06;const t=now*.00025;
      gl.clear(gl.COLOR_BUFFER_BIT|gl.DEPTH_BUFFER_BIT);gl.uniform1f(uniforms.aspect,width/height);gl.uniform1f(uniforms.zoom,1.22);gl.uniform1f(uniforms.time,t);
      const controls=[[-1.65,-.7,-.1],[-1.18,-.83,.2],[-.65,-.5,.46],[.36,-.63,.46],[1.04,-.43,.05],[.67,-.19,-.30],[-.49,-.31,-.15],[-.94,.03,.18],[-.48,.22,.42],[.25,.06,.48],[.75,.24,.28],[.65,.62,.35],[.91,.79,.56]];
      function curve(s){const f=s*(controls.length-1),i=Math.min(controls.length-2,Math.floor(f)),v=f-i;const p0=controls[Math.max(0,i-1)],p1=controls[i],p2=controls[i+1],p3=controls[Math.min(controls.length-1,i+2)];return [0,1,2].map(k=>.5*((2*p1[k])+(-p0[k]+p2[k])*v+(2*p0[k]-5*p1[k]+4*p2[k]-p3[k])*v*v+(-p0[k]+3*p1[k]-3*p2[k]+p3[k])*v*v*v)+(k===0?Math.sin(t*1.1+s*8)*.035+px*s:k===1?Math.sin(t+s*11)*.026+py*s:Math.sin(t+s*6)*.025));}
      const p=[],n=[],u=[],rows=160,cols=22;
      for(let j=0;j<=rows;j++){const s=j/rows,c=curve(s),a=curve(Math.max(0,s-.002)),b=curve(Math.min(1,s+.002)),tangent=norm(b.map((v,i)=>v-a[i])),axis=norm(cross(tangent,[0,0,1])),other=norm(cross(tangent,axis));const radius=(.016+.135*Math.sin(Math.min(1,s*2)*Math.PI*.5))*(s>.78?1.-(s-.78)*2.5:1.);
        for(let k=0;k<=cols;k++){const theta=k/cols*Math.PI*2;const normal=axis.map((v,i)=>v*Math.cos(theta)+other[i]*Math.sin(theta));p.push(c.map((v,i)=>v+normal[i]*radius));n.push(normal);u.push([s,k/cols]);}}
      submit(triangulate(p,n,u,rows,cols),0);
      const head=curve(1);ellipsoid([head[0]+.075,head[1],head[2]],[.26,.125,.155],1,-.12);
      ellipsoid([head[0]+.25,head[1]-.035,head[2]+.045],[.115,.08,.11],1,-.13);
      ellipsoid([head[0]+.10,head[1]+.03,head[2]+.145],[.026,.017,.010],2,-.25);
      ellipsoid([head[0]+.103,head[1]+.03,head[2]+.155],[.004,.015,.004],3,-.25);
      ellipsoid([head[0]+.092,head[1]+.056,head[2]+.14],[.068,.017,.032],1,-.25);
      ellipsoid([head[0]+.295,head[1]-.075,head[2]+.105],[.10,.007,.012],3,-.1);
      ellipsoid([head[0]+.28,head[1]+.003,head[2]+.127],[.012,.007,.005],3);
    }
    new IntersectionObserver(entries=>{visible=entries[0].isIntersecting;if(visible&&!raf)raf=requestAnimationFrame(render);},{rootMargin:'80px'}).observe(canvas);
    document.addEventListener('visibilitychange',()=>{if(!document.hidden&&visible&&!raf)raf=requestAnimationFrame(render);});
    canvas.addEventListener('webglcontextlost',e=>{e.preventDefault();visible=false;cancelAnimationFrame(raf);canvas.parentElement.classList.add('scene-unavailable');});
  }
  document.querySelectorAll('.viper-mesh').forEach(create);
})();
