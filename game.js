/* SAN PATRICK — CORE RESILIENTE
   Arquitectura: BOOT → VALIDATE → ENGINE → WORLD → INPUT → RECOVERY.
   Si Three.js falla, el juego cae automáticamente a un motor 2D local.
   No hay pantalla de inicio: el mundo intenta arrancar siempre.
*/
const CONFIG=Object.freeze({
  version:"0.1.0-resilient",
  world:{w:1200,h:900},
  player:{speed:180,spawn:{x:600,y:500}},
  saveKey:"san-patrick-resilient-save-v1",
  watchdogMs:4500
});

const $=id=>document.getElementById(id);
const ui={canvas:$("game"),status:$("status"),boot:$("boot"),menu:$("menu"),panel:$("menuPanel"),close:$("close"),resume:$("resume"),recover:$("recover"),toast:$("toast"),diag:$("diag")};
const state={
  running:false,paused:false,engine:"fallback",fatal:false,lastFrame:performance.now(),
  player:{x:CONFIG.player.spawn.x,y:CONFIG.player.spawn.y,heading:0},
  vehicle:null,time:8.5,weather:"despejado",messageUntil:0,message:"",
  keys:new Set(),entities:[],roads:[],zones:[],lastSaved:0,frames:0
};

const RULES=Object.freeze({
  roadsFirst:true,noBuildingOnRoad:true,
  chanarFirst:true,gameplayFirst:true,
  fallbackEngine:true,autoRecover:true,
  noStartScreen:true
});

function safe(fn,fallback=null){
  try{return fn()}catch(err){console.warn("SAN PATRICK safe:",err);return fallback}
}
function setStatus(t){ui.status.textContent=t}
function toast(t){
  state.message=t;state.messageUntil=performance.now()+2400;ui.toast.textContent=t;ui.toast.style.opacity="1";
}
function hideToast(){if(performance.now()>state.messageUntil)ui.toast.style.opacity="0"}

function validate(){
  const required=["game","menu","menuPanel","resume","recover"];
  const missing=required.filter(id=>!$(id));
  if(missing.length) throw new Error("Faltan nodos: "+missing.join(","));
  if(!ui.canvas.getContext) throw new Error("Canvas no disponible");
  if(!Number.isFinite(CONFIG.player.spawn.x)) throw new Error("Spawn inválido");
  return true;
}

/* ---------- WORLD DATA: structure before decoration ---------- */
const WORLD=Object.freeze({
  sectors:[
    {id:"center",name:"Centro",x:600,y:430,w:300,h:210},
    {id:"barrios",name:"Barrios",x:600,y:260,w:470,h:190},
    {id:"produccion",name:"Chacras y producción",x:260,y:480,w:300,h:300},
    {id:"industrial",name:"Parque Industrial",x:930,y:470,w:300,h:270},
    {id:"barda",name:"Bardas",x:600,y:80,w:1200,h:160},
    {id:"rio",name:"Río Neuquén / costa",x:600,y:825,w:1200,h:150}
  ],
  roads:[
    {x:600,y:430,w:1040,h:30,name:"Av. principal"},
    {x:600,y:590,w:850,h:22,name:"Eje sur"},
    {x:600,y:275,w:760,h:20,name:"Eje norte"},
    {x:410,y:430,w:20,h:520,name:"Eje oeste"},
    {x:790,y:430,w:20,h:520,name:"Eje este"},
    {x:210,y:570,w:20,h:470,name:"Picada oeste"},
    {x:990,y:570,w:20,h:470,name:"Picada este"},
    {x:600,y:700,w:700,h:16,name:"Costanera"}
  ],
  places:[
    {x:600,y:430,name:"CENTRO",kind:"civic"},
    {x:600,y:120,name:"BARDAS",kind:"land"},
    {x:600,y:775,name:"COSTA / RÍO",kind:"river"},
    {x:270,y:520,name:"CHACRAS",kind:"rural"},
    {x:930,y:520,name:"PARQUE INDUSTRIAL",kind:"work"},
    {x:600,y:610,name:"PLAZA / DEPORTE",kind:"life"}
  ],
  houses:[
    [500,340],[550,340],[650,340],[700,340],[500,390],[700,390],
    [500,480],[550,480],[650,480],[700,480],[540,540],[660,540],
    [330,350],[870,350],[330,430],[870,430]
  ]
});

