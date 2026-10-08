import * as THREE from "https://cdn.jsdelivr.net/npm/three@0.160.0/build/three.module.js";

const DATA=await fetch("./data/world.json").then(r=>r.json());
const scene=new THREE.Scene();
scene.background=new THREE.Color(0x989681);
scene.fog=new THREE.Fog(0x989681,80,360);
const camera=new THREE.PerspectiveCamera(62,innerWidth/innerHeight,.1,600);
const renderer=new THREE.WebGLRenderer({antialias:true});
renderer.setPixelRatio(Math.min(devicePixelRatio,1.7));renderer.setSize(innerWidth,innerHeight);
renderer.shadowMap.enabled=true;renderer.shadowMap.type=THREE.PCFSoftShadowMap;document.body.appendChild(renderer.domElement);
scene.add(new THREE.HemisphereLight(0xe7ead9,0x574c3b,2.2));
const sun=new THREE.DirectionalLight(0xffefca,3);sun.position.set(-100,130,80);sun.castShadow=true;sun.shadow.mapSize.set(2048,2048);scene.add(sun);

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
function treeLine(x,z,n,step,axis="x"){for(let i=0;i<n;i++)axis==="x"?tree(x+i*step,z,.8+(i%3)*.08):tree(x,z+i*step,.8+(i%3)*.08)}
function vineyard(x,z,rows,cols){for(let r=0;r<rows;r++)for(let c=0;c<cols;c++){box(x+r*3.4,.42,z+c*3.1,.08,.84,.08,0x5b4937)}}

const bardaMat=mat(0x8b5b43);
const bardaGeo=new THREE.BoxGeometry(460,22,12);
const barda=new THREE.Mesh(bardaGeo,bardaMat);barda.position.set(0,11,-235);barda.rotation.y=-.04;world.add(barda);
const river=new THREE.Mesh(new THREE.PlaneGeometry(430,38),mat(0x4e7281,.2));river.rotation.x=-Math.PI/2;river.position.set(0,.07,-180);world.add(river);

road(0,5,310,14,-.10);lineRoad(0,5,300, .12,-.10);
road(-2,42,280,8,.01);road(-72,30,8,150,0);road(76,32,8,160,0);
road(-15,78,8,130,.02);road(42,83,8,120,.02);road(-110,75,8,110,.02);
for(const z of [5,24,43,62,81,100])road(0,z,220,5,0);
for(const x of [-105,-72,-39,-6,27,60,93])road(x,60,5,90,0);
road(95,-40,8,125,.08);road(130,-20,150,6,.05);road(160,-80,6,120,.02);

for(let x=-150;x<=150;x+=13)tree(x,-9,.85);
for(let z=-5;z<=110;z+=15){tree(-116,z,.8);tree(116,z,.85)}
for(let z=15;z<120;z+=13){tree(-62,z,.75)}
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
for(const [id,p] of Object.entries(poiCoords)){marker(p[0],p[1],id.includes("bodega")?0xb98b58:id==="dique"||id==="balneario"?0x6693a0:0xe3d9bd)}

const player=new THREE.Group();
const body=new THREE.Mesh(new THREE.CapsuleGeometry(.55,1.35,6,12),mat(0x26343a,.9));body.position.y=1.15;body.castShadow=true;player.add(body);
const head=new THREE.Mesh(new THREE.SphereGeometry(.43,16,12),mat(0xb97d5d,.9));head.position.y=2.15;head.castShadow=true;player.add(head);
player.position.set(0,0,90);world.add(player);

const car=new THREE.Group();car.position.set(7,.35,82);
const chassis=box(0,.45,0,2.3,.55,4.2,0x3c4748,car);chassis.castShadow=true;
const cabin=box(0,.95,-.15,1.8,.65,2.1,0x202a2c,car);
for(const x of [-1.12,1.12])for(const z of [-1.35,1.35]){const w=new THREE.Mesh(new THREE.CylinderGeometry(.36,.36,.22,16),mat(0x171717));w.rotation.z=Math.PI/2;w.position.set(x,.25,z);w.castShadow=true;car.add(w)}
world.add(car);

const npcs=[];
for(let i=0;i<12;i++){const n=new THREE.Group();const b=new THREE.Mesh(new THREE.CapsuleGeometry(.34,.8,5,8),mat(i%2?0x5e675f:0x765f4f));b.position.y=.8;n.add(b);n.position.set(-90+(i%4)*55,0,18+Math.floor(i/4)*25);world.add(n);npcs.push({o:n,base:n.position.clone(),phase:i*.7})}

let vehicleMode=false,started=false,missionDone=false,nearMission=false;
let money=15000;
const keys={};
addEventListener("keydown",e=>{keys[e.key.toLowerCase()]=true;if(e.key.toLowerCase()==="m")toggleMap();if(e.key.toLowerCase()==="e"&&started)toggleVehicle();});
addEventListener("keyup",e=>keys[e.key.toLowerCase()]=false);

