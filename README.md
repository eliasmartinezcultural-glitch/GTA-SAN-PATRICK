# GTA SAN PATRICK

## Prototipo 0.3 — mundo vivo + territorio + sandbox

**Concepto:** un mundo abierto inspirado en la filosofía de juego de GTA San Andreas, pero creado alrededor de San Patricio del Chañar. No copia personajes, mapa, música, misiones ni recursos protegidos de GTA.

### Ya funciona
- Ciclo de día/noche con reloj interno.
- Guardado local de dinero, progreso, hora y descubrimientos.
- Tres objetivos encadenados con recompensa.
- Sistema de descubrimiento de puntos de interés.
- NPC con roles y actividad diferenciada según horario.
- Panel de progreso.
- Controles táctiles para celular/tablet.
- Mundo 3D en navegador.
- Cámara en tercera persona.
- Personaje masculino.
- Movimiento WASD / flechas.
- Vehículo básico: acercarse + **E** para entrar/salir.
- NPC ambientales.
- Dinero y primera misión.
- Mini-mapa.
- Panel territorial con zonas y puntos de interés.
- Río, bardas, calles, chacras, viñedos y corredor productivo.
- Base de datos territorial en `data/world.json`.

## Mapeo de Chañar

La primera capa de mapeo está construida a partir de cartografía pública de la **Dirección Provincial de Catastro e Información Territorial de Neuquén**, que publica un mapa específico de San Patricio del Chañar, y de información oficial municipal/provincial.

### Estructura jugable propuesta

1. **Centro urbano**
   - Municipalidad
   - Hospital
   - Policía
   - Bomberos
   - Registro Civil
   - Banco/cajero
   - Escuelas
   - Plazas
   - Deportes

2. **Sector sur**
   - Pista de skate
   - EPEN
   - Radio municipal
   - Centro cultural
   - SUM
   - equipamiento comunitario

3. **Chacras y picadas**
   - producción
   - riego
   - huertas
   - caminos rurales
   - frutales
   - viviendas rurales

4. **Río Neuquén**
   - balneario
   - naturaleza
   - pesca
   - aves
   - exploración

5. **Bardas**
   - miradores
   - caminos
   - secretos
   - vistas panorámicas

6. **Corredor vitivinícola**
   - Del Fin del Mundo
   - Malma
   - Familia Schroeder
   - Secreto Patagónico
   - Patritti

7. **Dique Compensador**
   - zona natural
   - observación de fauna
   - exploración

### Fuentes territoriales de referencia

- Dirección Provincial de Catastro e Información Territorial: mapa de localidad de San Patricio del Chañar.
- Municipalidad de San Patricio del Chañar: espacios públicos, balneario, chacra municipal, dique y mirador.
- Turismo Neuquén: bodegas, rutas y circuito vitivinícola.
- Neuquén Informa: trazado proyectado del Camino del Vino y conectividad entre bodegas.

> Las coordenadas internas del videojuego son una representación escalada para gameplay. No se presentan como coordenadas GPS exactas.

## Filosofía de diseño

**CHAÑAR NO ES DECORACIÓN. CHAÑAR ES EL MUNDO.**

La referencia a San Andreas está en los sistemas: libertad, exploración, movilidad, progresión, economía, misiones, actividades, personajes y consecuencias. La identidad, el territorio y las historias deben ser propias de Chañar.

## Arquitectura de crecimiento 0.4+

La referencia jugable es la filosofía de los mundos abiertos de GTA San Andreas: mapa amplio, libertad, vehículos, misiones, actividades paralelas, economía, estadísticas, personajes, descubrimientos, progresión y vida cotidiana. El contenido debe ser completamente original y territorialmente propio.

### Mapeo territorial reforzado
- RP7 y RP8 como ejes de movilidad.
- Picadas como red rural/productiva.
- Centro urbano y Sector Sur.
- Chacras y corredores de producción.
- Río Neuquén, Balneario y Dique Compensador.
- Bardas y Mirador La Virgen.
- Corredor vitivinícola y Camino del Vino.
- Nuevos nodos: El Chical, Sala de Elaboración de Alimentos, Costa Verde y Picada 11.
- Sistema preparado para sumar calles verificadas sin rehacer el mundo.

Fuentes recientes confirman el desarrollo del Camino del Vino por Picada 1 y la conexión entre bodegas; Turismo Neuquén documenta las ubicaciones y características del corredor vitivinícola. En 2026 también se incorporaron nuevas referencias locales como Bodega Urbana El Chical y la infraestructura de elaboración de alimentos. La cartografía provincial se utiliza como referencia territorial, no como recurso gráfico copiado.

### Regla multidispositivo
Todo sistema nuevo debe nacer preparado para:
- teclado y mouse;
- touch en celular/tablet;
- pantallas pequeñas;
- rendimiento bajo;
- guardado local;
- interfaz legible sin depender de hover;
- controles simples;
- carga futura por sectores.

### Próximas capas

### 0.3 — mapa jugable
- reproducir con mayor precisión la trama vial urbana;
- separar RP7, RP8, calles y picadas;
- crear barrios/sectores;
- incorporar accesos rurales;
- navegación GPS interna;
- mapa grande con filtros.

### 0.4 — vida
- NPC con rutinas;
- horarios;
- comercios;
- trabajos;
- servicios;
- conversaciones;
- relaciones.

### 0.5 — movilidad
- bicicleta;
- moto;
- auto;
- camioneta;
- transporte;
- combustible;
- estacionamiento.

### 0.6 — economía
- trabajos;
- salarios;
- gastos;
- compras;
- propiedades;
- negocios;
- mejoras.

### 0.7 — historia
- protagonista;
- familia;
- contactos;
- misiones;
- decisiones;
- consecuencias;
- historias paralelas.

### 0.8 — territorio vivo
- clima;
- ciclo día/noche;
- estaciones;
- río;
- chacras;
- cosechas;
- eventos;
- fauna;
- cambios del mundo.

### 0.9 — optimización
- rendimiento móvil;
- controles táctiles;
- carga por sectores;
- reducción de polígonos;
- guardado local.

### Regla

Cada nueva versión debe **sumar profundidad sin destruir lo que ya funciona**.

Tecnología: HTML + CSS + JavaScript + Three.js por CDN.  
Hosting previsto: GitHub Pages.