function buildWorldData(){
  state.roads=WORLD.roads.map(r=>({...r}));
  state.zones=WORLD.sectors.map(z=>({...z}));
  state.entities=[];
  for(let i=0;i<24;i++){
    const side=i%2?1:-1;
    state.entities.push({type:"person",x:600+side*(50+(i*37)%230),y:300+((i*53)%280),homeX:600+side*(50+(i*37)%230),homeY:300+((i*53)%280),phase:i});
  }
  for(let i=0;i<8;i++) state.entities.push({type:"car",x:270+i*105,y:430+(i%2)*155,phase:i,heading:i%2?0:Math.PI/2});
}

function roadHit(x,y,r=12){
  return state.roads.some(a=>Math.abs(x-a.x)<a.w/2+r&&Math.abs(y-a.y)<a.h/2+r);
}
function clampPlayer(){
  state.player.x=Math.max(25,Math.min(CONFIG.world.w-25,state.player.x));
  state.player.y=Math.max(25,Math.min(CONFIG.world.h-25,state.player.y));
}
function sectorAt(x,y){
  let best="territorio";
  let dist=Infinity;
  for(const z of state.zones){
    const dx=Math.max(Math.abs(x-z.x)-z.w/2,0),dy=Math.max(Math.abs(y-z.y)-z.h/2,0);
    const d=dx*dx+dy*dy;
    if(d<dist){dist=d;best=z.name}
  }
  return best;
}

/* ---------- FALLBACK 2D ENGINE ---------- */
class FallbackEngine{
  constructor(canvas){this.canvas=canvas;this.ctx=canvas.getContext("2d",{alpha:false});}
  resize(){this.canvas.width=Math.max(320,innerWidth*devicePixelRatio);this.canvas.height=Math.max(240,innerHeight*devicePixelRatio);this.canvas.style.width="100%";this.canvas.style.height="100%";this.ctx.setTransform(devicePixelRatio,0,0,devicePixelRatio,0,0);}
  start(){this.resize();addEventListener("resize",()=>this.resize());setStatus("MODO RESCATE · JUGABLE");}
  update(dt){
    if(state.paused)return;
    let dx=0,dy=0;
    if(state.keys.has("w")||state.keys.has("arrowup"))dy-=1;
    if(state.keys.has("s")||state.keys.has("arrowdown"))dy+=1;
    if(state.keys.has("a")||state.keys.has("arrowleft"))dx-=1;
    if(state.keys.has("d")||state.keys.has("arrowright"))dx+=1;
    const len=Math.hypot(dx,dy)||1;
    if(dx||dy){state.player.x+=dx/len*CONFIG.player.speed*dt;state.player.y+=dy/len*CONFIG.player.speed*dt;state.player.heading=Math.atan2(dx,dy);}
    clampPlayer();
    state.time=(state.time+dt*.06)%24;
    state.entities.forEach((e,i)=>{
      if(e.type==="person"){e.x=e.homeX+Math.sin(performance.now()*.0005+e.phase)*35;e.y=e.homeY+Math.cos(performance.now()*.0004+e.phase)*22}
      if(e.type==="car"){e.x+=Math.cos(e.heading)*dt*24;if(e.x>1050)e.x=150}
    });
  }
  draw(){
    const c=this.ctx,w=innerWidth,h=innerHeight;
    c.fillStyle="#7f8878";c.fillRect(0,0,w,h);
    const zoom=Math.min(w/760,h/560),ox=w/2-state.player.x*zoom,oy=h/2-state.player.y*zoom;
    c.save();c.translate(ox,oy);c.scale(zoom,zoom);
    c.fillStyle="#7d735e";c.fillRect(0,0,CONFIG.world.w,CONFIG.world.h);
    c.fillStyle="#6d513f";c.fillRect(0,0,1200,220);
    c.fillStyle="#416d79";c.fillRect(0,775,1200,125);
    c.fillStyle="#8c826b";c.fillRect(0,745,1200,30);
    for(const r of state.roads){c.fillStyle="#454846";c.fillRect(r.x-r.w/2,r.y-r.h/2,r.w,r.h)}
    for(const hse of WORLD.houses){c.fillStyle="#b7a68c";c.fillRect(hse[0]-18,hse[1]-12,36,24)}
    for(const p of WORLD.places){c.fillStyle=p.kind==="river"?"#6c948f":p.kind==="land"?"#87654d":"#6d735e";c.fillRect(p.x-20,p.y-12,40,24)}
    state.entities.forEach(e=>{
      if(e.type==="car"){c.fillStyle="#313d40";c.fillRect(e.x-12,e.y-7,24,14)}
      else{c.fillStyle="#243f52";c.fillRect(e.x-4,e.y-8,8,16)}
    });
    c.save();c.translate(state.player.x,state.player.y);c.rotate(state.player.heading);c.fillStyle="#203f53";c.fillRect(-7,-10,14,20);c.fillStyle="#c48768";c.beginPath();c.arc(0,-14,6,0,Math.PI*2);c.fill();c.restore();
    c.restore();
  }
  frame(){this.update(.016);this.draw();}
}

