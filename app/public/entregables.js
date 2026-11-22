// Cómo se ve cada tipo de entregable: completo (dentro del panel) y en miniatura (tarjeta de la galería).
// Tipos: documento · posts · calendario · competencia · prospectos · pipeline · checklist · finanzas

export const esc = (s) => String(s ?? "").replace(/[&<>"]/g, (ch) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[ch]));
const pesos = (n) => "$" + Math.round(n).toLocaleString("es-CO");
const miles = (n) => (n >= 1000 ? (n / 1000).toLocaleString("es-CO", { maximumFractionDigits: 1 }) + " mil" : String(n));

export const ETIQUETA = {
  documento: "Documento", posts: "Posts", calendario: "Calendario", competencia: "Análisis",
  prospectos: "Lista de prospectos", pipeline: "Tablero", checklist: "Lista", finanzas: "Reporte",
};

// ---------------------------------------------------------------- íconos de los posts (SVG pixelado)
const ICONOS = {
  horno: (a) => `<rect x="4" y="5" width="16" height="13" fill="#3a2a22"/><rect x="6" y="9" width="12" height="7" fill="${a}"/><rect x="7" y="10" width="10" height="2" fill="#ffd27a"/><rect x="6" y="6" width="2" height="2" fill="#888"/><rect x="10" y="6" width="2" height="2" fill="#888"/><rect x="9" y="1" width="1" height="3" fill="#ddd" opacity=".6"/><rect x="13" y="0" width="1" height="4" fill="#ddd" opacity=".6"/>`,
  pandebono: (a) => `<rect x="5" y="8" width="14" height="9" fill="${a}"/><rect x="7" y="6" width="10" height="2" fill="${a}"/><rect x="7" y="17" width="10" height="1" fill="#7a3f16"/><rect x="8" y="9" width="2" height="2" fill="#ffe7a8"/><rect x="13" y="11" width="2" height="2" fill="#ffe7a8"/><rect x="10" y="13" width="2" height="2" fill="#ffe7a8"/>`,
  pregunta: (a) => `<rect x="8" y="3" width="8" height="2" fill="${a}"/><rect x="15" y="5" width="2" height="5" fill="${a}"/><rect x="11" y="10" width="4" height="2" fill="${a}"/><rect x="11" y="12" width="2" height="3" fill="${a}"/><rect x="11" y="17" width="2" height="2" fill="${a}"/><rect x="7" y="5" width="2" height="2" fill="${a}"/>`,
  torta: (a) => `<rect x="4" y="11" width="16" height="8" fill="#fff4f6"/><rect x="4" y="11" width="16" height="2" fill="${a}"/><rect x="6" y="6" width="12" height="5" fill="#ffe1e8"/><rect x="6" y="6" width="12" height="1" fill="${a}"/><rect x="11" y="2" width="2" height="4" fill="#f1c84b"/><rect x="11" y="1" width="2" height="1" fill="#ff8a3b"/>`,
  sol: (a) => `<rect x="8" y="8" width="8" height="8" fill="${a}"/><rect x="11" y="2" width="2" height="4" fill="${a}"/><rect x="11" y="18" width="2" height="4" fill="${a}"/><rect x="2" y="11" width="4" height="2" fill="${a}"/><rect x="18" y="11" width="4" height="2" fill="${a}"/><rect x="5" y="5" width="2" height="2" fill="${a}"/><rect x="17" y="5" width="2" height="2" fill="${a}"/><rect x="5" y="17" width="2" height="2" fill="${a}"/><rect x="17" y="17" width="2" height="2" fill="${a}"/>`,
  estrella: (a) => `<rect x="11" y="2" width="2" height="4" fill="${a}"/><rect x="9" y="6" width="6" height="3" fill="${a}"/><rect x="3" y="9" width="18" height="3" fill="${a}"/><rect x="6" y="12" width="12" height="3" fill="${a}"/><rect x="7" y="15" width="10" height="2" fill="${a}"/><rect x="6" y="17" width="4" height="3" fill="${a}"/><rect x="14" y="17" width="4" height="3" fill="${a}"/><rect x="5" y="20" width="3" height="2" fill="${a}"/><rect x="16" y="20" width="3" height="2" fill="${a}"/>`,
  corazon: (a) => `<rect x="4" y="5" width="6" height="2" fill="${a}"/><rect x="14" y="5" width="6" height="2" fill="${a}"/><rect x="2" y="7" width="20" height="5" fill="${a}"/><rect x="4" y="12" width="16" height="3" fill="${a}"/><rect x="6" y="15" width="12" height="2" fill="${a}"/><rect x="8" y="17" width="8" height="2" fill="${a}"/><rect x="10" y="19" width="4" height="2" fill="${a}"/>`,
  reloj: (a) => `<rect x="8" y="2" width="8" height="2" fill="${a}"/><rect x="5" y="4" width="14" height="2" fill="${a}"/><rect x="3" y="6" width="2" height="12" fill="${a}"/><rect x="19" y="6" width="2" height="12" fill="${a}"/><rect x="5" y="18" width="14" height="2" fill="${a}"/><rect x="8" y="20" width="8" height="2" fill="${a}"/><rect x="11" y="7" width="2" height="6" fill="${a}"/><rect x="13" y="11" width="4" height="2" fill="${a}"/>`,
  chat: (a) => `<rect x="2" y="3" width="20" height="13" fill="${a}"/><rect x="5" y="16" width="5" height="3" fill="${a}"/><rect x="5" y="19" width="2" height="2" fill="${a}"/><rect x="6" y="8" width="2" height="2" fill="#fff" opacity=".85"/><rect x="11" y="8" width="2" height="2" fill="#fff" opacity=".85"/><rect x="16" y="8" width="2" height="2" fill="#fff" opacity=".85"/>`,
  bolsa: (a) => `<rect x="8" y="2" width="8" height="2" fill="${a}"/><rect x="7" y="4" width="2" height="4" fill="${a}"/><rect x="15" y="4" width="2" height="4" fill="${a}"/><rect x="3" y="8" width="18" height="13" fill="${a}"/><rect x="7" y="11" width="2" height="2" fill="#fff" opacity=".7"/><rect x="15" y="11" width="2" height="2" fill="#fff" opacity=".7"/>`,
  regalo: (a) => `<rect x="3" y="8" width="18" height="4" fill="${a}"/><rect x="4" y="12" width="16" height="9" fill="${a}"/><rect x="11" y="8" width="2" height="13" fill="#fff" opacity=".8"/><rect x="7" y="4" width="4" height="4" fill="${a}"/><rect x="13" y="4" width="4" height="4" fill="${a}"/>`,
  grafica: (a) => `<rect x="2" y="20" width="20" height="2" fill="${a}"/><rect x="4" y="14" width="3" height="6" fill="${a}"/><rect x="9" y="10" width="3" height="10" fill="${a}"/><rect x="14" y="12" width="3" height="8" fill="${a}"/><rect x="19" y="5" width="3" height="15" fill="${a}"/><rect x="5" y="9" width="2" height="2" fill="${a}"/><rect x="10" y="5" width="2" height="2" fill="${a}"/><rect x="15" y="7" width="2" height="2" fill="${a}"/>`,
  megafono: (a) => `<rect x="2" y="9" width="5" height="6" fill="${a}"/><rect x="7" y="7" width="3" height="10" fill="${a}"/><rect x="10" y="5" width="3" height="14" fill="${a}"/><rect x="13" y="3" width="3" height="18" fill="${a}"/><rect x="5" y="15" width="3" height="5" fill="${a}"/><rect x="18" y="8" width="3" height="2" fill="${a}"/><rect x="18" y="14" width="3" height="2" fill="${a}"/><rect x="19" y="11" width="3" height="2" fill="${a}"/>`,
  casa: (a) => `<rect x="11" y="2" width="2" height="2" fill="${a}"/><rect x="9" y="4" width="6" height="2" fill="${a}"/><rect x="7" y="6" width="10" height="2" fill="${a}"/><rect x="5" y="8" width="14" height="2" fill="${a}"/><rect x="3" y="10" width="18" height="2" fill="${a}"/><rect x="5" y="12" width="14" height="10" fill="${a}"/><rect x="10" y="15" width="4" height="7" fill="#fff" opacity=".7"/>`,
  check: (a) => `<rect x="18" y="5" width="3" height="3" fill="${a}"/><rect x="15" y="8" width="3" height="3" fill="${a}"/><rect x="12" y="11" width="3" height="3" fill="${a}"/><rect x="9" y="14" width="3" height="3" fill="${a}"/><rect x="6" y="11" width="3" height="3" fill="${a}"/><rect x="3" y="8" width="3" height="3" fill="${a}"/>`,
  cafe: (a) => `<rect x="4" y="9" width="13" height="10" fill="${a}"/><rect x="17" y="11" width="3" height="2" fill="${a}"/><rect x="19" y="11" width="2" height="5" fill="${a}"/><rect x="17" y="15" width="3" height="2" fill="${a}"/><rect x="3" y="20" width="16" height="2" fill="${a}"/><rect x="7" y="3" width="1" height="4" fill="#ddd" opacity=".6"/><rect x="11" y="2" width="1" height="5" fill="#ddd" opacity=".6"/>`,
  rayo: (a) => `<rect x="12" y="2" width="4" height="3" fill="${a}"/><rect x="10" y="5" width="4" height="3" fill="${a}"/><rect x="8" y="8" width="4" height="3" fill="${a}"/><rect x="6" y="11" width="12" height="2" fill="${a}"/><rect x="12" y="13" width="4" height="3" fill="${a}"/><rect x="10" y="16" width="4" height="3" fill="${a}"/><rect x="8" y="19" width="4" height="3" fill="${a}"/>`,
};
const icono = (n, a, size = 64) => `<svg viewBox="0 0 24 24" width="${size}" height="${size}" shape-rendering="crispEdges">${(ICONOS[n] || ICONOS.estrella)(a)}</svg>`;

function imagenPost(img, chica = false) {
  return `<div class="post-img ${chica ? "chica" : ""}" style="background:${img.fondo};color:${img.acento}">
    <div class="post-icono">${icono(img.icono, img.acento, chica ? 22 : 72)}</div>
    <div class="post-titular">${esc(img.titular)}</div>
    ${chica ? "" : `<div class="post-sub">${esc(img.sub)}</div>`}
  </div>`;
}

// ---------------------------------------------------------------- vista completa
export function completo(r, negocio) {
  const cab = `<header class="ent-cab"><span class="ent-tipo">${ETIQUETA[r.tipo] || "Entregable"}</span><h2>${esc(r.titulo)}</h2>${r.resumen ? `<p class="ent-resumen">${esc(r.resumen)}</p>` : ""}</header>`;
  const f = VISTAS[r.tipo] || VISTAS.documento;
  return cab + f(r, negocio);
}

const VISTAS = {
  documento: (r) => `<article class="md hoja">${md(r.md || "").replace(/^<h2>.*?<\/h2>/, "")}</article>`,

  posts: (r, negocio) => {
    const usuario = "@" + (negocio?.nombre || "tunegocio").toLowerCase().normalize("NFD").replace(/[^a-z0-9]/g, "");
    return `<div class="posts">${r.datos.map((p, i) => `
      <div class="post">
        <div class="post-top"><span class="post-av">${esc((negocio?.nombre || "T")[0])}</span><b>${esc(usuario)}</b><span class="pill gris">${esc(p.dia)} · ${esc(p.formato)}</span></div>
        ${imagenPost(p.imagen)}
        <div class="post-copy"><p>${esc(p.copy)}</p>${p.hashtags ? `<p class="hashtags">${esc(p.hashtags)}</p>` : ""}</div>
        <button class="copiar" data-copiar="${i}">Copiar texto</button>
      </div>`).join("")}</div>`;
  },

  calendario: (r) => `<div class="semana">${r.datos.map((d) => `
      <div class="dia ${d.estado}">
        <div class="dia-nom">${esc(d.dia)}</div>
        <span class="pill formato-${esc(d.formato.toLowerCase())}">${esc(d.formato)}</span>
        <p class="dia-tema">${esc(d.tema)}</p>
        ${d.porque ? `<p class="dia-porque">${esc(d.porque)}</p>` : ""}
        <span class="dia-estado">${d.estado === "listo" ? "✓ Listo" : "Pendiente"}</span>
      </div>`).join("")}</div>`,

  competencia: (r) => {
    const max = Math.max(...r.datos.map((d) => d.vistas / d.promedio));
    return `<div class="comp">${r.datos.sort((a, b) => b.vistas / b.promedio - a.vistas / a.promedio).map((d) => {
      const x = d.vistas / d.promedio;
      return `<div class="comp-fila">
        <div class="comp-cuenta"><b>${esc(d.cuenta)}</b><small>${miles(d.seguidores)} seguidores</small></div>
        <div class="comp-post"><p>${esc(d.mejor)}</p><small>${esc(d.porque)}</small></div>
        <div class="comp-barra"><div class="comp-relleno ${x >= 2 ? "alto" : ""}" style="width:${(x / max) * 100}%"></div><span>${x.toFixed(1)}x su promedio · ${miles(d.vistas)} vistas</span></div>
      </div>`;
    }).join("")}</div>`;
  },

  prospectos: (r) => {
    const orden = ["respondió", "contactado", "mensaje listo", "nuevo"];
    const cuenta = orden.map((e) => [e, r.datos.filter((p) => p.estado === e).length]).filter(([, n]) => n);
    return `<div class="embudo">${cuenta.map(([e, n]) => `<div class="embudo-paso est-${e.replace(" ", "-")}"><b>${n}</b><span>${e}</span></div>`).join("")}</div>
      <table class="tabla prospectos"><thead><tr><th>Negocio</th><th>Por qué encaja</th><th>Contacto</th><th>Estado</th><th></th></tr></thead><tbody>
      ${r.datos.map((p, i) => `<tr>
        <td><b>${esc(p.nombre)}</b><br><small>${esc(p.barrio)}${p.direccion ? ` · ${esc(p.direccion)}` : ""}</small></td>
        <td>${esc(p.porque)}</td>
        <td><small>${esc(p.telefono) || "Sin teléfono"}<br>${esc(p.instagram)}${p.fuente ? `<br><i class="fuente">${esc(p.fuente)}</i>` : ""}</small></td>
        <td><span class="pill est-${p.estado.replace(" ", "-")}">${esc(p.estado)}</span></td>
        <td><button class="ver-msg" data-msg="${i}">Mensaje</button></td>
      </tr><tr class="msg-fila" id="msg-${i}" hidden><td colspan="5"><div class="msg"><p>${esc(p.mensaje)}</p><button class="copiar" data-copiar-msg="${i}">Copiar mensaje</button></div></td></tr>`).join("")}
      </tbody></table>`;
  },

  pipeline: (r) => `<div class="kanban">${r.datos.map((col) => `
      <div class="kcol"><div class="kcol-cab">${esc(col.columna)} <small>${col.items.length}</small></div>
      ${col.items.map((it) => `<div class="kcard ${it.dias > 3 ? "frio" : ""}"><b>${esc(it.nombre)}</b><p>${esc(it.detalle)}</p><small>${it.dias === 0 ? "Hoy" : `Hace ${it.dias} día${it.dias > 1 ? "s" : ""}`}</small></div>`).join("")}
      </div>`).join("")}</div>`,

  checklist: (r) => `<ul class="check">${r.datos.map((d) => `
      <li class="${d.estado.replace(" ", "-")}"><span class="caja"></span>
        <div><b>${esc(d.texto)}</b><span class="resp">${esc(d.responsable)}</span>${d.nota ? `<p>${esc(d.nota)}</p>` : ""}</div>
        <span class="pill est-${d.estado.replace(" ", "-")}">${esc(d.estado)}</span>
      </li>`).join("")}</ul>`,

  finanzas: (r) => {
    const { semanas, productos, alertas } = r.datos;
    const ult = semanas.at(-1), ant = semanas.at(-2) || ult;
    const max = Math.max(...semanas.map((s) => s.ventas));
    const H = 160, bw = 18, gap = 22;
    const barras = semanas.map((s, i) => {
      const x = 30 + i * (bw * 2 + gap);
      const hv = (s.ventas / max) * H, hg = (s.gastos / max) * H;
      return `<rect x="${x}" y="${H - hv + 10}" width="${bw}" height="${hv}" fill="#58b368"/><rect x="${x + bw}" y="${H - hg + 10}" width="${bw}" height="${hg}" fill="#d97b5a"/><text x="${x + bw}" y="${H + 26}" text-anchor="middle">${s.s}</text>`;
    }).join("");
    const ancho = 30 + semanas.length * (bw * 2 + gap);
    return `<div class="kpis">
        <div class="kpi"><small>Ventas</small><b>${pesos(ult.ventas)}</b><span class="sube">+${Math.round((ult.ventas / ant.ventas - 1) * 100)} %</span></div>
        <div class="kpi"><small>Gastos</small><b>${pesos(ult.gastos)}</b><span class="baja">+${Math.round((ult.gastos / ant.gastos - 1) * 100)} %</span></div>
        <div class="kpi"><small>Quedó</small><b>${pesos(ult.ventas - ult.gastos)}</b><span>${((1 - ult.gastos / ult.ventas) * 100).toFixed(1)} % de margen</span></div>
      </div>
      <h3>Ventas y gastos, últimas 8 semanas</h3>
      <div class="grafica"><svg viewBox="0 0 ${ancho} ${H + 34}" shape-rendering="crispEdges">${barras}</svg>
      <p class="leyenda"><span class="lv"></span> Ventas <span class="lg"></span> Gastos</p></div>
      <h3>Qué vende y qué deja plata</h3>
      <div class="prods">${productos.map((p) => `<div class="prod"><span class="prod-nom">${esc(p.nombre)}</span>
        <div class="prod-barras"><div class="pb v" style="width:${p.ventas * 2}%"><i>${p.ventas} % de las ventas</i></div><div class="pb g" style="width:${p.ganancia * 2}%"><i>${p.ganancia} % de la ganancia</i></div></div></div>`).join("")}</div>
      <h3>Alertas</h3>
      <div class="alertas">${alertas.map((a) => `<div class="alerta ${a.nivel}">${esc(a.texto)}</div>`).join("")}</div>`;
  },
};

// Botones de copiar y mostrar mensaje, después de pintar.
export function conectar(raiz, r) {
  raiz.querySelectorAll("[data-copiar]").forEach((b) => (b.onclick = () => copiar(b, `${r.datos[b.dataset.copiar].copy}\n\n${r.datos[b.dataset.copiar].hashtags || ""}`.trim())));
  raiz.querySelectorAll("[data-copiar-msg]").forEach((b) => (b.onclick = () => copiar(b, r.datos[b.dataset.copiarMsg].mensaje)));
  raiz.querySelectorAll("[data-msg]").forEach((b) => (b.onclick = () => { const f = raiz.querySelector(`#msg-${b.dataset.msg}`); f.hidden = !f.hidden; }));
}
function copiar(b, texto) {
  navigator.clipboard?.writeText(texto).catch(() => {});
  const t = b.textContent; b.textContent = "Copiado ✓"; setTimeout(() => (b.textContent = t), 1400);
}

// ---------------------------------------------------------------- miniaturas
export function mini(r) {
  const d = r.datos;
  switch (r.tipo) {
    case "posts": return `<div class="mini mini-posts">${d.slice(0, 3).map((p) => imagenPost(p.imagen, true)).join("")}</div>`;
    case "calendario": return `<div class="mini mini-cal">${d.map((x) => `<span class="${x.estado}"><i>${esc(x.dia.split(" ")[0])}</i></span>`).join("")}</div>`;
    case "competencia": { const max = Math.max(...d.map((x) => x.vistas / x.promedio)); return `<div class="mini mini-barras">${d.map((x) => `<span style="width:${(x.vistas / x.promedio / max) * 100}%"></span>`).join("")}</div>`; }
    case "prospectos": return `<div class="mini mini-filas">${d.slice(0, 5).map((p) => `<span><i>${esc(p.nombre)}</i><b class="est-${p.estado.replace(" ", "-")}"></b></span>`).join("")}</div>`;
    case "pipeline": return `<div class="mini mini-kanban">${d.map((c) => `<span>${c.items.map((it) => `<b class="${it.dias > 3 ? "frio" : ""}"></b>`).join("")}</span>`).join("")}</div>`;
    case "checklist": return `<div class="mini mini-check">${d.slice(0, 4).map((x) => `<span class="${x.estado.replace(" ", "-")}"><b></b><i>${esc(x.texto)}</i></span>`).join("")}</div>`;
    case "finanzas": { const max = Math.max(...d.semanas.map((s) => s.ventas)); return `<div class="mini mini-fin">${d.semanas.map((s) => `<span><b style="height:${(s.ventas / max) * 100}%"></b><b class="g" style="height:${(s.gastos / max) * 100}%"></b></span>`).join("")}</div>`; }
    default: return `<div class="mini mini-doc"><b></b>${"<span></span>".repeat(6)}</div>`;
  }
}

// ---------------------------------------------------------------- markdown mínimo
export function md(src) {
  const inline = (s) => esc(s).replace(/\*\*(.+?)\*\*/g, "<strong>$1</strong>").replace(/`(.+?)`/g, "<code>$1</code>");
  const lineas = src.replace(/\r/g, "").split("\n");
  let out = "", i = 0;
  while (i < lineas.length) {
    const l = lineas[i];
    if (!l.trim()) { i++; continue; }
    let m;
    if ((m = l.match(/^(#{1,3})\s+(.*)$/))) { const n = m[1].length; out += `<h${n + 1}>${inline(m[2])}</h${n + 1}>`; i++; continue; }
    if (l.trim().startsWith("|")) {
      const filas = [];
      while (i < lineas.length && lineas[i].trim().startsWith("|")) filas.push(lineas[i++]);
      const celdas = (f) => f.trim().replace(/^\||\|$/g, "").split("|").map((x) => x.trim());
      const cuerpo = filas.filter((f, j) => !(j === 1 && /^[\s|:-]+$/.test(f)));
      out += `<table class="tabla"><thead><tr>${celdas(cuerpo[0]).map((x) => `<th>${inline(x)}</th>`).join("")}</tr></thead><tbody>${cuerpo.slice(1).map((f) => `<tr>${celdas(f).map((x) => `<td>${inline(x)}</td>`).join("")}</tr>`).join("")}</tbody></table>`;
      continue;
    }
    if (/^\s*([-*]|\d+\.)\s+/.test(l)) {
      const ord = /^\s*\d+\./.test(l);
      const items = [];
      while (i < lineas.length && /^\s*([-*]|\d+\.)\s+/.test(lineas[i])) items.push(lineas[i++].replace(/^\s*([-*]|\d+\.)\s+/, ""));
      out += `<${ord ? "ol" : "ul"}>${items.map((x) => `<li>${inline(x)}</li>`).join("")}</${ord ? "ol" : "ul"}>`;
      continue;
    }
    const par = [];
    while (i < lineas.length && lineas[i].trim() && !/^(#|\||\s*([-*]|\d+\.)\s)/.test(lineas[i])) par.push(lineas[i++]);
    out += `<p>${inline(par.join(" "))}</p>`;
  }
  return out;
}
