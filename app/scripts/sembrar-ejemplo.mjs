// Llena oficina/ con un negocio de ejemplo (Panadería La Espiga, ficticia) para ver la
// oficina funcionando antes de cargar el tuyo. Borra lo que haya en oficina/.
// Uso: npm run ejemplo
//
// Contrato de archivos por puesto (oficina/<puesto>/):
//   puesto.json      quién es, qué hace, horario
//   estado.json      estado, tarea, progreso, pasos, bitácora en vivo, indicadores
//   historial.jsonl  una línea por evento
//   resultados/      entregables: .md (documento) o .json { tipo, titulo, resumen, datos }
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..", "..");
const OF = path.join(ROOT, "oficina");
fs.rmSync(OF, { recursive: true, force: true });
fs.mkdirSync(OF, { recursive: true });

const w = (p, data) => {
  const f = path.join(OF, p);
  fs.mkdirSync(path.dirname(f), { recursive: true });
  fs.writeFileSync(f, typeof data === "string" ? data : JSON.stringify(data, null, 2) + "\n");
};
const hist = (id, filas) => w(`${id}/historial.jsonl`, filas.map((f) => JSON.stringify(f)).join("\n") + "\n");

w("negocio.json", { nombre: "Panadería La Espiga", ciudad: "Medellín", sector: "Panadería de barrio con venta al por mayor", logo: "logo.svg", ejemplo: true });
// Logo del negocio (opcional): cualquier imagen dentro de oficina/, nombrada en negocio.json.
w("logo.svg", '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 16 16" shape-rendering="crispEdges"><g fill="#f1c84b"><rect x="7" y="1" width="2" height="2"/><rect x="5" y="3" width="2" height="2"/><rect x="9" y="3" width="2" height="2"/><rect x="5" y="5" width="2" height="2"/><rect x="9" y="5" width="2" height="2"/><rect x="5" y="7" width="2" height="2"/><rect x="9" y="7" width="2" height="2"/><rect x="5" y="9" width="2" height="2"/><rect x="9" y="9" width="2" height="2"/><rect x="7" y="3" width="2" height="12"/></g><g fill="#c98a1e"><rect x="6" y="4" width="1" height="1"/><rect x="10" y="4" width="1" height="1"/><rect x="6" y="8" width="1" height="1"/><rect x="10" y="8" width="1" height="1"/><rect x="5" y="13" width="2" height="1"/><rect x="9" y="13" width="2" height="1"/></g></svg>');

