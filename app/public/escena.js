// La escena: el negocio es el núcleo del centro y cada departamento es una punta de la estrella.
// Cada oficina es una imagen en pixel art (oficinas/<id>.png, con cuadros extra para animarla).
// El trabajo viaja por los rayos: de cada oficina al núcleo y del núcleo a quien lo usa.
import * as ui from "./ui.js";

// cx, cy: centro de la oficina en % de la escena. lado: dónde sale la tarjeta al pasar el mouse.
export const PODS = [
  { id: "direccion",   cx: 50, cy: 21, color: "#f1b84b", icono: "direccion",   lado: "der" },
  { id: "ventas",      cx: 82, cy: 38, color: "#4f9bff", icono: "ventas",      lado: "izq" },
  { id: "finanzas",    cx: 69, cy: 70, color: "#4fd18a", icono: "finanzas",    lado: "der" },
  { id: "operaciones", cx: 31, cy: 70, color: "#3fd6e0", icono: "operaciones", lado: "izq" },
  { id: "marketing",   cx: 18, cy: 38, color: "#a46bff", icono: "marketing",   lado: "der" },
];
const ANCHO = 15; // ancho de cada oficina en % de la escena
const NUCLEO = { cx: 50, cy: 50 };

export const estado = { negocio: {}, equipo: [], porId: {} };
const params = new URLSearchParams(location.search);
export const horaForzada = params.has("hora") ? Number(params.get("hora")) : null;
let sel = -1;

// ---------------------------------------------------------------- datos
let primeraCarga = true;
export async function cargar() {
  try {
    const r = await fetch("/api/oficina", { cache: "no-store" });
    const d = await r.json();
    estado.negocio = d.negocio;
    estado.turnos = d.turnos || null;
    for (const e of d.equipo) {
      const viejo = estado.porId[e.id];
      if (viejo && viejo._simulando) continue;
      const antes = viejo?.resultados?.[0]?.archivo;
      e.turno = d.turnos?.puestos?.[e.id] || null;
      // el turno ya arrancó pero el empleado todavía no anotó su tarea
      if (e.turno?.turno === "corriendo" && e.estado?.estado !== "trabajando")
        e.estado = { ...e.estado, estado: "trabajando", tarea: "Preparándose para su turno", progreso: 2, pasos: [], bitacora: [], arrancando: true };
      estado.porId[e.id] = Object.assign(viejo || {}, e);
      const ahora = e.resultados?.[0];
      if (!primeraCarga && ahora && ahora.archivo !== antes) entregar(e.id, ahora.titulo);
    }
    primeraCarga = false;
    estado.equipo = PODS.map((p) => estado.porId[p.id]).filter(Boolean);
    pintarOficinas();
    ui.actualizarHud(estado);
    ui.refrescarPanel();
  } catch (e) { console.warn("No pude leer la oficina", e); }
}

// "Ponte a trabajar": el servidor abre un turno de Claude Code con el agente del puesto.
// Con el negocio de ejemplo no hay a quién ponerle a trabajar de verdad: se simula.
export async function ponerATrabajar(id, pedido = null) {
  const e = estado.porId[id];
  if (!e || e.estado.estado === "trabajando") return { mensaje: "Ya estoy en eso." };
  try {
    const r = await fetch("/api/trabajar", { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify({ puesto: id, pedido }) });
    const d = await r.json();
    if (d.ejemplo) { simular(id, pedido); return { mensaje: "Esta es la oficina de ejemplo, así que te muestro cómo se vería. Carga tu negocio con /contratar y trabajo de verdad." }; }
    if (!d.ok) return { mensaje: d.error || "No pude arrancar." };
    e.turno = { ...(e.turno || {}), turno: d.enCola ? "en cola" : "corriendo" };
    pintarOficinas(); await cargar();
    return { ok: true, mensaje: d.enCola ? "Anotado. Hay alguien trabajando, arranco apenas termine." : pedido ? "Entendido, me pongo con eso. Mira la oficina: vas a ver lo que voy haciendo." : "Listo, ya arranco. Mira la oficina: vas a ver lo que voy haciendo." };
  } catch { return { mensaje: "No encuentro el servidor de la oficina. ¿Sigue abierto npm start?" }; }
}

