import * as THREE from "https://cdn.jsdelivr.net/npm/three@0.160.0/build/three.module.js";

/* ============================================================
   SAN PATRICK — MUNDO BLOQUEADO
   San Patricio del Chañar, Neuquén
   Regla suprema: JUEGO > TERRITORIO > DETALLE.
   El territorio está inspirado en referencias reales verificadas,
   pero la geometría jugable es una reconstrucción original.
   ============================================================ */

const WORLD_RULES = Object.freeze({
  title: "SAN PATRICK",
  place: "SAN PATRICIO DEL CHAÑAR",
  territoryFirst: true,
  roadsAreSkeleton: true,
  noHousesOnRoads: true,
  riverIsWorldElement: true,
  bardasAreWorldElement: true,
  vineyardsAreWorldElement: true,
  lifeEverywhere: true,
  gameplayFirst: true,
  menuMinimal: true,
  noTourismEncyclopedia: true,
  originalGeometry: true
});

const TERRITORY = Object.freeze({
  neighborhoods: [
    "Centro","Primeros Pobladores","Unión y Fuerza","128 Viviendas",
    "76 Viviendas","50 Viviendas","Plan Federalismo","Suyai",
    "Obrero","Jardín","Parque Industrial","12 de Octubre",
    "25 de Abril","Loteo Social","340 Lotes"
  ],
  roads: [
    "Av. Ingeniero Gasparri","Av. Costanera","Calle 4","Calle 126",
    "Calle 128","Sierra Auca Mahuida","Pilmayquén","Quili Malal",
    "Picada 1","Picada 4","Picada 4,5","Picada 7","Picada 9",
    "Picada 11","Picada 12","Picada 15","Picada 19","Picada 20",
    "Ruta Provincial 7","Ruta Provincial 8"
  ],
  landmarks: [
    "Río Neuquén","Dique Compensador","Balneario Municipal",
    "Plaza de las Infancias","Polideportivo Tulio Ferraresso",
    "Mirador La Virgen","Chacra Municipal Valles del Chañar",
    "Parque Industrial","Camino del Vino"
  ],
  wineries: [
    "Bodega Del Fin del Mundo","Bodega Malma","Familia Schroeder",
    "Secreto Patagónico","Bodega Patritti"
  ],
  environments: [
    "Río y costa","Bardas","Chacras","Viñedos","Área urbana",
    "Parque Industrial","Picadas rurales"
  ]
});

/* ---------- CORE ---------- */
const scene = new THREE.Scene();
scene.background = new THREE.Color(0x8fa09a);
scene.fog = new THREE.Fog(0x8fa09a, 115, 650);

const camera = new THREE.PerspectiveCamera(62, innerWidth / innerHeight, .1, 900);
const renderer = new THREE.WebGLRenderer({ antialias: true });
renderer.setPixelRatio(Math.min(devicePixelRatio, 1.6));
renderer.setSize(innerWidth, innerHeight);
renderer.shadowMap.enabled = true;
renderer.shadowMap.type = THREE.PCFSoftShadowMap;
document.body.appendChild(renderer.domElement);

const hemi = new THREE.HemisphereLight(0xe9eee8, 0x514438, 2.1);
scene.add(hemi);

const sun = new THREE.DirectionalLight(0xffe6bf, 3.1);
sun.position.set(-180, 220, 150);
sun.castShadow = true;
sun.shadow.mapSize.set(1024,1024);
sun.shadow.camera.left=-260; sun.shadow.camera.right=260;
sun.shadow.camera.top=260; sun.shadow.camera.bottom=-260;
scene.add(sun);

const world = new THREE.Group();
scene.add(world);