// =====================================================================  DIRECCIÓN
w("direccion/puesto.json", {
  departamento: "Dirección",
  empresario: "Jeff Bezos",
  personaje: "bezos",
  saludo: "Soy Jeff Bezos y llevo la dirección. Mi trabajo es que toda la oficina empuje hacia lo mismo esta semana y que tú no tomes decisiones grandes a ciegas.",
  tareas: [
    "Cada lunes lee lo que entregó cada departamento y fija las 3 prioridades de la semana, con responsable",
    "Revisa qué se está quedando atrás y te avisa antes de que se vuelva un problema",
    "Te ayuda a pensar las decisiones grandes: qué tan reversible es, qué pasa si sale mal",
  ],
  horario: "Lunes 7:00 a. m.",
});
w("direccion/estado.json", {
  estado: "libre", tarea: null, progreso: 0, pasos: [], bitacora: [],
  indicadores: [
    { etiqueta: "Prioridades de la semana", valor: "3", nota: "1 hecha, 2 en curso" },
    { etiqueta: "Cosas atrasadas", valor: "1", nota: "cotizaciones de tortas" },
    { etiqueta: "Decisiones abiertas", valor: "1", nota: "abrir los domingos" },
  ],
});
w("direccion/resultados/2026-11-17-prioridades-semana-47.json", {
  tipo: "checklist",
  titulo: "Prioridades de la semana 47",
  resumen: "Leí lo que dejaron Ventas, Marketing, Operaciones y Finanzas. Estas tres mueven el mes; todo lo demás espera.",
  datos: [
    { texto: "Cerrar dos cafeterías como clientes mayoristas", responsable: "Ventas · Hormozi", estado: "en curso", nota: "Hay 12 prospectos y una oferta lista. Café Molienda es el más probable." },
    { texto: "Subir el pandebono de $2.500 a $2.800", responsable: "Finanzas · Buffett", estado: "hecho", nota: "El queso subió 18 %. Sin el ajuste, cada pandebono deja $480." },
    { texto: "Publicar el video del horno a las 5 a. m.", responsable: "Marketing · Gadzhi", estado: "en curso", nota: "Es el formato que más le funciona a la competencia." },
  ],
});
w("direccion/resultados/2026-11-17-decision-domingos.md", `# Decisión: ¿abrir los domingos?

## Lo que sabemos

- Tres panaderías del barrio abren los domingos y dos de ellas tienen fila a las 8 a. m.
- Tus ventas del sábado son las más altas de la semana: $1.120.000 en promedio.
- Abrir un domingo cuesta unos $310.000 entre turno, gas e insumos.

## Qué tan reversible es

Muy reversible. Si no funciona, se deja de abrir y lo único perdido son unos domingos de turno. Este tipo de decisión se toma rápido: no hace falta tener toda la información.

## Lo que haría

Abrir **cuatro domingos seguidos, de 7 a. m. a 1 p. m.**, y medir tres cosas:

1. Ventas del domingo contra lo que cuesta abrir.
2. Si las ventas del sábado bajan (si bajan, solo estás moviendo clientes de día).
3. Cuántos clientes nuevos llegan, preguntando en caja.

Si al cuarto domingo las ventas pasan de $500.000 y el sábado no cae, se deja fijo.
`);
hist("direccion", [
  { fecha: "2026-11-17T07:00:00", texto: "Empezó la reunión del lunes" },
  { fecha: "2026-11-17T07:02:00", texto: "Leyó los entregables de los 4 departamentos" },
  { fecha: "2026-11-17T07:06:00", texto: "Entregó: Prioridades de la semana 47" },
  { fecha: "2026-11-17T07:15:00", texto: "Entregó: Decisión: ¿abrir los domingos?" },
]);

