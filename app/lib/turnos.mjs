// Turnos: pone a trabajar a cada empleado a su hora, o cuando el dueño oprime
// "Ponte a trabajar". Cada turno es una sesión de Claude Code sin pantalla
// (claude -p) con el agente del puesto. Corre con el plan de la persona, así
// que va de a uno por defecto y solo mientras el servidor esté prendido.
//
// Si el computador estaba apagado a la hora de un turno, lo recupera al
// prender, siempre que no hayan pasado más de RECUPERAR_HORAS.
import { spawn, spawnSync } from "node:child_process";
import fs from "node:fs";
import path from "node:path";

const RECUPERAR_HORAS = 12;
const LIMITE_MIN = Number(process.env.OFICINA_LIMITE_MIN) || 25;
const MAX = Math.max(1, Number(process.env.OFICINA_MAX) || 1);
const CLAUDE = process.env.OFICINA_CLAUDE || "claude";
const DIAS = ["domingo", "lunes", "martes", "miércoles", "jueves", "viernes", "sábado"];

const leer = (f, d = null) => { try { return JSON.parse(fs.readFileSync(f, "utf8")); } catch { return d; } };
const iso = (d = new Date()) => { const z = (n) => String(n).padStart(2, "0"); return `${d.getFullYear()}-${z(d.getMonth() + 1)}-${z(d.getDate())}T${z(d.getHours())}:${z(d.getMinutes())}:${z(d.getSeconds())}`; };
const hora12 = (d) => { const h = d.getHours(); return `${((h + 11) % 12) + 1}:${String(d.getMinutes()).padStart(2, "0")} ${h >= 12 ? "p. m." : "a. m."}`; };

function enHora(dia, hhmm) {
  const [h, m] = hhmm.split(":").map(Number);
  const d = new Date(dia); d.setHours(h, m, 0, 0); return d;
}
// el turno programado más reciente que ya pasó, y el siguiente que viene
export function ultimoProgramado(programa, ahora = new Date()) {
  let mejor = null;
  for (const { dias, hora } of programa || []) for (let i = 0; i <= 7; i++) {
    const dia = new Date(ahora); dia.setDate(dia.getDate() - i);
    if (!dias.includes(dia.getDay())) continue;
    const t = enHora(dia, hora);
    if (t <= ahora) { if (!mejor || t > mejor) mejor = t; break; }
  }
  return mejor;
}
export function siguienteProgramado(programa, ahora = new Date()) {
  let mejor = null;
  for (const { dias, hora } of programa || []) for (let i = 0; i <= 7; i++) {
    const dia = new Date(ahora); dia.setDate(dia.getDate() + i);
    if (!dias.includes(dia.getDay())) continue;
    const t = enHora(dia, hora);
    if (t > ahora) { if (!mejor || t < mejor) mejor = t; break; }
  }
  return mejor;
}
function cuandoTexto(t, ahora = new Date()) {
  const man = new Date(ahora); man.setDate(man.getDate() + 1);
  const dia = t.toDateString() === ahora.toDateString() ? "hoy" : t.toDateString() === man.toDateString() ? "mañana" : DIAS[t.getDay()];
  return `${dia} ${hora12(t)}`;
}