let engine=null;

async function loadThree(){
  const mod=await import("https://cdn.jsdelivr.net/npm/three@0.160.0/build/three.module.js");
  return mod;
}

class ThreeEngine{
  constructor(THREE,canvas){this.T=THREE;this.canvas=canvas;this.scene=new THREE.Scene();this.camera=new THREE.PerspectiveCamera(62,innerWidth/innerHeight,.1,1800);this.renderer=new THREE.WebGLRenderer({canvas,antialias:true});this.group=new THREE.Group();this.scene.add(this.group);this.meshPlayer=null;this.meshCars=[];}
  start(){
    const T=this.T;this.scene.background=new T.Color(0x8fa09a);this.scene.fog=new T.Fog(0x8fa09a,160,1200);
    this.renderer.setPixelRatio(Math.min(devicePixelRatio,1.5));this.renderer.setSize(innerWidth,innerHeight,false);this.renderer.shadowMap.enabled=true;
    this.scene.add(new T.HemisphereLight(0xeaf0e8,0x514438,1.9));
    const sun=new T.DirectionalLight(0xffe6bf,2.8);sun.position.set(-180,260,180);sun.castShadow=true;this.scene.add(sun);
    const mat=c=>new T.MeshStandardMaterial({color:c,roughness:.9});
    const box=(x,y,z,w,h,d,c)=>{const m=new T.Mesh(new T.BoxGeometry(w,h,d),mat(c));m.position.set(x,y,z);m.castShadow=true;m.receiveShadow=true;this.group.add(m);return m};
    box(600,-.3,450,1200,.6,900,0x81755f);
    for(const r of WORLD.roads)box(r.x,.03,r.y,r.w,.08,r.h,0x3e4240);
    box(600,.04,837,1200,.1,126,0x426f7b);box(600,.03,760,1200,.06,28,0x8b826e);
    box(600,18,110,1200,36,180,0x795844);
    for(const hse of WORLD.houses)box(hse[0],3,hse[1],36,6,24,0xb7a68c);
    for(const p of WORLD.places){box(p.x,1.2,p.y,42,2.4,30,p.kind==="river"?0x577c83:p.kind==="land"?0x80634e:0x6b725e)}
    for(const e of state.entities){
      if(e.type==="person"){const g=new T.Group();const b=new T.Mesh(new T.BoxGeometry(7,15,5),mat(0x29495e));b.position.y=9;g.add(b);const h=new T.Mesh(new T.SphereGeometry(3.5,8,6),mat(0xb97d5d));h.position.y=19;g.add(h);g.position.set(e.x,0,e.y);this.group.add(g);e.mesh=g}
      else{const m=box(e.x,2,e.y,24,4,14,0x485257);e.mesh=m;this.meshCars.push(e)}
    }
    const pg=new T.Group();const body=new T.Mesh(new T.BoxGeometry(9,18,6),mat(0x29475a));body.position.y=10;pg.add(body);const head=new T.Mesh(new T.SphereGeometry(4,10,8),mat(0xb97d5d));head.position.y=22;pg.add(head);this.group.add(pg);this.meshPlayer=pg;
    addEventListener("resize",()=>{this.camera.aspect=innerWidth/innerHeight;this.camera.updateProjectionMatrix();this.renderer.setSize(innerWidth,innerHeight,false)});
    setStatus("MODO 3D · JUGABLE");
  }
  update(dt){
    if(state.paused)return;
    let dx=0,dy=0;if(state.keys.has("w")||state.keys.has("arrowup"))dy-=1;if(state.keys.has("s")||state.keys.has("arrowdown"))dy+=1;if(state.keys.has("a")||state.keys.has("arrowleft"))dx-=1;if(state.keys.has("d")||state.keys.has("arrowright"))dx+=1;
    const len=Math.hypot(dx,dy)||1;if(dx||dy){state.player.x+=dx/len*CONFIG.player.speed*dt;state.player.y+=dy/len*CONFIG.player.speed*dt;state.player.heading=Math.atan2(dx,dy)}clampPlayer();
    state.time=(state.time+dt*.06)%24;
    for(const e of state.entities){if(e.type==="person"){e.x=e.homeX+Math.sin(performance.now()*.0005+e.phase)*35;e.y=e.homeY+Math.cos(performance.now()*.0004+e.phase)*22}if(e.type==="car"){e.x+=Math.cos(e.heading)*dt*24;if(e.x>1050)e.x=150}if(e.mesh)e.mesh.position.set(e.x,e.type==="person"?0:2,e.y)}}
    this.meshPlayer.position.set(state.player.x,0,state.player.y);this.meshPlayer.rotation.y=state.player.heading;
    const target=this.meshPlayer;const desired=new this.T.Vector3(target.position.x+110,75,target.position.z+130);this.camera.position.lerp(desired,Math.min(1,dt*5));this.camera.lookAt(target.position.x,5,target.position.z);
  }
  draw(){this.renderer.render(this.scene,this.camera)}
  frame(){this.update(.016);this.draw()}
}

