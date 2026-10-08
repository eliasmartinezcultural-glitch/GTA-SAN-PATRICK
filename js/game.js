import * as THREE from "https://cdn.jsdelivr.net/npm/three@0.160.0/build/three.module.js";
import { createTerritoryRuntime } from "./territory-runtime.js";

const DATA=await fetch("./data/world.json").then(r=>r.json());
const scene=new THREE.Scene();
scene.background=new THREE.Color(0x989681);
scene.fog=new THREE.Fog(0x989681,80,380);
const camera=new THREE.PerspectiveCamera(62,innerWidth/innerHeight,.1,650);
const renderer=new THREE.WebGLRenderer({antialias:true});
renderer.setPixelRatio(Math.min(devicePixelRatio,1.7));
renderer.setSize(innerWidth,innerHeight);
renderer.shadowMap.enabled=true;
renderer.shadowMap.type=THREE.PCFSoftShadowMap;
document.body.appendChild(renderer.domElement);

scene.add(new THREE.HemisphereLight(0xe7ead9,0x574c3b,2.2));
const sun=new THREE.DirectionalLight(0xffefca,3);
sun.position.set(-100,130,80);sun.castShadow=true;sun.shadow.mapSize.set(2048,2048);scene.add(sun);

const world=new THREE.Group();scene.add(world);
const ground=new THREE.Mesh(new THREE.PlaneGeometry(520,520),new THREE.MeshStandardMaterial({color:0x8b8067,roughness:1}));
ground.rotation.x=-Math.PI/2;ground.receiveShadow=true;world.add(ground);

function mat(c,r=1){return new THREE.MeshStandardMaterial({color:c,roughness:r})}
function box(x,y,z,sx,sy,sz,color,group=world){const m=new THREE.Mesh(new THREE.BoxGeometry(sx,sy,sz),mat(color));m.position.set(x,y,z);m.castShadow=true;m.receiveShadow=true;group.add(m);return m}
function tree(x,z,s=1){box(x,2*s,z,.22*s,4*s,.22*s,0x5a4430);const c=new THREE.Mesh(new THREE.SphereGeometry(1.7*s,10,8),mat(0x526347));c.position.set(x,5*s,z);c.scale.y=.75;c.castShadow=true;world.add(c)}
function building(x,z,w,d,h,c=0xc2b394){box(x,h/2,z,w,h,d,c);box(x,h+.12,z,w*.48,.18,d*.32,0x574635)}
function road(x,z,w,d,a=0){const r=box(x,.045,z,w,.08,d,0x47463f);r.rotation.y=a}
function lineRoad(x,z,w,d,a=0){const r=box(x,.065,z,w,.035,d,0xc8c0a7);r.rotation.y=a}
function marker(x,z,c=0xe8e2cc){const m=new THREE.Mesh(new THREE.CylinderGeometry(.45,.45,.12,16),mat(c));m.position.set(x,.1,z);world.add(m);return m}
function vineyard(x,z,rows,cols){for(let r=0;r<rows;r++)for(let c=0;c<cols;c++)box(x+r*3.4,.42,z+c*3.1,.08,.84,.08,0x5b4937)}

const barda=new THREE.Mesh(new THREE.BoxGeometry(460,22,12),mat(0x8b5b43));
barda.position.set(0,11,-235);barda.rotation.y=-.04;world.add(barda);
const river=new THREE.Mesh(new THREE.PlaneGeometry(430,38),mat(0x4e7281,.2));
river.rotation.x=-Math.PI/2;river.position.set(0,.07,-180);world.add(river);

road(0,5,310,14,-.10);lineRoad(0,5,300,.12,-.10);
road(-2,42,280,8,.01);road(-72,30,8,150,0);road(76,32,8,160,0);
road(-15,78,8,130,.02);road(42,83,8,120,.02);road(-110,75,8,110,.02);
for(const z of [5,24,43,62,81,100])road(0,z,220,5,0);
for(const x of [-105,-72,-39,-6,27,60,93])road(x,60,5,90,0);
road(95,-40,8,125,.08);road(130,-20,150,6,.05);road(160,-80,6,120,.02);