function simular(id, pedido = null) {
  const e = estado.porId[id];
  e._simulando = true;
  const tarea = pedido || e.tareas[0];
  const pasos = ["Leer la información del negocio", tarea, "Revisar el resultado", "Dejarlo en entregables"].map((texto) => ({ texto, hecho: false }));
  const indicadores = e.estado.indicadores;
  const ahora = () => { const d = new Date(), h = d.getHours(); return `${((h + 11) % 12) + 1}:${String(d.getMinutes()).padStart(2, "0")} ${h >= 12 ? "p. m." : "a. m."}`; };
  e.estado = { estado: "trabajando", tarea: tarea, progreso: 0, pasos, desde: new Date().toISOString(), bitacora: [{ hora: ahora(), texto: "Abrí la información del negocio" }], indicadores };
  e.historial.unshift({ fecha: new Date().toISOString(), texto: `Empezó: ${tarea}` });
  pintarOficinas(); ui.actualizarHud(estado);
  const iv = setInterval(() => {
    e.estado.progreso = Math.min(100, e.estado.progreso + 5);
    e.estado.pasos.forEach((p, i) => {
      const hecho = e.estado.progreso >= (i + 1) * 25;
      if (hecho && !p.hecho) e.estado.bitacora.push({ hora: ahora(), texto: `Listo: ${p.texto}` });
      p.hecho = hecho;
    });
    ui.refrescarPanel();
    pintarLineas();
    if (e.estado.progreso >= 100) {
      clearInterval(iv);
      e.estado = { estado: "libre", tarea: null, progreso: 0, pasos: [], bitacora: [], indicadores };
      e.historial.unshift({ fecha: new Date().toISOString(), texto: "Terminó y dejó el resultado" });
      e._simulando = false;
      pintarOficinas(); ui.actualizarHud(estado); ui.refrescarPanel();
      entregar(id, tarea);
    }
  }, 600);
}

