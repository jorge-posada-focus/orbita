// Todo lo que no es la escena: HUD, barra de opciones, misión, logros, diálogo centrado
// y el panel de trabajo de cada empleado.
import { dibujarRetrato } from "./arte.js";
import { completo, mini, conectar, ETIQUETA, esc } from "./entregables.js";

const $ = (s) => document.querySelector(s);
const EJEMPLO_PEDIDO = {
  direccion: "¿me conviene abrir los domingos?",
  marketing: "tres posts para la temporada de diciembre",
  ventas: "búscame gimnasios del barrio que podrían comprarme",
  operaciones: "dime a qué clientes no les he respondido",
  finanzas: "¿me conviene subir los precios este mes?",
};
const ESTADOS = { trabajando: "Trabajando", libre: "Libre", durmiendo: "Durmiendo" };
const MESES = ["ene", "feb", "mar", "abr", "may", "jun", "jul", "ago", "sep", "oct", "nov", "dic"];
const DIAS = ["Dom", "Lun", "Mar", "Mié", "Jue", "Vie", "Sáb"];

let dialogo = null;
let panel = null;
let anim = 0;

const of = () => window.oficina.estado;
export const abierto = () => Boolean(dialogo || panel);
export function cerrarTodo() { cerrarDialogo(); cerrarPanel(); }

// ---------------------------------------------------------------- retratos
export function retrato(personaje, clase = "") {
  const caja = document.createElement("div");
  caja.className = `retrato ${clase}`;
  const img = new Image();
  img.alt = "";
  img.src = `retratos/${personaje}.png`;
  img.onerror = () => {
    const cv = document.createElement("canvas"); cv.width = 40; cv.height = 40;
    img.replaceWith(cv);
    const tic = (t) => { if (!cv.isConnected) return; dibujarRetrato(cv.getContext("2d"), personaje, t, caja.classList.contains("hablando")); requestAnimationFrame(tic); };
    requestAnimationFrame(tic);
  };
  caja.appendChild(img);
  return caja;
}

// ---------------------------------------------------------------- hora y fechas
function ahoraFicticia() {
  const d = new Date();
  const h = new URLSearchParams(location.search).get("hora");
  if (h !== null) d.setHours(Number(h), 0, 0, 0);
  return d;
}
const hora12 = (d) => { const h = d.getHours(); return `${((h + 11) % 12) + 1}:${String(d.getMinutes()).padStart(2, "0")} ${h >= 12 ? "p. m." : "a. m."}`; };
function hora(iso) { const d = new Date(iso); return isNaN(d) ? "" : hora12(d); }
function fecha(iso) { const d = new Date(iso); return isNaN(d) ? iso : `${d.getDate()} ${MESES[d.getMonth()]} · ${hora12(d)}`; }
const fechaCorta = (f) => { const [, m, d] = f.split("-"); return `${Number(d)} ${MESES[Number(m) - 1]}`; };

