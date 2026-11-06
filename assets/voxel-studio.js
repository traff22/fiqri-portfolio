/* FQ / The Editing Room — a real-time 3D voxel diorama of mini Fiqri at work.
 *
 * - Built entirely from first-party voxels (no downloaded models): room, desk,
 *   two live monitors, lamp, window over Jakarta at night, shelf, coffee
 *   station, camera on a tripod and mini Fiqri (dark swept fringe, charcoal
 *   sweater, white collar — after the hero portrait).
 * - Lives on its own: edit → render → coffee break → back to the timeline,
 *   on a loop. Monitors show a moving timeline / program feed / render bar.
 * - Interactive: drag to turn the room, click the monitors, the coffee or
 *   Fiqri himself. The page's Edit / Render / Coffee / Say hi buttons call the
 *   same actions (touch + keyboard).
 * - Paused off-screen and in background tabs; prefers-reduced-motion keeps
 *   the room still and switches poses without travel animation.
 *
 * Three.js (MIT) is vendored in assets/vendor and only loaded when the About
 * section approaches the viewport (see creators-lab.js). */
import * as THREE from "./vendor/three.module.min.js";

export function mountVoxelStudio(host,{reducedMotion,onState}={}){
  const reduced=()=>Boolean(reducedMotion?.matches);

  /* ------------------------------------------------------------ renderer */
  const renderer=new THREE.WebGLRenderer({antialias:true,alpha:true,powerPreference:"low-power"});
  renderer.setPixelRatio(Math.min(window.devicePixelRatio||1,2));
  renderer.outputColorSpace=THREE.SRGBColorSpace;
  renderer.shadowMap.enabled=true;
  renderer.shadowMap.type=THREE.PCFSoftShadowMap;
  const canvas=renderer.domElement;
  canvas.className="fq-voxel__canvas";
  canvas.setAttribute("role","img");
  canvas.setAttribute("aria-label","3D voxel editing room: mini Fiqri editing at his desk, rendering, and taking coffee breaks. Drag to turn the room.");
  host.appendChild(canvas);

  const scene=new THREE.Scene();
  const camera=new THREE.OrthographicCamera(-10,10,10,-10,-100,200);

  /* ------------------------------------------------------------ time of day */
  // The room follows the visitor's clock (html[data-daypart], set in <head>):
  // the window, the sun, the desk lamp and the screen glow all change.
  const DAY=({
    dawn:{sky:["#3a4f8f","#e9a58c"],orb:"#ffe1c4",orbY:62,lit:.25,city:["#1d2a4f","#25335c"],sun:["#ffd2b8",2.0],hemi:2.0,lamp:40,win:["#ffc6a8",10],screen:22},
    day:{sky:["#3d7be0","#b4d6ff"],orb:"#fff6e0",orbY:14,lit:0,city:["#2f4a7a","#3a5a8f"],sun:["#ffffff",2.9],hemi:2.6,lamp:0,win:["#d5e6ff",16],screen:16},
    dusk:{sky:["#1f2f6b","#ff9a5a"],orb:"#ffcf94",orbY:56,lit:.35,city:["#141d3d","#1b2650"],sun:["#ffb27a",1.9],hemi:1.9,lamp:55,win:["#ff9a62",11],screen:24},
    night:{sky:["#0b1638","#2c4a92"],orb:"#eef2ff",orbY:12,lit:.5,city:["#0c1430","#111c40"],sun:["#b9ccff",1.3],hemi:1.7,lamp:62,win:["#6f8fff",6],screen:28}
  })[document.documentElement.dataset.daypart]||null;
  const light=DAY||{sky:["#0b1638","#2c4a92"],orb:"#eef2ff",orbY:12,lit:.5,city:["#0c1430","#111c40"],sun:["#b9ccff",1.3],hemi:1.7,lamp:62,win:["#6f8fff",6],screen:28};

  /* ------------------------------------------------------------ helpers */
  let seed=7;
  const rand=()=>((seed=(seed*16807)%2147483647)-1)/2147483646;
  const color=hex=>new THREE.Color(hex);
  const jitter=(c,amount=.045)=>{const k=1+(rand()-.5)*2*amount;return c.clone().multiplyScalar(k)};
  const cube=new THREE.BoxGeometry(1,1,1);
  const lambert=new THREE.MeshLambertMaterial({color:0xffffff});

  // Collect voxels as [x,y,z,size,THREE.Color]; turn a list into one InstancedMesh.
  const box=(list,x0,y0,z0,w,h,d,hex,s=1,amount=.045,skip)=>{
    const base=color(hex);
    const nx=Math.round(w/s),ny=Math.round(h/s),nz=Math.round(d/s);
    for(let i=0;i<nx;i++)for(let j=0;j<ny;j++)for(let k=0;k<nz;k++){
      // Interior voxels are never seen; skip them for big solids.
      if(nx>2&&ny>2&&nz>2&&i>0&&j>0&&k>0&&i<nx-1&&j<ny-1&&k<nz-1)continue;
      if(skip&&skip(i,j,k))continue;
      list.push([x0+i*s,y0+j*s,z0+k*s,s,jitter(base,amount)]);
    }
  };
  const instanced=(list,{cast=true,receive=true}={})=>{
    const mesh=new THREE.InstancedMesh(cube,lambert,list.length);
    const m=new THREE.Matrix4(),q=new THREE.Quaternion(),p=new THREE.Vector3(),sc=new THREE.Vector3();
    list.forEach(([x,y,z,s,c],i)=>{
      p.set(x+s/2,y+s/2,z+s/2);sc.set(s,s,s);
      mesh.setMatrixAt(i,m.compose(p,q,sc));mesh.setColorAt(i,c);
    });
    mesh.castShadow=cast;mesh.receiveShadow=receive;
    return mesh;
  };
  const glow=(w,h,map,opacity=1)=>new THREE.Mesh(new THREE.PlaneGeometry(w,h),
    new THREE.MeshBasicMaterial({map,transparent:opacity<1,opacity,toneMapped:false}));
  const canvasTexture=(w,h)=>{
    const c=document.createElement("canvas");c.width=w;c.height=h;
    const t=new THREE.CanvasTexture(c);
    t.magFilter=THREE.NearestFilter;t.minFilter=THREE.NearestFilter;t.colorSpace=THREE.SRGBColorSpace;
    return {c,ctx:c.getContext("2d"),t};
  };
  const interactive=[];
  const tag=(obj,action)=>{obj.traverse(o=>{o.userData.action=action});interactive.push(obj);return obj};

  /* ------------------------------------------------------------ palette */
  const P={
    wall:"#17243f",wallTop:"#29426e",base:"#0c1426",floorA:"#1e2d4a",floorB:"#1a2843",plinth:"#080e1c",
    rug:"#1d4ed8",rugEdge:"#7aa6ff",wood:"#6d4f45",woodDark:"#4f3933",metal:"#8f9db8",
    dark:"#0d1424",bezel:"#080c18",chair:"#1e3a8a",chairDark:"#172c66",
    skin:"#c8916f",skinShade:"#b07a5c",hair:"#141821",hairHi:"#232a38",sweater:"#2b3042",
    sweaterHi:"#363d55",collar:"#eef1f8",pants:"#1a1e2c",shoe:"#d9dde8",
    teal:"#7aa6ff",iris:"#7aa6ff",cream:"#eef0fa",coral:"#d98a73",leaf:"#3f9f7f",leafHi:"#62c79e",
    lamp:"#e8d6b0",rec:"#ff5b6b"
  };

  /* ------------------------------------------------------------ the room */
  const S=[];
  // plinth + floor planks
  for(let x=0;x<20;x++)for(let z=0;z<14;z++){
    const inRug=x>=6&&x<15&&z>=4&&z<10,edge=inRug&&(x===6||x===14||z===4||z===9);
    S.push([x,-1,z,1,jitter(color(inRug?(edge?P.rugEdge:P.rug):(z%2?P.floorA:P.floorB)),inRug?.03:.06)]);
  }
  for(let x=-1;x<20;x++)S.push([x,-2,13,1,jitter(color(P.plinth))]);
  for(let z=-1;z<13;z++)S.push([19,-2,z,1,jitter(color(P.plinth))]);
  // back wall with a window opening, left wall
  box(S,-1,-1,-1,21,13,1,P.wall,1,.035,(i,j)=>i>=2&&i<6&&j>=6&&j<11);
  box(S,-1,-1,0,1,13,14,P.wall,1,.035);
  // skirting + top trim
  for(let x=0;x<20;x++){S.push([x,0,-.25,.25,jitter(color(P.base))]);}
  for(let x=-1;x<20;x++)S.push([x,11.5,-1,.5,jitter(color(P.wallTop),.02)]),S.push([x+.5,11.5,-1,.5,jitter(color(P.wallTop),.02)]);
  for(let z=0;z<14;z++)S.push([-1,11.5,z,.5,jitter(color(P.wallTop),.02)]),S.push([-1,11.5,z+.5,.5,jitter(color(P.wallTop),.02)]);
  // window frame + sill
  box(S,.75,4.75,-1,4.5,.25,1.25,P.wallTop,.25,.02);
  box(S,.75,10,-1,4.5,.25,1,P.wallTop,.25,.02);
  box(S,.75,5,-1,.25,5,1,P.wallTop,.25,.02);box(S,5,5,-1,.25,5,1,P.wallTop,.25,.02);
  box(S,2.875,5,-.75,.25,5,.25,P.wallTop,.25,.02);
  // desk (walnut) with legs
  box(S,5,3.5,0,10,.5,3.5,P.wood,.5,.05);
  for(const [x,z] of [[5,0],[14.5,0],[5,3],[14.5,3]])box(S,x,0,z,.5,3.5,.5,P.woodDark,.5,.03);
  box(S,5.5,2.5,.25,9,.5,.25,P.woodDark,.25,.03);
  // keyboard + mouse
  box(S,8.5,4,2.25,3.25,.25,1,"#1b2347",.25,.05);
  for(let i=0;i<12;i++)for(let k=0;k<3;k++)if((i+k)%2===0)S.push([8.5+i*.25+.0,4.25,2.25+k*.25+.125,.125,jitter(color("#7d8ccc"),.08)]);
  box(S,12.25,4,2.5,.5,.25,.75,"#d7ddef",.25,.03);
  // monitors (bezel + stand); screens are separate glowing planes
  const monitor=(x)=>{box(S,x,4.75,1,3.75,2.75,.5,P.bezel,.25,.03);box(S,x+1.625,4,1.125,.5,.75,.25,P.metal,.25,.04);box(S,x+1.125,4,.75,1.5,.25,1,P.metal,.25,.04)};
  monitor(6.375);monitor(10.375);
  // desk lamp (warm accent light lives here)
  box(S,5.5,4,.75,1,.25,1,P.dark,.25);box(S,5.875,4.25,1,.25,2,.25,P.metal,.25);
  box(S,5.875,6.25,1,.25,.25,1.25,P.metal,.25);box(S,5.75,5.75,1.875,.75,.5,.75,P.lamp,.25,.02);
  // PC tower under the desk, teal LED added as glow
  box(S,13.25,0,.5,1.25,2.75,2.5,P.dark,.25,.04);
  box(S,13.25,.25,3,1.25,.25,.25,"#273463",.25);
  // coffee station: cabinet, machine, cups
  box(S,16.5,0,0,3,3,2,"#2c3a74",.5,.04);
  box(S,16.5,3,0,3,.25,2,"#c9d2ee",.25,.03);
  box(S,18,3.25,.25,1.25,1.75,1,"#1c223d",.25,.04);
  box(S,18,5,.25,1.25,.25,1.25,"#9aa6cf",.25,.04);
  box(S,18.25,3.25,1.25,.75,.25,.25,"#5a678f",.25);
  box(S,16.75,3.25,.25,.5,.75,.5,P.teal,.25,.03);
  // shelf on the left wall: books, clapperboard, film reel
  box(S,0,7,3,1.25,.25,6,P.woodDark,.25,.03);
  const books=["#2563eb","#cfe0ff",P.coral,"#c4cbe8","#1e3a8a","#7aa6ff","#26334f"];
  books.forEach((c,i)=>box(S,.25,7.25,3.25+i*.5,.75,1.25+((i*7)%3)*.25,.25,c,.25,.04));
  for(let i=0;i<6;i++)box(S,.25,7.25,7.25+i*.25,.75,.25,.25,i%2?P.cream:P.dark,.25,.02);
  box(S,.25,7.5,7.25,.75,.75,1.5,P.dark,.25,.03);
  box(S,.25,8.25,7.25,.75,.25,1.5,P.cream,.25,.02);
  // poster frame (art is a texture plane)
  box(S,13.75,5.75,0,4.5,.25,.25,P.wallTop,.25,.02);box(S,13.75,10,0,4.5,.25,.25,P.wallTop,.25,.02);
  box(S,13.75,6,0,.25,4,.25,P.wallTop,.25,.02);box(S,18,6,0,.25,4,.25,P.wallTop,.25,.02);
  // plant in the front-left corner
  box(S,.5,0,11.5,1.5,1.5,1.5,P.coral,.25,.04);
  const leaves=[[1,1.5,12,.75],[.5,2.25,11.75,.5],[1.5,2.5,12.5,.5],[1,3,12,.5],[.75,3.5,12.25,.5],[1.5,1.75,11.5,.5],[.25,1.75,12.5,.5],[1.25,4,11.75,.25]];
  leaves.forEach(([x,y,z,s],i)=>box(S,x,y,z,s*2,s,s*2,i%2?P.leaf:P.leafHi,s/2,.08));
  // camera on a tripod, front-right — the videographer's room
  for(const [dx,dz] of [[-.75,0],[.75,0],[0,.9]]){
    for(let k=0;k<12;k++){const t=k/12;S.push([17.5+dx*(1-t)-.125,t*3,10.5+dz*(1-t)-.125,.25,jitter(color(P.metal))])}
  }
  box(S,17,3,10,1.25,1,1.75,P.dark,.25,.04);
  box(S,17.25,3.25,9.5,.75,.75,.5,"#2a3152",.25,.04);
  box(S,17.875,4,10.5,.25,.25,.5,P.cream,.125,.02);

  const room=instanced(S);
  scene.add(room);

  /* ------------------------------------------------------------ glowing surfaces */
  // Window: Jakarta at night, painted once.
  const win=canvasTexture(64,80);
  {
    const g=win.ctx,grd=g.createLinearGradient(0,0,0,80);
    grd.addColorStop(0,light.sky[0]);grd.addColorStop(1,light.sky[1]);
    g.fillStyle=grd;g.fillRect(0,0,64,80);
    g.fillStyle=light.orb;g.fillRect(44,light.orbY,7,7); // sun or moon
    if(light.lit===0){g.fillStyle="#ffffffcc";g.fillRect(8,14,14,3);g.fillRect(11,11,8,3);g.fillRect(26,24,12,3)} // daytime clouds
    let s2=3;const r2=()=>((s2=(s2*48271)%2147483647)/2147483647);
    for(let x=0;x<64;){const w=6+Math.floor(r2()*9),h=22+Math.floor(r2()*40);
      g.fillStyle=r2()>.5?light.city[0]:light.city[1];g.fillRect(x,80-h,w,h);
      for(let yy=80-h+3;yy<78;yy+=4)for(let xx=x+1;xx<x+w-1;xx+=3)if(r2()<light.lit*.75){g.fillStyle=r2()>.3?"#ffd38a":"#cfe0ff";g.fillRect(xx,yy,1,2)}
      x+=w+1}
    win.t.needsUpdate=true;
  }
  const windowPane=glow(4,5,win.t);windowPane.position.set(3,8,-.8);scene.add(windowPane);

  // Poster: an original "FQ." film one-sheet.
  const poster=canvasTexture(48,48);
  {
    const g=poster.ctx,grd=g.createLinearGradient(0,0,48,48);
    grd.addColorStop(0,"#0a1430");grd.addColorStop(1,"#1d4ed8");g.fillStyle=grd;g.fillRect(0,0,48,48);
    g.fillStyle="#9ec0ff";g.beginPath();g.arc(32,18,9,0,7);g.fill();
    g.fillStyle="#0e1336";g.fillRect(0,30,48,18);
    g.fillStyle="#eef0fa";
    // pixel "FQ."
    [[6,35],[6,36],[6,37],[6,38],[6,39],[7,35],[8,35],[7,37],[11,35],[12,35],[13,35],[11,36],[13,36],[11,37],[13,37],[11,38],[12,38],[13,38],[13,39],[15,39]].forEach(([x,y])=>g.fillRect(x,y,1,1));
    g.fillStyle="#cfe0ff";g.fillRect(6,42,20,1);
    poster.t.needsUpdate=true;
  }
  const posterPlane=glow(3.75,3.75,poster.t);posterPlane.position.set(16,8,.13);scene.add(posterPlane);

  // Live monitor feeds.
  const left=canvasTexture(120,84),right=canvasTexture(120,84);
  const leftScreen=glow(3.4,2.4,left.t),rightScreen=glow(3.4,2.4,right.t);
  leftScreen.position.set(8.25,6.125,1.505);rightScreen.position.set(12.25,6.125,1.505);
  scene.add(leftScreen,rightScreen);
  tag(leftScreen,"edit");tag(rightScreen,"project");
  // The PC tower is the render button now that the program monitor plays real work.
  {const pc=new THREE.Mesh(new THREE.BoxGeometry(1.5,3,2.7),new THREE.MeshBasicMaterial({visible:false}));pc.position.set(13.875,1.4,1.75);scene.add(pc);tag(pc,"render")}

  /* ---- the program monitor plays the same film as the showreel ---- */
  // Listens to Chapter One (fq:shot carries the YouTube id). Until a shot has
  // played, it cycles through the highlighted projects in Selected Work.
  // Thumbnails load with CORS; if that is refused the painted feed stays.
  const reel={id:null,img:null,next:0,clock:0};
  const reelIds=[...document.querySelectorAll("#work .work-card.is-featured .work-media[data-youtube-id]")].map(m=>m.dataset.youtubeId).filter(Boolean);
  let reelFromShowreel=false;
  function loadShot(id){
    if(!id||id===reel.id)return;
    const img=new Image();img.crossOrigin="anonymous";img.decoding="async";
    img.onload=()=>{reel.img=img;reel.id=id};
    img.onerror=()=>{};
    img.src="https://i.ytimg.com/vi/"+id+"/hqdefault.jpg";
  }
  document.getElementById("cinema-wrap")?.addEventListener("fq:shot",e=>{if(e.detail?.id){reelFromShowreel=true;loadShot(e.detail.id)}});
  function openReelProject(){
    const media=reel.id&&document.querySelector(`#work .work-media[data-youtube-id="${CSS.escape(reel.id)}"]`);
    const trigger=media?.closest(".work-card")?.querySelector(".work-trigger");
    if(trigger){trigger.click();return true}
    return false;
  }

  // Small emissive details.
  const ledMat=new THREE.MeshBasicMaterial({color:P.teal,toneMapped:false});
  const led=new THREE.Mesh(new THREE.BoxGeometry(.125,.6,.05),ledMat);led.position.set(14.2,1.6,3.03);scene.add(led);
  const recMat=new THREE.MeshBasicMaterial({color:P.rec,toneMapped:false});
  const rec=new THREE.Mesh(new THREE.BoxGeometry(.18,.18,.18),recMat);rec.position.set(18.1,4.2,10.2);scene.add(rec);
  const shade=new THREE.Mesh(new THREE.BoxGeometry(.7,.06,.7),new THREE.MeshBasicMaterial({color:"#ffe2a8",toneMapped:false}));
  shade.position.set(6.125,5.72,2.25);scene.add(shade);
  if(!light.lamp)shade.material.color.set("#5d5648"); // lamp switched off in daylight

  /* ------------------------------------------------------------ lights */
  scene.add(new THREE.HemisphereLight("#9ec0ff","#141d36",light.hemi));
  const sun=new THREE.DirectionalLight(light.sun[0],light.sun[1]);
  sun.position.set(22,30,24);sun.target.position.set(10,0,6);
  sun.castShadow=true;sun.shadow.mapSize.set(1024,1024);
  Object.assign(sun.shadow.camera,{left:-18,right:18,top:18,bottom:-18,near:1,far:90});
  sun.shadow.bias=-.0008;sun.shadow.normalBias=.02;
  scene.add(sun,sun.target);
  const lampLight=new THREE.PointLight("#ffb46b",light.lamp,12,2); // off by daylampLight.position.set(6.2,5.4,2.4);scene.add(lampLight);
  const screenLight=new THREE.PointLight("#7fa2ff",light.screen,9,2);screenLight.position.set(10.3,6,3);scene.add(screenLight);
  const windowLight=new THREE.PointLight(light.win[0],light.win[1],8,2);windowLight.position.set(3,8,1);scene.add(windowLight);

  /* ------------------------------------------------------------ chair */
  const chair=new THREE.Group();chair.position.set(10.375,0,6);scene.add(chair);
  {
    const C=[];
    box(C,-1.25,1.75,-1.25,2.5,.5,2.5,P.chair,.25,.04);
    box(C,-1.25,2.25,1,2.5,3,.5,P.chair,.25,.04);
    box(C,-1,2.5,1.25,2,2.5,.25,P.chairDark,.25,.03);
    box(C,-.25,.5,-.25,.5,1.25,.5,P.metal,.25,.04);
    for(const [dx,dz] of [[1,0],[-1,0],[0,1],[0,-1]])box(C,dx>0?.25:dx<0?-1.25:-.25,.25,dz>0?.25:dz<0?-1.25:-.25,dx?1:.5,.25,dz?1:.5,P.dark,.25);
    chair.add(instanced(C));
  }

  /* ------------------------------------------------------------ mini Fiqri */
  // Built on a half-voxel grid (0.5). Local forward is +z.
  const H=.5;
  const part=(parent,build,{x=0,y=0,z=0}={})=>{
    const pivot=new THREE.Group();pivot.position.set(x,y,z);parent.add(pivot);
    const overlay=new THREE.Group();pivot.add(overlay);
    const L=[];build(L);overlay.add(instanced(L,{receive:false}));
    return {pivot,overlay};
  };
  const hv=(L,x,y,z,w,h,d,hex,amount=.03,skip)=>box(L,x*H,y*H,z*H,w*H,h*H,d*H,hex,H,amount,skip);

  const fiqri=new THREE.Group();fiqri.scale.setScalar(.86);scene.add(fiqri);
  const hips=new THREE.Group();hips.position.y=2;fiqri.add(hips);
  const legL=part(hips,L=>{hv(L,-2,-4,-1,2,3,2,P.pants);hv(L,-2,-4,-1,2,1,3,P.shoe,.02)},{x:0});
  const legR=part(hips,L=>{hv(L,0,-4,-1,2,3,2,P.pants);hv(L,0,-4,-1,2,1,3,P.shoe,.02)},{x:0});
  const torso=part(hips,L=>{
    hv(L,-2.5,0,-1.5,5,5,3,P.sweater,.04);
    hv(L,-2.5,4,-1.5,5,1,3,P.sweaterHi,.03);
    // white collar points peeking out at the neckline
    hv(L,-1.5,4,1.5,1,1,.5,P.collar,.01);hv(L,.5,4,1.5,1,1,.5,P.collar,.01);
    hv(L,-.5,4.5,1.25,1,.5,.5,P.collar,.01);
  });
  const armL=part(torso.overlay,L=>{hv(L,-1,-5,-1,2,4,2,P.sweater,.04);hv(L,-1,-5.5,-1,2,1,2,P.skin,.02)},{x:-1.75,y:2.25});
  const armR=part(torso.overlay,L=>{hv(L,-1,-5,-1,2,4,2,P.sweater,.04);hv(L,-1,-5.5,-1,2,1,2,P.skin,.02)},{x:1.75,y:2.25});
  const head=part(torso.overlay,L=>{
    // Head on the 6×6×6 half-voxel grid. Hair REPLACES skin voxels (crown,
    // back, upper sides) so the silhouette stays a head, not a helmet; the
    // nape and ears stay visible. Eyes and mouth are painted on the face.
    const skin=color(P.skin),shade=color(P.skinShade),hair=color(P.hair),hi=color(P.hairHi),eye=color("#1a1d2a");
    for(let i=-3;i<3;i++)for(let j=0;j<6;j++)for(let k=-3;k<3;k++){
      const back=k<=-2&&j>=2,crown=j>=5,side=(i===-3||i===2)&&j>=3&&k<=0;
      const face=k===2;
      let c=skin;
      if(back||crown||side)c=crown&&(i*3+k)%5===0?hi:hair;
      else if(face&&j===2&&(i===-2||i===1))c=eye;
      else if(face&&j===0&&(i===-1||i===0))c=shade;
      else if(!face&&k<2&&k>-2&&j>0&&j<5&&i>-3&&i<2)continue; // hidden interior
      L.push([i*H,j*H,k*H,H,jitter(c,.03)]);
    }
    // volume on top, swept fringe falling to one side over the brow
    hv(L,-3,6,-3,6,1,5,P.hair,.05);hv(L,-2,7,-2,4,1,3,P.hairHi,.05);
    hv(L,-3,5,3,6,1,1,P.hair,.05);hv(L,-3,4,3,5,1,1,P.hair,.05);hv(L,-3,3,3,2,1,1,P.hairHi,.05);
    // ears
    hv(L,-4,2,0,1,2,1,P.skinShade,.02);hv(L,3,2,0,1,2,1,P.skinShade,.02);
    // neck
    hv(L,-1,-1,-1,2,1,2,P.skinShade,.02);
  },{y:2.5});
  // mug that travels with the right hand during coffee breaks
  const mugGroup=new THREE.Group();
  {
    const M=[];box(M,-.3,0,-.3,.6,.75,.6,P.cream,.15,.02);box(M,.3,.15,-.075,.15,.45,.15,P.cream,.15);
    box(M,-.15,.6,-.15,.3,.15,.3,"#6b4b3e",.15);
    mugGroup.add(instanced(M,{receive:false}));
  }
  const mugHome=new THREE.Vector3(17.2,3.25,1.1);
  mugGroup.position.copy(mugHome);scene.add(mugGroup);
  tag(mugGroup,"coffee");
  const machine=new THREE.Group();machine.position.set(18.2,4.2,.9);scene.add(machine);
  {const hit=new THREE.Mesh(new THREE.BoxGeometry(2.8,2.5,2),new THREE.MeshBasicMaterial({visible:false}));machine.add(hit);tag(machine,"coffee")}
  // steam voxels
  const steamMat=new THREE.MeshBasicMaterial({color:"#eef4ff",transparent:true,opacity:0,toneMapped:false});
  const steam=[0,1,2,3].map(()=>{const m=new THREE.Mesh(new THREE.BoxGeometry(.18,.18,.18),steamMat.clone());scene.add(m);return m});
  // invisible hit box around Fiqri for picking
  {const hit=new THREE.Mesh(new THREE.BoxGeometry(3.4,8,3),new THREE.MeshBasicMaterial({visible:false}));hit.position.y=4;fiqri.add(hit)}
  tag(fiqri,"wave");

  /* ------------------------------------------------------------ poses */
  const SEAT=new THREE.Vector3(10.375,0,6.1);
  const sitPose=()=>{
    fiqri.position.set(SEAT.x,0,SEAT.z);fiqri.rotation.y=Math.PI;
    hips.position.y=2.25;legL.pivot.rotation.x=legR.pivot.rotation.x=-Math.PI/2;
    legL.pivot.position.x=-.05;legR.pivot.position.x=.05;
    torso.pivot.rotation.x=0;head.pivot.rotation.set(0,0,0);
    armL.pivot.rotation.set(-1.25,0,.08);armR.pivot.rotation.set(-1.25,0,-.08);
    chair.rotation.y=0;
  };
  sitPose();

  /* ------------------------------------------------------------ choreography */
  const ease=t=>t<.5?4*t*t*t:1-Math.pow(-2*t+2,3)/2;
  function* wait(sec){let t=0;while(t<sec)t+=yield}
  function* tween(sec,fn){if(reduced()){fn(1);return}let t=0;fn(0);while(t<sec){t+=yield;fn(ease(Math.min(1,t/sec)))}}
  function* to(sec,list){
    const from=list.map(([o,k])=>o[k]);
    yield* tween(sec,t=>list.forEach(([o,k,v],i)=>{o[k]=from[i]+(v-from[i])*t}));
  }
  const angle=a=>Math.atan2(Math.sin(a),Math.cos(a));
  let typing=false,walking=false,sipping=false,mood="edit",renderProgress=0,renderDone=0;
  let job=null,queue=null,autonomous=true,lookTimer=6;

  const announce=(mode,byUser)=>{mood=mode;onState?.(mode,byUser)};

  function* walkTo(x,z,speed=2.6){
    const dx=x-fiqri.position.x,dz=z-fiqri.position.z,dist=Math.hypot(dx,dz);
    if(dist<.05)return;
    const face=Math.atan2(dx,dz),turn=angle(face-fiqri.rotation.y);
    yield* to(.25,[[fiqri.rotation,"y",fiqri.rotation.y+turn]]);
    walking=true;
    yield* to(dist/speed,[[fiqri.position,"x",x],[fiqri.position,"z",z]]);
    walking=false;
  }
  function* standUp(){
    typing=false;
    yield* to(.45,[[armL.pivot.rotation,"x",0],[armR.pivot.rotation,"x",0],[torso.pivot.rotation,"x",0]]);
    yield* to(.5,[[fiqri.position,"z",SEAT.z+1.6],[hips.position,"y",2],[legL.pivot.rotation,"x",0],[legR.pivot.rotation,"x",0],[chair.rotation,"y",.5]]);
  }
  function* sitDown(){
    yield* walkTo(SEAT.x,SEAT.z+1.6);
    yield* to(.3,[[fiqri.rotation,"y",Math.PI]]);
    yield* to(.55,[[fiqri.position,"x",SEAT.x],[fiqri.position,"z",SEAT.z],[hips.position,"y",2.25],[legL.pivot.rotation,"x",-Math.PI/2],[legR.pivot.rotation,"x",-Math.PI/2],[chair.rotation,"y",0]]);
    yield* to(.35,[[armL.pivot.rotation,"x",-1.25],[armR.pivot.rotation,"x",-1.25]]);
  }
  const seated=()=>Math.abs(hips.position.y-2.25)<.01&&fiqri.position.distanceTo(SEAT)<.05;

  function* edit(sec=9){
    if(!seated())yield* sitDown();
    announce("edit",false);typing=true;
    yield* wait(sec);
  }
  function* render(){
    if(!seated())yield* sitDown();
    announce("render",false);typing=false;renderProgress=0;renderDone=0;
    yield* to(.6,[[torso.pivot.rotation,"x",-.16],[armL.pivot.rotation,"x",-2.75],[armR.pivot.rotation,"x",-2.75],[armL.pivot.rotation,"z",.55],[armR.pivot.rotation,"z",-.55]]);
    let t=0;while(t<4.2){t+=yield;renderProgress=Math.min(1,t/4)}
    renderDone=1;
    yield* to(.4,[[torso.pivot.rotation,"x",0],[armL.pivot.rotation,"x",-1.25],[armR.pivot.rotation,"x",-1.25],[armL.pivot.rotation,"z",.08],[armR.pivot.rotation,"z",-.08]]);
    yield* wait(1);
  }
  function* coffee(){
    announce("coffee",false);
    if(seated())yield* standUp();
    yield* walkTo(18.95,3.9); // right hand (world -x when facing the wall) lands on the mug
    yield* to(.3,[[fiqri.rotation,"y",Math.PI]]);
    yield* to(.4,[[armR.pivot.rotation,"x",-1.35]]);
    // pick the mug up into the right hand
    armR.overlay.add(mugGroup);mugGroup.position.set(0,-2.95,0);
    yield* to(.35,[[armR.pivot.rotation,"x",-.35]]);
    yield* to(.6,[[fiqri.rotation,"y",0]]); // face the camera to sip
    for(let i=0;i<2;i++){
      sipping=true;
      yield* to(.5,[[armR.pivot.rotation,"x",-2.1],[armR.pivot.rotation,"z",.35],[head.pivot.rotation,"x",-.18]]);
      yield* wait(.8);
      yield* to(.45,[[armR.pivot.rotation,"x",-.35],[armR.pivot.rotation,"z",0],[head.pivot.rotation,"x",0]]);
      sipping=false;yield* wait(.5);
    }
    yield* to(.5,[[fiqri.rotation,"y",Math.PI]]);
    yield* to(.35,[[armR.pivot.rotation,"x",-1.35]]);
    scene.add(mugGroup);mugGroup.position.copy(mugHome);mugGroup.rotation.set(0,0,0);
    yield* to(.3,[[armR.pivot.rotation,"x",0]]);
    yield* sitDown();
  }
  function* wave(){
    announce("wave",false);
    const wasSeated=seated();typing=false;
    if(wasSeated){
      // spin the chair round to face whoever is looking at the room
      const turn=angle(cameraYaw()-Math.PI);
      yield* to(.7,[[chair.rotation,"y",turn],[fiqri.rotation,"y",Math.PI+turn],[armL.pivot.rotation,"x",0],[armR.pivot.rotation,"x",-.2]]);
    }else{
      yield* to(.5,[[fiqri.rotation,"y",angle(cameraYaw())]]);
    }
    yield* to(.35,[[armR.pivot.rotation,"x",-2.9],[armR.pivot.rotation,"z",-.25],[head.pivot.rotation,"z",.12]]);
    for(let i=0;i<3;i++){
      yield* to(.22,[[armR.pivot.rotation,"z",-.65]]);
      yield* to(.22,[[armR.pivot.rotation,"z",-.1]]);
    }
    yield* to(.35,[[armR.pivot.rotation,"x",wasSeated?-1.25:0],[armR.pivot.rotation,"z",wasSeated?-.08:0],[head.pivot.rotation,"z",0]]);
    if(wasSeated)yield* to(.7,[[chair.rotation,"y",0],[fiqri.rotation,"y",Math.PI],[armL.pivot.rotation,"x",-1.25]]);
  }
  function* life(){
    // The autonomous day: a long edit, a render, more cutting, a coffee break.
    for(;;){
      yield* edit(9);
      yield* render();
      yield* edit(7);
      yield* coffee();
    }
  }
  function* userAction(kind){
    if(kind==="edit")yield* edit(6);
    else if(kind==="render")yield* render();
    else if(kind==="coffee")yield* coffee();
    else if(kind==="wave")yield* wave();
    announce("edit",false);
  }
  // With reduced motion the room stays still: Fiqri edits, and only reacts
  // (instantly, without travel) when the visitor asks.
  function* still(){announce("edit",false);for(;;)yield* wait(1e9)}
  const routine=()=>reduced()?still():life();
  const start=gen=>{job=gen;job.next()};
  start(routine());

  function trigger(kind){
    // Finish any half-held mug cleanly before switching.
    if(mugGroup.parent!==scene){scene.add(mugGroup);mugGroup.position.copy(mugHome);mugGroup.rotation.set(0,0,0)}
    typing=false;walking=false;sipping=false;
    const resume=function*(){yield* userAction(kind);yield* routine()};
    start(resume());
    onState?.(kind,true);
  }

  /* ------------------------------------------------------------ screens */
  const clips=[["#7d93f0",0,26],["#5fd0c8",28,22],["#a6a0ff",52,30],["#7d93f0",84,18],["#d58ca3",104,26]];
  let feedTime=0,playX=0;
  function paintScreens(dt){
    feedTime+=dt;
    // no showreel shot yet: rotate through the highlighted projects every 5 s
    if(!reelFromShowreel&&reelIds.length){reel.clock-=dt;if(reel.clock<=0){reel.clock=5;loadShot(reelIds[reel.next++%reelIds.length])}}
    // LEFT: editing timeline
    let g=left.ctx;
    g.fillStyle="#0c1230";g.fillRect(0,0,120,84);
    g.fillStyle="#1c2550";g.fillRect(0,0,120,9);
    g.fillStyle="#f1a9b0";g.fillRect(4,3,3,3);g.fillStyle="#eed5ac";g.fillRect(9,3,3,3);g.fillStyle="#8ddbcc";g.fillRect(14,3,3,3);
    // source viewer with a little mountain shot
    g.fillStyle="#3a4c94";g.fillRect(6,13,52,30);
    g.fillStyle="#7d97e6";g.beginPath();g.moveTo(6,43);g.lineTo(22,26);g.lineTo(32,34);g.lineTo(44,22);g.lineTo(58,40);g.lineTo(58,43);g.fill();
    g.fillStyle="#c9d8ff";g.fillRect(46,17,4,4);
    g.fillStyle="#526aa7";g.fillRect(64,13,50,6);g.fillStyle="#6376ae";g.fillRect(64,23,38,4);g.fillRect(64,31,46,4);
    // tracks
    const scroll=(feedTime*6)%140;
    for(let track=0;track<3;track++){
      const y=52+track*9;g.fillStyle="#141b40";g.fillRect(4,y,112,7);
      clips.forEach(([c,x0,w],i)=>{const x=((x0+track*17-scroll)%140+140)%140-10;g.fillStyle=track===2?"#55618f":c;g.fillRect(4+x,y+1,w-(track*3),5)});
    }
    playX=mood==="edit"?(playX+dt*14)%112:playX;
    g.fillStyle="#e9f3ff";g.fillRect(4+playX,48,1,34);g.fillRect(3+playX,47,3,2);
    left.t.needsUpdate=true;
    // RIGHT: program monitor / render / break
    g=right.ctx;
    g.fillStyle="#0c1230";g.fillRect(0,0,120,84);
    if(mood==="render"){
      g.fillStyle="#152056";g.fillRect(10,26,100,34);
      g.fillStyle="#dfe7ff";g.font="bold 9px monospace";g.fillText(renderProgress<1?"RENDERING":"EXPORTED",16,40);
      g.fillStyle="#26315f";g.fillRect(16,46,88,6);
      g.fillStyle=renderProgress<1?"#88dbc8":"#5fe0c8";g.fillRect(16,46,Math.round(88*renderProgress),6);
      g.fillStyle="#9fb2e8";g.font="8px monospace";g.fillText(Math.round(renderProgress*100)+"%",90,40);
    }else if(mood==="coffee"){
      g.fillStyle="#1a2252";g.fillRect(0,0,120,84);
      g.fillStyle="#9aa8ff";g.font="bold 10px monospace";g.fillText("BRB",48,44);
      g.fillStyle="#5fe0c8";g.fillRect(44,50,32,1);
    }else if(reel.img){
      // real project frame, centre-cropped from the 4:3 YouTube still, pixelated
      g.imageSmoothingEnabled=false;
      g.fillStyle="#04060a";g.fillRect(0,0,120,84);
      g.drawImage(reel.img,0,45,480,270,6,6,108,62);
      g.fillStyle="#04060acc";g.fillRect(6,58,14,10);g.fillStyle="#fff";g.beginPath();g.moveTo(10,60);g.lineTo(16,63);g.lineTo(10,66);g.fill();
      g.fillStyle="#141b40";g.fillRect(6,72,108,6);g.fillStyle="#9fc6fa";g.fillRect(6,72,Math.round(108*((feedTime%5)/5)),6);
    }else{
      const hue=(Math.floor(feedTime/3)%4);
      const sky=[["#2b3a8a","#8a7fe0"],["#16304a","#4fb3a5"],["#3a2b6a","#d98a9a"],["#1e2b66","#7aa2ff"]][hue];
      const grd=g.createLinearGradient(0,0,0,70);grd.addColorStop(0,sky[0]);grd.addColorStop(1,sky[1]);
      g.fillStyle=grd;g.fillRect(6,6,108,62);
      g.fillStyle="#0f163b";const off=(feedTime*10)%30;
      for(let x=-30;x<120;x+=30){g.fillRect(6+x+off,48,18,20);g.fillRect(16+x+off,40,8,28)}
      g.fillStyle="#141b40";g.fillRect(6,72,108,6);g.fillStyle="#9fc6fa";g.fillRect(6,72,Math.round(108*((feedTime%5)/5)),6);
    }
    right.t.needsUpdate=true;
  }

  /* ------------------------------------------------------------ camera */
  const target=new THREE.Vector3(9.6,4.6,6.2);
  const HOME_AZ=1.0,HOME_EL=.58;
  let az=HOME_AZ,el=HOME_EL,azGoal=HOME_AZ,elGoal=HOME_EL,drift=0,dragging=false,lastX=0,lastY=0,userTurned=0;
  const cameraYaw=()=>az; // world yaw that faces the viewer
  function frame(){
    const w=host.clientWidth||1,h=host.clientHeight||1,aspect=w/h;
    const size=aspect>1.15?12.4:aspect>.9?14.2:15.4;
    camera.left=-size*aspect;camera.right=size*aspect;camera.top=size;camera.bottom=-size;
    camera.updateProjectionMatrix();
  }
  function placeCamera(){
    const d=60;
    camera.position.set(target.x+Math.sin(az)*Math.cos(el)*d,target.y+Math.sin(el)*d,target.z+Math.cos(az)*Math.cos(el)*d);
    camera.lookAt(target);
  }

  /* ------------------------------------------------------------ input */
  const ray=new THREE.Raycaster(),ndc=new THREE.Vector2();
  const pick=e=>{
    const r=canvas.getBoundingClientRect();
    ndc.set(((e.clientX-r.left)/r.width)*2-1,-((e.clientY-r.top)/r.height)*2+1);
    ray.setFromCamera(ndc,camera);
    const hit=ray.intersectObjects(interactive,true)[0];
    return hit?.object?.userData?.action||null;
  };
  let downX=0,downY=0,downAt=0;
  canvas.addEventListener("pointerdown",e=>{dragging=true;lastX=downX=e.clientX;lastY=downY=e.clientY;downAt=performance.now();if(e.pointerType!=="touch")canvas.setPointerCapture?.(e.pointerId)});
  canvas.addEventListener("pointermove",e=>{
    if(dragging){
      const dx=e.clientX-lastX,dy=e.clientY-lastY;lastX=e.clientX;lastY=e.clientY;
      azGoal=Math.min(1.45,Math.max(.12,azGoal-dx*.006));
      if(e.pointerType!=="touch")elGoal=Math.min(.9,Math.max(.32,elGoal+dy*.004));
      userTurned=performance.now();
    }else if(e.pointerType==="mouse"){
      canvas.style.cursor=pick(e)?"pointer":"grab";
    }
  });
  const end=e=>{
    if(!dragging)return;dragging=false;
    const moved=Math.hypot(e.clientX-downX,e.clientY-downY);
    if(moved<6&&performance.now()-downAt<500){
      const action=pick(e);
      if(action==="project"){if(!openReelProject())trigger("edit")}
      else if(action)trigger(action);
    }
  };
  canvas.addEventListener("pointerup",end);
  canvas.addEventListener("pointercancel",()=>{dragging=false});
  canvas.addEventListener("pointerleave",e=>{if(e.pointerType==="mouse")dragging=false});

  /* ------------------------------------------------------------ loop */
  let running=false,raf=0,last=0,screenClock=0,frames=0;
  const clock=()=>performance.now()/1000;
  function tick(){
    raf=0;if(!running)return;
    const now=clock(),dt=Math.min(.1,now-last||0);last=now;
    // camera: gentle drift unless the visitor has turned the room recently
    if(!reduced()){
      drift+=dt;
      if(performance.now()-userTurned>4000&&!dragging){azGoal+=(HOME_AZ+Math.sin(drift*.18)*.2-azGoal)*.01;elGoal+=(HOME_EL-elGoal)*.01}
    }
    az+=(azGoal-az)*.12;el+=(elGoal-el)*.12;placeCamera();
    // choreography
    if(job){const r=job.next(dt);if(r.done)job=null}
    // procedural overlays
    const t=now;
    const moving=!reduced();
    armL.overlay.rotation.x=typing&&moving?Math.sin(t*18)*.09:0;
    armR.overlay.rotation.x=typing&&moving?Math.sin(t*18+1.7)*.09:0;
    const step=walking&&moving?Math.sin(t*11):0;
    legL.overlay.rotation.x=step*.6;legR.overlay.rotation.x=-step*.6;
    if(walking){armL.overlay.rotation.x=-step*.45;armR.overlay.rotation.x=step*.45}
    fiqri.position.y=walking&&moving?Math.abs(Math.cos(t*11))*.08:0;
    // keep the mug upright in the hand whatever the arm is doing
    if(mugGroup.parent===armR.overlay){
      mugGroup.rotation.x=-(armR.pivot.rotation.x+armR.overlay.rotation.x);
      mugGroup.rotation.z=-armR.pivot.rotation.z;
    }
    torso.overlay.position.y=moving?Math.sin(t*1.6)*.03:0; // breathing
    head.overlay.rotation.x=typing&&moving?Math.sin(t*2.4)*.04:0;
    // the occasional glance over the shoulder while editing
    if(typing&&moving){lookTimer-=dt;head.overlay.rotation.y=lookTimer<0&&lookTimer>-1.4?Math.sin((lookTimer+1.4)/1.4*Math.PI)*-.7:0;if(lookTimer<-1.4)lookTimer=7+Math.random()*5}
    else head.overlay.rotation.y=0;
    // steam from the mug in hand
    const mugPos=new THREE.Vector3();mugGroup.getWorldPosition(mugPos);
    steam.forEach((m,i)=>{
      const k=((t*.6+i/steam.length)%1);
      const on=mood==="coffee"&&mugGroup.parent!==scene&&moving;
      m.material.opacity=on?(1-k)*.75:0;
      m.position.set(mugPos.x+Math.sin(t*2+i)*.12,mugPos.y+.6+k*1.6,mugPos.z+Math.cos(t*2+i)*.12);
    });
    // blinking REC light + LED pulse
    recMat.color.set(Math.floor(t*1.2)%2?"#3a1520":P.rec);
    ledMat.color.setRGB(.37,.88+.1*Math.sin(t*3),.78);
    screenLight.intensity=mood==="render"?light.screen*1.25:mood==="coffee"?light.screen*.45:light.screen;
    screenClock+=dt;if(screenClock>1/12){paintScreens(screenClock);screenClock=0}
    renderer.render(scene,camera);
    frames++;host.dataset.frames=String(frames);
    raf=requestAnimationFrame(tick);
  }
  function resize(){
    const w=host.clientWidth||1,h=host.clientHeight||1;
    renderer.setSize(w,h,false);frame();placeCamera();
    if(!running)renderer.render(scene,camera);
  }
  const ro=new ResizeObserver(resize);ro.observe(host);
  resize();paintScreens(0);placeCamera();renderer.render(scene,camera);

  function setRunning(on){
    if(on===running)return;running=on;
    if(on){last=clock();if(!raf)raf=requestAnimationFrame(tick)}
    else if(raf){cancelAnimationFrame(raf);raf=0}
  }
  let userPaused=false,inView=false;
  const io=new IntersectionObserver(es=>{inView=es.some(e=>e.isIntersecting);setRunning(inView&&!document.hidden&&!userPaused)},{threshold:.05});
  io.observe(host);
  document.addEventListener("visibilitychange",()=>{if(document.hidden)setRunning(false);else{const r=host.getBoundingClientRect();setRunning(r.bottom>0&&r.top<innerHeight&&!userPaused)}});
  reducedMotion?.addEventListener?.("change",()=>{if(reduced()){azGoal=HOME_AZ;elGoal=HOME_EL}});

  const api={
    trigger,
    // Visitor pause (R-39): freezes the routine, the camera drift and the REC light.
    setPaused(on){userPaused=Boolean(on);setRunning(!userPaused&&inView&&!document.hidden);if(userPaused)renderer.render(scene,camera)},
    get paused(){return userPaused},
    // Cameo stills for other sections (rendered once by tools/render-cameos.mjs,
    // never at runtime on the page): Fiqri alone on a transparent ground.
    cameo(pose,frame=0){
      setRunning(false);job=null;typing=walking=sipping=false;
      scene.children.forEach(o=>{if(!o.isLight&&o!==sun.target)o.visible=o===fiqri||(pose==="sleep"&&o===chair)||(pose==="coffee"&&o===mugGroup)});
      [armL,armR,legL,legR,head,torso].forEach(p=>{p.overlay.rotation.set(0,0,0);p.overlay.position.set(0,0,0)});
      fiqri.position.set(10,0,8);fiqri.rotation.set(0,0,0);
      head.pivot.rotation.set(0,0,0);torso.pivot.rotation.set(0,0,0);
      armL.pivot.rotation.set(0,0,.06);armR.pivot.rotation.set(0,0,-.06);
      legL.pivot.rotation.set(0,0,0);legR.pivot.rotation.set(0,0,0);hips.position.y=2;
      el=.2;az=HOME_AZ; // a lower, friendlier camera than the room's: face first, not the crown
      const face=az; // turn to the camera
      if(pose==="wave"){
        fiqri.rotation.y=face;
        armR.pivot.rotation.set(0,0,frame%2?2.65:2.2); // raised out to the side
        head.pivot.rotation.set(0,0,frame%2?-.1:-.04);
      }else if(pose==="coffee"){
        fiqri.rotation.y=face;
        armR.overlay.add(mugGroup);mugGroup.position.set(0,-2.95,0);mugGroup.visible=true;
        armR.pivot.rotation.set(frame%2?-2.15:-1.2,0,frame%2?.3:.12);
        mugGroup.rotation.set(-(armR.pivot.rotation.x),0,-armR.pivot.rotation.z);
        head.pivot.rotation.set(frame%2?-.18:0,0,0);
      }else if(pose==="sleep"){
        chair.position.set(10,0,8);chair.rotation.y=face-Math.PI;
        fiqri.rotation.y=face;fiqri.position.set(10,0,8);
        hips.position.y=2.25;legL.pivot.rotation.x=legR.pivot.rotation.x=-Math.PI/2;
        torso.pivot.rotation.x=.06;head.pivot.rotation.set(.22,0,frame%2?.46:.38); // dozing, head on one side
        armL.pivot.rotation.set(-1.2,0,.85);armR.pivot.rotation.set(-1.2,0,-.85);
      }
      // frame the figure: target its middle, tight orthographic view
      target.set(10,pose==="sleep"?3.4:4.1,8);
      const w=host.clientWidth||1,h=host.clientHeight||1,aspect=w/h,size=pose==="sleep"?4.4:5.2;
      camera.left=-size*aspect;camera.right=size*aspect;camera.top=size;camera.bottom=-size;camera.updateProjectionMatrix();
      sun.shadow.camera.updateProjectionMatrix();
      placeCamera();renderer.setClearColor(0x000000,0);renderer.render(scene,camera);
    },
    // Fast-forward the choreography (used by the browser smoke test).
    advance(sec){for(let t=0;t<sec;t+=.05){if(job){const r=job.next(.05);if(r.done)job=null}}placeCamera();renderer.render(scene,camera)},
    get mode(){return mood},
    destroy(){setRunning(false);io.disconnect();ro.disconnect();renderer.dispose();canvas.remove()}
  };
  host.fqVoxel=api;
  return api;
}
