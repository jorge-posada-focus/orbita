// La oficina: sirve la página, lee la carpeta oficina/ que escriben los empleados
// y avisa a la página en vivo (SSE) cada vez que algo cambia.
// No llama a ninguna IA por su cuenta: los turnos (app/lib/turnos.mjs) abren
// Claude Code con el agente de cada puesto, a su hora o cuando el dueño lo pide.
import http from "node:http";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { crearTurnos } from "./lib/turnos.mjs";
import { crearConsultas } from "./lib/consultas.mjs";

const APP = path.dirname(fileURLToPath(import.meta.url));
// ruta real: en Windows una ruta corta (FAMILI~1) tumba fs.watch
const ROOT = fs.realpathSync.native(path.resolve(APP, ".."));
const PUBLIC = path.join(APP, "public");
const OFICINA = path.join(ROOT, "oficina");
const PORT = Number(process.env.PORT) || 4740;
const TYPES = { ".html": "text/html; charset=utf-8", ".js": "text/javascript; charset=utf-8", ".css": "text/css; charset=utf-8", ".svg": "image/svg+xml", ".png": "image/png", ".jpg": "image/jpeg", ".webp": "image/webp", ".json": "application/json", ".ico": "image/x-icon" };

const readText = (p) => { try { return fs.readFileSync(p, "utf8"); } catch { return null; } };
const readJson = (p) => { const t = readText(p); if (!t) return null; try { return JSON.parse(t); } catch { return null; } };