// ---------------------------------------------------------------- HUD, misión y logro
let ultimoLogro = "";
export function actualizarHud(estado) {
  const nombre = estado.negocio?.nombre || "Tu negocio";
  $("#negocio").textContent = nombre;
  $("#hud-negocio").textContent = nombre;
  const hl = $("#hud-logo");
  if (estado.negocio?.logo) { if (!hl.querySelector("img")) hl.innerHTML = `<img src="/logo" alt="">`; hl.classList.add("con-img"); }
  else hl.textContent = nombre.trim()[0] || "T";
  $("#hud-equipo").textContent = `${estado.equipo.length} empleados`;
  const trab = estado.equipo.filter((e) => e.estado?.estado === "trabajando").length;
  $("#chip-trabajando").innerHTML = `<i class="punto"></i>${trab} trabajando ahora`;
  const fin = estado.porId.finanzas?.estado?.indicadores?.[0];
  $("#chip-plata").innerHTML = fin ? `<b>${esc(fin.valor)}</b> ${esc(fin.etiqueta.toLowerCase())}` : "";
  $("#chip-plata").hidden = !fin;
  const d = ahoraFicticia();
  const tu = estado.turnos, ct = $("#chip-turnos");
  ct.hidden = !tu?.aviso && (!tu?.activos || !tu.proximo);
  ct.classList.toggle("alerta", !!tu?.aviso);
  ct.title = tu?.aviso || "";
  if (tu?.aviso) ct.textContent = "Turnos en pausa (?)";
  else if (!ct.hidden) ct.innerHTML = `Próximo turno: <b>${esc(estado.porId[tu.proximo.puesto]?.departamento || "")}</b>, ${esc(tu.proximo.cuando)}`;
  $("#chip-fecha").textContent = `${DIAS[d.getDay()]}, ${d.getDate()} ${MESES[d.getMonth()]} · ${hora12(d)}`;

  // misión actual: la primera prioridad de Dirección que no está hecha
  const dir = estado.porId.direccion;
  const prio = dir?.resultados.find((r) => r.tipo === "checklist");
  const pend = prio?.datos.find((x) => x.estado !== "hecho");
  const mis = $("#mision");
  mis.hidden = !pend;
  if (pend) {
    mis.innerHTML = `<span class="mis-ico"></span><span class="mis-txt"><b>Misión de la semana</b><span>${esc(pend.texto)}</span><small>${esc(pend.responsable)}</small></span><span class="mis-flecha">›</span>`;
    mis.onclick = () => abrirEntregable(dir, prio);
  }

  // logro: lo último que entregó la oficina
  const todos = estado.equipo.flatMap((e) => e.resultados.map((r) => ({ r, e }))).sort((a, b) => (a.r.archivo < b.r.archivo ? 1 : -1));
  const nuevo = todos[0];
  if (nuevo && nuevo.r.archivo !== ultimoLogro) {
    ultimoLogro = nuevo.r.archivo;
    const l = $("#logro");
    l.hidden = false;
    l.innerHTML = `<span class="logro-ico"></span><span><b>Nuevo entregable</b><span>${esc(nuevo.r.titulo)}</span><small>${esc(nuevo.e.empresario)} · ${ETIQUETA[nuevo.r.tipo] || ""}</small></span>`;
    l.onclick = () => abrirEntregable(nuevo.e, nuevo.r);
    clearTimeout(l._t); l._t = setTimeout(() => { l.hidden = true; }, 9000);
  }
}

// ---------------------------------------------------------------- barra de opciones
export function irA(seccion) {
  document.querySelectorAll("#barra-nav button").forEach((b) => b.classList.toggle("sel", b.dataset.ir === seccion));
  if (seccion === "inicio") return cerrarTodo();
  abrirPanel(null, seccion);
}

// ---------------------------------------------------------------- diálogo (centrado)
function lineaEstado(e) {
  const st = e.estado?.estado || "libre";
  const ultimo = e.resultados?.[0]?.titulo;
  if (st === "trabajando") return `Ahora mismo: ${e.estado.tarea.charAt(0).toLowerCase() + e.estado.tarea.slice(1)}. Voy en ${e.estado.progreso} %.`;
  if (e.turno?.turno === "en cola") return "Estoy en cola: arranco apenas termine quien está trabajando.";
  if (st === "durmiendo") return `Zzz... Me toca ${e.horario.charAt(0).toLowerCase() + e.horario.slice(1)}.${ultimo ? ` Lo último que dejé: «${ultimo}».` : ""}`;
  return `Ahora estoy libre.${ultimo ? ` Lo último que entregué: «${ultimo}».` : ""}`;
}

export function abrirDialogo(emp) {
  cerrarPanel();
  dialogo = {
    emp,
    texto: `${emp.saludo} ${lineaEstado(emp)}`,
    mostrados: 0,
    opciones: [
      { t: "Ver mi trabajo", f: () => abrirPanel(emp) },
      emp.estado?.estado === "trabajando" || emp.turno?.turno ? null : { t: "Haz tu ronda", f: () => { decir("Déjame ver...", []); window.oficina.ponerATrabajar(emp.id).then((r) => decir(r.mensaje, [{ t: "Dale", f: cerrarDialogo }])); } },
      emp.estado?.estado === "trabajando" || emp.turno?.turno ? null : { t: "Te encargo algo", f: () => { abrirPanel(emp); setTimeout(() => $("#pnl-pedido")?.focus(), 50); } },
      { t: "Quiero tu opinión", f: entrarConsulta },
      { t: "Chao", f: cerrarDialogo },
    ].filter(Boolean),
    sel: 0,
  };
  salirConsulta();
  $("#dialogo").hidden = false;
  $("#dialogo").style.setProperty("--c", window.oficina.PODS.find((p) => p.id === emp.id)?.color || "#f1c84b");
  const r = $("#dlg-retrato");
  r.innerHTML = "";
  r.appendChild(retrato(emp.personaje, "dlg"));
  $("#dlg-nombre").textContent = emp.empresario;
  $("#dlg-cargo").textContent = emp.departamento;
  pintarOpciones();
  animarTexto();
}

