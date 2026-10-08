import * as THREE from "https://cdn.jsdelivr.net/npm/three@0.160.0/build/three.module.js";

const scene=new THREE.Scene();
scene.background=new THREE.Color(0x9b9a82);
scene.fog=new THREE.Fog(0x9b9a82,70,300);

const camera=new THREE.PerspectiveCamera(62,innerWidth/innerHeight,.1,500);
const renderer=new THREE.WebGLRenderer({antialias:true});
renderer.setPixelRatio(Math.min(devicePixelRatio,1.7));
renderer.setSize(innerWidth,innerHeight);
renderer.shadowMap.enabled=true;
renderer.shadowMap.type=THREE.PCFSoftShadowMap;
document.body.appendChild(renderer.domElement);

scene.add(new THREE.HemisphereLight(0xdce4cf,0x5b503c,2.2));
const sun=new THREE.DirectionalLight(0xfff1d2,3.1);
sun.position.set(-80,120,55);sun.castShadow=true;sun.shadow.mapSize.set(2048,2048);scene.add(sun);

const world=new THREE.Group();scene.add(world);
const ground=new THREE.Mesh(new THREE.PlaneGeometry(500,500),new THREE.MeshStandardMaterial({color:0x8d8268,roughness:1}));
ground.rotation.x=-Math.PI/2;ground.receiveShadow=true;world.add(ground);

function box(x,y,z,sx,sy,sz,color,rough=1){
 const m=new THREE.Mesh(new THREE.BoxGeometry(sx,sy,sz),new THREE.MeshStandardMaterial({color,roughness:rough}));
 m.position.set(x,y,z);m.castShadow=true;m.receiveShadow=true;world.add(m);return m;
}
function cyl(x,y,z,r,h,color){
 const m=new THREE.Mesh(new THREE.CylinderGeometry(r,r*.92,h,10),new THREE.MeshStandardMaterial({color,roughness:.95}));
 m.position.set(x,y,z);m.castShadow=true;world.add(m);return m;
}
function tree(x,z,scale=1){
 cyl(x,2*scale,z,.22*scale,4*scale,0x5a4430);
 const crown=new THREE.Mesh(new THREE.SphereGeometry(1.7*scale,10,8),new THREE.MeshStandardMaterial({color:0x526347,roughness:1}));
 crown.position.set(x,5*scale,z);crown.scale.y=.75;crown.castShadow=true;world.add(crown);
}
function building(x,z,w,d,h,color){
 box(x,h/2,z,w,h,d,color,.9);
 box(x,h+.12,z,w*.45,.18,d*.3,0x5a4333);
}
function road(x,z,w,d){
 box(x,.035,z,w,.08,d,0x45443d);
}
function vineyard(x,z,rows,cols){
 for(let r=0;r<rows;r++) for(let c=0;c<cols;c++){
   const px=x+r*3.4, pz=z+c*3.2;
   box(px,.45,pz,.08,.9,.08,0x5b4937);
   if(c<cols-1){const line=new THREE.Mesh(new THREE.BoxGeometry(.06,.05,3.1),new THREE.MeshStandardMaterial({color:0x594a38}));line.position.set(px,.82,pz+1.6);world.add(line)}
 }
}
function barda(){
 const pts=[[-210,0],[-155,-12],[-95,-5],[-40,-18],[20,-7],[80,-16],[145,-4],[210,-13]];
 const shape=new THREE.Shape();shape.moveTo(pts[0][0],0);
 pts.forEach(p=>shape.lineTo(p[0],p[1]));
 shape.lineTo(210,24);shape.lineTo(-210,24);shape.closePath();
 const geo=new THREE.ExtrudeGeometry(shape,{depth:12,bevelEnabled:false});
 const m=new THREE.Mesh(geo,new THREE.MeshStandardMaterial({color:0x8d5b43,roughness:1}));
 m.rotation.x=Math.PI/2;m.position.set(0,0,-105);m.receiveShadow=true;world.add(m);
}

