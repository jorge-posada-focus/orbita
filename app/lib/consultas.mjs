// Consultas: el dueño conversa con un empresario de la oficina. No es un encargo:
// no hay pasos ni entregables, solo su opinión con su forma de pensar y lo que sabe
// del negocio. Cada mensaje abre claude -p con el agente del puesto; los siguientes
// continúan la misma sesión (--resume). La conversación se guarda como documento
// en los entregables del puesto.
import { spawn } from "node:child_process";
import fs from "node:fs";
import path from "node:path";

const LIMITE_MIN = 6;
const iso = (d = new Date()) => { const z = (n) => String(n).padStart(2, "0"); return `${d.getFullYear()}-${z(d.getMonth() + 1)}-${z(d.getDate())}T${z(d.getHours())}:${z(d.getMinutes())}:${z(d.getSeconds())}`; };
const slug = (t) => t.normalize("NFD").replace(/[̀-ͯ]/g, "").toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "").slice(0, 50).replace(/-$/, "");
const sinRayas = (t) => String(t || "").replace(/\s*—\s*/g, ", ");
const OTROS = "Dirección (Jeff Bezos), Marketing (Iman Gadzhi), Ventas (Alex Hormozi), Operaciones (Gino Wickman), Finanzas (Warren Buffett)";

function primerMensaje(texto) {
  return [
    "Modo consulta: el dueño quiere conversar contigo y oír tu opinión. No es un encargo.",
    "- No uses el script de la oficina ni escribas archivos. Solo lees.",
    "- Antes de responder lee lo que necesites de negocio/ (perfil.md, cliente-ideal.md, voz.md, finanzas.csv o contactos.csv si existen), los entregables recientes de oficina/*/resultados/ que tengan que ver, y tu cerebro.",
    "- Responde como en una conversación en persona: corto (máximo unas 180 palabras), en español, de tú. Toma una postura clara y di por qué, con tu forma de pensar y al menos un dato concreto de este negocio. Nada de \"depende\" sin decir de qué y qué harías tú.",
    "- Si te falta un dato que cambia la respuesta, pregúntalo primero (máximo dos preguntas) y di qué harías según la respuesta.",
    `- Si la pregunta es de otra área, da tu mirada y di a quién más preguntarle: ${OTROS}.`,
    "- Párrafos cortos; como mucho una lista corta. Sin títulos, sin tablas, sin guiones largos.",
    "- Eres una simulación basada en su obra pública: no inventes citas ni cifras. La decisión es del dueño.",
    "",
    `Mensaje del dueño: ${texto}`,
  ].join("\n");
}

