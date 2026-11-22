#!/usr/bin/env node
// Lo que usan los empleados para dejar rastro en la oficina mientras trabajan.
// La página (npm start) lee estos mismos archivos y los muestra en vivo.
//
//   node app/scripts/oficina.mjs fecha
//   node app/scripts/oficina.mjs iniciar                       crea la oficina vacía con los 5 puestos (borra lo que haya)
//   node app/scripts/oficina.mjs empezar <puesto> "<tarea>" "<paso 1>|<paso 2>|..."
//   node app/scripts/oficina.mjs paso <puesto> <n> ["nota"]     marca el paso n (desde 1) como hecho
//   node app/scripts/oficina.mjs nota <puesto> "<texto>"        una línea en la bitácora en vivo
//   node app/scripts/oficina.mjs indicadores <puesto> <archivo.json | '[{"etiqueta":..,"valor":..,"nota":..}]'>
//   node app/scripts/oficina.mjs archivo <puesto> <slug> <json|md>   imprime la ruta donde guardar el entregable
//   node app/scripts/oficina.mjs terminar <puesto> [libre|durmiendo]  valida, anota en el historial y cierra
//   node app/scripts/oficina.mjs validar [puesto]
//   node app/scripts/oficina.mjs historial <puesto> "<texto>"
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..", "..");
const OF = path.join(ROOT, "oficina");
const NEGOCIO = path.join(ROOT, "negocio");
const PUESTOS = JSON.parse(fs.readFileSync(path.join(ROOT, "app", "puestos.json"), "utf8"));
const ICONOS = ["horno", "pandebono", "pregunta", "torta", "sol", "estrella", "corazon", "reloj", "chat", "bolsa", "regalo", "grafica", "megafono", "casa", "check", "cafe", "rayo"];

const leer = (f, d = null) => { try { return JSON.parse(fs.readFileSync(f, "utf8")); } catch { return d; } };
const escribir = (f, data) => { fs.mkdirSync(path.dirname(f), { recursive: true }); fs.writeFileSync(f, JSON.stringify(data, null, 2) + "\n"); };
const ahoraIso = () => { const d = new Date(), z = (n) => String(n).padStart(2, "0"); return `${d.getFullYear()}-${z(d.getMonth() + 1)}-${z(d.getDate())}T${z(d.getHours())}:${z(d.getMinutes())}:${z(d.getSeconds())}`; };
const hoy = () => ahoraIso().slice(0, 10);
const hora = () => { const d = new Date(), h = d.getHours(); return `${((h + 11) % 12) + 1}:${String(d.getMinutes()).padStart(2, "0")} ${h >= 12 ? "p. m." : "a. m."}`; };
const salir = (msg) => { console.error(msg); process.exit(1); };

function puesto(id) {
  if (!PUESTOS[id]) salir(`No existe el puesto "${id}". Puestos: ${Object.keys(PUESTOS).join(", ")}`);
  return { dir: path.join(OF, id), estadoF: path.join(OF, id, "estado.json") };
}
const historial = (id, texto) => fs.appendFileSync(path.join(OF, id, "historial.jsonl"), JSON.stringify({ fecha: ahoraIso(), texto }) + "\n");