function titulo(md, archivo) {
  const m = md.match(/^#\s+(.+)$/m);
  return m ? m[1].trim() : archivo.replace(/\.md$/, "");
}

function leerPuesto(id) {
  const dir = path.join(OFICINA, id);
  const puesto = readJson(path.join(dir, "puesto.json"));
  if (!puesto) return null;
  const estado = readJson(path.join(dir, "estado.json")) || { estado: "libre" };
  const resDir = path.join(dir, "resultados");
  // entregables: .md es un documento; .json trae { tipo, titulo, resumen, datos }
  const resultados = fs.existsSync(resDir)
    ? fs.readdirSync(resDir).filter((f) => /\.(md|json)$/.test(f)).sort().reverse().map((f) => {
        const base = { archivo: f, fecha: f.slice(0, 10) };
        if (f.endsWith(".json")) {
          const j = readJson(path.join(resDir, f));
          return j ? { ...base, tipo: j.tipo || "documento", titulo: j.titulo || f, resumen: j.resumen || "", datos: j.datos } : null;
        }
        const md = readText(path.join(resDir, f)) || "";
        return { ...base, tipo: "documento", titulo: titulo(md, f), md };
      }).filter(Boolean)
    : [];
  const historial = (readText(path.join(dir, "historial.jsonl")) || "")
    .split("\n").filter(Boolean).map((l) => { try { return JSON.parse(l); } catch { return null; } })
    .filter(Boolean).reverse().slice(0, 40);
  return { id, ...puesto, estado, resultados, historial };
}

function leerOficina() {
  const negocio = readJson(path.join(OFICINA, "negocio.json")) || { nombre: "Tu negocio" };
  const ids = fs.existsSync(OFICINA) ? fs.readdirSync(OFICINA).filter((d) => fs.existsSync(path.join(OFICINA, d, "puesto.json"))) : [];
  return { negocio, equipo: ids.map(leerPuesto).filter(Boolean) };
}

// ---------------------------------------------------------------- en vivo
const clientes = new Set();
let espera = null;
function avisar() {
  clearTimeout(espera);
  espera = setTimeout(() => { for (const c of clientes) c.write("data: cambio\n\n"); }, 250);
}
// se vigila la raíz y no oficina/ porque /contratar borra y vuelve a crear oficina/
try {
  fs.watch(ROOT, { recursive: true }, (_, f) => {
    if (!f) return avisar();
    const r = f.replace(/\\/g, "/");
    if (r.startsWith("oficina/") && !r.startsWith("oficina/.turnos/") || r === "oficina") avisar();
  });
} catch (e) { console.warn("No pude vigilar la carpeta; la página se actualizará cada 30 s.", e.message); }

// recién clonado: no hay oficina todavía, se carga la de ejemplo para que se vea algo
if (!fs.existsSync(path.join(OFICINA, "negocio.json"))) {
  const { spawnSync } = await import("node:child_process");
  spawnSync(process.execPath, [path.join(APP, "scripts", "sembrar-ejemplo.mjs")], { cwd: ROOT, stdio: "inherit" });
}

const PUESTOS = JSON.parse(fs.readFileSync(path.join(APP, "puestos.json"), "utf8"));
const turnos = crearTurnos({ ROOT, OFICINA, PUESTOS, avisar });
const consultas = crearConsultas({ ROOT, OFICINA, PUESTOS, turnos });

function leerCuerpo(req) {
  return new Promise((ok) => { let b = ""; req.on("data", (d) => (b += d)); req.on("end", () => { try { ok(JSON.parse(b || "{}")); } catch { ok({}); } }); });
}

function send(res, code, body, type = "application/json") {
  res.writeHead(code, { "content-type": type, "cache-control": "no-store" });
  res.end(typeof body === "string" ? body : JSON.stringify(body));
}

const server = http.createServer((req, res) => {
  const url = new URL(req.url, `http://${req.headers.host}`);
  const p = url.pathname;
  try {
    if (p === "/api/oficina") return send(res, 200, { ...leerOficina(), turnos: turnos.estado() });
    if (p === "/api/eventos") {
      res.writeHead(200, { "content-type": "text/event-stream", "cache-control": "no-store", connection: "keep-alive" });
      res.write("retry: 3000\n\n");
      clientes.add(res);
      const latido = setInterval(() => res.write(": sigo aquí\n\n"), 25000);
      req.on("close", () => { clearInterval(latido); clientes.delete(res); });
      return;
    }
    if (p === "/api/consulta" && req.method === "POST") {
      return leerCuerpo(req).then((b) => consultas.conversar({ puesto: String(b.puesto || ""), mensaje: String(b.mensaje || "").slice(0, 2000), sesion: b.sesion ? String(b.sesion) : null }, res));
    }
    if (p === "/api/trabajar" && req.method === "POST") {
      return leerCuerpo(req).then((b) => { const r = turnos.pedir(String(b.puesto || ""), "boton", b.pedido ? String(b.pedido).slice(0, 500) : null); send(res, r.ok ? 200 : 409, r); });
    }
    if (p === "/logo") {
      const n = readJson(path.join(OFICINA, "negocio.json")) || {};
      const f = n.logo ? path.normalize(path.join(OFICINA, n.logo)) : null;
      if (!f || !f.startsWith(OFICINA) || !fs.existsSync(f)) return send(res, 404, "Sin logo", "text/plain");
      res.writeHead(200, { "content-type": TYPES[path.extname(f)] || "application/octet-stream", "cache-control": "no-store" });
      return fs.createReadStream(f).pipe(res);
    }
    const file = path.normalize(path.join(PUBLIC, p === "/" ? "index.html" : decodeURIComponent(p)));
    if (!file.startsWith(PUBLIC) || !fs.existsSync(file) || fs.statSync(file).isDirectory()) return send(res, 404, "No existe", "text/plain");
    res.writeHead(200, { "content-type": TYPES[path.extname(file)] || "application/octet-stream", "cache-control": "no-store" });
    fs.createReadStream(file).pipe(res);
  } catch (e) {
    send(res, 500, { error: String(e.message || e) });
  }
});

server.listen(PORT, "127.0.0.1", () => {
  console.log(`Oficina abierta en http://localhost:${PORT}`);
  turnos.arrancar();
  const t = turnos.estado();
  console.log(t.activos
    ? `Turnos automáticos activos. Próximo: ${PUESTOS[t.proximo?.puesto]?.departamento || "-"}, ${t.proximo?.cuando || "-"} (deja esta ventana abierta para que trabajen)`
    : `Turnos automáticos apagados (${t.porQue}).`);
});
for (const s of ["SIGINT", "SIGTERM"]) process.on(s, () => { turnos.cerrar(); process.exit(0); });