function resetEngine(){
  safe(()=>{if(engine?.renderer)engine.renderer.dispose()});
  state.engine="fallback";engine=new FallbackEngine(ui.canvas);engine.start();
  toast("Modo de rescate activado: el juego sigue.");
}

async function boot(){
  try{validate();buildWorldData();loadSave();bindInput();resetEngine();
    try{
      const T=await Promise.race([loadThree(),new Promise((_,rej)=>setTimeout(()=>rej(new Error("3D timeout")),3500))]);
      safe(()=>engine?.renderer?.dispose());
      engine=new ThreeEngine(T,ui.canvas);engine.start();state.engine="three";
    }catch(err){console.warn("3D no disponible, se mantiene rescate",err)}
    state.running=true;ui.boot.classList.add("done");toast("Mundo listo · "+sectorAt(state.player.x,state.player.y));
  }catch(err){console.error(err);state.fatal=true;resetEngine();state.running=true;ui.boot.classList.add("done");toast("Recuperación de emergencia activada");}
}

function bindInput(){
  addEventListener("keydown",e=>{
    const k=e.key.toLowerCase();state.keys.add(k);
    if(["arrowup","arrowdown","arrowleft","arrowright"," "].includes(k))e.preventDefault();
    if(k==="escape")toggleMenu();
    if(k==="e"&&!state.paused)interact();
  },{passive:false});
  addEventListener("keyup",e=>state.keys.delete(e.key.toLowerCase()));
  ui.menu.onclick=toggleMenu;ui.close.onclick=closeMenu;ui.resume.onclick=closeMenu;ui.recover.onclick=manualRecover;
}
function toggleMenu(){state.paused=!state.paused;ui.panel.hidden=!state.paused;if(state.paused)saveGame()}
function closeMenu(){state.paused=false;ui.panel.hidden=true}
function interact(){toast(roadHit(state.player.x,state.player.y)?"Estás en la red vial de Chañar.":"Explorá el territorio. Próximo sistema: interacción local.")}
function manualRecover(){closeMenu();resetEngine();toast("Motor reconstruido. Podés seguir jugando.")}
function loadSave(){safe(()=>{const raw=localStorage.getItem(CONFIG.saveKey);if(!raw)return;const s=JSON.parse(raw);if(Number.isFinite(s.x)&&Number.isFinite(s.y)){state.player.x=s.x;state.player.y=s.y}})}
function saveGame(){safe(()=>localStorage.setItem(CONFIG.saveKey,JSON.stringify({x:state.player.x,y:state.player.y,time:state.time,version:CONFIG.version})));state.lastSaved=performance.now()}

let lastWatch=performance.now();
function watchdog(now){
  if(now-lastWatch>CONFIG.watchdogMs&&!state.paused){console.warn("watchdog: frame delay");lastWatch=now;safe(()=>{if(!engine){resetEngine()}})}
  if(now-state.lastSaved>15000)saveGame();
}
function loop(now){
  requestAnimationFrame(loop);
  const dt=Math.min(.05,Math.max(.001,(now-state.lastFrame)/1000));state.lastFrame=now;state.frames++;
  if(!state.running)return;
  safe(()=>{engine.update(dt);engine.draw()});
  hideToast();watchdog(now);
  setStatus((state.engine==="three"?"MODO 3D":"MODO RESCATE")+" · "+sectorAt(state.player.x,state.player.y));
}
window.addEventListener("error",e=>{console.error(e.error||e.message);if(state.running&&state.engine==="three"){resetEngine();toast("Se detectó un fallo y el juego se reparó.")}});
window.addEventListener("unhandledrejection",e=>{console.error(e.reason);if(state.running&&state.engine==="three"){resetEngine();toast("Se detectó un fallo y el juego se reparó.")}});
buildWorldData();requestAnimationFrame(loop);boot();