barda();
road(0,0,360,12);road(0,45,360,8);road(-75,22,8,180);road(75,22,8,180);
for(let x=-170;x<=170;x+=14){tree(x,-24,1+(Math.abs(x)%3)*.08)}
for(let z=-70;z<110;z+=15){tree(-112,z,.8);tree(112,z,.9)}
building(-30,-28,20,15,7,0xc7b99b);building(31,-28,16,13,6,0xb4aa91);
building(-30,72,23,16,8,0xb9a98d);building(30,72,18,14,7,0xcbbd9e);
building(-45,95,10,9,5,0x9f8f77);building(52,92,12,10,5,0xa99a7e);
vineyard(-105,-80,13,7);vineyard(88,-82,13,7);

const river=new THREE.Mesh(new THREE.PlaneGeometry(330,34),new THREE.MeshStandardMaterial({color:0x4f7180,roughness:.18,metalness:.05}));
river.rotation.x=-Math.PI/2;river.position.set(0,.06,-135);world.add(river);

const player=new THREE.Group();
const body=new THREE.Mesh(new THREE.CapsuleGeometry(.55,1.35,6,12),new THREE.MeshStandardMaterial({color:0x26343a,roughness:.9}));
body.position.y=1.15;body.castShadow=true;player.add(body);
const head=new THREE.Mesh(new THREE.SphereGeometry(.43,16,12),new THREE.MeshStandardMaterial({color:0xb97d5d,roughness:.9}));
head.position.y=2.15;head.castShadow=true;player.add(head);
player.position.set(0,0,20);world.add(player);

const keys={};
addEventListener("keydown",e=>{keys[e.key.toLowerCase()]=true;if(e.key===" "){e.preventDefault()}});
addEventListener("keyup",e=>keys[e.key.toLowerCase()]=false);

let started=false,nearShown=false;
const start=document.getElementById("start");
document.getElementById("play").onclick=()=>{started=true;start.style.opacity=0;setTimeout(()=>start.remove(),550)};

const msg=document.getElementById("message");
function say(t){msg.textContent=t;msg.classList.add("show");clearTimeout(say.t);say.t=setTimeout(()=>msg.classList.remove("show"),2600)}

const clock=new THREE.Clock();
const desired=new THREE.Vector3();
function animate(){
 requestAnimationFrame(animate);
 const dt=Math.min(clock.getDelta(),.035);
 if(started){
   let dx=(keys.d||keys.arrowright?1:0)-(keys.a||keys.arrowleft?1:0);
   let dz=(keys.s||keys.arrowdown?1:0)-(keys.w||keys.arrowup?1:0);
   const len=Math.hypot(dx,dz)||1;dx/=len;dz/=len;
   const speed=9;
   if(dx||dz){
     player.position.x+=dx*speed*dt;player.position.z+=dz*speed*dt;
     player.rotation.y=Math.atan2(dx,dz);
   }
   player.position.x=THREE.MathUtils.clamp(player.position.x,-175,175);
   player.position.z=THREE.MathUtils.clamp(player.position.z,-120,125);
   desired.set(player.position.x+dx*-7,4.6,player.position.z+dz*-7+2.2);
   camera.position.lerp(desired,1-Math.pow(.001,dt));
   camera.lookAt(player.position.x,1.25,player.position.z);
   if(player.position.distanceTo(new THREE.Vector3(0,0,-30))<9&&!nearShown){nearShown=true;say("SAN PATRICIO DEL CHAÑAR · PRIMER PUNTO DE ENCUENTRO")}
 } else {
   camera.position.set(0,6,22);camera.lookAt(0,1,-20);
 }
 renderer.render(scene,camera);
}
animate();
addEventListener("resize",()=>{camera.aspect=innerWidth/innerHeight;camera.updateProjectionMatrix();renderer.setSize(innerWidth,innerHeight)});