for(let x=-150;x<=150;x+=13)tree(x,-9,.85);
for(let z=-5;z<=110;z+=15){tree(-116,z,.8);tree(116,z,.85)}
for(let z=15;z<120;z+=13)tree(-62,z,.75);
vineyard(-145,-95,14,9);vineyard(92,-110,15,8);

building(-30,20,20,15,7);building(31,20,18,14,6,0xb4aa91);building(-28,61,22,15,8,0xb9a98d);
building(30,61,17,14,7,0xc8b99a);building(-80,75,16,12,6,0xa99a7e);building(80,75,16,12,6,0xb6a98e);
building(-105,25,12,10,5,0x9f9079);building(105,25,13,11,5,0xb5a58a);
building(52,105,15,11,6,0xc4b495);building(-48,105,12,10,5,0xa89b84);

const poiCoords={
 municipalidad:[-30,20],hospital:[-64,53],policia:[-44,46],bomberos:[-26,47],registro:[-10,47],
 banco:[18,48],escuela1:[-75,18],plaza:[-82,45],deporte1:[-82,67],skate:[45,95],epen:[70,108],
 radio:[-3,111],cultural:[22,108],sum:[-50,112],huerta:[-126,-48],chacra_municipal:[-110,-63],
 bodega_fin_mundo:[155,-65],bodega_malma:[124,-38],bodega_schroeder:[92,-58],bodega_secreto:[115,-86],
 bodega_patritti:[150,-105],balneario:[-12,-154],dique:[172,-150],mirador:[-135,-185]
};
const poiById=Object.fromEntries(DATA.pois.map(p=>[p.id,p]));
for(const [id,p] of Object.entries(poiCoords))marker(p[0],p[1],id.includes("bodega")?0xb98b58:id==="dique"||id==="balneario"?0x6693a0:0xe3d9bd);

const player=new THREE.Group();
const body=new THREE.Mesh(new THREE.CapsuleGeometry(.55,1.35,6,12),mat(0x26343a,.9));body.position.y=1.15;body.castShadow=true;player.add(body);
const head=new THREE.Mesh(new THREE.SphereGeometry(.43,16,12),mat(0xb97d5d,.9));head.position.y=2.15;head.castShadow=true;player.add(head);
player.position.set(0,0,90);world.add(player);

const car=new THREE.Group();car.position.set(7,.35,82);
box(0,.45,0,2.3,.55,4.2,0x3c4748,car);box(0,.95,-.15,1.8,.65,2.1,0x202a2c,car);
for(const x of [-1.12,1.12])for(const z of [-1.35,1.35]){const w=new THREE.Mesh(new THREE.CylinderGeometry(.36,.36,.22,16),mat(0x171717));w.rotation.z=Math.PI/2;w.position.set(x,.25,z);w.castShadow=true;car.add(w)}
world.add(car);

const TERRITORY=await createTerritoryRuntime({scene,world,player,car,sun});