// =====================================================================  MARKETING
w("marketing/puesto.json", {
  departamento: "Marketing",
  empresario: "Iman Gadzhi",
  personaje: "gadzhi",
  saludo: "Iman Gadzhi, marketing. Cada noche miro qué le está funcionando a tu competencia, armo el plan de la semana y te dejo los posts escritos y diseñados, listos para subir.",
  tareas: [
    "Cada noche revisa tendencias del sector y lo que publicó tu competencia, con sus números",
    "Arma el plan de contenido de la semana: qué publicar, en qué formato y por qué",
    "Escribe y diseña los posts y los anuncios con la voz de tu negocio",
  ],
  horario: "Domingos 9:00 p. m.",
});
w("marketing/estado.json", {
  estado: "trabajando",
  tarea: "Escribiendo y diseñando los 5 posts de la semana 48",
  progreso: 60,
  desde: "2026-11-22T21:00:00",
  pasos: [
    { texto: "Revisar lo que publicó la competencia", hecho: true },
    { texto: "Elegir los 5 temas de la semana", hecho: true },
    { texto: "Escribir el copy de cada post", hecho: true },
    { texto: "Diseñar las imágenes", hecho: false },
    { texto: "Dejarlos listos en entregables", hecho: false },
  ],
  bitacora: [
    { hora: "9:00 p. m.", texto: "Abrí el plan de la semana 48 y la voz del negocio" },
    { hora: "9:03 p. m.", texto: "Post 1: el horno a las 5 a. m. Copy listo" },
    { hora: "9:06 p. m.", texto: "Post 2: por qué el pandebono sale mejor caliente. Copy listo" },
    { hora: "9:08 p. m.", texto: "Post 3: encuesta de desayuno. Copy listo" },
    { hora: "9:11 p. m.", texto: "Diseñando la imagen del post 1 con los colores de la panadería" },
  ],
  indicadores: [
    { etiqueta: "Posts listos esta semana", valor: "5", nota: "para la semana 48" },
    { etiqueta: "Cuentas vigiladas", valor: "6", nota: "panaderías de Medellín" },
    { etiqueta: "Mejor formato de la competencia", valor: "Reel", nota: "el horno, 3,4x su promedio" },
  ],
});
w("marketing/resultados/2026-11-22-posts-semana-48.json", {
  tipo: "posts",
  titulo: "5 posts listos, semana 48",
  resumen: "Uno por día de lunes a sábado (el miércoles va en historia). La idea de la semana: que se antoje. Nada de promociones todavía.",
  datos: [
    { dia: "Lunes", formato: "Reel", imagen: { fondo: "#2b1a12", acento: "#f1a33b", titular: "5:00 a. m.", sub: "la hora en que sale el primer pan", icono: "horno" },
    copy: "Mientras Medellín duerme, aquí ya huele a pan. Este es el primer horno del día, el que sale a las 5:00 a. m. Si pasas antes de las 7, todavía lo alcanzas caliente.", hashtags: "#PanaderíaLaEspiga #Laureles #PanCaliente #Medellín" },
    { dia: "Martes", formato: "Carrusel", imagen: { fondo: "#f4e3c1", acento: "#b5652a", titular: "Pandebono", sub: "por qué se come en los primeros 20 minutos", icono: "pandebono" },
    copy: "El pandebono tiene una ventana: los primeros 20 minutos. Después el queso se asienta y ya no es lo mismo. Por eso lo sacamos en tandas pequeñas cada hora.", hashtags: "#Pandebono #DesayunoPaisa #Laureles" },
    { dia: "Miércoles", formato: "Historia", imagen: { fondo: "#3d6b4f", acento: "#f6efdf", titular: "¿Dulce o salado?", sub: "encuesta de desayuno", icono: "pregunta" },
    copy: "Encuesta: ¿tu desayuno es de pan dulce o de pan salado? El que gane sale en oferta el sábado.", hashtags: "" },
    { dia: "Jueves", formato: "Reel", imagen: { fondo: "#f6d6dc", acento: "#9b2f4f", titular: "Torta de 15", sub: "de la masa a la entrega, en 40 segundos", icono: "torta" },
    copy: "Así se arma una torta de encargo, de principio a fin. Esta fue para los 15 de Valentina. Las hacemos con 3 días de anticipación.", hashtags: "#TortasMedellín #TortaDe15 #PorEncargo" },
    { dia: "Sábado", formato: "Post", imagen: { fondo: "#1f3a5f", acento: "#f1c84b", titular: "Domingos abiertos", sub: "de 7 a. m. a 1 p. m.", icono: "sol" },
    copy: "Desde este domingo abrimos de 7 a. m. a 1 p. m. Mismo pan, mismo horno, un día más.", hashtags: "#PanaderíaLaEspiga #Domingo" },
  ],
});
w("marketing/resultados/2026-11-22-plan-semana-48.json", {
  tipo: "calendario",
  titulo: "Plan de contenido, semana 48",
  resumen: "Cinco piezas. Dos reels porque es lo que más le funciona al sector; ninguna promoción hasta tener audiencia.",
  datos: [
    { dia: "Lun 23", formato: "Reel", tema: "El horno a las 5 de la mañana", porque: "Formato que más le rinde a la competencia (3,4x su promedio)", estado: "listo" },
    { dia: "Mar 24", formato: "Carrusel", tema: "Por qué el pandebono sale mejor caliente", porque: "Responde la pregunta que más hacen en comentarios", estado: "listo" },
    { dia: "Mié 25", formato: "Historia", tema: "Encuesta: ¿dulce o salado?", porque: "Interacción barata y te dice qué producto empujar", estado: "listo" },
    { dia: "Jue 26", formato: "Reel", tema: "Torta de 15, de principio a fin", porque: "Las tortas dejan el 41 % de la plata y casi no se muestran", estado: "listo" },
    { dia: "Vie 27", formato: "Descanso", tema: "Responder comentarios de la semana", porque: "", estado: "pendiente" },
    { dia: "Sáb 28", formato: "Post", tema: "Abrimos los domingos", porque: "Si decides abrir (ver decisión de Dirección)", estado: "listo" },
  ],
});
w("marketing/resultados/2026-11-21-competencia-semana-47.json", {
  tipo: "competencia",
  titulo: "Lo que le funcionó a la competencia, semana 47",
  resumen: "Revisé 6 panaderías de Medellín en Instagram. El patrón se repite: lo que más se ve es el proceso (horno, masa, miga), no el producto terminado.",
  datos: [
    { cuenta: "@panaderiadelparque", seguidores: 18400, mejor: "Video del horno abriéndose a las 5 a. m.", vistas: 41200, promedio: 12100, porque: "La gente comenta \"huele hasta acá\"" },
    { cuenta: "@masamadrelaureles", seguidores: 9700, mejor: "Pan partido por dentro, en cámara lenta", vistas: 22800, promedio: 7400, porque: "Muestra la miga, que es lo que se compra" },
    { cuenta: "@pandelaabuela.med", seguidores: 26100, mejor: "Sorteo de una torta", vistas: 15300, promedio: 9800, porque: "Muchos comentarios, pocas ventas" },
    { cuenta: "@hornodelbarrio", seguidores: 5200, mejor: "El panadero contando su turno", vistas: 11900, promedio: 2600, porque: "Historia de una persona real" },
    { cuenta: "@lamiga.panaderia", seguidores: 13300, mejor: "Precios de todo en una sola foto", vistas: 6100, promedio: 5900, porque: "Útil, pero no se comparte" },
    { cuenta: "@trigoydulce", seguidores: 7800, mejor: "Croissant de 24 capas", vistas: 9400, promedio: 4100, porque: "Dato curioso que la gente guarda" },
  ],
});
hist("marketing", [
  { fecha: "2026-11-21T21:00:00", texto: "Revisó 6 cuentas de la competencia" },
  { fecha: "2026-11-21T21:12:00", texto: "Entregó: Lo que le funcionó a la competencia" },
  { fecha: "2026-11-22T21:00:00", texto: "Empezó el plan de la semana 48" },
  { fecha: "2026-11-22T21:04:00", texto: "Entregó: Plan de contenido, semana 48" },
  { fecha: "2026-11-22T21:05:00", texto: "Entregó: 5 posts listos, semana 48" },
  { fecha: "2026-11-22T21:10:00", texto: "Empezó a diseñar las imágenes" },
]);

