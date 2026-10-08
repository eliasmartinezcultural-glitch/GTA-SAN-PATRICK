(() => {
"use strict";

/* SAN PATRICIO — NUEVO NÚCLEO
   Regla: primero jugabilidad, después territorio, después detalle.
   Sin dependencias externas. Si el navegador dibuja canvas, el juego arranca.
*/
const C=document.getElementById("game"),X=C.getContext("2d");
const zoneEl=document.getElementById("zone"),clockEl=document.getElementById("clock");
const W=2400,H=1800, keys=new Set();
const world={roads:[],houses:[],trees:[],people:[],cars:[],points:[]};
const p={x:1200,y:900,a:0,speed:220};
let last=performance.now(),gameTime=8*60,cam={x:1200,y:900},dpr=1;

function resize(){dpr=Math.min(devicePixelRatio||1,2);C.width=innerWidth*dpr;C.height=innerHeight*dpr;X.setTransform(dpr,0,0,dpr,0,0)}
addEventListener("resize",resize); resize();
addEventListener("keydown",e=>{keys.add(e.key.toLowerCase()); if(["arrowup","arrowdown","arrowleft","arrowright"," "].includes(e.key.toLowerCase()))e.preventDefault()});
addEventListener("keyup",e=>keys.delete(e.key.toLowerCase()));

function rect(x,y,w,h,t){world.roads.push({x,y,w,h,t})}
function buildWorld(){
  world.roads.length=world.houses.length=world.trees.length=world.people.length=world.cars.length=world.points.length=0;
  // Estructura territorial grande: río, barda, ejes y sectores.
  rect(0,790,W,120,"avenida"); rect(0,1040,W,72,"sur");
  rect(1080,0,120,H,"eje"); rect(1390,0,82,H,"eje");
  rect(380,0,70,H,"oeste"); rect(1780,0,82,H,"este");
  rect(0,540,700,58,"picada"); rect(1700,650,700,58,"picada");
  // Costa / río Neuquén al norte.
  for(let i=0;i<28;i++)world.trees.push({x:40+i*84,y:90+Math.sin(i)*28,r:12+((i*7)%9)});
  // Chacras y arboledas.
  for(let i=0;i<75;i++){
    const x=520+(i*137)%1050,y=170+(i*83)%480;
    if(!onRoad(x,y))world.trees.push({x,y,r:8+(i%7)});
  }
  // Manzanas urbanas. Nunca se colocan sobre caminos.
  for(let r=0;r<5;r++)for(let c=0;c<8;c++){
    const x=520+c*145+(r%2)*18,y=660+r*110;
    if(!onRoad(x+35,y+30))world.houses.push({x,y,w:68,h:52});
  }
  const names=["Plaza","Municipalidad","Deporte","Costa","Chacras","Parque Industrial","Mirador"];
  world.points.push({x:1115,y:850,n:names[0]},{x:1260,y:850,n:names[1]},{x:1540,y:850,n:names[2]},
    {x:720,y:300,n:names[3]},{x:760,y:430,n:names[4]},{x:2050,y:980,n:names[5]},{x:2050,y:360,n:names[6]});
  for(let i=0;i<20;i++)world.people.push({x:600+(i*101)%1200,y:650+(i*67)%480,v:.25+(i%4)*.08,t:i%2});
  for(let i=0;i<9;i++)world.cars.push({x:200+i*250,y:830+(i%2)*250,a:i%2?0:Math.PI/2,v:45+(i%3)*15});
}
function onRoad(x,y){return world.roads.some(r=>x>r.x-8&&x<r.x+r.w+8&&y>r.y-8&&y<r.y+r.h+8)}
function blocked(x,y){return x<35||y<35||x>W-35||y>H-35}
function sector(x,y){
  if(y<500)return "Costa / chacras";
  if(x>1850)return "Parque Industrial";
  if(y>1180)return "Barrios";
  return "Centro";
}
function update(dt){
  let dx=(keys.has("d")||keys.has("arrowright")?1:0)-(keys.has("a")||keys.has("arrowleft")?1:0);
  let dy=(keys.has("s")||keys.has("arrowdown")?1:0)-(keys.has("w")||keys.has("arrowup")?1:0);
  if(dx||dy){const m=Math.hypot(dx,dy);dx/=m;dy/=m;p.a=Math.atan2(dy,dx);const nx=p.x+dx*p.speed*dt,ny=p.y+dy*p.speed*dt;if(!blocked(nx,p.y))p.x=nx;if(!blocked(p.x,ny))p.y=ny}
  for(const n of world.people){n.x+=Math.cos(n.t?0:.7)*n.v*dt;n.y+=Math.sin(n.t?.6:0)*n.v*dt;if(n.x<450||n.x>1800)n.t^=1}
  for(const c of world.cars){c.x+=Math.cos(c.a)*c.v*dt;c.y+=Math.sin(c.a)*c.v*dt;if(c.x>W+30)c.x=-30;if(c.y>H+30)c.y=-30}
  gameTime=(gameTime+dt*8)%(24*60);
  zoneEl.textContent=sector(p.x,p.y);
  clockEl.textContent=String(Math.floor(gameTime/60)).padStart(2,"0")+":"+String(Math.floor(gameTime%60)).padStart(2,"0");
  cam.x+=(p.x-cam.x)*Math.min(1,dt*7);cam.y+=(p.y-cam.y)*Math.min(1,dt*7);
}
function draw(){
  const w=innerWidth,h=innerHeight;X.clearRect(0,0,w,h);
  X.save();X.translate(w/2-cam.x,h/2-cam.y);
  // territorio
  X.fillStyle="#b7c88b";X.fillRect(0,0,W,H);
  X.fillStyle="#d7e0bd";X.fillRect(0,0,W,500); // costa/bajo río
  X.fillStyle="#79aeb8";X.beginPath();X.moveTo(0,0);X.lineTo(W,0);X.lineTo(W,115);X.quadraticCurveTo(1800,175,1200,125);X.quadraticCurveTo(550,75,0,160);X.closePath();X.fill();
  // barda
  X.fillStyle="#a8835c";X.beginPath();X.moveTo(0,510);X.lineTo(W,510);X.lineTo(W,570);X.lineTo(0,570);X.closePath();X.fill();
  // chacras
  for(let x=520;x<1700;x+=42){X.strokeStyle="#9aae6b";X.beginPath();X.moveTo(x,150);X.lineTo(x,500);X.stroke()}
  // roads
  for(const r of world.roads){X.fillStyle="#555b5d";X.fillRect(r.x,r.y,r.w,r.h);X.strokeStyle="#c9b96d";X.lineWidth=2;if(r.w>r.h){for(let x=r.x+15;x<r.x+r.w;x+=42){X.beginPath();X.moveTo(x,r.y+r.h/2);X.lineTo(x+20,r.y+r.h/2);X.stroke()}}else{for(let y=r.y+15;y<r.y+r.h;y+=42){X.beginPath();X.moveTo(r.x+r.w/2,y);X.lineTo(r.x+r.w/2,y+20);X.stroke()}}}
  // houses
  for(const b of world.houses){X.fillStyle="#d9c9aa";X.fillRect(b.x,b.y,b.w,b.h);X.fillStyle="#8e6650";X.beginPath();X.moveTo(b.x-5,b.y);X.lineTo(b.x+b.w/2,b.y-20);X.lineTo(b.x+b.w+5,b.y);X.fill()}
  // trees
  for(const t of world.trees){X.fillStyle="#4f7d43";X.beginPath();X.arc(t.x,t.y,t.r,0,7);X.fill();X.fillStyle="#76563b";X.fillRect(t.x-2,t.y+t.r-2,4,10)}
  // points
  for(const q of world.points){X.fillStyle="#f4e7c4";X.fillRect(q.x-42,q.y-18,84,36);X.fillStyle="#26342c";X.font="12px Arial";X.textAlign="center";X.fillText(q.n,q.x,q.y+4)}
  // cars
  for(const c of world.cars){X.save();X.translate(c.x,c.y);X.rotate(c.a);X.fillStyle="#263b4b";X.fillRect(-18,-9,36,18);X.fillStyle="#b8d2d8";X.fillRect(-5,-7,11,14);X.restore()}
  // people
  for(const n of world.people){X.fillStyle="#6d493b";X.beginPath();X.arc(n.x,n.y-9,5,0,7);X.fill();X.fillStyle=n.t?"#5c7180":"#8d684d";X.fillRect(n.x-5,n.y-4,10,15)}
  // player
  X.save();X.translate(p.x,p.y);X.rotate(p.a);X.fillStyle="#20252a";X.fillRect(-9,-13,18,26);X.fillStyle="#d6b08d";X.beginPath();X.arc(0,-15,7,0,7);X.fill();X.fillStyle="#e2c34c";X.fillRect(4,-3,5,6);X.restore();
  X.restore();
}
function loop(now){const dt=Math.min((now-last)/1000,.05);last=now;update(dt);draw();requestAnimationFrame(loop)}
buildWorld(); requestAnimationFrame(loop);
})();