const start=document.getElementById("start"),msg=document.getElementById("message");
document.getElementById("play").onclick=()=>{started=true;start.style.opacity=0;setTimeout(()=>start.remove(),550);say("OBJETIVO 01 · Llegá a la plaza y conocé tu primer punto de la ciudad.")};
function say(t){msg.textContent=t;msg.classList.add("show");clearTimeout(say.t);say.t=setTimeout(()=>msg.classList.remove("show"),3000)}

const panel=document.getElementById("map-panel");
function toggleMap(){if(!started)return;panel.style.display=panel.style.display==="block"?"none":"block"}
document.getElementById("close-map").onclick=()=>panel.style.display="none";

const map=document.getElementById("map-canvas");map.className="map-bg";
map.innerHTML='<div class="map-barda"></div><div class="map-river"></div><div class="map-road main"></div><div class="map-road cross"></div><div class="map-road rural" style="top:39%"></div><div class="map-road rural" style="top:67%"></div><div class="map-player" id="map-player"></div>';
const mp=document.getElementById("map-player");
for(const [id,p] of Object.entries(poiCoords)){const d=document.createElement("i");d.className="map-point";d.title=id;d.style.left=(50+p[0]/4)+"%";d.style.top=(54+p[1]/4)+"%";map.appendChild(d)}
const zl=document.getElementById("zone-list");zl.className="zone-grid";
for(const z of DATA.zones){const pois=DATA.pois.filter(p=>p.zone===z.id);const c=document.createElement("div");c.className="zone-card";c.innerHTML='<strong>'+z.name+'</strong><span>'+z.type.replaceAll("_"," ")+'</span><div class="poi-list">'+pois.map(p=>'<span class="poi">'+p.name+'</span>').join("")+'</div>';zl.appendChild(c)}

const hud=document.querySelector(".location");
const clock=new THREE.Clock();const camTarget=new THREE.Vector3();const desired=new THREE.Vector3();const temp=new THREE.Vector3();
function moveCharacter(dt){
 let dx=(keys.d||keys.arrowright?1:0)-(keys.a||keys.arrowleft?1:0);
 let dz=(keys.s||keys.arrowdown?1:0)-(keys.w||keys.arrowup?1:0);
 const len=Math.hypot(dx,dz)||1;dx/=len;dz/=len;
 if(!dx&&!dz)return {dx:0,dz:0};
 const speed=vehicleMode?18:8.5;
 const obj=vehicleMode?car:player;
 obj.position.x+=dx*speed*dt;obj.position.z+=dz*speed*dt;obj.rotation.y=Math.atan2(dx,dz);
 obj.position.x=THREE.MathUtils.clamp(obj.position.x,-180,185);obj.position.z=THREE.MathUtils.clamp(obj.position.z,-205,125);
 if(vehicleMode){player.position.copy(car.position);player.visible=false}else player.visible=true;
 return {dx,dz}
}
function toggleVehicle(){
 if(vehicleMode){vehicleMode=false;player.visible=true;player.position.copy(car.position);player.position.x+=2.4;say("Bajaste del vehículo.");return}
 if(player.position.distanceTo(car.position)<5){vehicleMode=true;player.visible=false;say("Vehículo tomado. Ahora sí: a recorrer Chañar.");}
 else say("Acercate al vehículo para subirte.");
}
function updateNPC(t){npcs.forEach((n,i)=>{n.o.position.x=n.base.x+Math.sin(t*.35+n.phase)*3;n.o.position.z=n.base.z+Math.cos(t*.28+n.phase)*2})}
function updateMap(){const o=vehicleMode?car:player;mp.style.left=(50+o.position.x/4)+"%";mp.style.top=(54+o.position.z/4)+"%"}

function animate(){
 requestAnimationFrame(animate);const dt=Math.min(clock.getDelta(),.035);const t=performance.now()/1000;
 if(started&&panel.style.display!=="block"){
   const m=moveCharacter(dt);
   const o=vehicleMode?car:player;
   desired.set(o.position.x-m.dx*7,5.2,o.position.z-m.dz*7+2.4);
   camera.position.lerp(desired,1-Math.pow(.001,dt));camera.lookAt(o.position.x,1.15,o.position.z);
   updateNPC(t);updateMap();
   if(!missionDone&&o.position.distanceTo(new THREE.Vector3(-82,45,0))<10){missionDone=true;money+=2500;say("MISIÓN COMPLETADA · Primer recorrido · +$2.500");}
   if(!nearMission&&o.position.distanceTo(new THREE.Vector3(0,5,0))<8){nearMission=true;say("CENTRO · Acá empieza la ciudad. Hay gente, trabajo, servicios y oportunidades.");}
   hud.textContent="SAN PATRICIO DEL CHAÑAR · "+(vehicleMode?"EN VEHÍCULO":"A PIE")+" · $"+money.toLocaleString("es-AR");
 }else if(!started){camera.position.set(0,6,24);camera.lookAt(0,1,-15)}
 renderer.render(scene,camera)
}
animate();
addEventListener("resize",()=>{camera.aspect=innerWidth/innerHeight;camera.updateProjectionMatrix();renderer.setSize(innerWidth,innerHeight)});