// =====================================================================  VENTAS
w("ventas/puesto.json", {
  departamento: "Ventas",
  empresario: "Alex Hormozi",
  personaje: "hormozi",
  saludo: "Alex Hormozi, ventas. Busco a quién venderle, le armo una oferta que le dé pena rechazar y te dejo el primer mensaje escrito para cada uno. Tú solo lo mandas.",
  tareas: [
    "Busca prospectos que encajan con tu cliente ideal, con teléfono, Instagram y por qué encajan",
    "Arma la oferta para cada tipo de cliente, con garantía",
    "Escribe el primer mensaje y el guion de llamada de cada prospecto",
  ],
  horario: "Lunes y jueves 8:00 a. m.",
});
w("ventas/estado.json", {
  estado: "trabajando",
  tarea: "Buscando cafeterías en Laureles que compran pan al por mayor",
  progreso: 35,
  desde: "2026-11-22T20:40:00",
  pasos: [
    { texto: "Buscar cafeterías en un radio de 2 km", hecho: true },
    { texto: "Descartar las que hornean su propio pan", hecho: false },
    { texto: "Sacar teléfono e Instagram de cada una", hecho: false },
    { texto: "Escribir el primer mensaje para cada una", hecho: false },
  ],
  bitacora: [
    { hora: "8:40 p. m.", texto: "Busqué \"cafetería\" en Laureles, Estadio y Conquistadores" },
    { hora: "8:43 p. m.", texto: "Encontré 23 cafeterías con buenas reseñas" },
    { hora: "8:47 p. m.", texto: "Descarté 6 que ya hornean su propio pan" },
    { hora: "8:52 p. m.", texto: "Revisando el menú de Café La Ceiba: vende croissants, no dice de dónde" },
  ],
  indicadores: [
    { etiqueta: "Prospectos en la lista", valor: "12", nota: "+17 por revisar" },
    { etiqueta: "Mensajes listos para enviar", valor: "12", nota: "uno por prospecto" },
    { etiqueta: "Respondieron", valor: "3", nota: "de 7 contactados" },
  ],
});
w("ventas/resultados/2026-11-20-prospectos-cafeterias.json", {
  tipo: "prospectos",
  titulo: "12 cafeterías que podrían comprarte",
  resumen: "Todas en Laureles y Estadio, a menos de 2 km, y ninguna hornea su propio pan. Ordenadas por qué tan probable es que compren. Datos de ejemplo.",
  datos: [
    { nombre: "Café Molienda", barrio: "Laureles", telefono: "300 000 0101", instagram: "@cafemolienda", porque: "Abrió hace 3 meses y busca proveedor", estado: "respondió", mensaje: "Hola, soy de la Panadería La Espiga, a 6 cuadras. Vi que abrieron hace poco: ¿ya tienen quién les lleve el pan de la mañana? Les puedo dejar una muestra mañana a las 6:30." },
    { nombre: "Café Tinto y Libro", barrio: "Laureles", telefono: "300 000 0102", instagram: "@tintoylibro", porque: "Vende croissants que compra congelados", estado: "respondió", mensaje: "Hola, soy de la Panadería La Espiga. Vi que tienen croissants en la carta: ¿les gustaría probar unos recién horneados, entregados antes de abrir?" },
    { nombre: "La Esquina del Grano", barrio: "Estadio", telefono: "300 000 0103", instagram: "@esquinadelgrano", porque: "Desayunos todo el día, 40 mesas", estado: "contactado", mensaje: "Hola, con 40 mesas de desayuno el pan se les debe ir rápido. ¿Les puedo dejar una muestra esta semana?" },
    { nombre: "Café Ventana", barrio: "Laureles", telefono: "300 000 0104", instagram: "@cafeventana", porque: "Se queja en reseñas de que se le acaba el pan", estado: "contactado", mensaje: "Hola, vi un par de reseñas que dicen que a veces se les acaba el pan. Nosotros entregamos dos veces al día si hace falta." },
    { nombre: "Origen Café", barrio: "Conquistadores", telefono: "300 000 0105", instagram: "@origencafe", porque: "Café de especialidad sin panadería propia", estado: "respondió", mensaje: "Hola, buen café pide buen pan. Les llevo una muestra de pan de masa madre sin compromiso." },
    { nombre: "Tostado y Leche", barrio: "Estadio", telefono: "300 000 0106", instagram: "@tostadoyleche", porque: "Menú de sánduches, compra pan tajado", estado: "contactado", mensaje: "Hola, para sánduches les puedo hacer el pan a la medida de su menú. ¿Hablamos?" },
    { nombre: "Café La Ceiba", barrio: "Laureles", telefono: "300 000 0107", instagram: "@cafelaceiba", porque: "Vende croissants, no dice de dónde", estado: "contactado", mensaje: "Hola, soy de una panadería del barrio. ¿Les interesa probar croissants recién horneados?" },
    { nombre: "Granos del Valle", barrio: "Laureles", telefono: "300 000 0108", instagram: "@granosdelvalle", porque: "Abre a las 6 a. m., necesita pan temprano", estado: "mensaje listo", mensaje: "Hola, si abren a las 6 les entregamos a las 5:40. ¿Les dejo una muestra?" },
    { nombre: "Café 70", barrio: "Estadio", telefono: "300 000 0109", instagram: "@cafe70med", porque: "Cerca del estadio, mucho flujo los fines de semana", estado: "mensaje listo", mensaje: "Hola, los días de partido el pan se les debe acabar. Podemos hacer entregas extra esos días." },
    { nombre: "La Tertulia", barrio: "Laureles", telefono: "300 000 0110", instagram: "@latertulia.cafe", porque: "Brunch los domingos", estado: "mensaje listo", mensaje: "Hola, para el brunch del domingo les podemos llevar pan recién salido a las 8." },
    { nombre: "Bendito Café", barrio: "Estadio", telefono: "300 000 0111", instagram: "@benditocafe", porque: "Pastelería pequeña, sin pan salado", estado: "mensaje listo", mensaje: "Hola, vi que tienen pastelería pero no pan salado. ¿Les interesa complementar?" },
    { nombre: "Mirador Café", barrio: "Conquistadores", telefono: "300 000 0112", instagram: "@miradorcafe", porque: "Abrió segunda sede hace un mes", estado: "mensaje listo", mensaje: "Hola, felicitaciones por la segunda sede. ¿Quién les está llevando el pan a la nueva?" },
  ],
});
w("ventas/resultados/2026-11-20-oferta-mayorista.md", `# Oferta mayorista para cafeterías

## La promesa

**Pan fresco todos los días antes de las 6:30 a. m., o ese día no pagas.**

## Lo que incluye

- Pedido mínimo de 40 unidades diarias, mezclando lo que quieran: pan de sal, pandebono, croissant, pan de masa madre.
- Entrega a domicilio sin costo dentro de 3 km.
- Cambio del pedido hasta las 8 p. m. del día anterior, por WhatsApp.

## Para que lo prueben sin miedo

- **Primera semana con 20 % de descuento**, para que lo prueben con sus propios clientes.
- **Si en un mes no venden más desayunos, cancelan sin multa.**

## Por qué esta oferta

A una cafetería no le duele el precio del pan. Le duele abrir a las 7 sin pan. Por eso la garantía va sobre la hora y no sobre el producto: es lo que nadie más del barrio les promete.

## Guion para la llamada

1. "¿Quién les lleva el pan hoy y a qué hora llega?"
2. "¿Qué pasa los días que llega tarde?"
3. "Si les garantizo que llega antes de las 6:30 o no pagan ese día, ¿lo probarían una semana?"
`);
hist("ventas", [
  { fecha: "2026-11-20T08:00:00", texto: "Empezó la búsqueda de cafeterías" },
  { fecha: "2026-11-20T08:21:00", texto: "Entregó: 12 cafeterías que podrían comprarte" },
  { fecha: "2026-11-20T08:30:00", texto: "Entregó: Oferta mayorista para cafeterías" },
  { fecha: "2026-11-21T10:12:00", texto: "Café Molienda respondió: quiere la muestra" },
  { fecha: "2026-11-22T20:40:00", texto: "Empezó a buscar más cafeterías en Laureles" },
]);

