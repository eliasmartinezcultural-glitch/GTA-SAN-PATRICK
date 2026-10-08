// CHAÑAR FIRST · TERRITORY ENGINE 0.6
// Capa independiente de diseño sistémico. No reemplaza game.js.
// Orden: territorio grande -> jugabilidad -> vida -> detalle.

export const TERRITORY_06 = {
  identity: "San Patricio del Chañar",
  hierarchy: ["geografia","ejes_viales","sectores","hitos","actividad","detalle"],
  sectors: {
    urbano: {label:"Planta urbana", priority:1, gameplay:["misiones","comercio","servicios","social"]},
    borde: {label:"Borde urbano", priority:2, gameplay:["transicion","movilidad","encuentros"]},
    chacras: {label:"Chacras y picadas", priority:3, gameplay:["produccion","entregas","exploracion"]},
    vitivinicola: {label:"Corredor vitivinícola", priority:4, gameplay:["trabajo","entregas","propiedad"]},
    rio: {label:"Río Neuquén y costa", priority:5, gameplay:["recreacion","exploracion","pesca"]},
    bardas: {label:"Bardas", priority:6, gameplay:["miradores","rutas","secretos"]},
    dique: {label:"Dique Compensador", priority:7, gameplay:["naturaleza","exploracion","observacion"]}
  },
  missionArc: [
    {id:"m01", sector:"urbano", title:"Conocer el centro", target:"plaza"},
    {id:"m02", sector:"urbano", title:"Un día normal", target:"municipalidad"},
    {id:"m03", sector:"borde", title:"Salir del pueblo", target:"conexion_chacras"},
    {id:"m04", sector:"chacras", title:"El mundo productivo", target:"chacra_municipal"},
    {id:"m05", sector:"vitivinicola", title:"Camino del vino", target:"corredor_vino"},
    {id:"m06", sector:"rio", title:"Bajar al río", target:"balneario"},
    {id:"m07", sector:"bardas", title:"Mirar el territorio", target:"mirador"},
    {id:"m08", sector:"dique", title:"Más allá del pueblo", target:"dique"}
  ],
  dayPhases: [
    {from:5,to:7,name:"amanecer",population:.35,traffic:.25,outdoor:.35},
    {from:7,to:9,name:"mañana",population:.85,traffic:.75,outdoor:.8},
    {from:9,to:13,name:"actividad",population:1,traffic:1,outdoor:1},
    {from:13,to:16,name:"mediodia",population:.72,traffic:.72,outdoor:.55},
    {from:16,to:19,name:"tarde",population:.95,traffic:.9,outdoor:1},
    {from:19,to:21,name:"atardecer",population:.7,traffic:.65,outdoor:.8},
    {from:21,to:24,name:"noche",population:.38,traffic:.35,outdoor:.35},
    {from:0,to:5,name:"madrugada",population:.12,traffic:.1,outdoor:.08}
  ],
  climate: {
    states:["despejado","parcialmente_nublado","nublado","viento","lluvia_ligera","lluvia_fuerte","tormenta"],
    weights:{despejado:34,parcialmente_nublado:20,nublado:16,viento:18,lluvia_ligera:7,lluvia_fuerte:4,tormenta:1},
    effects:{
      despejado:{visibility:1,drive:1},
      parcialmente_nublado:{visibility:.98,drive:1},
      nublado:{visibility:.92,drive:1},
      viento:{visibility:.9,drive:.94},
      lluvia_ligera:{visibility:.82,drive:.9},
      lluvia_fuerte:{visibility:.62,drive:.78},
      tormenta:{visibility:.45,drive:.68}
    }
  },
  rules: [
    "El mapa grande manda sobre el detalle.",
    "Cada sector necesita una función jugable antes de recibir decoración.",
    "Una misión debe hacer recorrer territorio, no leer territorio.",
    "La información contextual aparece al jugar, no como enciclopedia.",
    "Ningún sistema territorial puede romper la experiencia limpia de juego.",
    "La ciudad, las chacras, el corredor productivo, el río y las bardas deben sentirse conectados."
  ]
};

export function getDayPhase(hour){
  return TERRITORY_06.dayPhases.find(p => hour >= p.from && hour < p.to) || TERRITORY_06.dayPhases[0];
}

export function climateProfile(state){
  return TERRITORY_06.climate.effects[state] || TERRITORY_06.climate.effects.despejado;
}

export function territorialAudit(){
  const s = TERRITORY_06.sectors;
  const required = ["urbano","borde","chacras","vitivinicola","rio","bardas","dique"];
  return required.every(k => s[k]) && TERRITORY_06.missionArc.length >= 7;
}