// qué está haciendo, dicho como lo diría alguien de la oficina
function queHace(nombre, input = {}) {
  const ruta = String(input.file_path || input.path || input.pattern || "").replace(/\\/g, "/");
  if (nombre === "WebSearch") return `Buscando en internet: ${String(input.query || "").slice(0, 60)}`;
  if (nombre === "WebFetch") return "Leyendo una página";
  if (/cerebros\//.test(ruta)) return "Repasando lo que sabe del tema";
  if (/finanzas/.test(ruta)) return "Mirando tus números";
  if (/contactos/.test(ruta)) return "Revisando tus clientes";
  if (/negocio\//.test(ruta)) return "Leyendo sobre tu negocio";
  if (/resultados\//.test(ruta)) return "Revisando lo que entregó la oficina";
  return "Pensando";
}

export function crearConsultas({ ROOT, OFICINA, PUESTOS, turnos }) {
  const sesiones = new Map(); // sesion -> { puesto, archivo }
  const ocupados = new Set();

  function guardar(puesto, sesion, pregunta, respuesta) {
    const p = PUESTOS[puesto];
    let s = sesiones.get(sesion);
    if (!s) {
      const d = new Date();
      const titulo = sinRayas(pregunta).replace(/\s+/g, " ").trim();
      const corto = titulo.length > 70 ? titulo.slice(0, 70).replace(/\s+\S*$/, "") + "..." : titulo;
      const dir = path.join(OFICINA, puesto, "resultados");
      fs.mkdirSync(dir, { recursive: true });
      let archivo = path.join(dir, `${iso(d).slice(0, 10)}-consulta-${slug(titulo) || "sin-titulo"}.md`);
      for (let i = 2; fs.existsSync(archivo); i++) archivo = archivo.replace(/(-\d+)?\.md$/, `-${i}.md`);
      fs.writeFileSync(archivo, `# Consulta: ${corto}\n\n_Conversación con ${p.empresario}, ${p.departamento} (simulación basada en su obra pública). La decisión es tuya._\n`);
      s = { puesto, archivo };
      sesiones.set(sesion, s);
      fs.appendFileSync(path.join(OFICINA, puesto, "historial.jsonl"), JSON.stringify({ fecha: iso(d), texto: `Consulta del dueño: ${corto}` }) + "\n");
    }
    fs.appendFileSync(s.archivo, `\n**Tú:** ${sinRayas(pregunta)}\n\n**${p.empresario}:** ${sinRayas(respuesta)}\n`);
    return path.basename(s.archivo);
  }

  // escribe al navegador una línea JSON por evento: estado, delta, fin o error
  function conversar({ puesto, mensaje, sesion }, res) {
    const enviar = (o) => res.write(JSON.stringify(o) + "\n");
    res.writeHead(200, { "content-type": "application/x-ndjson; charset=utf-8", "cache-control": "no-store" });
    if (!PUESTOS[puesto]) { enviar({ t: "error", x: "Ese puesto no existe." }); return res.end(); }
    const b = turnos.base();
    if (b.esEjemplo) { enviar({ t: "error", x: "Esta es la oficina de ejemplo. Carga tu negocio con /contratar y conversamos sobre el tuyo." }); return res.end(); }
    if (b.sinSesion) { enviar({ t: "error", x: b.sinSesion }); return res.end(); }
    if (ocupados.has(puesto)) { enviar({ t: "error", x: "Dame un momento, todavía estoy respondiendo lo anterior." }); return res.end(); }
    if (sesion && !sesiones.has(sesion)) sesion = null; // el servidor se reinició: empieza de nuevo

    const args = [
      "-p", sesion ? mensaje : primerMensaje(mensaje),
      ...(sesion ? ["--resume", sesion] : []),
      "--agents", b.agentes,
      "--agent", `oficina-${puesto}`,
      "--output-format", "stream-json", "--verbose", "--include-partial-messages",
      "--permission-prompts", "none",
      "--allowedTools", "Read", "Grep", "Glob", "WebSearch", "WebFetch",
      "--disallowedTools", "Write", "Edit", "Bash", "NotebookEdit",
      ...b.extra,
    ];
    ocupados.add(puesto);
    enviar({ t: "estado", x: sesion ? "Pensando" : "Leyendo sobre tu negocio" });
    const hijo = spawn(b.cmd, [...b.pre, ...args], { cwd: ROOT, env: b.env, stdio: ["ignore", "pipe", "pipe"], windowsHide: true });
    let resto = "", errores = "", sesionNueva = sesion, final = null, cerrado = false;
    const limite = setTimeout(() => { errores += "Tardó demasiado y lo corté."; hijo.kill(); }, LIMITE_MIN * 60000);
    res.on("close", () => { cerrado = true; });

    hijo.stdout.on("data", (d) => {
      resto += d;
      const lineas = resto.split("\n"); resto = lineas.pop();
      for (const l of lineas) {
        let ev; try { ev = JSON.parse(l); } catch { continue; }
        if (ev.session_id) sesionNueva = ev.session_id;
        if (ev.type === "stream_event" && ev.event?.type === "content_block_delta" && ev.event.delta?.type === "text_delta") enviar({ t: "delta", x: ev.event.delta.text });
        if (ev.type === "assistant") for (const c of ev.message?.content || []) if (c.type === "tool_use") enviar({ t: "estado", x: queHace(c.name, c.input) });
        if (ev.type === "result") final = ev;
      }
    });
    hijo.stderr.on("data", (d) => (errores += d));
    hijo.on("error", (e) => (errores += e.message));
    hijo.on("close", () => {
      clearTimeout(limite);
      ocupados.delete(puesto);
      // al continuar, Claude Code puede darle otro id a la sesión: se sigue en el mismo documento
      if (sesion && sesionNueva && sesionNueva !== sesion && sesiones.has(sesion)) sesiones.set(sesionNueva, sesiones.get(sesion));
      if (final && !final.is_error && final.result) {
        const archivo = guardar(puesto, sesionNueva, mensaje, final.result);
        enviar({ t: "fin", x: final.result, sesion: sesionNueva, archivo });
      } else {
        const msg = (final?.result || errores.replace(/\x1b\[[0-9;]*m/g, "").trim().split("\n").pop() || "No pude responder.").slice(0, 300);
        enviar({ t: "error", x: msg });
      }
      if (!cerrado) res.end();
    });
  }

  return { conversar };
}