const materialCache = new Map();
const mat = color => {
  if(!materialCache.has(color)) materialCache.set(color,new THREE.MeshStandardMaterial({
    color, roughness:.88, metalness:0
  }));
  return materialCache.get(color);
};
const box = (x,y,z,w,h,d,color,parent=world) => {
  const m = new THREE.Mesh(new THREE.BoxGeometry(w,h,d),mat(color));
  m.position.set(x,y,z);
  m.castShadow = true; m.receiveShadow = true;
  parent.add(m);
  return m;
};
const cyl = (x,y,z,r,h,color,parent=world) => {
  const m = new THREE.Mesh(new THREE.CylinderGeometry(r,r,h,10),mat(color));
  m.position.set(x,y,z);
  m.castShadow = true; m.receiveShadow = true;
  parent.add(m);
  return m;
};

/* ---------- BIG TERRITORY ---------- */
box(0,-.35,0,720,.55,720,0x8a7a60);

const road = (x,z,w,d,color=0x3f4140) => box(x,.02,z,w,.07,d,color);
const sidewalk = (x,z,w,d) => box(x,.075,z,w,.05,d,0x77766e);

/* Urban skeleton — roads first, buildings second. */
road(0,0,540,15);
road(0,82,420,9);
road(0,-84,470,9);
road(-92,15,10,300);
road(92,15,10,300);
road(-175,15,9,330);
road(175,15,9,330);
road(-20,155,360,8);
road(35,-155,380,8);
road(-255,40,9,260);
road(255,40,9,260);

/* Picadas / rural axes */
for (const [x,z,w,d] of [
  [-285,-80,9,270],[285,-80,9,270],
  [-225,-215,9,240],[225,-215,9,240],
  [-100,-245,300,8],[105,-245,280,8],
  [-315,205,180,8],[315,205,180,8]
]) road(x,z,w,d,0x555044);

for (const p of [
  [-8,10,530,2],[0,82,415,1.5],[-92,15,2,292],[92,15,2,292]
]) sidewalk(...p);

/* River, coast and barda — these are gameplay geography, not decoration. */
const river = box(0,.06,-292,690,.1,54,0x477487);
const river2 = box(0,.055,-262,690,.08,10,0x5c8d92);
const shore = box(0,.035,-228,690,.05,24,0x8c836c);
const barda = box(0,14,270,690,28,34,0x795643);
for(let i=-330;i<=330;i+=22){
  const ridge = cyl(i,18,246,10,20,0x84634f);
  ridge.scale.z = .65;
}

/* ---------- LANDSCAPE DETAILS ---------- */
function tree(x,z,s=1){
  const g=new THREE.Group();
  cyl(0,.9,0,.18,1.8,0x5b4432,g);
  const crown=cyl(0,2.2,0,.75,1.35,0x4f6549,g);
  crown.scale.x=1.05;
  g.position.set(x,0,z); g.scale.setScalar(s);
  world.add(g); return g;
}
function shrub(x,z,s=1){
  const g=new THREE.Group();
  cyl(0,.45,0,.55,.75,0x596344,g);
  g.position.set(x,0,z); g.scale.setScalar(s); world.add(g); return g;
}
for(const [x,z,s] of [
  [-40,-40,1.2],[35,-45,1],[-125,-35,1.1],[120,-32,1.25],
  [-150,105,1],[145,110,1.2],[-210,120,.9],[210,125,1],
  [-260,-170,1],[-180,-185,.8],[180,-180,1],[270,-175,.9]
]) tree(x,z,s);
for(let i=0;i<55;i++){
  const x=-330+(i*67)%650, z=-210+(i*43)%390;
  shrub(x,z,.65+(i%4)*.12);
}