const npcs=[];
const npcRoles=["vecino","trabajador","productor","estudiante","deportista","comerciante","vecina","trabajadora","chacarero","estudiante","artista","vecino"];
const npcNames=["Tomás","Mica","Julián","Rocío","Nico","Sofi","Mateo","Abril","Leo","Cami","Bruno","Lola"];
function createHuman(i){
 const n=new THREE.Group();
 const skin=[0xc98f72,0xb8785d,0xd7a184,0xa96750][i%4];
 const shirt=[0x355c7d,0x7a4e38,0x536b4f,0x8a6a42,0x5d5966,0x2f5260][i%6];
 const pants=[0x30343b,0x4b4a45,0x28384a,0x5a4a3c][i%4];
 const hair=[0x211b17,0x38251d,0x5a3825,0x1b2024][i%4];
 const torso=new THREE.Mesh(new THREE.CapsuleGeometry(.27,.55,4,8),mat(shirt));torso.position.y=1.05;n.add(torso);
 const head=new THREE.Mesh(new THREE.SphereGeometry(.25,10,8),mat(skin));head.position.y=1.72;n.add(head);
 const hairMesh=new THREE.Mesh(new THREE.SphereGeometry(.255,10,6,0,Math.PI*2,0,Math.PI*.48),mat(hair));hairMesh.position.y=1.82;n.add(hairMesh);
 for(const x of [-.105,.105]){const leg=new THREE.Mesh(new THREE.CapsuleGeometry(.095,.48,4,6),mat(pants));leg.position.set(x,.58,0);n.add(leg);}
 for(const x of [-.34,.34]){const arm=new THREE.Mesh(new THREE.CapsuleGeometry(.075,.45,4,6),mat(x<0&&i%2===0?skin:shirt));arm.position.set(x,1.08,0);arm.rotation.z=x<0?-0.12:0.12;n.add(arm);}
 n.userData.role=npcRoles[i];n.userData.name=npcNames[i];n.userData.human=true;
 return n;
}
for(let i=0;i<12;i++){
 const n=createHuman(i);
 n.position.set(-90+(i%4)*55,0,18+Math.floor(i/4)*25);
 world.add(n);
 npcs.push({o:n,base:n.position.clone(),phase:i*.7,role:npcRoles[i],name:npcNames[i]});
}

let vehicleMode=false,started=false;
let money=Number(localStorage.getItem("sp_money")||15000);
let missionIndex=Number(localStorage.getItem("sp_mission")||0);
let timeOfDay=Number(localStorage.getItem("sp_time")||8.5);
let discovered=JSON.parse(localStorage.getItem("sp_discovered")||"[]");
let currentPOI=null,saveTick=0,menuOpen=false;
const keys={};

addEventListener("keydown",e=>{
 const k=e.key.toLowerCase();
 if(k==="escape"){e.preventDefault();if(started)toggleMenu();return}
 keys[k]=true;
 if(k==="m"&&started&&!menuOpen)toggleMap();
 if(k==="e"&&started&&!menuOpen)interact();
 if(k==="p"&&started&&!menuOpen)toggleStats();
});
addEventListener("keyup",e=>keys[e.key.toLowerCase()]=false);

const start=document.getElementById("start"),msg=document.getElementById("message");
document.getElementById("play").onclick=()=>{
 started=true;document.body.classList.add("game-active");
 start.style.opacity=0;setTimeout(()=>start.remove(),550);
 updateStats();
};
function say(t){msg.textContent=t;msg.classList.add("show");clearTimeout(say.t);say.t=setTimeout(()=>msg.classList.remove("show"),3200)}

const panel=document.getElementById("map-panel");
function toggleMap(){if(!started)return;panel.style.display=panel.style.display==="block"?"none":"block";updateMap()}
document.getElementById("close-map").onclick=()=>panel.style.display="none";

const pauseMenu=document.getElementById("pause-menu");
const settingsPanel=document.getElementById("settings-panel");
function toggleMenu(force){
 if(!started)return;
 menuOpen=force===undefined?!menuOpen:force;
 pauseMenu.classList.toggle("open",menuOpen);
 if(menuOpen){panel.style.display="none";stats.style.display="none";settingsPanel.classList.remove("open");}
}
document.getElementById("menu-button").onclick=()=>toggleMenu();
document.getElementById("resume-game").onclick=()=>toggleMenu(false);
document.getElementById("menu-map").onclick=()=>{toggleMenu(false);toggleMap()};
document.getElementById("menu-progress").onclick=()=>{toggleMenu(false);toggleStats()};
document.getElementById("menu-save").onclick=()=>{save();say("PARTIDA GUARDADA");toggleMenu(false)};
document.getElementById("menu-settings").onclick=()=>settingsPanel.classList.toggle("open");
document.getElementById("menu-exit").onclick=()=>{save();location.reload()};
document.getElementById("setting-quality").onchange=e=>{
 const v=e.target.value;
 renderer.setPixelRatio(v==="high"?Math.min(devicePixelRatio,1.8):v==="low"?1:Math.min(devicePixelRatio,1.35));
};
document.getElementById("setting-vibration").onchange=e=>{if(!e.target.checked)navigator.vibrate=undefined};