// ---------------------------------------------------------------- validación de entregables
const txt = (v) => typeof v === "string" && v.trim().length > 0;
const num = (v) => typeof v === "number" && isFinite(v);
function validarEntregable(f) {
  const errores = [];
  if (f.endsWith(".md")) {
    const md = fs.readFileSync(f, "utf8");
    if (!/^#\s+\S/m.test(md)) errores.push("el .md necesita un título con # en la primera línea");
    if (md.includes("—")) errores.push("tiene guiones largos (—)");
    return errores;
  }
  const j = leer(f);
  if (!j) return ["no es JSON válido"];
  if (!txt(j.tipo)) errores.push("falta tipo");
  if (!txt(j.titulo)) errores.push("falta titulo");
  if (!txt(j.resumen)) errores.push("falta resumen");
  if (JSON.stringify(j).includes("—")) errores.push("tiene guiones largos (—)");
  const d = j.datos;
  const lista = (campos, extra) => {
    if (!Array.isArray(d) || !d.length) return errores.push("datos debe ser una lista con al menos un elemento");
    d.forEach((x, i) => {
      for (const c of campos) if (!txt(x?.[c])) errores.push(`datos[${i}].${c} falta o está vacío`);
      extra?.(x, i);
    });
  };
  switch (j.tipo) {
    case "posts":
      lista(["dia", "formato", "copy"], (x, i) => {
        const im = x.imagen || {};
        for (const c of ["fondo", "acento", "titular", "sub", "icono"]) if (!txt(im[c])) errores.push(`datos[${i}].imagen.${c} falta`);
        if (im.icono && !ICONOS.includes(im.icono)) errores.push(`datos[${i}].imagen.icono "${im.icono}" no existe. Usa uno de: ${ICONOS.join(", ")}`);
        for (const c of ["fondo", "acento"]) if (im[c] && !/^#[0-9a-f]{6}$/i.test(im[c])) errores.push(`datos[${i}].imagen.${c} debe ser un color #rrggbb`);
      });
      break;
    case "calendario":
      lista(["dia", "formato", "tema", "estado"], (x, i) => { if (!["listo", "pendiente"].includes(x.estado)) errores.push(`datos[${i}].estado debe ser "listo" o "pendiente"`); });
      break;
    case "competencia":
      lista(["cuenta", "mejor", "porque"], (x, i) => { for (const c of ["seguidores", "vistas", "promedio"]) if (!num(x[c]) || (c === "promedio" && x[c] <= 0)) errores.push(`datos[${i}].${c} debe ser un número${c === "promedio" ? " mayor que 0" : ""}`); });
      break;
    case "prospectos":
      lista(["nombre", "porque", "estado", "mensaje"], (x, i) => {
        if (!["nuevo", "mensaje listo", "contactado", "respondió"].includes(x.estado)) errores.push(`datos[${i}].estado debe ser nuevo, mensaje listo, contactado o respondió`);
        for (const c of ["barrio", "telefono", "instagram"]) if (typeof x[c] !== "string") errores.push(`datos[${i}].${c} debe ser texto (vacío si no se encontró)`);
        for (const c of ["direccion", "fuente"]) if (x[c] !== undefined && typeof x[c] !== "string") errores.push(`datos[${i}].${c} debe ser texto`);
      });
      break;
    case "pipeline":
      lista(["columna"], (x, i) => {
        if (!Array.isArray(x.items)) return errores.push(`datos[${i}].items debe ser una lista`);
        x.items.forEach((it, k) => { if (!txt(it.nombre) || typeof it.detalle !== "string" || !num(it.dias)) errores.push(`datos[${i}].items[${k}] necesita nombre, detalle y dias (número)`); });
      });
      break;
    case "checklist":
      lista(["texto", "responsable", "estado"], (x, i) => { if (!["pendiente", "en curso", "hecho"].includes(x.estado)) errores.push(`datos[${i}].estado debe ser pendiente, en curso o hecho`); });
      break;
    case "finanzas": {
      if (!d || !Array.isArray(d.semanas) || !d.semanas.length) { errores.push("datos.semanas debe ser una lista"); break; }
      d.semanas.forEach((s, i) => { if (!txt(s.s) || !num(s.ventas) || !num(s.gastos)) errores.push(`datos.semanas[${i}] necesita s, ventas y gastos (números)`); });
      if (!Array.isArray(d.productos)) errores.push("datos.productos debe ser una lista (puede ir vacía)");
      else d.productos.forEach((p, i) => { if (!txt(p.nombre) || !num(p.ventas) || !num(p.ganancia)) errores.push(`datos.productos[${i}] necesita nombre, ventas y ganancia (porcentajes)`); });
      if (!Array.isArray(d.alertas)) errores.push("datos.alertas debe ser una lista");
      else d.alertas.forEach((a, i) => { if (!["alta", "media", "ok"].includes(a.nivel) || !txt(a.texto)) errores.push(`datos.alertas[${i}] necesita nivel (alta, media u ok) y texto`); });
      break;
    }
    default:
      errores.push(`tipo "${j.tipo}" no existe. Tipos: posts, calendario, competencia, prospectos, pipeline, checklist, finanzas (o un .md)`);
  }
  return errores;
}

function validarPuesto(id) {
  const res = path.join(OF, id, "resultados");
  if (!fs.existsSync(res)) return 0;
  let malos = 0;
  for (const f of fs.readdirSync(res).filter((x) => /\.(json|md)$/.test(x))) {
    const e = validarEntregable(path.join(res, f));
    if (e.length) { malos++; console.log(`✗ ${id}/resultados/${f}\n  - ${e.join("\n  - ")}`); }
  }
  return malos;
}

const tituloDe = (f) => {
  if (f.endsWith(".md")) return (fs.readFileSync(f, "utf8").match(/^#\s+(.+)$/m) || [, path.basename(f)])[1].trim();
  return leer(f)?.titulo || path.basename(f);
};

// ---------------------------------------------------------------- comandos
const [cmd, id, ...args] = process.argv.slice(2);

switch (cmd) {
  case "fecha": {
    const d = new Date();
    console.log(`${hoy()} ${hora()} (${d.toLocaleDateString("es", { weekday: "long" })})`);
    break;
  }

  case "iniciar": {
    fs.rmSync(OF, { recursive: true, force: true });
    fs.mkdirSync(OF, { recursive: true });
    const neg = leer(path.join(NEGOCIO, "negocio.json"), { nombre: "Tu negocio" });
    delete neg.ejemplo;
    if (neg.logo && fs.existsSync(path.join(NEGOCIO, neg.logo))) fs.copyFileSync(path.join(NEGOCIO, neg.logo), path.join(OF, path.basename(neg.logo)));
    else delete neg.logo;
    if (neg.logo) neg.logo = path.basename(neg.logo);
    escribir(path.join(OF, "negocio.json"), neg);
    for (const [pid, p] of Object.entries(PUESTOS)) {
      const { cerebro, ...pub } = p;
      escribir(path.join(OF, pid, "puesto.json"), pub);
      escribir(path.join(OF, pid, "estado.json"), { estado: "libre", tarea: null, progreso: 0, pasos: [], bitacora: [], indicadores: [] });
      fs.mkdirSync(path.join(OF, pid, "resultados"), { recursive: true });
      fs.writeFileSync(path.join(OF, pid, "historial.jsonl"), JSON.stringify({ fecha: ahoraIso(), texto: "Llegó a la oficina" }) + "\n");
    }
    console.log(`Oficina lista para ${neg.nombre}, con ${Object.keys(PUESTOS).length} puestos.`);
    break;
  }

  case "empezar": {
    const { estadoF } = puesto(id);
    const [tarea, pasosTxt = ""] = args;
    if (!tarea) salir('Uso: empezar <puesto> "<tarea>" "<paso 1>|<paso 2>"');
    const prev = leer(estadoF, {});
    const pasos = pasosTxt.split("|").map((t) => t.trim()).filter(Boolean).map((texto) => ({ texto, hecho: false }));
    escribir(estadoF, { estado: "trabajando", tarea, progreso: 3, desde: ahoraIso(), pasos, bitacora: [{ hora: hora(), texto: "Empecé" }], indicadores: prev.indicadores || [] });
    historial(id, `Empezó: ${tarea}`);
    console.log(`${id}: trabajando en "${tarea}" (${pasos.length} pasos)`);
    break;
  }

  case "paso": {
    const { estadoF } = puesto(id);
    const e = leer(estadoF);
    const n = Number(args[0]);
    if (!e?.pasos?.[n - 1]) salir(`No hay paso ${args[0]}. Pasos: ${(e?.pasos || []).map((p, i) => `${i + 1}. ${p.texto}`).join(" | ")}`);
    e.pasos[n - 1].hecho = true;
    const hechos = e.pasos.filter((p) => p.hecho).length;
    e.progreso = Math.max(e.progreso || 0, Math.round((hechos / e.pasos.length) * 95));
    e.bitacora.push({ hora: hora(), texto: args[1] || `Listo: ${e.pasos[n - 1].texto}` });
    escribir(estadoF, e);
    console.log(`${id}: ${hechos}/${e.pasos.length} pasos, ${e.progreso} %`);
    break;
  }

  case "nota": {
    const { estadoF } = puesto(id);
    const e = leer(estadoF);
    if (!args[0]) salir('Uso: nota <puesto> "<texto>"');
    e.bitacora = [...(e.bitacora || []), { hora: hora(), texto: args[0] }].slice(-30);
    escribir(estadoF, e);
    console.log("ok");
    break;
  }

  case "indicadores": {
    const { estadoF } = puesto(id);
    const fuente = args[0] || "";
    const lista = fs.existsSync(fuente) ? leer(fuente) : (() => { try { return JSON.parse(fuente); } catch { return null; } })();
    if (!Array.isArray(lista) || !lista.every((k) => txt(k.etiqueta) && txt(String(k.valor ?? "")))) salir('Los indicadores son una lista de { "etiqueta", "valor", "nota" }');
    const e = leer(estadoF);
    e.indicadores = lista.slice(0, 3).map((k) => ({ etiqueta: k.etiqueta, valor: String(k.valor), nota: k.nota || "" }));
    escribir(estadoF, e);
    console.log(`${id}: ${e.indicadores.length} indicadores`);
    break;
  }

  case "archivo": {
    const { dir } = puesto(id);
    const [slug, ext = "json"] = args;
    if (!slug || !["json", "md"].includes(ext)) salir("Uso: archivo <puesto> <slug> <json|md>");
    const limpio = slug.toLowerCase().normalize("NFD").replace(/[̀-ͯ]/g, "").replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
    const f = path.join(dir, "resultados", `${hoy()}-${limpio}.${ext}`);
    fs.mkdirSync(path.dirname(f), { recursive: true });
    console.log(path.relative(ROOT, f).replaceAll("\\", "/"));
    console.log(f.replaceAll("\\", "/"));
    break;
  }

  case "terminar": {
    const { dir, estadoF } = puesto(id);
    const e = leer(estadoF, {});
    const desde = e.desde || "0000";
    const res = path.join(dir, "resultados");
    const nuevos = fs.existsSync(res) ? fs.readdirSync(res).filter((f) => /\.(json|md)$/.test(f) && fs.statSync(path.join(res, f)).mtime.getTime() >= new Date(desde).getTime() - 1000) : [];
    let malos = 0;
    for (const f of nuevos) {
      const err = validarEntregable(path.join(res, f));
      if (err.length) { malos++; console.log(`✗ ${f}\n  - ${err.join("\n  - ")}`); }
    }
    if (malos) salir(`\n${malos} entregable(s) con errores. Corrígelos y vuelve a correr terminar.`);
    for (const f of nuevos) historial(id, `Entregó: ${tituloDe(path.join(res, f))}`);
    const final = args[0] === "durmiendo" ? "durmiendo" : "libre";
    escribir(estadoF, { estado: final, tarea: null, progreso: 0, pasos: [], bitacora: [], indicadores: e.indicadores || [] });
    if (final === "durmiendo") historial(id, `Se fue a dormir hasta ${PUESTOS[id].horario.charAt(0).toLowerCase() + PUESTOS[id].horario.slice(1)}`);
    console.log(`${id}: terminó con ${nuevos.length} entregable(s): ${nuevos.join(", ") || "ninguno"}`);
    break;
  }

  case "validar": {
    const ids = id ? [id] : Object.keys(PUESTOS);
    const malos = ids.reduce((s, x) => s + validarPuesto(x), 0);
    console.log(malos ? `${malos} entregable(s) con errores` : "Todos los entregables están bien.");
    process.exit(malos ? 1 : 0);
  }

  case "historial": {
    puesto(id);
    if (!args[0]) salir('Uso: historial <puesto> "<texto>"');
    historial(id, args[0]);
    console.log("ok");
    break;
  }

  default:
    console.log(fs.readFileSync(fileURLToPath(import.meta.url), "utf8").split("\n").slice(1, 16).map((l) => l.replace(/^\/\/ ?/, "")).join("\n"));
}