/* Vineyards: long rows follow the rural geometry. */
function vineyard(x,z,rows=18,cols=22,scale=1){
  const g=new THREE.Group();
  for(let r=0;r<rows;r++){
    for(let c=0;c<cols;c++){
      const post=new THREE.Mesh(new THREE.BoxGeometry(.08,.85,.08),mat(0x574b35));
      post.position.set(r*3.4, .43, c*3.0);
      g.add(post);
      if(c<cols-1){
        const vine=new THREE.Mesh(new THREE.BoxGeometry(.16,.48,2.6),mat(0x3e583a));
        vine.position.set(r*3.4,.65,c*3+1.5);
        g.add(vine);
      }
    }
  }
  g.position.set(x,0,z); g.scale.setScalar(scale); world.add(g);
}
vineyard(-305,-170,18,25,.95);
vineyard(135,-205,23,22,.9);
vineyard(-235,155,20,18,.8);
vineyard(170,135,17,18,.82);

/* ---------- URBAN FABRIC ---------- */
const neighborhoodZones = [
  [-45,38,"Primeros Pobladores"],[45,38,"128 Viviendas"],
  [-45,72,"Unión y Fuerza"],[45,72,"76 Viviendas"],
  [-48,112,"50 Viviendas"],[48,112,"Plan Federalismo"],
  [-48,145,"Suyai"],[48,145,"Obrero"],
  [-120,100,"Jardín"],[120,100,"Parque Industrial"],
  [-120,-65,"12 de Octubre"],[120,-65,"25 de Abril"],
  [-120,-115,"Loteo Social"],[120,-115,"340 Lotes"]
];

function house(x,z,w,d,h,c){
  const g=new THREE.Group();
  box(0,h/2,0,w,h,d,c,g);
  box(0,h+.1,0,w*.5,.18,d*.36,0x514438,g);
  box(-w*.22,h*.48,d/2+.02,w*.18,.42,.05,0x35464a,g);
  box(w*.22,h*.48,d/2+.02,w*.18,.42,.05,0x35464a,g);
  g.position.set(x,0,z); world.add(g); return g;
}

/* Buildings remain offset from road axes. */
const homes=[
 [-48,35,17,12,5,0xc8b99f],[-5,36,16,12,5.5,0xb8aa92],[48,35,18,13,5,0xcabda3],
 [-48,65,16,12,5,0xb7a68a],[48,66,17,12,5.5,0xc1b195],
 [-50,105,19,13,5,0xcdbfa6],[50,106,16,12,5,0xb3a186],
 [-48,138,18,13,5,0xc0af96],[48,139,17,12,5,0xc5b498],
 [-126,100,19,13,5,0xb7a78d],[126,101,22,15,6,0xc6b89c],
 [-126,-62,18,13,5,0xc8b28e],[126,-63,18,13,5,0xbca88d],
 [-126,-112,20,14,5,0xc3b294],[126,-113,19,13,5,0xb8a58b],
 [-205,55,24,15,6,0x9e927c],[205,55,24,15,6,0xa69a83]
];
homes.forEach(h=>house(...h));

/* Central civic cluster */
house(0,-38,34,22,8,0x9e927c);
house(0,48,28,20,7,0xb3a68e);
box(-16,.2,48,5,.4,5,0x69776a);
box(16,.2,48,5,.4,5,0x69776a);

/* Industrial edge */
for(let i=0;i<8;i++){
  const x=155+(i%4)*34, z=25+Math.floor(i/4)*48;
  box(x,6,z,26,12,22, i%2?0x74736c:0x666966);
  box(x,12.2,z,10,.3,10,0x484b49);
}

/* ---------- SIGNAGE / LANDMARKS ---------- */
function sign(x,z,text){
  const g=new THREE.Group();
  box(0,1.7,0,2.8,.18,.18,0x514438,g);
  const board=box(0,2.35,0,4.2,1.05,.12,0x2f3934,g);
  g.position.set(x,0,z); world.add(g);
  const el=document.createElement("div");
  el.className="world-label"; el.textContent=text;
  el.style.position="absolute"; el.style.display="none";
  document.body.appendChild(el);
  return {g,el,text};
}
const signs=[
 sign(-8,4,"CENTRO"),
 sign(-90,0,"UNIÓN Y FUERZA"),
 sign(91,0,"76 VIVIENDAS"),
 sign(175,35,"PARQUE INDUSTRIAL"),
 sign(-175,35,"PRIMEROS POBLADORES"),
 sign(-255,-105,"PICADA 1"),
 sign(255,-105,"PICADA 7"),
 sign(-235,-225,"CAMINO DEL VINO")
];