const stats=document.getElementById("stats-panel");
function toggleStats(){stats.style.display=stats.style.display==="block"?"none":"block";updateStats()}
document.getElementById("close-stats").onclick=()=>stats.style.display="none";
function updateStats(){
 document.getElementById("stat-money").textContent="$"+money.toLocaleString("es-AR");
 document.getElementById("stat-time").textContent=formatTime(timeOfDay);
 document.getElementById("stat-discovered").textContent=discovered.length+"/"+DATA.pois.length;
 document.getElementById("stat-mission").textContent=TERRITORY.getMissionTitle(missionIndex);
}

const map=document.getElementById("map-canvas");map.className="map-bg";
map.innerHTML='<div class="map-barda"></div><div class="map-river"></div><div class="map-road main"></div><div class="map-road cross"></div><div class="map-road rural r1"></div><div class="map-road rural r2"></div><div class="map-player" id="map-player"></div>';
const mp=document.getElementById("map-player");
for(const [id,p] of Object.entries(poiCoords)){const d=document.createElement("i");d.className="map-point "+(id.includes("bodega")?"wine":"");d.title=poiById[id]?.name||id;d.style.left=(50+p[0]/4)+"%";d.style.top=(54+p[1]/4)+"%";map.appendChild(d)}
const zl=document.getElementById("zone-list");zl.className="zone-grid";
for(const z of DATA.zones){
 const pois=DATA.pois.filter(p=>p.zone===z.id),c=document.createElement("div");c.className="zone-card";
 c.innerHTML='<strong>'+z.name+'</strong><span>'+z.type.replaceAll("_"," ")+'</span><div class="poi-list">'+pois.map(p=>'<span class="poi">'+p.name+'</span>').join("")+"</div>";
 zl.appendChild(c);
}

function formatTime(t){const h=Math.floor(t)%24,m=Math.floor((t-Math.floor(t))*60);return String(h).padStart(2,"0")+":"+String(m).padStart(2,"0")}
function save(){
 localStorage.setItem("sp_money",money);
 localStorage.setItem("sp_mission",missionIndex);
 localStorage.setItem("sp_time",timeOfDay);
 localStorage.setItem("sp_discovered",JSON.stringify(discovered));
}
function discover(id){
 if(!poiById[id]||discovered.includes(id))return;
 discovered.push(id);money+=150;save();say("DESCUBRIMIENTO · "+poiById[id].name+" · +$150");
 updateStats();
}
function nearestPOI(){
 const o=vehicleMode?car:player;let best=null,dist=999;
 for(const [id,p] of Object.entries(poiCoords)){const d=o.position.distanceTo(new THREE.Vector3(p[0],0,p[1]));if(d<dist){dist=d;best={id,dist}}}
 return best;
}
function interact(){
 const near=nearestPOI();
 if(near&&near.dist<8){discover(near.id);const p=poiById[near.id];say(p.name+" · "+p.category.replaceAll("_"," ")+" · "+(p.route||"punto de la ciudad"));return}
 if(!vehicleMode&&player.position.distanceTo(car.position)<5){vehicleMode=true;player.visible=false;say("Vehículo tomado. Ahora sí: recorremos Chañar.");return}
 if(vehicleMode){vehicleMode=false;player.visible=true;player.position.copy(car.position);player.position.x+=2.4;say("Bajaste del vehículo.");return}
 const npc=npcs.find(n=>n.o.position.distanceTo(player.position)<5);
 if(npc)say(npc.name+" · "+npc.role+" · “Nos cruzamos seguido por acá.”");
}