// ---------------------------------------------------------------- consulta: conversar con el empresario
const ABRE_CONSULTA = {
  direccion: "Cuéntame qué decisión tienes encima. Lo primero que voy a mirar es si se puede deshacer o no.",
  marketing: "Dale, cuéntame. ¿Qué quieres mover: que te conozcan más, que te escriban más o que te compren más?",
  ventas: "Cuéntame la idea. Te voy a decir si yo la compraría y qué le cambiaría para que sea difícil decirle que no.",
  operaciones: "Cuéntame qué te tiene ocupado. Si depende de que tú te acuerdes, ahí hay algo que arreglar.",
  finanzas: "Cuéntame en qué estás pensando poner la plata. Antes de opinar voy a mirar tus números.",
};
const limpio = (t) => t.replace(/\*\*/g, "").replace(/^#+\s*/gm, "");

function entrarConsulta() {
  dialogo.consulta = { sesion: null, ocupado: false, ctrl: null };
  $(".dlg").classList.add("consulta");
  $("#dlg-opciones").hidden = true;
  $("#dlg-consulta").hidden = false;
  decir(ABRE_CONSULTA[dialogo.emp.id] || "Cuéntame.", []);
  setTimeout(() => $("#dlg-msg").focus(), 50);
}

function salirConsulta() {
  dialogo?.consulta?.ctrl?.abort();
  if (dialogo) dialogo.consulta = null;
  $(".dlg").classList.remove("consulta");
  $("#dlg-opciones").hidden = false;
  $("#dlg-consulta").hidden = true;
  $("#dlg-tu").hidden = true;
  $("#dlg-estado").hidden = true;
}

async function enviarConsulta() {
  const c = dialogo?.consulta, caja = $("#dlg-msg"), texto = caja.value.trim();
  if (!c || c.ocupado || !texto) return;
  c.ocupado = true; c.ctrl = new AbortController();
  $("#dlg-enviar").disabled = true;
  caja.value = "";
  $("#dlg-tu").textContent = `Tú: ${texto}`; $("#dlg-tu").hidden = false;
  const est = $("#dlg-estado");
  const ponerEstado = (x) => { est.textContent = `${x}...`; est.hidden = false; dialogo.texto = ""; dialogo.mostrados = 0; $("#dlg-texto").textContent = ""; };
  ponerEstado(c.sesion ? "Pensando" : "Leyendo sobre tu negocio");
  try {
    const r = await fetch("/api/consulta", { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify({ puesto: dialogo.emp.id, mensaje: texto, sesion: c.sesion }), signal: c.ctrl.signal });
    const lector = r.body.getReader(), dec = new TextDecoder();
    let resto = "";
    for (;;) {
      const { value, done } = await lector.read();
      if (done) break;
      resto += dec.decode(value, { stream: true });
      const lineas = resto.split("\n"); resto = lineas.pop();
      for (const l of lineas) {
        let ev; try { ev = JSON.parse(l); } catch { continue; }
        if (ev.t === "estado") ponerEstado(ev.x);
        if (ev.t === "delta") { est.hidden = true; dialogo.texto += ev.x; }
        if (ev.t === "fin") { est.hidden = true; if (limpio(ev.x) !== limpio(dialogo.texto)) { dialogo.texto = ev.x; dialogo.mostrados = Math.min(dialogo.mostrados, ev.x.length); } c.sesion = ev.sesion; }
        if (ev.t === "error") { est.hidden = true; dialogo.texto = ev.x; dialogo.mostrados = 0; }
      }
    }
  } catch (e) {
    if (e.name !== "AbortError" && dialogo) { est.hidden = true; dialogo.texto = "Se cortó la conexión con la oficina. ¿Sigue abierto npm start?"; dialogo.mostrados = 0; }
  } finally {
    if (dialogo?.consulta === c) { c.ocupado = false; $("#dlg-enviar").disabled = false; caja.focus(); }
  }
}

$("#dlg-consulta").addEventListener("submit", (ev) => { ev.preventDefault(); enviarConsulta(); });
$("#dlg-salir").addEventListener("click", (ev) => { ev.stopPropagation(); cerrarDialogo(); });
$("#dlg-msg").addEventListener("keydown", (ev) => {
  ev.stopPropagation();
  if (ev.key === "Escape") cerrarDialogo();
  if (ev.key === "Enter" && !ev.shiftKey) { ev.preventDefault(); enviarConsulta(); }
});

function decir(texto, opciones) { dialogo.texto = texto; dialogo.mostrados = 0; dialogo.opciones = opciones; dialogo.sel = 0; pintarOpciones(); animarTexto(); }

function animarTexto() {
  cancelAnimationFrame(anim);
  const r = $("#dlg-retrato");
  const tic = () => {
    if (!dialogo) return;
    const hablando = dialogo.mostrados < dialogo.texto.length;
    if (hablando) {
      dialogo.mostrados = Math.min(dialogo.texto.length, dialogo.mostrados + (dialogo.consulta ? 4 : 1.6));
      $("#dlg-texto").textContent = limpio(dialogo.texto.slice(0, Math.floor(dialogo.mostrados)));
      if (dialogo.consulta) $("#dlg-texto").scrollTop = 1e6;
      $("#dlg-opciones").classList.toggle("visible", dialogo.mostrados >= dialogo.texto.length);
    }
    r.firstChild?.classList.toggle("hablando", hablando);
    anim = requestAnimationFrame(tic);
  };
  anim = requestAnimationFrame(tic);
}

function pintarOpciones() {
  const ul = $("#dlg-opciones");
  ul.innerHTML = "";
  dialogo.opciones.forEach((o, i) => {
    const b = document.createElement("button");
    b.textContent = o.t;
    b.className = i === dialogo.sel ? "sel" : "";
    b.onclick = (ev) => { ev.stopPropagation(); o.f(); };
    b.onmouseenter = () => { dialogo.sel = i; [...ul.children].forEach((x, j) => (x.className = j === i ? "sel" : "")); };
    ul.appendChild(b);
  });
  ul.classList.toggle("visible", dialogo.mostrados >= dialogo.texto.length);
}

function cerrarDialogo() { dialogo?.consulta?.ctrl?.abort(); dialogo = null; $("#dialogo").hidden = true; cancelAnimationFrame(anim); }

// ---------------------------------------------------------------- panel
const PESTANAS = [["resumen", "Resumen"], ["entregables", "Entregables"], ["historial", "Historial"]];

export function abrirPanel(emp, tipo = null) {
  cerrarDialogo();
  panel = { emp, tipo, pestana: "resumen", resultado: null, firma: "" };
  $("#panel").hidden = false;
  $("#pnl-cuerpo").scrollTop = 0;
  refrescarPanel(true);
}
function abrirEntregable(emp, r) { abrirPanel(emp); panel.pestana = "entregables"; panel.resultado = r; refrescarPanel(true); }
function cerrarPanel() {
  panel = null; $("#panel").hidden = true;
  document.querySelectorAll("#barra-nav button").forEach((b) => b.classList.toggle("sel", b.dataset.ir === "inicio"));
}

function tarjetas(lista, conQuien = false) {
  return `<div class="galeria">${lista.map((x, i) => `
    <button class="tarjeta" data-i="${i}">
      <span class="tarjeta-mini">${mini(x.r)}</span>
      <span class="tarjeta-pie"><span class="ent-tipo">${ETIQUETA[x.r.tipo] || "Entregable"}</span><b>${esc(x.r.titulo)}</b><small>${fechaCorta(x.r.fecha)}${conQuien ? ` · ${esc(x.e.empresario)}` : ""}</small></span>
    </button>`).join("")}</div>`;
}

function verEntregable(cuerpo, r, volver) {
  cuerpo.innerHTML = `<button class="volver">‹ Volver</button><div class="entregable">${completo(r, of().negocio)}</div>`;
  cuerpo.querySelector(".volver").onclick = volver;
  conectar(cuerpo, r);
}

function seccion(cab, tabs, cuerpo) {
  const equipo = of().equipo;
  tabs.innerHTML = "";
  const titulo = (t, p) => `<div class="pnl-titulo"><h2>${t}</h2><p>${p}</p></div>`;
  if (panel.tipo === "departamentos") {
    cab.innerHTML = titulo("Departamentos", "Cada departamento lo dirige alguien que sabe de eso. Toca uno para ver su trabajo.");
    cuerpo.innerHTML = `<div class="deps">${equipo.map((e) => `
      <button class="dep" data-emp="${e.id}" style="--c:${window.oficina.PODS.find((p) => p.id === e.id).color}">
        <span class="dep-cab"><span class="dep-ret"></span><span><b>${esc(e.departamento)}</b><small>${esc(e.empresario)}</small><span class="pill ${e.estado.estado}">${ESTADOS[e.estado.estado]}</span></span></span>
        <span class="dep-inds">${(e.estado.indicadores || []).map((k) => `<span><b>${esc(k.valor)}</b><small>${esc(k.etiqueta)}</small></span>`).join("")}</span>
        <span class="dep-pie">${e.resultados.length} entregables · ${esc(e.horario)}</span>
      </button>`).join("")}</div>`;
    cuerpo.querySelectorAll(".dep").forEach((b) => {
      const e = of().porId[b.dataset.emp];
      b.querySelector(".dep-ret").appendChild(retrato(e.personaje, "chico"));
      b.onclick = () => abrirPanel(e);
    });
  }
  if (panel.tipo === "entregables") {
    const todos = equipo.flatMap((e) => e.resultados.map((r) => ({ r, e }))).sort((a, b) => (a.r.archivo < b.r.archivo ? 1 : -1));
    if (panel.resultado) return verEntregable(cuerpo, panel.resultado, () => { panel.resultado = null; refrescarPanel(true); });
    cab.innerHTML = titulo("Entregables", `Todo lo que ha entregado la oficina, lo más nuevo primero. ${todos.length} en total.`);
    cuerpo.innerHTML = tarjetas(todos, true);
    cuerpo.querySelectorAll(".tarjeta").forEach((b) => (b.onclick = () => { panel.resultado = todos[Number(b.dataset.i)].r; refrescarPanel(true); cuerpo.scrollTop = 0; }));
  }
  if (panel.tipo === "actividad") {
    const act = equipo.flatMap((e) => e.historial.map((h) => ({ h, e }))).sort((a, b) => (a.h.fecha < b.h.fecha ? 1 : -1));
    cab.innerHTML = titulo("Actividad", "Lo que ha pasado en la oficina, minuto a minuto.");
    cuerpo.innerHTML = `<ul class="historial">${act.map(({ h, e }) => `<li><span class="fecha">${fecha(h.fecha)} · ${esc(e.empresario)} (${esc(e.departamento)})</span>${esc(h.texto)}</li>`).join("")}</ul>`;
  }
  if (panel.tipo === "config") {
    const n = of().negocio;
    cab.innerHTML = titulo("Configuración", "Tu negocio y el horario de cada empleado.");
    cuerpo.innerHTML = `
      <h3>Tu negocio</h3>
      <table class="tabla"><tbody><tr><th>Nombre</th><td>${esc(n.nombre)}</td></tr><tr><th>Ciudad</th><td>${esc(n.ciudad || "")}</td></tr><tr><th>Sector</th><td>${esc(n.sector || "")}</td></tr></tbody></table>
      ${n.ejemplo ? `<p class="aviso">Esta es una oficina de ejemplo. Para cargar tu negocio, abre Claude Code en esta carpeta y escribe <code>/contratar</code>.</p>` : ""}
      <h3>Horario</h3>
      <table class="tabla"><thead><tr><th>Departamento</th><th>Quién</th><th>Le toca</th><th>Qué hace</th></tr></thead><tbody>${equipo.map((e) => `<tr><td><b>${esc(e.departamento)}</b></td><td>${esc(e.empresario)}</td><td>${esc(e.horario)}</td><td><small>${esc(e.tareas.join(" · "))}</small></td></tr>`).join("")}</tbody></table>`;
  }
}

export function refrescarPanel(forzar = false) {
  if (!panel) return;
  const cab = $("#pnl-cabeza"), tabs = $("#pnl-tabs"), cuerpo = $("#pnl-cuerpo");
  if (panel.tipo) return seccion(cab, tabs, cuerpo);

  const e = panel.emp;
  const st = e.estado?.estado || "libre";
  const firma = JSON.stringify([panel.pestana, panel.resultado?.archivo, e.estado, e.resultados.length, e.historial.length]);
  if (!forzar && firma === panel.firma) return;
  panel.firma = firma;

  cab.innerHTML = `<div class="pnl-quien"></div>
    <div class="pnl-titulo"><h2>${esc(e.empresario)}</h2><p>${esc(e.departamento)} · <span class="pill ${st}">${ESTADOS[st]}</span> · ${esc(e.horario)}</p></div>
    <div class="indicadores">${(e.estado.indicadores || []).map((k) => `<div class="ind"><b>${esc(k.valor)}</b><span>${esc(k.etiqueta)}</span>${k.nota ? `<small>${esc(k.nota)}</small>` : ""}</div>`).join("")}</div>`;
  cab.querySelector(".pnl-quien").appendChild(retrato(e.personaje, "grande"));

  tabs.innerHTML = PESTANAS.map(([id, t]) => `<button data-p="${id}" class="${panel.pestana === id ? "sel" : ""}">${t}${id === "entregables" ? ` <small>${e.resultados.length}</small>` : ""}</button>`).join("");
  tabs.querySelectorAll("button").forEach((b) => (b.onclick = () => { panel.pestana = b.dataset.p; panel.resultado = null; refrescarPanel(true); cuerpo.scrollTop = 0; }));

  if (panel.pestana === "resumen") {
    const ahora = st === "trabajando"
      ? `<p class="tarea-actual">${esc(e.estado.tarea)}</p>
         <div class="barra"><div style="width:${e.estado.progreso}%"></div></div><p class="pct">${e.estado.progreso} %${e.estado.desde ? ` · desde ${fecha(e.estado.desde)}` : ""}</p>
         <ul class="pasos">${(e.estado.pasos || []).map((p) => `<li class="${p.hecho ? "hecho" : ""}">${esc(p.texto)}</li>`).join("")}</ul>
         ${e.estado.bitacora?.length ? `<h4>Bitácora en vivo</h4><ul class="bitacora">${e.estado.bitacora.map((b) => `<li><small>${esc(b.hora)}</small>${esc(b.texto)}</li>`).join("")}<li class="cursor">▍</li></ul>` : ""}`
      : e.turno?.turno === "en cola"
      ? `<p class="vacio">En cola: arranca apenas termine quien está trabajando.</p>`
      : `<p class="vacio">${st === "durmiendo" ? "Está durmiendo." : "Está libre ahora mismo."}${of().turnos?.activos && e.turno?.siguiente ? ` Su próximo turno: ${esc(e.turno.siguiente)}.` : ""}</p>
         ${e.turno?.ultimo ? `<p class="ultimo-turno ${e.turno.ultimo.ok ? "" : "mal"}">Último turno: ${fecha(e.turno.ultimo.hasta)}, ${esc(e.turno.ultimo.minutos)} min${e.turno.ultimo.ok ? "" : ". No terminó bien, revisa el historial."}</p>` : ""}
         <div class="encargo">
           <label for="pnl-pedido">Encárgale algo puntual</label>
           <textarea id="pnl-pedido" rows="2" maxlength="500" placeholder="Por ejemplo: ${esc(EJEMPLO_PEDIDO[e.id] || "lo que necesites de su área")}"></textarea>
           <div class="encargo-botones"><button class="accion" id="pnl-encargar">Encargar</button><button class="accion sec" id="pnl-trabajar">Hacer su ronda normal</button></div>
         </div>`;
    const ultimo = e.resultados[0];
    cuerpo.innerHTML = `<div class="resumen">
        <div class="col"><h3>De qué me encargo</h3><p class="saludo">${esc(e.saludo)}</p>
          <ul class="tareas">${e.tareas.map((t) => `<li>${esc(t)}</li>`).join("")}</ul></div>
        <div class="col ahora"><h3>Ahora</h3>${ahora}</div>
      </div>
      ${ultimo ? `<h3 class="sep">Lo último que entregó</h3><div class="entregable">${completo(ultimo, of().negocio)}</div>` : ""}`;
    const caja = $("#pnl-pedido");
    if (caja) {
      caja.value = panel.borrador || "";
      caja.addEventListener("input", () => (panel.borrador = caja.value));
      caja.addEventListener("keydown", (ev) => { ev.stopPropagation(); if (ev.key === "Enter" && !ev.shiftKey) { ev.preventDefault(); $("#pnl-encargar").click(); } });
    }
    const lanzar = (boton, pedido) => {
      boton.disabled = true; boton.textContent = "Arrancando...";
      window.oficina.ponerATrabajar(e.id, pedido).then((r) => { if (r.ok && pedido) panel.borrador = ""; refrescarPanel(true); toastSimple(r.mensaje); });
    };
    $("#pnl-trabajar")?.addEventListener("click", (ev) => lanzar(ev.target, null));
    $("#pnl-encargar")?.addEventListener("click", (ev) => {
      const pedido = caja.value.trim();
      if (!pedido) { caja.focus(); toastSimple("Escribe qué le quieres encargar."); return; }
      lanzar(ev.target, pedido);
    });
    if (ultimo) conectar(cuerpo, ultimo);
  }
  if (panel.pestana === "entregables") {
    if (panel.resultado) return verEntregable(cuerpo, panel.resultado, () => { panel.resultado = null; refrescarPanel(true); });
    const lista = e.resultados.map((r) => ({ r, e }));
    cuerpo.innerHTML = lista.length ? tarjetas(lista) : `<p class="vacio">Todavía no ha entregado nada.</p>`;
    cuerpo.querySelectorAll(".tarjeta").forEach((b) => (b.onclick = () => { panel.resultado = lista[Number(b.dataset.i)].r; refrescarPanel(true); cuerpo.scrollTop = 0; }));
  }
  if (panel.pestana === "historial") {
    cuerpo.innerHTML = `<ul class="historial">${e.historial.map((h) => `<li><span class="fecha">${fecha(h.fecha)}</span>${esc(h.texto)}</li>`).join("")}</ul>`;
  }
}

// ---------------------------------------------------------------- teclado
export function capturaTeclado(e) {
  if (panel) {
    if (e.key === "Escape" || e.key === "Backspace") { if (panel.resultado) { panel.resultado = null; refrescarPanel(true); } else cerrarPanel(); e.preventDefault(); }
    return true;
  }
  if (dialogo?.consulta) {
    if (e.key === "Escape") cerrarDialogo();
    return true;
  }
  if (dialogo) {
    const listo = dialogo.mostrados >= dialogo.texto.length;
    if (e.key === "Escape") cerrarDialogo();
    else if (e.key === "Enter" || e.key === " ") {
      if (!listo) { dialogo.mostrados = dialogo.texto.length; $("#dlg-texto").textContent = dialogo.texto; $("#dlg-opciones").classList.add("visible"); }
      else dialogo.opciones[dialogo.sel].f();
    } else if (["ArrowUp", "ArrowDown", "ArrowLeft", "ArrowRight"].includes(e.key) && listo) {
      const d = ["ArrowDown", "ArrowRight"].includes(e.key) ? 1 : -1;
      dialogo.sel = (dialogo.sel + d + dialogo.opciones.length) % dialogo.opciones.length;
      pintarOpciones();
    }
    e.preventDefault();
    return true;
  }
  return false;
}

document.addEventListener("click", (e) => {
  if (panel && e.target.id === "panel") cerrarPanel();
  if (dialogo && e.target.id === "dialogo") cerrarDialogo();
});

// aviso corto abajo, para respuestas del botón del panel
export function toastSimple(texto) {
  let t = document.getElementById("toast-simple");
  if (!t) { t = document.createElement("div"); t.id = "toast-simple"; document.body.appendChild(t); }
  t.textContent = texto; t.classList.add("ver");
  clearTimeout(t._h); t._h = setTimeout(() => t.classList.remove("ver"), 6000);
}