/* Landmark markers use low-poly original geometry. */
function landmark(x,z,name,color=0x6f6b5a,scale=1){
  const g=new THREE.Group();
  box(0,.6,0,2.2,1.2,2.2,color,g);
  box(0,1.55,0,1.5,.7,1.5,0xb2a98f,g);
  g.position.set(x,0,z); g.scale.setScalar(scale); world.add(g);
  return {g,name};
}
const landmarks=[
 landmark(0,-190,"Balneario Municipal",0x607d73,1.6),
 landmark(-180,-205,"Chacra Municipal Valles del Chañar",0x65744e,1.3),
 landmark(215,-195,"Mirador La Virgen",0x85745f,1.15),
 landmark(0,185,"Plaza de las Infancias",0x777c65,1.1),
 landmark(-15,105,"Polideportivo Tulio Ferraresso",0x626866,1.25),
 landmark(0,-255,"Dique Compensador",0x536f78,1.8)
];

/* Wineries are spatial anchors, not a tourist menu. */
const wineries=[
 {name:"Del Fin del Mundo",x:-285,z:-135},
 {name:"Malma",x:215,z:-145},
 {name:"Familia Schroeder",x:180,z:155},
 {name:"Secreto Patagónico",x:-225,z:160},
 {name:"Patritti",x:-315,z:120}
];
for(const w of wineries){
  house(w.x,w.z,22,18,7,0x8b7b65);
  box(w.x,7.2,w.z,9,.3,7,0x554d42);
}

/* ---------- LIFE ---------- */
function human(x,z,i,role="vecino"){
  const g=new THREE.Group();
  const skin=[0xc98d70,0xb8785c,0xd5a080,0xa96b51][i%4];
  const shirt=[0x34576b,0x704735,0x4e694f,0x7d6848,0x6d536c][i%5];
  const pants=[0x30353b,0x4b4b45,0x293b4c][i%3];
  box(0,1.05,0,.5,.8,.28,shirt,g);
  const head=new THREE.Mesh(new THREE.SphereGeometry(.27,10,8),mat(skin));
  head.position.y=1.72; head.castShadow=true; g.add(head);
  box(-.12,.52,0,.16,.65,.18,pants,g); box(.12,.52,0,.16,.65,.18,pants,g);
  box(-.36,1.08,0,.13,.65,.13,shirt,g); box(.36,1.08,0,.13,.65,.13,shirt,g);
  g.position.set(x,0,z);
  g.userData={role,home:new THREE.Vector3(x,0,z),seed:i};
  world.add(g); return g;
}

const people=[];
for(let i=0;i<34;i++){
  const side=i%2?1:-1;
  const x=side*(35+(i*23)%125);
  const z=-30+((i*37)%190);
  people.push(human(x,z,i,i%5===0?"trabajador":i%7===0?"estudiante":"vecino"));
}

/* Animals: tiny, sparse, ambient. */
function animal(x,z,type,i){
  const g=new THREE.Group();
  const body=box(0,.42,0,.65,.42,.3,type==="perro"?0x75614e:0x6d705f,g);
  const head=box(.35,.58,0,.3,.3,.28,type==="perro"?0x806a55:0x707467,g);
  g.position.set(x,0,z); g.userData={type,seed:i,home:g.position.clone()};
  world.add(g); return g;
}
const animals=[];
for(let i=0;i<12;i++) animals.push(animal(-160+(i*29)%310,-175+(i*31)%90,i%3===0?"perro":"ave",i));