export function crearTurnos({ ROOT, OFICINA, PUESTOS, avisar }) {
  const DIR = path.join(OFICINA, ".turnos");
  const ESTADO = path.join(DIR, "estado.json");
  const CLI = path.join(ROOT, "app", "scripts", "oficina.mjs");
  const cola = [];
  const corriendo = new Map(); // puesto -> { desde, motivo, hijo }
  let ultimo = null; // puesto -> iso del último turno lanzado
  let apagado = process.env.OFICINA_TURNOS === "0" ? "apagados con OFICINA_TURNOS=0" : null;

  const negocio = () => leer(path.join(OFICINA, "negocio.json"), {});
  const esEjemplo = () => !fs.existsSync(path.join(OFICINA, "negocio.json")) || negocio().ejemplo === true;
  const guardar = () => { fs.mkdirSync(DIR, { recursive: true }); fs.writeFileSync(ESTADO, JSON.stringify({ ultimo }, null, 2)); };

  function cargarUltimo() {
    ultimo = leer(ESTADO)?.ultimo;
    if (!ultimo) { // primera vez: no recuperar turnos de antes de existir
      ultimo = Object.fromEntries(Object.keys(PUESTOS).map((p) => [p, iso()]));
      if (fs.existsSync(OFICINA)) guardar();
    }
  }

  // ¿claude tiene sesión en esta terminal? Sin sesión los turnos no pueden trabajar.
  let sesionCache = null;
  function sinSesion() {
    if (/\.m?js$/.test(CLAUDE)) return null;
    if (sesionCache && Date.now() - sesionCache.t < 60000) return sesionCache.msg;
    let msg = null;
    const env = { ...process.env };
    for (const k of Object.keys(env)) if (k === "CLAUDECODE" || k.startsWith("CLAUDE_CODE_")) delete env[k];
    const r = spawnSync(CLAUDE, ["auth", "status"], { encoding: "utf8", env, timeout: 15000, windowsHide: true });
    if (r.error?.code === "ENOENT") msg = "No encuentro Claude Code en esta terminal. Instálalo (https://claude.com/claude-code) y vuelve a abrir la oficina.";
    else { try { if (JSON.parse(r.stdout).loggedIn === false) msg = "Claude Code no tiene sesión iniciada en esta terminal. Corre claude una vez, inicia sesión con /login y vuelve a abrir la oficina."; } catch {} }
    sesionCache = { t: Date.now(), msg };
    return msg;
  }

  function pedir(puesto, motivo = "boton", pedido = null) {
    if (!PUESTOS[puesto]) return { ok: false, error: `No existe el puesto ${puesto}` };
    if (esEjemplo()) return { ok: false, ejemplo: true, error: "La oficina tiene el negocio de ejemplo. Carga el tuyo con /contratar." };
    const falta = sinSesion();
    if (falta) return { ok: false, error: falta };
    if (corriendo.has(puesto)) return { ok: false, error: "Ya está trabajando" };
    if (cola.some((c) => c.puesto === puesto)) return { ok: true, enCola: true };
    cola.push({ puesto, motivo, pedido, pedidoEn: iso() });
    avisar();
    siguiente();
    return { ok: true, enCola: cola.some((c) => c.puesto === puesto) };
  }

  function siguiente() {
    while (corriendo.size < MAX && cola.length) lanzar(cola.shift());
  }

  // Los agentes de .claude/agents se pasan por la línea de comandos: así el turno
  // funciona aunque Claude Code todavía no haya marcado la carpeta como confiable
  // (en ese caso ignora los agentes y permisos del proyecto).
  function agentes() {
    const dir = path.join(ROOT, ".claude", "agents");
    const todos = {};
    for (const f of fs.readdirSync(dir).filter((x) => /^oficina-.+\.md$/.test(x))) {
      const t = fs.readFileSync(path.join(dir, f), "utf8").replace(/\r\n/g, "\n");
      const m = t.match(/^---\n([\s\S]*?)\n---\n([\s\S]*)$/);
      if (!m) continue;
      const meta = Object.fromEntries(m[1].split("\n").map((l) => l.match(/^(\w+):\s*(.*)$/)).filter(Boolean).map((x) => [x[1], x[2].trim()]));
      todos[meta.name || f.replace(/\.md$/, "")] = { description: meta.description || "", prompt: m[2].trim(), tools: (meta.tools || "").split(",").map((s) => s.trim()).filter(Boolean) };
    }
    const f = path.join(DIR, "agentes.json");
    fs.mkdirSync(DIR, { recursive: true });
    fs.writeFileSync(f, JSON.stringify(todos));
    return f;
  }

  function lanzar({ puesto, motivo, pedido }) {
    const desde = new Date();
    ultimo[puesto] = iso(desde); guardar();
    const prompt = [
      `Pedido: ${pedido || "Ronda normal"}`,
      `Fecha de hoy: ${spawnSync(process.execPath, [CLI, "fecha"], { cwd: ROOT, encoding: "utf8" }).stdout.trim()}`,
      `Este es un turno ${motivo === "horario" ? "automático por horario" : "pedido desde la oficina"}: el dueño no está mirando el chat, así que no le hagas preguntas; decide con lo que hay y déjalo anotado.`,
      `Sigue tu protocolo en .claude/skills/oficina/references/puestos/${puesto}.md y el contrato en .claude/skills/oficina/references/contrato.md.`,
      "Al terminar responde en 5 líneas como máximo: qué entregaste, lo más importante que encontraste y qué necesita decidir o hacer el dueño.",
    ].join("\n");
    const args = [
      "-p", prompt,
      "--agents", agentes(),
      "--agent", `oficina-${puesto}`,
      "--output-format", "json",
      "--permission-mode", "acceptEdits",
      "--permission-prompts", "none",
      "--allowedTools", "Read", "Grep", "Glob", "Write", "Edit", "WebSearch", "WebFetch", "Bash(node app/scripts/oficina.mjs:*)",
    ];
    if (process.env.OFICINA_MODELO) args.push("--model", process.env.OFICINA_MODELO);
    const env = { ...process.env };
    for (const k of Object.keys(env)) if (k === "CLAUDECODE" || k.startsWith("CLAUDE_CODE_")) delete env[k];

    let salida = "", errores = "";
    let hijo;
    try {
      // OFICINA_CLAUDE puede ser un script .mjs (para probar los turnos sin gastar el plan)
      const [cmd, pre] = /\.m?js$/.test(CLAUDE) ? [process.execPath, [CLAUDE]] : [CLAUDE, []];
      hijo = spawn(cmd, [...pre, ...args], { cwd: ROOT, env, stdio: ["ignore", "pipe", "pipe"], windowsHide: true });
    } catch (e) {
      return terminar(puesto, { desde, motivo, codigo: -1, salida: "", errores: String(e.message || e) });
    }
    const limite = setTimeout(() => { errores += `\nSe pasó de ${LIMITE_MIN} minutos y lo corté.`; hijo.kill(); }, LIMITE_MIN * 60000);
    hijo.stdout.on("data", (d) => (salida += d));
    hijo.stderr.on("data", (d) => (errores += d));
    hijo.on("error", (e) => { errores += `\n${e.message}`; });
    hijo.on("close", (codigo) => { clearTimeout(limite); terminar(puesto, { desde, motivo, codigo, salida, errores }); });
    corriendo.set(puesto, { desde: iso(desde), motivo, hijo });
    console.log(`[turnos] ${puesto} empezó (${motivo})`);
    avisar();
  }

  function terminar(puesto, { desde, motivo, codigo, salida, errores }) {
    corriendo.delete(puesto);
    let r = null; try { r = JSON.parse(salida); } catch {}
    errores = errores.replace(/\x1b\[[0-9;]*m/g, "");
    // si el empleado se cortó a la mitad, se cierra su puesto y se validan sus entregables
    const est = leer(path.join(OFICINA, puesto, "estado.json"), {});
    const cierre = est.estado === "trabajando"
      ? spawnSync(process.execPath, [CLI, "terminar", puesto], { cwd: ROOT, encoding: "utf8" })
      : spawnSync(process.execPath, [CLI, "validar", puesto], { cwd: ROOT, encoding: "utf8" });
    const fin = new Date();
    const registro = {
      puesto, motivo, desde: iso(desde), hasta: iso(fin),
      minutos: Math.round((fin - desde) / 6000) / 10,
      ok: codigo === 0 && !r?.is_error && cierre.status === 0,
      respuesta: r?.result || null,
      modelo: r?.modelUsage ? Object.keys(r.modelUsage).join(", ") : null,
      tokens: r?.usage ? (r.usage.input_tokens || 0) + (r.usage.output_tokens || 0) + (r.usage.cache_read_input_tokens || 0) + (r.usage.cache_creation_input_tokens || 0) : null,
      problema: codigo !== 0 || r?.is_error ? (errores.trim() || salida.trim()).slice(-600) || `Salió con código ${codigo}` : cierre.status !== 0 ? (cierre.stdout + cierre.stderr).trim().slice(-600) : null,
    };
    fs.mkdirSync(DIR, { recursive: true });
    fs.appendFileSync(path.join(DIR, "corridas.jsonl"), JSON.stringify(registro) + "\n");
    if (!registro.ok) fs.appendFileSync(path.join(OFICINA, puesto, "historial.jsonl"), JSON.stringify({ fecha: iso(fin), texto: `El turno no terminó bien: ${(registro.problema || "").split("\n")[0].slice(0, 140)}` }) + "\n");
    console.log(`[turnos] ${puesto} terminó en ${registro.minutos} min (${registro.ok ? "bien" : "con problemas"})`);
    avisar();
    siguiente();
  }

  function revisarHorario() {
    if (apagado || esEjemplo() || sinSesion()) return;
    if (!ultimo) cargarUltimo();
    const ahora = new Date();
    for (const [p, def] of Object.entries(PUESTOS)) {
      const t = ultimoProgramado(def.programa, ahora);
      if (!t || ahora - t > RECUPERAR_HORAS * 3600000) continue;
      if (ultimo[p] && new Date(ultimo[p]) >= t) continue;
      if (corriendo.has(p) || cola.some((c) => c.puesto === p)) continue;
      pedir(p, "horario");
    }
  }

  function ultimaCorrida() {
    const t = (() => { try { return fs.readFileSync(path.join(DIR, "corridas.jsonl"), "utf8"); } catch { return ""; } })();
    const por = {};
    for (const l of t.split("\n").filter(Boolean)) { try { const c = JSON.parse(l); por[c.puesto] = c; } catch {} }
    return por;
  }

  function estado() {
    const ahora = new Date();
    const ejemplo = esEjemplo();
    const falta = ejemplo || apagado ? null : sinSesion();
    const proximos = Object.entries(PUESTOS)
      .map(([p, def]) => ({ puesto: p, t: siguienteProgramado(def.programa, ahora) }))
      .filter((x) => x.t).sort((a, b) => a.t - b.t);
    const ult = ultimaCorrida();
    return {
      activos: !apagado && !ejemplo && !falta,
      porQue: apagado || (ejemplo ? "negocio de ejemplo" : falta),
      aviso: falta,
      max: MAX,
      proximo: proximos[0] ? { puesto: proximos[0].puesto, cuando: cuandoTexto(proximos[0].t, ahora), iso: iso(proximos[0].t) } : null,
      puestos: Object.fromEntries(Object.keys(PUESTOS).map((p) => {
        const c = corriendo.get(p);
        const enCola = cola.findIndex((x) => x.puesto === p);
        const sig = proximos.find((x) => x.puesto === p);
        const u = ult[p];
        return [p, {
          turno: c ? "corriendo" : enCola >= 0 ? "en cola" : null,
          desde: c?.desde || null,
          delante: enCola >= 0 ? corriendo.size + enCola : 0,
          siguiente: sig ? cuandoTexto(sig.t, ahora) : null,
          ultimo: u ? { hasta: u.hasta, minutos: u.minutos, ok: u.ok, respuesta: u.respuesta, problema: u.problema } : null,
        }];
      })),
    };
  }

  function arrancar() {
    cargarUltimo();
    revisarHorario();
    setInterval(revisarHorario, 30000);
  }

  function cerrar() { for (const { hijo } of corriendo.values()) hijo?.kill(); }

  // lo mismo que usa un turno para abrir Claude Code, para las consultas
  function base() {
    const [cmd, pre] = /\.m?js$/.test(CLAUDE) ? [process.execPath, [CLAUDE]] : [CLAUDE, []];
    const env = { ...process.env };
    for (const k of Object.keys(env)) if (k === "CLAUDECODE" || k.startsWith("CLAUDE_CODE_")) delete env[k];
    const extra = process.env.OFICINA_MODELO ? ["--model", process.env.OFICINA_MODELO] : [];
    return { cmd, pre, env, extra, agentes: agentes(), esEjemplo: esEjemplo(), sinSesion: sinSesion() };
  }

  return { pedir, estado, arrancar, cerrar, base };
}