// ---------------------------------------------------------------- oficinas
const ICONOS = {
  ventas: `<rect x="2" y="12" width="3" height="6"/><rect x="7" y="8" width="3" height="10"/><rect x="12" y="4" width="3" height="14"/><rect x="2" y="2" width="6" height="2"/>`,
  operaciones: `<rect x="3" y="3" width="14" height="14" fill="none" stroke="currentColor" stroke-width="2"/><rect x="6" y="6" width="3" height="3"/><rect x="11" y="6" width="3" height="3"/><rect x="6" y="11" width="3" height="3"/><rect x="11" y="11" width="3" height="3"/>`,
  marketing: `<rect x="2" y="7" width="4" height="6"/><rect x="6" y="5" width="3" height="10"/><rect x="9" y="3" width="3" height="14"/><rect x="13" y="8" width="5" height="2"/><rect x="13" y="4" width="4" height="2"/><rect x="13" y="12" width="4" height="2"/>`,
  direccion: `<rect x="2" y="7" width="3" height="9"/><rect x="15" y="7" width="3" height="9"/><rect x="8" y="4" width="4" height="12"/><rect x="2" y="14" width="16" height="3"/><rect x="5" y="9" width="3" height="5"/><rect x="12" y="9" width="3" height="5"/>`,
  finanzas: `<rect x="2" y="14" width="16" height="2"/><rect x="3" y="10" width="3" height="4"/><rect x="8" y="7" width="3" height="7"/><rect x="13" y="3" width="3" height="11"/>`,
};
const ESTADOS = { trabajando: "Trabajando", libre: "Libre", durmiendo: "Durmiendo" };
const esc = (s) => String(s ?? "").replace(/[&<>"]/g, (ch) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[ch]));
const minus = (s) => (s ? s.charAt(0).toLowerCase() + s.slice(1) : "");

// Lo que dice la placa debajo de cada oficina: una sola línea con lo que está haciendo.
function lineaCorta(e) {
  const st = e.estado?.estado || "libre";
  if (st === "trabajando") return e.estado.tarea || "Trabajando";
  if (e.turno?.turno === "en cola") return "En cola, arranca apenas se libere el turno";
  if (st === "durmiendo") return `Vuelve ${minus(e.horario)}`;
  return e.resultados?.[0] ? `Entregó: ${e.resultados[0].titulo}` : "Libre";
}

let firmaOficinas = "";
function pintarOficinas() {
  const caja = document.getElementById("oficinas");
  const firma = JSON.stringify(estado.equipo.map((e) => [e.id, e.estado.estado, e.estado.tarea, e.estado.indicadores, e.resultados?.[0]?.archivo, e.turno?.turno]));
  if (firma === firmaOficinas) return;
  firmaOficinas = firma;
  caja.innerHTML = "";
  PODS.forEach((p, i) => {
    const e = estado.porId[p.id];
    if (!e) return;
    const st = e.estado?.estado || "libre";
    const el = document.createElement("div");
    el.className = `oficina ${st} lado-${p.lado}${i === sel ? " sel" : ""}`;
    el.style.cssText = `left:${p.cx}%;top:${p.cy}%;width:${ANCHO}%;--c:${p.color}`;
    el.dataset.i = i;
    el.innerHTML = `
      <button class="pod" data-cuadro="a" aria-label="Hablar con ${esc(e.empresario)}, ${esc(e.departamento)}">
        <img class="cuadro-a" src="oficinas/${p.id}.png" alt="" onerror="this.closest('.oficina').classList.add('sin-img')">
        <img class="cuadro-b" src="oficinas/${p.id}-b.png" alt="" onerror="this.remove()">
        <img class="cuadro-dormido" src="oficinas/${p.id}-dormido.png" alt="" onerror="this.closest('.oficina').classList.add('sin-dormido');this.remove()">
        <span class="pod-retrato"></span>
        ${st === "trabajando" ? `<span class="burbuja"><i></i><i></i><i></i></span>` : ""}
        ${st === "durmiendo" ? `<span class="zzz"><i>z</i><i>z</i><i>Z</i></span>` : ""}
      </button>
      <div class="placa">
        <span class="placa-cab"><i class="placa-punto ${st}"></i><b>${esc(e.departamento)}</b><small>${esc(e.empresario)}</small></span>
        <span class="placa-linea">${esc(lineaCorta(e))}</span>
        ${st === "trabajando" ? `<span class="placa-barra"><i style="width:${e.estado.progreso || 0}%"></i></span>` : ""}
      </div>
      <div class="tarjeta-of">
        <div class="tof-cab"><svg viewBox="0 0 20 20" class="tof-ico" fill="currentColor" shape-rendering="crispEdges">${ICONOS[p.icono]}</svg>
          <div class="tof-nom"><b>${esc(e.departamento)}</b><small>con ${esc(e.empresario)}</small></div></div>
        <span class="tof-estado ${st}"><i></i>${ESTADOS[st]}</span>
        <ul>${(e.estado.indicadores || []).slice(0, 3).map((k) => `<li><span>${esc(k.etiqueta)}:</span> <b>${esc(k.valor)}</b></li>`).join("")}</ul>
        <small class="tof-pie">Clic para hablar</small>
      </div>`;
    el.querySelector(".pod-retrato").appendChild(ui.retrato(e.personaje, "pod"));
    el.querySelector(".pod").onclick = () => { seleccionar(i); ui.abrirDialogo(e); };
    el.querySelector(".tarjeta-of").onclick = () => { seleccionar(i); ui.abrirDialogo(e); };
    el.onmouseenter = () => seleccionar(i);
    el.onmouseleave = () => seleccionar(-1);
    caja.appendChild(el);
  });
  pintarNucleo();
}

// Solo la barra y el texto de la placa, sin repintar todo (la simulación avanza cada 600 ms).
function pintarLineas() {
  PODS.forEach((p, i) => {
    const e = estado.porId[p.id], el = document.querySelector(`.oficina[data-i="${i}"]`);
    if (!e || !el) return;
    const barra = el.querySelector(".placa-barra i");
    if (barra) barra.style.width = `${e.estado.progreso || 0}%`;
  });
}

function seleccionar(i) {
  sel = i;
  document.querySelectorAll(".oficina").forEach((el) => el.classList.toggle("sel", Number(el.dataset.i) === i));
}

// Cuadros: trabajando alterna con el cuadro b a ritmo irregular; libre parpadea de vez en cuando;
// durmiendo usa su cuadro propio.
const reloj = {};
function animarCuadros(t) {
  PODS.forEach((p, i) => {
    const e = estado.porId[p.id];
    const pod = document.querySelector(`.oficina[data-i="${i}"] .pod`);
    if (!e || !pod) return;
    const st = e.estado?.estado || "libre";
    let cuadro = "a";
    if (st === "durmiendo") cuadro = "dormido";
    else {
      const r = (reloj[p.id] ||= { prox: t + 800 + i * 700, hasta: 0 });
      if (t >= r.prox) {
        const dura = st === "trabajando" ? 380 + Math.random() * 420 : 200;
        r.hasta = t + dura;
        r.prox = t + dura + (st === "trabajando" ? 900 + Math.random() * 1800 : 3500 + Math.random() * 4000);
      }
      if (t < r.hasta) cuadro = "b";
    }
    if (pod.dataset.cuadro !== cuadro) pod.dataset.cuadro = cuadro;
  });
}

// ---------------------------------------------------------------- núcleo: el negocio
function pintarNucleo() {
  const n = estado.negocio || {};
  const logo = document.getElementById("nucleo-logo");
  const clave = n.logo ? `img:${n.logo}` : `txt:${n.nombre}`;
  if (logo.dataset.clave !== clave) {
    logo.dataset.clave = clave;
    const inicial = esc((n.nombre || "T").trim()[0]);
    logo.innerHTML = n.logo ? `<img src="/logo" alt="" onerror="this.parentNode.innerHTML='${inicial}'">` : inicial;
  }
  const total = estado.equipo.reduce((s, e) => s + (e.resultados?.length || 0), 0);
  const trab = estado.equipo.filter((e) => e.estado?.estado === "trabajando").length;
  document.getElementById("nucleo-sub").textContent = `${total} entregables · ${trab} trabajando`;
}
document.getElementById("nucleo").onclick = () => ui.irA("entregables");

const anillos = document.getElementById("anillos").getContext("2d");
function pintarAnillos(t) {
  const S = 96, c = S / 2;
  anillos.clearRect(0, 0, S, S);
  const pulso = pulsoHasta > t ? (pulsoHasta - t) / 700 : 0;
  // halo
  for (let rr = 46; rr > 30; rr -= 2) {
    anillos.fillStyle = `rgba(110,170,255,${0.018 + pulso * 0.03})`;
    anillos.beginPath(); anillos.arc(c, c, rr, 0, Math.PI * 2); anillos.fill();
  }
  const puntos = (radio, n, vel, color, tam) => {
    for (let k = 0; k < n; k++) {
      const a = (k / n) * Math.PI * 2 + t * vel;
      anillos.fillStyle = color;
      anillos.fillRect(Math.round(c + Math.cos(a) * radio - tam / 2), Math.round(c + Math.sin(a) * radio - tam / 2), tam, tam);
    }
  };
  // anillo exterior punteado que gira despacio, anillo medio al revés con cinco marcas (una por departamento)
  puntos(43, 56, 0.00012, "rgba(120,180,255,0.55)", 1);
  puntos(37, 90, -0.00025, `rgba(150,205,255,${0.35 + pulso * 0.5})`, 1);
  PODS.forEach((p, k) => {
    const a = Math.atan2(p.cy - NUCLEO.cy, (p.cx - NUCLEO.cx) * 16 / 9);
    anillos.fillStyle = p.color;
    anillos.fillRect(Math.round(c + Math.cos(a) * 37 - 1.5), Math.round(c + Math.sin(a) * 37 - 1.5), 3, 3);
  });
  // placa hexagonal del centro
  anillos.fillStyle = "#0e1230";
  anillos.beginPath();
  for (let k = 0; k < 6; k++) { const a = Math.PI / 6 + (k * Math.PI) / 3; anillos[k ? "lineTo" : "moveTo"](c + Math.cos(a) * 30, c + Math.sin(a) * 30); }
  anillos.closePath(); anillos.fill();
  anillos.strokeStyle = `rgba(120,190,255,${0.8 + pulso * 0.2})`; anillos.lineWidth = 2; anillos.stroke();
  anillos.strokeStyle = "rgba(120,190,255,0.25)"; anillos.lineWidth = 1;
  anillos.beginPath();
  for (let k = 0; k < 6; k++) { const a = Math.PI / 6 + (k * Math.PI) / 3; anillos[k ? "lineTo" : "moveTo"](c + Math.cos(a) * 25, c + Math.sin(a) * 25); }
  anillos.closePath(); anillos.stroke();
}

// ---------------------------------------------------------------- paquetes que viajan por los rayos
// Cada entrega sale de una oficina, pasa por el núcleo y llega a quien la usa.
const FLUJO = [
  { de: "direccion",   a: "marketing",   nota: "Prioridades de la semana" },
  { de: "marketing",   a: "ventas",      nota: "Posts para los prospectos" },
  { de: "ventas",      a: "operaciones", nota: "Prospectos que respondieron" },
  { de: "operaciones", a: "finanzas",    nota: "Pedidos confirmados" },
  { de: "finanzas",    a: "direccion",   nota: "Reporte de la semana" },
];
const capa = document.getElementById("paquetes");
const viajes = [];
let pulsoHasta = 0;
const pod = (id) => PODS.find((p) => p.id === id);
// punto del rayo a una fracción f entre la oficina (0) y el núcleo (1)
const enRayo = (p, f) => ({ x: p.cx + (NUCLEO.cx - p.cx) * f, y: p.cy + (NUCLEO.cy - p.cy) * f });

function lanzar(deId, aId, texto, t) {
  const p = pod(deId);
  if (!p) return;
  const el = document.createElement("div");
  el.className = "paquete";
  el.style.setProperty("--c", p.color);
  el.innerHTML = `<i class="paq-ico"></i><span>${esc(texto)}</span>`;
  capa.appendChild(el);
  const tramos = [{ desde: enRayo(p, 0.56), hasta: enRayo(p, 0.86), dura: 1300 }];
  const q = aId && pod(aId);
  if (q) tramos.push({ desde: enRayo(q, 0.86), hasta: enRayo(q, 0.58), dura: 1300, color: q.color });
  el.style.left = `${tramos[0].desde.x}%`; el.style.top = `${tramos[0].desde.y}%`;
  viajes.push({ el, tramos, i: 0, t0: t + 40, destino: q?.id });
}

export function entregar(id, texto) {
  lanzar(id, null, `Listo: ${texto}`, performance.now());
}

function moverPaquetes(t) {
  for (let k = viajes.length - 1; k >= 0; k--) {
    const v = viajes[k], tr = v.tramos[v.i];
    let f = (t - v.t0) / tr.dura;
    if (f < 0) continue;
    if (f >= 1) {
      if (v.i === 0) { pulsoHasta = t + 700; document.getElementById("nucleo").classList.remove("pulso"); void document.getElementById("nucleo").offsetWidth; document.getElementById("nucleo").classList.add("pulso"); }
      v.i++; v.t0 = t + 260;
      if (v.i >= v.tramos.length) {
        if (v.destino) llegada(v.destino);
        v.el.classList.add("fuera");
        setTimeout(() => v.el.remove(), 400);
        viajes.splice(k, 1);
        continue;
      }
      if (v.tramos[v.i].color) v.el.style.setProperty("--c", v.tramos[v.i].color);
      f = 0;
    }
    const e = f < 0.5 ? 2 * f * f : 1 - Math.pow(-2 * f + 2, 2) / 2;
    const x = tr.desde.x + (tr.hasta.x - tr.desde.x) * e, y = tr.desde.y + (tr.hasta.y - tr.desde.y) * e;
    v.el.style.left = `${x}%`; v.el.style.top = `${y}%`;
    // dentro del núcleo el paquete se esconde un instante
    v.el.classList.toggle("adentro", (v.i === 0 && f > 0.92) || (v.i === 1 && f < 0.08));
  }
}

function llegada(id) {
  const el = document.querySelector(`.oficina[data-i="${PODS.findIndex((p) => p.id === id)}"]`);
  if (!el) return;
  el.classList.remove("recibe"); void el.offsetWidth; el.classList.add("recibe");
}

// El ambiente: cada pocos segundos alguien despierto le pasa algo a otro, con el título real
// de uno de sus entregables.
let proxEnvio = 1500, turno = 0;
function ambiente(t) {
  if (t < proxEnvio || ui.abierto()) return;
  proxEnvio = t + 3200 + Math.random() * 1800;
  for (let k = 0; k < FLUJO.length; k++) {
    const f = FLUJO[(turno + k) % FLUJO.length];
    const e = estado.porId[f.de];
    // solo pasa algo real: sin entregables no hay nada que llevar
    if (!e || e.estado?.estado === "durmiendo" || !e.resultados?.length) continue;
    turno = (turno + k + 1) % FLUJO.length;
    const r = e.resultados[Math.floor(Math.random() * e.resultados.length)];
    const texto = r.titulo;
    lanzar(f.de, f.a, texto.length > 30 ? texto.slice(0, 28).trimEnd() + "…" : texto, t);
    return;
  }
}

// ---------------------------------------------------------------- fondo: piso y rayos
const fondo = document.getElementById("fondo");
const FW = 320, FH = 180;
fondo.width = FW; fondo.height = FH;
const fc = fondo.getContext("2d");
let semilla = 7;
const azar = () => ((semilla = (semilla * 16807) % 2147483647) / 2147483647);
const r = (x, y, w, h, c) => { fc.fillStyle = c; fc.fillRect(x, y, w, h); };
const NX = (NUCLEO.cx / 100) * FW, NY = (NUCLEO.cy / 100) * FH;

function pintarFondo(t) {
  // fondo oscuro con un resplandor que sale del núcleo
  // transparente: detrás está la galaxia (galaxia.js); aquí solo el resplandor del núcleo
  fc.clearRect(0, 0, FW, FH);
  const g = fc.createRadialGradient(NX, NY, 4, NX, NY, 150);
  g.addColorStop(0, "rgba(40, 46, 120, 0.75)"); g.addColorStop(0.45, "rgba(26, 30, 80, 0.35)"); g.addColorStop(1, "rgba(8, 9, 26, 0)");
  fc.fillStyle = g; fc.fillRect(0, 0, FW, FH);
  // anillos concéntricos del piso, punteados
  for (const radio of [44, 74, 108]) {
    const n = Math.round(radio * 2.2);
    for (let k = 0; k < n; k++) {
      if (k % 3) continue;
      const a = (k / n) * Math.PI * 2;
      r(Math.round(NX + Math.cos(a) * radio * 1.35), Math.round(NY + Math.sin(a) * radio * 0.78), 1, 1, "#262b5e");
    }
  }
  // rayos del núcleo a cada oficina, con pulsos que viajan hacia el centro si el departamento trabaja
  for (const p of PODS) {
    const e = estado.porId[p.id];
    const st = e?.estado?.estado || "libre";
    const px = (p.cx / 100) * FW, py = (p.cy / 100) * FH;
    const largo = Math.hypot(px - NX, py - NY), pasos = Math.round(largo);
    const base = st === "durmiendo" ? 0.18 : st === "trabajando" ? 0.5 : 0.32;
    fc.fillStyle = p.color;
    for (let s = 0; s <= pasos; s++) {
      const f = s / pasos;
      if (f < 0.16) continue; // no pisa el núcleo
      const x = Math.round(NX + (px - NX) * f), y = Math.round(NY + (py - NY) * f);
      let a = base * (s % 2 ? 0.6 : 1);
      if (st === "trabajando") {
        const fase = ((t / 22 + s) % 26) / 26; // pulsos hacia el núcleo
        if (fase > 0.82) a = 1;
      }
      fc.globalAlpha = a;
      fc.fillRect(x, y, 1, 1);
      if (st !== "durmiendo") { fc.globalAlpha = a * 0.25; fc.fillRect(x - 1, y, 3, 1); fc.fillRect(x, y - 1, 1, 3); }
    }
    fc.globalAlpha = 1;
  }
}

// ---------------------------------------------------------------- teclado
addEventListener("keydown", (e) => {
  if (ui.capturaTeclado(e)) return;
  const n = PODS.length;
  if (["ArrowRight", "ArrowDown", "d", "s"].includes(e.key)) { seleccionar((sel + 1 + n) % n); e.preventDefault(); }
  if (["ArrowLeft", "ArrowUp", "a", "w"].includes(e.key)) { seleccionar((sel - 1 + n) % n); e.preventDefault(); }
  if ((e.key === "Enter" || e.key === " ") && sel >= 0) { ui.abrirDialogo(estado.porId[PODS[sel].id]); e.preventDefault(); }
});

function bucle(t) {
  pintarFondo(t); pintarAnillos(t); animarCuadros(t); moverPaquetes(t); ambiente(t);
  requestAnimationFrame(bucle);
}

export function iniciar() {
  cargar().then(() => requestAnimationFrame(bucle));
  // en vivo: el servidor avisa cuando cambia algo en oficina/; el sondeo queda de respaldo
  try { new EventSource("/api/eventos").onmessage = () => cargar(); } catch {}
  setInterval(cargar, 30000);
}
