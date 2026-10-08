import * as THREE from "https://cdn.jsdelivr.net/npm/three@0.160.0/build/three.module.js";

const scene=new THREE.Scene();
scene.background=new THREE.Color(0x9b9b88);
scene.fog=new THREE.Fog(0x9b9b88,90,420);
const camera=new THREE.PerspectiveCamera(62,innerWidth/innerHeight,.1,700);
const renderer=new THREE.WebGLRenderer({antialias:true});
renderer.setPixelRatio(Math.min(devicePixelRatio,1.5));
renderer.setSize(innerWidth,innerHeight);
renderer.shadowMap.enabled=true;
document.body.appendChild(renderer.domElement);

scene.add(new THREE.HemisphereLight(0xe8eadc,0x55483b,2.2));
const sun=new THREE.DirectionalLight(0xffe8c2,3);
sun.position.set(-120,160,100);
sun.castShadow=true;
scene.add(sun);

const world=new THREE.Group();
scene.add(world);
const mat=c=>new THREE.MeshStandardMaterial({color:c,roughness:.9});
const box=(x,y,z,w,h,d,c,parent=world)=>{const m=new THREE.Mesh(new THREE.BoxGeometry(w,h,d),mat(c));m.position.set(x,y,z);m.castShadow=true;m.receiveShadow=true;parent.add(m);return m};

const ground=box(0,-.3,0,520,.5,520,0x87785f);
const road=(x,z,w,d,rot=0)=>{const r=box(x,.02,z,w,.06,d,0x454541);r.rotation.y=rot;return r};
road(0,0,430,14);
road(-80,55,9,250);
road(80,65,9,270);
road(0,90,250,8);
road(0,-90,300,8);
road(-135,-20,8,180);
road(135,-20,8,180);

const house=(x,z,w,d,h,c)=>{const hse=box(x,h/2,z,w,h,d,c);box(x,h+.08,z,w*.5,.16,d*.35,0x514538);return hse};
const houses=[[-45,38,18,13,5,0xc5b69b],[0,38,16,12,6,0xb9aa91],[45,38,20,14,5,0xcabca1],[-45,75,15,12,5,0xb6a58b],[45,75,17,13,6,0xc1b096],[-45,115,20,14,5,0xcbbda4],[45,115,16,12,5,0xb3a286],[-115,45,17,13,5,0xc0ae92],[115,45,18,13,5,0xc8b99c],[-115,85,16,12,5,0xb6a487],[115,85,18,14,6,0xc4b397],[-115,-65,17,13,5,0xc5b18f],[115,-65,19,14,5,0xb9a88d]];
for(const h of houses)house(...h);

const vineyard=(x,z)=>{for(let r=0;r<12;r++)for(let c=0;c<10;c++){box(x+r*4,.45,z+c*3,.08,.9,.08,0x514a36)}};
vineyard(-180,-145);vineyard(125,-145);

const river=box(0,.05,-205,420,.08,38,0x4c7482);
const barda=box(0,12,-250,440,24,18,0x805b48);

function human(x,z,i){
 const g=new THREE.Group();
 const skin=[0xc98d70,0xb8785c,0xd5a080,0xa96b51][i%4];
 const shirt=[0x34576b,0x704735,0x4e694f,0x7d6848][i%4];
 const pants=[0x30353b,0x4b4b45,0x293b4c][i%3];
 const torso=box(0,1.05,0,.5,.8,.28,shirt,g);
 const head=new THREE.Mesh(new THREE.SphereGeometry(.27,10,8),mat(skin));head.position.y=1.72;head.castShadow=true;g.add(head);
 for(const x of[-.12,.12])box(x,.52,0,.16,.65,.18,pants,g);
 for(const x of[-.36,.36])box(x,1.08,0,.13,.65,.13,shirt,g);
 g.position.set(x,0,z);world.add(g);return g;
}
const people=[];
for(let i=0;i<14;i++)people.push(human(-105+(i%7)*35,15+Math.floor(i/7)*32,i));

const player=new THREE.Group();
box(0,1.05,0,.55,1.1,.35,0x29475a,player);
const phead=new THREE.Mesh(new THREE.SphereGeometry(.3,12,8),mat(0xb97d5d));phead.position.y=1.85;player.add(phead);
player.position.set(0,0,135);world.add(player);

const car=new THREE.Group();
box(0,.55,0,2.2,.65,4,0x3c4c4c,car);
box(0,1.05,-.2,1.75,.6,2,0x20282a,car);
for(const x of[-1.1,1.1])for(const z of[-1.25,1.25]){const w=new THREE.Mesh(new THREE.CylinderGeometry(.35,.35,.2,12),mat(0x171717));w.rotation.z=Math.PI/2;w.position.set(x,.28,z);car.add(w)}
car.position.set(5,0,112);world.add(car);

const keys={};
let playing=false,vehicle=false,paused=false;
addEventListener("keydown",e=>{keys[e.key.toLowerCase()]=true;if(e.key==="Escape"&&playing)toggleMenu()});
addEventListener("keyup",e=>keys[e.key.toLowerCase()]=false);

const start=document.getElementById("start");
document.getElementById("play").onclick=()=>{playing=true;start.style.opacity="0";setTimeout(()=>start.remove(),400)};
const menuPanel=document.getElementById("menuPanel");
function toggleMenu(){paused=!paused;menuPanel.style.display=paused?"grid":"none"}
document.getElementById("menu").onclick=()=>{if(playing)toggleMenu()};
document.getElementById("close").onclick=()=>{paused=false;menuPanel.style.display="none"};
document.getElementById("continue").onclick=()=>{paused=false;menuPanel.style.display="none"};

function move(dt){
 if(!playing||paused)return;
 const speed=vehicle?10:5;
 let x=0,z=0;
 if(keys.w||keys.arrowup)z-=1;
 if(keys.s||keys.arrowdown)z+=1;
 if(keys.a||keys.arrowleft)x-=1;
 if(keys.d||keys.arrowright)x+=1;
 const len=Math.hypot(x,z)||1;
 const o=vehicle?car:player;
 o.position.x+=x/len*speed*dt;
 o.position.z+=z/len*speed*dt;
 if(x||z)o.rotation.y=Math.atan2(x,z);
 if(keys.e){keys.e=false;if(player.position.distanceTo(car.position)<4&&!vehicle){vehicle=true;player.visible=false}else if(vehicle){vehicle=false;player.visible=true;player.position.copy(car.position);player.position.x+=2.5}}
 people.forEach((n,i)=>{n.position.x+=Math.sin(performance.now()*.00025+i)*dt*.8});
}

function animate(){
 requestAnimationFrame(animate);
 move(.016);
 const target=vehicle?car:player;
 const desired=new THREE.Vector3(target.position.x+9,7,target.position.z+12);
 camera.position.lerp(desired,.08);
 camera.lookAt(target.position.x,1,target.position.z);
 renderer.render(scene,camera);
}
animate();

addEventListener("resize",()=>{camera.aspect=innerWidth/innerHeight;camera.updateProjectionMatrix();renderer.setSize(innerWidth,innerHeight)});