/* ---------- PLAYER + VEHICLES ---------- */
const player=new THREE.Group();
box(0,1.05,0,.55,1.1,.35,0x29475a,player);
const phead=new THREE.Mesh(new THREE.SphereGeometry(.3,12,8),mat(0xb97d5d));
phead.position.y=1.85; phead.castShadow=true; player.add(phead);
player.position.set(0,0,135); world.add(player);

function makeCar(color){
  const g=new THREE.Group();
  box(0,.55,0,2.2,.65,4,color,g);
  box(0,1.05,-.2,1.75,.6,2,0x20282a,g);
  for(const x of[-1.1,1.1])for(const z of[-1.25,1.25]){
    const w=new THREE.Mesh(new THREE.CylinderGeometry(.35,.35,.2,12),mat(0x171717));
    w.rotation.z=Math.PI/2; w.position.set(x,.28,z); w.castShadow=true; g.add(w);
  }
  return g;
}
const cars=[];
const car=makeCar(0x3c4c4c); car.position.set(5,0,112); world.add(car); cars.push(car);
for(const [x,z,c] of [[-72,3,0x7d4b3e],[78,3,0x3e5668],[174,-12,0x6b694d],[215,70,0x7b5545]]){
  const ccar=makeCar(c); ccar.position.set(x,0,z); world.add(ccar); cars.push(ccar);
}

/* ---------- GAMEPLAY SYSTEMS ---------- */
const keys={};
let playing=false, vehicle=null, paused=false, time=8.5, weather="despejado";
let activeMessage="";
let messageUntil=0;

addEventListener("keydown",e=>{
  keys[e.key.toLowerCase()]=true;
  if(e.key==="Escape"&&playing) toggleMenu();
  if(e.key.toLowerCase()==="e"&&playing&&!paused) interact();
});
addEventListener("keyup",e=>keys[e.key.toLowerCase()]=false);

function nearestCar(){
  let best=null,dist=Infinity;
  for(const c of cars){
    const d=player.position.distanceTo(c.position);
    if(d<dist){dist=d;best=c;}
  }
  return {car:best,dist};
}
function interact(){
  if(vehicle){
    player.visible=true;
    player.position.copy(vehicle.position);
    player.position.x+=2.5;
    vehicle=null;
    flash("Bajaste del vehículo");
    return;
  }
  const n=nearestCar();
  if(n.car&&n.dist<4.5){
    vehicle=n.car; player.visible=false; flash("Subiste al vehículo");
    return;
  }
  flash("Acercate a un vehículo o explorá Chañar");
}
function flash(text){
  activeMessage=text; messageUntil=performance.now()+2600;
  const el=document.getElementById("toast"); if(el) el.textContent=text;
}

function toggleMenu(){
  paused=!paused;
  document.getElementById("menuPanel").style.display=paused?"grid":"none";
}

function move(dt){
  if(!playing||paused) return;
  const speed=vehicle?12:5.5;
  let x=0,z=0;
  if(keys.w||keys.arrowup)z-=1;
  if(keys.s||keys.arrowdown)z+=1;
  if(keys.a||keys.arrowleft)x-=1;
  if(keys.d||keys.arrowright)x+=1;
  const len=Math.hypot(x,z)||1;
  const target=vehicle||player;
  if(x||z){
    target.position.x+=x/len*speed*dt;
    target.position.z+=z/len*speed*dt;
    target.rotation.y=Math.atan2(x,z);
  }
  /* Keep the player inside the designed world. */
  target.position.x=THREE.MathUtils.clamp(target.position.x,-338,338);
  target.position.z=THREE.MathUtils.clamp(target.position.z,-332,315);

  /* NPC routines: work/school/commerce rhythms. */
  const hour=time%24;
  people.forEach((n,i)=>{
    const active=hour>=7&&hour<20;
    const dx=Math.sin(performance.now()*.00025+i)*dt*(active?.7:.25);
    const dz=Math.cos(performance.now()*.00019+i*2)*dt*(active?.45:.12);
    n.position.x+=dx; n.position.z+=dz;
    n.position.x=THREE.MathUtils.clamp(n.position.x,-320,320);
    n.position.z=THREE.MathUtils.clamp(n.position.z,-220,220);
  });
  animals.forEach((a,i)=>{
    a.position.x+=Math.sin(performance.now()*.00035+i)*dt*.35;
    a.position.z+=Math.cos(performance.now()*.00028+i)*dt*.2;
  });
}

