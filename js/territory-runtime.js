import * as THREE from "https://cdn.jsdelivr.net/npm/three@0.160.0/build/three.module.js";

export async function createTerritoryRuntime({scene,world,sun}){
  const [rules,missions,climate]=await Promise.all([
    fetch("./data/territory_rules.json").then(r=>r.json()),
    fetch("./data/missions_06.json").then(r=>r.json()),
    fetch("./data/climate_06.json").then(r=>r.json())
  ]);

  const g=new THREE.Group();
  g.name="CHANAR_TERRITORY_RUNTIME";
  world.add(g);

  const material=c=>new THREE.MeshStandardMaterial({color:c,roughness:1});
  const block=(x,y,z,w,h,d,c,rot=0)=>{
    const m=new THREE.Mesh(new THREE.BoxGeometry(w,h,d),material(c));
    m.position.set(x,y,z);
    m.rotation.y=rot;
    m.castShadow=true;
    m.receiveShadow=true;
    g.add(m);
    return m;
  };
  const road=(x,z,w,d,rot=0)=>block(x,.05,z,w,.1,d,0x41413d,rot);

  // Estructura grande: rutas, ciudad, chacras, rio y bardas.
  road(0,5,320,15,-.10);
  road(-5,48,300,9,.01);
  road(-112,28,8,185,0);
  road(74,34,8,175,0);
  road(3,80,8,125,.02);
  road(58,84,8,118,.02);
  road(-108,78,8,112,.02);
  road(108,76,8,120,.02);
  road(-30,-20,250,7,.05);
  road(35,-62,235,7,-.04);
  road(100,-104,145,7,.03);
  road(148,-48,7,120,.02);

  // Ciudad: lotes y viviendas separadas de las calzadas. Nunca una casa sobre una calle.\n  const houses=[[-91,18,7,5,2.8],[-72,18,6,5,3.2],[-51,18,7,5,3],[-34,18,6,5,3.4],[-17,18,7,5,2.7],[1,18,6,5,3.1],[20,18,7,5,3.5],[40,18,6,5,2.8],[58,18,7,5,3.2],[-91,66,7,5,3],[-71,66,6,5,2.8],[-50,66,7,5,3.4],[-31,66,6,5,2.7],[-12,66,7,5,3.1],[8,66,6,5,3.5],[27,66,7,5,2.8],[48,66,6,5,3.2],[67,66,7,5,2.9],[-70,102,8,5,3],[-47,102,7,5,2.8],[-25,102,8,5,3.4],[-3,102,7,5,2.7],[20,102,8,5,3.1],[44,102,7,5,3.3],[66,102,8,5,2.9]];\n  houses.forEach((b,i)=>{const body=block(b[0],b[4]/2,b[1],b[2],b[4],b[3],[0xb9aa8e,0xc9b99b,0xa99a82,0xd0c0a4][i%4]);body.userData.building=true;block(b[0],.035,b[1]-4.2,b[2]+2,.07,.8,0x8b8578);});

  for(let p=0;p<8;p++){
    const x=-150+p*34;
    for(let r=0;r<7;r++) block(x,.38,-18-r*17,25,.7,.18,0x6a5239);
  }
  for(let r=0;r<12;r++) for(let c=0;c<8;c++) block(78+r*4.1,.48,-8-c*5,.1,.95,.1,0x5e4937);

  const river=new THREE.Mesh(new THREE.PlaneGeometry(500,46),material(0x416f7d));
  river.rotation.x=-Math.PI/2;
  river.position.set(0,.035,-172);
  g.add(river);

  for(let i=0;i<9;i++){
    const x=-210+i*52;
    const h=7+(i%3)*3;
    block(x,h/2,-226-(i%2)*5,50,h,16,0x87553f,i%2?-.04:.03);
  }

  // Clima conectado al runtime: viento como prioridad y lluvia ocasional.
  const weather=new THREE.Group();
  weather.name="CLIMATE_RUNTIME";
  scene.add(weather);

  const windPos=new Float32Array(180*3);
  for(let i=0;i<180;i++){
    windPos[i*3]=(Math.random()-.5)*430;
    windPos[i*3+1]=1+Math.random()*18;
    windPos[i*3+2]=(Math.random()-.5)*430;
  }
  const windGeo=new THREE.BufferGeometry();
  windGeo.setAttribute("position",new THREE.BufferAttribute(windPos,3));
  const wind=new THREE.Points(windGeo,new THREE.PointsMaterial({color:0xd8d0b8,size:.08,transparent:true,opacity:.35}));
  weather.add(wind);

  const rainPos=new Float32Array(260*3);
  for(let i=0;i<260;i++){
    rainPos[i*3]=(Math.random()-.5)*300;
    rainPos[i*3+1]=Math.random()*35;
    rainPos[i*3+2]=(Math.random()-.5)*300;
  }
  const rainGeo=new THREE.BufferGeometry();
  rainGeo.setAttribute("position",new THREE.BufferAttribute(rainPos,3));
  const rain=new THREE.Points(rainGeo,new THREE.PointsMaterial({color:0xb9c9cf,size:.13,transparent:true,opacity:.6}));
  rain.visible=false;
  weather.add(rain);

  let climateState=localStorage.getItem("sp_climate")||"despejado";
  let climateClock=Number(localStorage.getItem("sp_climate_clock")||0);

  const profile=id=>climate.states.find(s=>s.id===id)||climate.states[0];
  const chooseClimate=()=>{
    const order=["despejado","parcialmente_nublado","nublado","viento","lluvia_ligera","lluvia_fuerte"];
    const index=Math.floor(Date.now()/90000)%order.length;
    return order[index];
  };

  const missionMap={
    plaza:[-82,45],
    municipalidad:[-30,20],
    conexion_chacras:[-110,-25],
    chacra_municipal:[-110,-63],
    corredor_vino:[145,-72],
    balneario:[-12,-154],
    mirador:[-135,-185],
    dique:[172,-150]
  };

  function mission(index){
    const m=missions.chapters[index];
    if(!m) return null;
    const xy=missionMap[m.goal]||[0,0];
    return {...m,x:xy[0],z:xy[1]};
  }

  function update({dt,object}){
    climateClock+=dt;
    if(climateClock>90){
      climateState=chooseClimate();
      climateClock=0;
      localStorage.setItem("sp_climate",climateState);
      localStorage.setItem("sp_climate_clock","0");
    }

    const p=profile(climateState);
    wind.visible=climateState==="viento"||climateState==="parcialmente_nublado";
    wind.material.opacity=climateState==="viento"?.62:.22;
    const rainy=climateState==="lluvia_ligera"||climateState==="lluvia_fuerte";
    rain.visible=rainy;
    if(climateState==="nublado") sun.intensity=Math.min(sun.intensity,2.1);
    if(climateState==="lluvia_fuerte") sun.intensity=Math.min(sun.intensity,1.55);

    const wp=windGeo.attributes.position.array;
    for(let i=0;i<180;i++){
      wp[i*3]+=(climateState==="viento"?dt*5:dt*.7);
      if(wp[i*3]>215) wp[i*3]=-215;
    }
    windGeo.attributes.position.needsUpdate=true;

    if(rainy){
      const rp=rainGeo.attributes.position.array;
      for(let i=0;i<260;i++){
        rp[i*3+1]-=dt*18;
        if(rp[i*3+1]<.2) rp[i*3+1]=35;
      }
      rainGeo.attributes.position.needsUpdate=true;
    }

    if(object) object.userData.territoryDrivingFactor=p.driving;
  }

  return {
    rules,
    missions,
    climate,
    mission,
    getMissionTitle:i=>missions.chapters[i]?.title||"Libre exploración",
    getClimate:()=>climateState,
    update
  };
}