function moveCharacter(dt){
 let dx=(keys.d||keys.arrowright?1:0)-(keys.a||keys.arrowleft?1:0);
 let dz=(keys.s||keys.arrowdown?1:0)-(keys.w||keys.arrowup?1:0);
 const len=Math.hypot(dx,dz)||1;dx/=len;dz/=len;
 if(!dx&&!dz)return {dx:0,dz:0};
 const territoryFactor=vehicleMode?(car.userData.territoryDrivingFactor||1):1;
 const speed=(vehicleMode?18:8.5)*territoryFactor,obj=vehicleMode?car:player;
 obj.position.x+=dx*speed*dt;obj.position.z+=dz*speed*dt;obj.rotation.y=Math.atan2(dx,dz);
 obj.position.x=THREE.MathUtils.clamp(obj.position.x,-180,185);obj.position.z=THREE.MathUtils.clamp(obj.position.z,-205,125);
 if(vehicleMode){player.position.copy(car.position);player.visible=false}else player.visible=true;
 return {dx,dz};
}
function updateNPC(t){
 npcs.forEach((n,i)=>{
  const active=(Math.floor(timeOfDay)>=7&&Math.floor(timeOfDay)<22);
  const amp=active?1:0.35;
  n.o.position.x=n.base.x+Math.sin(t*.35+n.phase)*3*amp;
  n.o.position.z=n.base.z+Math.cos(t*.28+n.phase)*2*amp;
 });
}
function updateMap(){const o=vehicleMode?car:player;mp.style.left=(50+o.position.x/4)+"%";mp.style.top=(54+o.position.z/4)+"%"}
function missionCheck(o){
 const target=TERRITORY.mission(missionIndex);
 if(!target)return;
 if(o.position.distanceTo(new THREE.Vector3(target.x,0,target.z))<10){
   money+=target.reward;missionIndex++;save();
   say("MISIÓN COMPLETADA · +$"+target.reward.toLocaleString("es-AR")+" · "+target.title);
   updateStats();
 }
}
function applyDaylight(){
 const phase=(timeOfDay/24)*Math.PI*2-Math.PI/2;
 const daylight=Math.max(.18,Math.sin(phase)*.75+.35);
 sun.intensity=1.2+daylight*2;
 scene.background.setHSL(.16,.12,.42+daylight*.12);
}
function setupTouch(){
 const controls=document.getElementById("touch-controls");if(!controls)return;
 const bind=(id,k)=>{
  const el=document.getElementById(id);
  ["pointerdown"].forEach(ev=>el.addEventListener(ev,e=>{e.preventDefault();keys[k]=true}));
  ["pointerup","pointercancel","pointerleave"].forEach(ev=>el.addEventListener(ev,e=>{e.preventDefault();keys[k]=false}));
 };
 bind("t-up","w");bind("t-down","s");bind("t-left","a");bind("t-right","d");
 document.getElementById("t-e").onclick=()=>started&&interact();
 document.getElementById("t-m").onclick=()=>started&&toggleMap();
 document.getElementById("t-p").onclick=()=>started&&toggleStats();
}
setupTouch();


const clock=new THREE.Clock();const desired=new THREE.Vector3();
function animate(){
 requestAnimationFrame(animate);
 const dt=Math.min(clock.getDelta(),.035),t=performance.now()/1000;
 if(started&&!menuOpen&&panel.style.display!=="block"&&stats.style.display!=="block"){
  const m=moveCharacter(dt),o=vehicleMode?car:player;
  desired.set(o.position.x-m.dx*7,5.2,o.position.z-m.dz*7+2.4);
  camera.position.lerp(desired,1-Math.pow(.001,dt));camera.lookAt(o.position.x,1.15,o.position.z);
  updateNPC(t);updateMap();missionCheck(o);
  timeOfDay=(timeOfDay+dt*.055)%24;applyDaylight();
  TERRITORY.update({dt,object:o});
  const near=nearestPOI();
  currentPOI=near&&near.dist<9?poiById[near.id]:null;
  if(currentPOI)document.getElementById("interaction").textContent="E · "+currentPOI.name;
  else document.getElementById("interaction").textContent="E · interactuar";
  if(++saveTick%120===0)save();
 }else if(!started){camera.position.set(0,6,24);camera.lookAt(0,1,-15)}
 renderer.render(scene,camera)
}
animate();
addEventListener("resize",()=>{camera.aspect=innerWidth/innerHeight;camera.updateProjectionMatrix();renderer.setSize(innerWidth,innerHeight)});