function updateWorld(dt){
  /* Accelerated in-game clock: one real second ~= four game minutes. */
  time=(time+dt*.0667)%24;
  const h=time;
  const daylight=Math.max(0,Math.sin((h-6)/12*Math.PI));
  sun.intensity=1.0+daylight*2.3;
  hemi.intensity=.9+daylight*1.3;

  const sky=new THREE.Color().setHSL(.52,.12,.30+daylight*.28);
  scene.background.copy(sky);
  scene.fog.color.copy(sky);

  /* Wind is a Chañar identity cue: landscape movement is subtle. */
  const wind=Math.sin(performance.now()*.0012)*.035;
  world.children.forEach((o,i)=>{
    if(o.userData?.wind) o.rotation.z=wind*(i%2?1:-1);
  });

  const period=h<7?"AMANECER":h<12?"MAÑANA":h<17?"TARDE":h<21?"ATARDECER":"NOCHE";
  const hud=document.getElementById("worldTime");
  if(hud) hud.textContent=period+" · "+String(Math.floor(h)).padStart(2,"0")+":"+String(Math.floor((h%1)*60)).padStart(2,"0");
}

function updateCamera(dt){
  const target=vehicle||player;
  const desired=new THREE.Vector3(
    target.position.x+9,
    vehicle?8:7,
    target.position.z+12
  );
  camera.position.lerp(desired,Math.min(1,dt*6));
  camera.lookAt(target.position.x,1.1,target.position.z);
}

function projectLabel(item){
  const v=item.g.position.clone(); v.y+=4;
  v.project(camera);
  const visible=v.z<1 && Math.abs(v.x)<1.1 && Math.abs(v.y)<1.1;
  item.el.style.display=visible&&playing?"block":"none";
  if(visible){
    item.el.style.left=((v.x*.5+.5)*innerWidth)+"px";
    item.el.style.top=((-v.y*.5+.5)*innerHeight)+"px";
  }
}

/* ---------- UI ---------- */
const start=document.getElementById("start");
document.getElementById("play").onclick=()=>{
  playing=true;
  start.style.opacity="0";
  setTimeout(()=>start.remove(),400);
  flash("San Patricio del Chañar te espera");
};

const menuPanel=document.getElementById("menuPanel");
document.getElementById("menu").onclick=()=>{if(playing)toggleMenu();};
document.getElementById("close").onclick=()=>{paused=false;menuPanel.style.display="none";};
document.getElementById("continue").onclick=()=>{paused=false;menuPanel.style.display="none";};

const toast=document.createElement("div");
toast.id="toast"; toast.textContent="";
document.body.appendChild(toast);

const hud=document.createElement("div");
hud.id="worldTime"; hud.textContent="MAÑANA · 08:30";
document.body.appendChild(hud);

/* ---------- LOOP ---------- */
let last=performance.now();
function animate(now){
  requestAnimationFrame(animate);
  const dt=Math.min(.05,(now-last)/1000); last=now;
  move(dt);
  updateWorld(dt);
  updateCamera(dt);
  signs.forEach(projectLabel);
  toast.style.opacity=messageUntil>now?"1":"0";
  renderer.render(scene,camera);
}
requestAnimationFrame(animate);

addEventListener("resize",()=>{
  camera.aspect=innerWidth/innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(innerWidth,innerHeight);
});

console.log("SAN PATRICK WORLD LOCKED",WORLD_RULES,TERRITORY);