// =====================================================================  OPERACIONES
w("operaciones/puesto.json", {
  departamento: "Operaciones",
  empresario: "Gino Wickman",
  personaje: "wickman",
  saludo: "Gino Wickman, operaciones. Me encargo de que ningún cliente se quede sin respuesta y de que el negocio no dependa de que tú te acuerdes de todo.",
  tareas: [
    "Lleva el CRM: en qué etapa va cada cliente, quién no respondió y a quién toca escribirle hoy",
    "Mantiene la lista de pendientes de la semana, con responsable y fecha",
    "Revisa qué procesos dependen solo de ti y propone cómo soltarlos",
  ],
  horario: "Todos los días 7:30 a. m.",
});
w("operaciones/estado.json", {
  estado: "libre", tarea: null, progreso: 0, pasos: [], bitacora: [],
  indicadores: [
    { etiqueta: "Contactos activos", valor: "14", nota: "en 4 etapas" },
    { etiqueta: "Toca escribirles hoy", valor: "4", nota: "ninguno con más de una semana" },
    { etiqueta: "Pendientes de la semana", valor: "6", nota: "2 hechos" },
  ],
});
w("operaciones/resultados/2026-11-22-tablero-clientes.json", {
  tipo: "pipeline",
  titulo: "Tablero de clientes",
  resumen: "Dónde va cada cliente. Las tarjetas en rojo llevan más de 3 días sin movimiento.",
  datos: [
    { columna: "Nuevo", items: [
      { nombre: "Granos del Valle", detalle: "Cafetería · mensaje listo", dias: 0 },
      { nombre: "Café 70", detalle: "Cafetería · mensaje listo", dias: 0 },
      { nombre: "Laura (torta de bodas)", detalle: "Escribió por Instagram", dias: 1 },
    ] },
    { columna: "Contactado", items: [
      { nombre: "La Esquina del Grano", detalle: "Lo vio, no respondió", dias: 2 },
      { nombre: "Café Ventana", detalle: "Lo vio, no respondió", dias: 2 },
      { nombre: "Andrés (pandebonos oficina)", detalle: "\"Lo hablo con mi jefe\"", dias: 4 },
    ] },
    { columna: "Cotización enviada", items: [
      { nombre: "Marcela (torta de 15)", detalle: "Pidió precio el martes", dias: 5 },
      { nombre: "Origen Café", detalle: "Pidió lista de precios", dias: 1 },
      { nombre: "Colegio San Marcos", detalle: "Refrigerios para 120", dias: 3 },
    ] },
    { columna: "Cliente", items: [
      { nombre: "Don Hernán", detalle: "Pedido semanal · no pidió esta semana", dias: 6 },
      { nombre: "Café Molienda", detalle: "Muestra el lunes 6:30 a. m.", dias: 0 },
      { nombre: "Restaurante El Fogón", detalle: "Pedido diario de 60", dias: 0 },
    ] },
  ],
});
w("operaciones/resultados/2026-11-22-a-quien-escribirle-hoy.json", {
  tipo: "checklist",
  titulo: "A quién escribirle hoy",
  resumen: "Cuatro contactos. Lo que toca y el mensaje sugerido.",
  datos: [
    { texto: "Marcela (torta de 15)", responsable: "Mandar precio y foto de una parecida", estado: "pendiente", nota: "Lleva 5 días esperando. Si no se le responde hoy, se va con otra panadería." },
    { texto: "Don Hernán (pedido semanal)", responsable: "Preguntar si todo bien", estado: "pendiente", nota: "Es cliente de hace 2 años y no pidió esta semana." },
    { texto: "Andrés (pandebonos para oficina)", responsable: "Preguntar si ya lo habló", estado: "pendiente", nota: "Sugerido: \"¿Pudiste hablarlo? Te dejo 10 de prueba el viernes si quieres.\"" },
    { texto: "Café Molienda", responsable: "Confirmar la muestra del lunes", estado: "hecho", nota: "Confirmado por WhatsApp." },
  ],
});
hist("operaciones", [
  { fecha: "2026-11-22T07:30:00", texto: "Revisó el CRM: 14 contactos activos" },
  { fecha: "2026-11-22T07:33:00", texto: "Entregó: Tablero de clientes" },
  { fecha: "2026-11-22T07:34:00", texto: "Entregó: A quién escribirle hoy" },
]);

// =====================================================================  FINANZAS
w("finanzas/puesto.json", {
  departamento: "Finanzas",
  empresario: "Warren Buffett",
  personaje: "buffett",
  saludo: "Warren Buffett, finanzas. Los viernes leo tus números y te digo, sin adornos, qué está dejando plata, qué no, y dónde se te está yendo.",
  tareas: [
    "Lee tus ingresos y gastos de la semana desde tu hoja de cálculo",
    "Te da un reporte semanal con gráficas y alertas",
    "Te dice qué productos dejan plata y si tus precios están bien",
  ],
  horario: "Viernes 6:00 p. m.",
});
w("finanzas/estado.json", {
  estado: "durmiendo", tarea: null, progreso: 0, pasos: [], bitacora: [],
  indicadores: [
    { etiqueta: "Quedó esta semana", valor: "$860.000", nota: "+6 % contra la anterior" },
    { etiqueta: "Margen", valor: "17,8 %", nota: "ventas menos gastos" },
    { etiqueta: "Alertas", valor: "2", nota: "queso y tortas" },
  ],
});
w("finanzas/resultados/2026-11-21-reporte-semana-47.json", {
  tipo: "finanzas",
  titulo: "Reporte semanal, semana 47",
  resumen: "Buena semana: vendiste 7 % más que la anterior. Pero el queso se está comiendo el margen del pandebono, y tu mejor producto casi no se muestra.",
  datos: {
    semanas: [
      { s: "S40", ventas: 4120000, gastos: 3610000 }, { s: "S41", ventas: 4300000, gastos: 3650000 },
      { s: "S42", ventas: 4050000, gastos: 3700000 }, { s: "S43", ventas: 4380000, gastos: 3720000 },
      { s: "S44", ventas: 4410000, gastos: 3690000 }, { s: "S45", ventas: 4290000, gastos: 3780000 },
      { s: "S46", ventas: 4510000, gastos: 3700000 }, { s: "S47", ventas: 4820000, gastos: 3960000 },
    ],
    productos: [
      { nombre: "Tortas por encargo", ventas: 22, ganancia: 41 },
      { nombre: "Pan de sal", ventas: 34, ganancia: 28 },
      { nombre: "Mayoristas", ventas: 18, ganancia: 16 },
      { nombre: "Pandebono", ventas: 16, ganancia: 8 },
      { nombre: "Bebidas", ventas: 10, ganancia: 7 },
    ],
    alertas: [
      { nivel: "alta", texto: "El queso subió 18 % en un mes. Cada pandebono pasó de dejarte $900 a dejarte $480." },
      { nivel: "media", texto: "Las tortas son el 22 % de las ventas pero el 41 % de la ganancia. Es tu mejor producto y casi no lo muestras." },
      { nivel: "ok", texto: "Los gastos fijos están estables por tercera semana." },
    ],
  },
});
w("finanzas/resultados/2026-11-21-precios.md", `# ¿Tus precios dejan plata?

| Producto | Precio | Cuesta hacerlo | Te deja |
|---|---|---|---|
| Pandebono | $2.500 | $2.020 | $480 |
| Pan de sal (unidad) | $600 | $310 | $290 |
| Croissant | $4.500 | $2.100 | $2.400 |
| Torta de 15 (20 porciones) | $180.000 | $78.000 | $102.000 |

## Lo que haría

- **Pandebono a $2.800.** Con el queso como está, es el único producto que vendes casi al costo. Tus vecinos ya lo venden entre $2.800 y $3.200.
- **No tocaría el pan de sal.** Es lo que trae a la gente todos los días; ganas en volumen.
- **Empujaría las tortas.** Cada torta deja lo mismo que 212 pandebonos.
`);
hist("finanzas", [
  { fecha: "2026-11-21T18:00:00", texto: "Leyó la hoja de ingresos y gastos" },
  { fecha: "2026-11-21T18:08:00", texto: "Entregó: Reporte semanal, semana 47" },
  { fecha: "2026-11-21T18:14:00", texto: "Entregó: ¿Tus precios dejan plata?" },
  { fecha: "2026-11-21T18:15:00", texto: "Se fue a dormir hasta el viernes" },
]);

console.log("Oficina de ejemplo lista en", OF);
