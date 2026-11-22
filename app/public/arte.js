// Todo el arte de la oficina, dibujado en código a resolución nativa (16 px por baldosa).
// Nada de imágenes: cada mueble y cada personaje son rectángulos de color.

export const T = 16;

export const PAL = {
  ink: "#1d1626",
  piso: "#e7d8bd", pisoLinea: "#d6c4a3", pisoBrillo: "#efe3cc",
  muroTope: "#4a3d5c", muroCara: "#6e5d84", muroCaraOsc: "#5b4c70", zocalo: "#3a2f49",
  alfombra: { d: ["#8e3c3c", "#7f3434"], m: ["#4d3c7a", "#43346b"], v: ["#8a5a36", "#7a4e2e"], o: ["#3e607c", "#36546d"], f: ["#2f6b50", "#285d45"] },
  madera: "#a2673b", maderaTope: "#c58650", maderaOsc: "#7c4b29",
  metal: "#9aa3b2", metalOsc: "#6c7486", pantalla: "#5fd9f5", pantallaOsc: "#2a9fc0",
  planta: "#4e9a52", plantaOsc: "#357a3d", maceta: "#b5653f",
  papel: "#f4f1e8", rojo: "#d24b4b", amarillo: "#f1c84b", verde: "#58b368", azul: "#4f86d9",
  ventanaDia: "#9fd3f2", ventanaNoche: "#27305a", marco: "#3a2f49",
};

const r = (c, x, y, w, h, col) => { c.fillStyle = col; c.fillRect(x, y, w, h); };

// ---------------------------------------------------------------- mapa
// # muro · . recepción · d dirección · m marketing · v ventas · o operaciones · f finanzas
export const MAPA = [
  "############################",
  "############################",
  "#dddddddd#mmmmmmmm#vvvvvvvv#",
  "#dddddddd#mmmmmmmm#vvvvvvvv#",
  "#dddddddd#mmmmmmmm#vvvvvvvv#",
  "#dddddddd#mmmmmmmm#vvvvvvvv#",
  "#dddddddd#mmmmmmmm#vvvvvvvv#",
  "#####.#######..#######.#####",
  "#..........................#",
  "#..........................#",
  "#..........................#",
  "######.#####....#####.######",
  "#oooooooooo#....#ffffffffff#",
  "#oooooooooo#....#ffffffffff#",
  "#oooooooooo#....#ffffffffff#",
  "#oooooooooo#....#ffffffffff#",
  "#oooooooooo#....#ffffffffff#",
  "#############..#############",
];
export const W = MAPA[0].length, H = MAPA.length;
export const esMuro = (x, y) => x < 0 || y < 0 || x >= W || y >= H || MAPA[y][x] === "#";

function piso(c, x, y, k) {
  const px = x * T, py = y * T;
  if (k === ".") {
    r(c, px, py, T, T, PAL.piso);
    r(c, px, py, T, 1, PAL.pisoLinea); r(c, px, py, 1, T, PAL.pisoLinea);
    r(c, px + 2, py + 2, 3, 1, PAL.pisoBrillo);
    return;
  }
  const [a, b] = PAL.alfombra[k];
  if (k === "v") { // tablas de madera
    r(c, px, py, T, T, a);
    for (let i = 0; i < 4; i++) r(c, px, py + i * 4 + 3, T, 1, b);
    r(c, px + ((y * 7) % 12) + 2, py, 1, 4, b); r(c, px + ((y * 5) % 10) + 4, py + 8, 1, 4, b);
    return;
  }
  r(c, px, py, T, T, a);
  for (let i = 0; i < T; i += 4) for (let j = (i / 4) % 2 ? 2 : 0; j < T; j += 4) r(c, px + j, py + i, 1, 1, b);
}

function muro(c, x, y, hora) {
  const px = x * T, py = y * T;
  const abajoPiso = y + 1 < H && !esMuro(x, y + 1);
  if (!abajoPiso) { r(c, px, py, T, T, PAL.muroTope); r(c, px, py + T - 1, T, 1, "#433754"); return; }
  r(c, px, py, T, 5, PAL.muroTope);
  r(c, px, py + 5, T, 10, PAL.muroCara);
  r(c, px, py + 5, T, 1, PAL.muroCaraOsc);
  r(c, px, py + 14, T, 2, PAL.zocalo);
  // ventanas en el muro exterior de arriba
  if (y === 1 && x % 4 === 2 && x > 0 && x < W - 1 && !"9 18".split(" ").includes(String(x))) {
    const noche = hora >= 19 || hora < 6;
    r(c, px + 2, py + 6, 12, 7, PAL.marco);
    r(c, px + 3, py + 7, 10, 5, noche ? PAL.ventanaNoche : PAL.ventanaDia);
    r(c, px + 8, py + 7, 1, 5, PAL.marco);
    if (noche) { r(c, px + 4, py + 8, 1, 1, "#f5e9a8"); r(c, px + 11, py + 10, 1, 1, "#f5e9a8"); }
    else r(c, px + 4, py + 8, 2, 1, "#d8f0fb");
  }
}

export function pintarFondo(c, hora) {
  for (let y = 0; y < H; y++) for (let x = 0; x < W; x++) {
    const k = MAPA[y][x];
    if (k === "#") muro(c, x, y, hora); else piso(c, x, y, k);
  }
  // tapetes de recepción
  r(c, 12 * T + 2, 12 * T + 2, 4 * T - 4, 4 * T - 4, "#c9a26b");
  r(c, 12 * T + 4, 12 * T + 4, 4 * T - 8, 4 * T - 8, "#b38a55");
  r(c, 12 * T + 6, 12 * T + 6, 4 * T - 12, 4 * T - 12, "#c9a26b");
  // carteles en la cara del muro (dibujados sobre el muro)
  cuadroMuro(c, 2, 1, "dia1"); cuadroMuro(c, 6, 1, "plantaMuro");
  cuadroMuro(c, 11, 1, "poster"); cuadroMuro(c, 15, 1, "posterYT");
  cuadroMuro(c, 20, 1, "embudo", 3);
  cuadroMuro(c, 2, 11, "kanban", 3);
  cuadroMuro(c, 23, 11, "grafica", 2);
  cuadroMuro(c, 16, 7, "tablero", 2);
  // letreros de departamento sobre las puertas
}

function cuadroMuro(c, x, y, tipo, ancho = 1) {
  const px = x * T, py = y * T;
  if (tipo === "dia1") { r(c, px + 2, py + 6, 12, 8, PAL.papel); r(c, px + 3, py + 7, 10, 2, PAL.rojo); r(c, px + 5, py + 10, 1, 3, PAL.ink); r(c, px + 7, py + 10, 3, 1, PAL.ink); r(c, px + 7, py + 12, 3, 1, PAL.ink); }
  if (tipo === "plantaMuro") { r(c, px + 4, py + 7, 8, 7, "#3a2f49"); r(c, px + 5, py + 8, 6, 5, "#f1c84b"); r(c, px + 6, py + 9, 4, 3, "#e0873b"); }
  if (tipo === "poster") { r(c, px + 3, py + 6, 10, 8, "#1d1626"); r(c, px + 4, py + 7, 8, 3, "#f1c84b"); r(c, px + 4, py + 11, 6, 1, "#ffffff"); }
  if (tipo === "posterYT") { r(c, px + 3, py + 6, 10, 8, "#ffffff"); r(c, px + 5, py + 8, 6, 4, PAL.rojo); r(c, px + 7, py + 9, 1, 2, "#ffffff"); r(c, px + 8, py + 9.5, 1, 1, "#ffffff"); }
  if (tipo === "embudo") {
    r(c, px + 1, py + 5, ancho * T - 2, 10, "#f7f7f2"); r(c, px + 1, py + 5, ancho * T - 2, 1, PAL.metalOsc);
    const cx = px + (ancho * T) / 2;
    [[16, PAL.azul], [12, PAL.verde], [8, PAL.amarillo], [4, PAL.rojo]].forEach(([w, col], i) => r(c, cx - w, py + 7 + i * 2, w * 2, 2, col));
  }
  if (tipo === "kanban") {
    r(c, px + 1, py + 5, ancho * T - 2, 10, "#f7f7f2"); r(c, px + 1, py + 5, ancho * T - 2, 1, PAL.metalOsc);
    const cols = [PAL.amarillo, PAL.azul, PAL.verde];
    for (let i = 0; i < 3; i++) { const cx = px + 3 + i * 15; r(c, cx + 11, py + 6, 1, 8, "#ddd"); for (let j = 0; j < 3 - i % 2; j++) r(c, cx + (j % 2) * 5, py + 7 + j * 2 + (j > 1 ? 1 : 0), 4, 2, cols[i]); }
  }
  if (tipo === "grafica") {
    r(c, px + 1, py + 5, ancho * T - 2, 10, "#f7f7f2");
    [3, 4, 3, 6, 5, 7, 8].forEach((h, i) => r(c, px + 4 + i * 4, py + 14 - h, 3, h, i > 4 ? PAL.verde : "#8fc79a"));
  }
  if (tipo === "tablero") {
    r(c, px + 1, py + 4, ancho * T - 2, 11, "#6b4a2e"); r(c, px + 2, py + 5, ancho * T - 4, 9, "#c99f6a");
    for (let i = 0; i < 4; i++) { r(c, px + 4 + i * 7, py + 6, 5, 6, [PAL.papel, PAL.amarillo, "#9fd3f2", PAL.papel][i]); r(c, px + 6 + i * 7, py + 6, 1, 1, PAL.rojo); }
  }
}

// ---------------------------------------------------------------- muebles
// Cada mueble: tiles que ocupa (sólidos) y cómo se dibuja. Se ordenan por su base con los personajes.
export const MUEBLES = [
  // Dirección
  { id: "escritorioD", x: 3, y: 4, w: 3, h: 1, dibujo: "escritorio", dueno: "direccion", monitores: 1 },
  { x: 4, y: 3, w: 1, h: 1, dibujo: "silla", fondo: true, solido: false },
  { x: 1, y: 2, w: 2, h: 1, dibujo: "libreria" },
  { x: 8, y: 2, w: 1, h: 1, dibujo: "planta" },
  { x: 7, y: 5, w: 2, h: 1, dibujo: "sofa", col: "#5b3a6b" },
  { x: 1, y: 6, w: 1, h: 1, dibujo: "planta" },
  // Marketing
  { id: "escritorioM", x: 13, y: 4, w: 3, h: 1, dibujo: "escritorio", dueno: "marketing", monitores: 2 },
  { x: 14, y: 3, w: 1, h: 1, dibujo: "silla", fondo: true, solido: false },
  { x: 11, y: 3, w: 1, h: 1, dibujo: "aroLuz" },
  { x: 11, y: 5, w: 1, h: 1, dibujo: "camara" },
  { x: 17, y: 2, w: 1, h: 1, dibujo: "planta" },
  { x: 16, y: 6, w: 2, h: 1, dibujo: "puff" },
  // Ventas
  { id: "escritorioV", x: 22, y: 4, w: 3, h: 1, dibujo: "escritorio", dueno: "ventas", monitores: 1, telefono: true },
  { x: 23, y: 3, w: 1, h: 1, dibujo: "silla", fondo: true, solido: false },
  { x: 26, y: 4, w: 1, h: 2, dibujo: "pesas" },
  { x: 19, y: 2, w: 1, h: 1, dibujo: "planta" },
  { x: 19, y: 6, w: 2, h: 1, dibujo: "archivador" },
  // Operaciones
  { id: "escritorioO", x: 4, y: 14, w: 3, h: 1, dibujo: "escritorio", dueno: "operaciones", monitores: 1 },
  { x: 5, y: 13, w: 1, h: 1, dibujo: "silla", fondo: true, solido: false },
  { x: 1, y: 13, w: 1, h: 2, dibujo: "archivador" },
  { x: 1, y: 16, w: 1, h: 1, dibujo: "planta" },
  { x: 9, y: 15, w: 2, h: 2, dibujo: "mesaJuntas" },
  // Finanzas
  { id: "escritorioF", x: 21, y: 14, w: 3, h: 1, dibujo: "escritorio", dueno: "finanzas", monitores: 1, gaseosa: true },
  { x: 22, y: 13, w: 1, h: 1, dibujo: "silla", fondo: true, solido: false },
  { x: 26, y: 12, w: 1, h: 1, dibujo: "caja" },
  { x: 26, y: 14, w: 1, h: 1, dibujo: "nevera" },
  { x: 26, y: 16, w: 1, h: 1, dibujo: "planta" },
  { x: 17, y: 16, w: 1, h: 1, dibujo: "planta" },
  // Recepción
  { id: "buzon", x: 12, y: 16, w: 1, h: 1, dibujo: "buzon", objeto: "buzon" },
  { id: "cafetera", x: 26, y: 8, w: 1, h: 1, dibujo: "cafetera", objeto: "cafetera" },
  { x: 1, y: 8, w: 1, h: 1, dibujo: "planta" },
  { x: 1, y: 10, w: 2, h: 1, dibujo: "sofa", col: "#3f6f8f" },
  { x: 26, y: 10, w: 1, h: 1, dibujo: "planta" },
];
// el tablero de horarios está en el muro, se habla con él desde abajo
export const OBJETOS_MURO = [{ id: "tablero", x: 16, y: 7, w: 2, objeto: "tablero" }];

export function dibujarMueble(c, m, t, ctx = {}) {
  const px = m.x * T, py = m.y * T, w = m.w * T;
  switch (m.dibujo) {
    case "escritorio": {
      r(c, px, py + 2, w, 9, PAL.maderaTope);
      r(c, px, py + 11, w, 4, PAL.madera);
      r(c, px, py + 15, w, 1, PAL.maderaOsc);
      r(c, px + 1, py + 11, 2, 5, PAL.maderaOsc); r(c, px + w - 3, py + 11, 2, 5, PAL.maderaOsc);
      // monitores a los lados (miran al empleado), para que el empresario se vea completo
      const n = m.monitores || 1;
      const lados = n === 2 ? [px + 2, px + w - 13] : [px + 2];
      lados.forEach((mx, i) => {
        r(c, mx, py - 3, 11, 8, PAL.ink); r(c, mx + 1, py - 2, 9, 6, "#2d2538");
        r(c, mx + 4, py + 5, 3, 2, PAL.ink);
        if (ctx.trabajando) { const g = (Math.floor(t / 180) + i) % 3; r(c, mx, py - 4, 11, 1, g ? PAL.pantalla : PAL.pantallaOsc); r(c, mx + 1, py - 2, 9, 1, "#3d5a73"); }
      });
      r(c, px + w / 2 - 4, py + 7, 8, 3, PAL.papel); r(c, px + w / 2 - 3, py + 8, 6, 1, "#c9c3b4");
      if (m.telefono) { r(c, px + w - 9, py + 5, 6, 4, PAL.ink); r(c, px + w - 8, py + 4, 4, 1, PAL.ink); r(c, px + w - 8, py + 6, 1, 1, PAL.rojo); }
      if (m.gaseosa) { r(c, px + w - 7, py + 3, 3, 5, PAL.rojo); r(c, px + w - 7, py + 5, 3, 1, "#ffffff"); }
      if (!m.telefono && !m.gaseosa && n === 1) { r(c, px + w - 7, py + 4, 4, 4, "#ffffff"); r(c, px + w - 6, py + 5, 2, 2, "#6b3f22"); }
      break;
    }
    case "silla":
      r(c, px + 3, py - 2, 10, 10, "#2f2a3a"); r(c, px + 4, py - 1, 8, 8, "#423a52");
      r(c, px + 4, py + 8, 8, 4, "#2f2a3a");
      break;
    case "libreria":
      r(c, px, py - 8, w, 23, PAL.maderaOsc); r(c, px + 1, py - 7, w - 2, 21, PAL.madera);
      for (let s = 0; s < 3; s++) {
        r(c, px + 1, py - 7 + s * 7 + 6, w - 2, 1, PAL.maderaOsc);
        for (let b = 0; b < 7; b++) r(c, px + 2 + b * 4, py - 7 + s * 7 + 1 + (b % 2), 3, 5 - (b % 2), [PAL.rojo, PAL.azul, PAL.amarillo, PAL.verde, "#8a5bb8"][(b + s * 2) % 5]);
      }
      break;
    case "planta":
      r(c, px + 4, py + 9, 8, 6, PAL.maceta); r(c, px + 3, py + 8, 10, 2, "#c97a50");
      r(c, px + 3, py - 1, 10, 9, PAL.planta); r(c, px + 1, py + 2, 4, 5, PAL.planta); r(c, px + 11, py + 2, 4, 5, PAL.planta);
      r(c, px + 6, py - 3, 4, 3, PAL.planta);
      r(c, px + 5, py + 1, 2, 3, PAL.plantaOsc); r(c, px + 10, py + 4, 2, 3, PAL.plantaOsc); r(c, px + 7, py - 2, 1, 4, PAL.plantaOsc);
      break;
    case "sofa": {
      const col = m.col;
      r(c, px, py, w, 6, col); r(c, px + 1, py + 6, w - 2, 7, col);
      r(c, px, py + 4, 3, 10, col); r(c, px + w - 3, py + 4, 3, 10, col);
      r(c, px + 3, py + 7, w / 2 - 4, 5, "rgba(255,255,255,0.12)"); r(c, px + w / 2 + 1, py + 7, w / 2 - 4, 5, "rgba(255,255,255,0.12)");
      r(c, px, py + 14, w, 2, "rgba(0,0,0,0.25)");
      break;
    }
    case "puff":
      r(c, px + 1, py + 4, 13, 10, "#e0873b"); r(c, px + 3, py + 3, 9, 3, "#f0a05a");
      r(c, px + 17, py + 4, 13, 10, "#58b368"); r(c, px + 19, py + 3, 9, 3, "#77c986");
      break;
    case "aroLuz": {
      r(c, px + 7, py + 4, 2, 11, PAL.metalOsc); r(c, px + 4, py + 14, 8, 2, PAL.metalOsc);
      r(c, px + 2, py - 8, 12, 12, "#ffffff"); r(c, px + 4, py - 6, 8, 8, PAL.muroTope);
      r(c, px + 6, py - 4, 4, 4, "#2d2538");
      if (ctx.trabajando) r(c, px + 1, py - 9, 14, 1, "#fffbe0");
      break;
    }
    case "camara":
      r(c, px + 7, py + 3, 2, 12, PAL.ink); r(c, px + 3, py + 14, 10, 2, PAL.ink);
      r(c, px + 3, py - 2, 10, 6, PAL.ink); r(c, px + 11, py - 1, 4, 4, "#3a3448");
      r(c, px + 5, py - 1, 1, 1, ctx.trabajando && Math.floor(t / 500) % 2 ? PAL.rojo : "#5a1f1f");
      break;
    case "pesas":
      r(c, px + 2, py, 12, 30, "#3a3448"); r(c, px + 3, py + 1, 10, 28, "#4a4458");
      for (let i = 0; i < 4; i++) { r(c, px + 3, py + 4 + i * 7, 10, 2, PAL.metal); r(c, px + 2, py + 3 + i * 7, 3, 4, "#2a2433"); r(c, px + 11, py + 3 + i * 7, 3, 4, "#2a2433"); }
      break;
    case "archivador":
      for (let j0 = 0; j0 < m.h; j0++) for (let i = 0; i < m.w; i++) {
        const ax = px + i * T, ay = py + j0 * T;
        r(c, ax + 1, ay - 6, 14, 21, PAL.metalOsc); r(c, ax + 2, ay - 5, 12, 19, PAL.metal);
        for (let j = 0; j < 3; j++) { r(c, ax + 2, ay - 5 + j * 6 + 5, 12, 1, PAL.metalOsc); r(c, ax + 6, ay - 3 + j * 6, 4, 1, PAL.ink); }
      }
      break;
    case "mesaJuntas":
      r(c, px + 2, py + 4, w - 4, m.h * T - 10, PAL.maderaTope); r(c, px + 2, py + m.h * T - 6, w - 4, 3, PAL.madera);
      r(c, px + 6, py + 8, 6, 4, PAL.papel); r(c, px + 18, py + 14, 6, 4, PAL.papel);
      break;
    case "caja":
      r(c, px + 1, py - 2, 14, 17, "#3c4150"); r(c, px + 2, py - 1, 12, 15, "#596075");
      r(c, px + 6, py + 3, 5, 5, "#2b2f3b"); r(c, px + 8, py + 5, 1, 1, PAL.amarillo); r(c, px + 12, py + 4, 1, 4, PAL.metal);
      break;
    case "nevera":
      r(c, px + 1, py - 8, 14, 23, "#b02a3a"); r(c, px + 2, py - 7, 12, 14, "#9fd3f2");
      for (let i = 0; i < 3; i++) for (let j = 0; j < 3; j++) r(c, px + 3 + j * 4, py - 6 + i * 5, 2, 3, PAL.rojo);
      r(c, px + 2, py + 8, 12, 1, "#7a1c28");
      break;
    case "buzon":
      r(c, px + 7, py + 6, 2, 9, PAL.ink); r(c, px + 3, py - 1, 10, 8, PAL.azul); r(c, px + 3, py - 2, 10, 2, "#6a9be3");
      r(c, px + 5, py + 2, 6, 1, PAL.ink);
      if (ctx.nuevos) r(c, px + 12, py - 6, 2, 6, PAL.rojo), r(c, px + 12, py - 6, 4, 3, PAL.rojo);
      break;
    case "cafetera":
      r(c, px + 2, py, 12, 15, "#d9d4cc"); r(c, px + 3, py - 6, 10, 7, PAL.ink); r(c, px + 4, py - 5, 8, 3, "#3a3448");
      r(c, px + 6, py + 7, 4, 4, "#ffffff"); r(c, px + 7, py + 8, 2, 2, "#6b3f22");
      if (Math.floor(t / 400) % 2) r(c, px + 7, py + 4, 1, 2, "rgba(255,255,255,0.7)");
      break;
  }
}

// ---------------------------------------------------------------- personajes
export const PERSONAJES = {
  bezos:   { piel: "#e6b08b", pielSombra: "#c98f6c", pelo: null, peinado: "calvo", barba: null, gafas: false, camisa: "#9cc3e6", saco: "#2b3a67", corbata: null, pantalon: "#3a3f55", sonrisa: true },
  gadzhi:  { piel: "#d49b70", pielSombra: "#b47c55", pelo: "#24160f", peinado: "volumen", barba: "#3a2416", barbaCorta: true, gafas: false, camisa: "#1b1b20", saco: null, corbata: null, pantalon: "#2a2a30", reloj: true },
  hormozi: { piel: "#d6a07a", pielSombra: "#b5805c", pelo: "#1c130e", peinado: "atrasLargo", barba: "#1c130e", gafas: false, camisa: "#18181c", saco: null, corbata: null, pantalon: "#2b2b33", ancho: true },
  wickman: { piel: "#efc29f", pielSombra: "#d2a07e", pelo: "#a9a9b0", peinado: "corto", barba: null, gafas: false, camisa: "#f4f1e8", saco: "#1f2d4d", corbata: "#3d6fd1", pantalon: "#1f2d4d" },
  buffett: { piel: "#f1c4a6", pielSombra: "#d6a385", pelo: "#f2f2f2", peinado: "ralo", barba: null, gafas: true, camisa: "#f4f1e8", saco: "#6a6a72", corbata: "#b0283a", pantalon: "#55555c", cejas: "#e8e8e8" },
  dueno:   { piel: "#c98c62", pielSombra: "#a86f49", pelo: "#3a2417", peinado: "dueno", barba: null, gafas: false, camisa: "#3f8f5a", saco: null, corbata: null, pantalon: "#3b4f7a", capucha: true },
};

// Personaje de cuerpo entero, ~16x22, con los pies en (ox, oy) = esquina inferior izquierda de su baldosa.
// dir: 0 abajo, 1 izquierda, 2 derecha, 3 arriba · pose: "pie" | "sentado" | "dormido"
export function dibujarPersonaje(c, id, ox, oy, dir = 0, paso = 0, pose = "pie", t = 0, tecleando = false) {
  const p = PERSONAJES[id];
  const ancho = p.ancho ? 1 : 0;
  const baja = pose === "pie" ? 0 : 3;
  const y0 = oy + baja;
  // sombra
  if (pose === "pie") r(c, ox + 3, oy - 2, 10, 2, "rgba(0,0,0,0.22)");
  // piernas
  if (pose === "pie") {
    const a = paso === 1 ? 1 : 0, b = paso === 3 ? 1 : 0;
    r(c, ox + 5, oy - 7 - a, 2, 6, p.pantalon); r(c, ox + 9, oy - 7 - b, 2, 6, p.pantalon);
    r(c, ox + 5, oy - 2 - a, 2, 1, PAL.ink); r(c, ox + 9, oy - 2 - b, 2, 1, PAL.ink);
  }
  // torso
  const tx = ox + 4 - ancho, tw = 8 + ancho * 2, ty = y0 - 13;
  r(c, tx, ty, tw, 7, p.saco || p.camisa);
  if (p.saco) { r(c, ox + 7, ty, 2, 6, p.camisa); if (p.corbata) r(c, ox + 7, ty + 1, 2, 4, p.corbata); }
  if (p.capucha && dir !== 3) r(c, ox + 6, ty, 4, 1, "#2f6e44");
  // brazos
  const dormido = pose === "dormido";
  const tecla = tecleando && Math.floor(t / 120) % 2;
  const brazo = p.saco || p.camisa;
  if (pose === "pie") {
    const s = paso % 2 ? 1 : 0;
    r(c, tx - 1, ty + 1 + s, 1, 5, brazo); r(c, tx + tw, ty + 1 + (1 - s), 1, 5, brazo);
    r(c, tx - 1, ty + 6 + s, 1, 1, p.piel); r(c, tx + tw, ty + 7 - s, 1, 1, p.piel);
  } else {
    r(c, tx - 1, ty + 1, 2, 5, brazo); r(c, tx + tw - 1, ty + 1, 2, 5, brazo);
    r(c, tx, ty + 6 - (tecla ? 1 : 0), 2, 1, p.piel); r(c, tx + tw - 2, ty + 6 - (tecla ? 0 : 1), 2, 1, p.piel);
  }
  if (p.reloj && dir !== 3) r(c, tx + tw - 1, ty + 5, 1, 1, PAL.amarillo);
  // cabeza
  const hy = dormido ? y0 - 18 : y0 - 22;
  const hx = ox + 4;
  r(c, hx, hy, 8, 9, p.piel);
  r(c, hx, hy + 8, 8, 1, p.pielSombra);
  if (dir === 0 || dir === 3) { r(c, hx - 1, hy + 4, 1, 2, p.piel); r(c, hx + 8, hy + 4, 1, 2, p.piel); }
  // pelo
  pelo(c, p, hx, hy, dir);
  // cara
  if (dir !== 3 && !dormido) {
    const ojoY = hy + 4;
    if (dir === 0) { r(c, hx + 2, ojoY, 1, 2, PAL.ink); r(c, hx + 5, ojoY, 1, 2, PAL.ink); }
    if (dir === 1) r(c, hx + 1, ojoY, 1, 2, PAL.ink);
    if (dir === 2) r(c, hx + 6, ojoY, 1, 2, PAL.ink);
    if (p.gafas) {
      if (dir === 0) { r(c, hx + 1, ojoY - 1, 3, 1, PAL.ink); r(c, hx + 4, ojoY - 1, 3, 1, PAL.ink); r(c, hx + 1, ojoY + 2, 3, 1, PAL.ink); r(c, hx + 4, ojoY + 2, 3, 1, PAL.ink); r(c, hx + 1, ojoY, 1, 2, PAL.ink); r(c, hx + 6, ojoY, 1, 2, PAL.ink); }
      else r(c, dir === 1 ? hx : hx + 5, ojoY - 1, 3, 4, "rgba(29,22,38,0.55)");
    }
    if (p.cejas && dir === 0) { r(c, hx + 1, ojoY - 2, 3, 1, p.cejas); r(c, hx + 4, ojoY - 2, 3, 1, p.cejas); }
    if (p.barba) {
      if (p.barbaCorta) { r(c, hx, hy + 6, 8, 3, p.barba); r(c, hx + 1, hy + 9, 6, 1, p.barba); if (dir === 0) r(c, hx + 3, hy + 7, 2, 1, p.piel); }
      else { r(c, hx, hy + 5, 8, 4, p.barba); r(c, hx + 1, hy + 9, 6, 2, p.barba); if (dir === 0) r(c, hx + 3, hy + 7, 2, 1, "#7a3b2e"); }
    } else if (dir === 0) {
      if (p.sonrisa) { r(c, hx + 2, hy + 7, 4, 1, "#7a3b2e"); r(c, hx + 2, hy + 6, 1, 1, "#7a3b2e"); r(c, hx + 5, hy + 6, 1, 1, "#7a3b2e"); }
      else r(c, hx + 3, hy + 7, 2, 1, "#9a5544");
    }
  }
  if (dormido && dir !== 3) { r(c, hx + 2, hy + 5, 1, 1, PAL.ink); r(c, hx + 5, hy + 5, 1, 1, PAL.ink); }
}

function pelo(c, p, hx, hy, dir) {
  const col = p.pelo;
  switch (p.peinado) {
    case "calvo":
      r(c, hx + 1, hy - 1, 6, 1, p.piel);
      r(c, hx + 2, hy + 1, 2, 1, "#f8d7bd");
      if (dir === 3) r(c, hx + 3, hy + 2, 2, 1, "#f8d7bd");
      break;
    case "volumen":
      r(c, hx - 1, hy - 2, 10, 4, col); r(c, hx, hy - 3, 7, 1, col);
      if (dir === 3) r(c, hx - 1, hy, 10, 6, col); else { r(c, hx - 1, hy + 2, 1, 3, col); r(c, hx + 8, hy + 2, 1, 3, col); }
      r(c, hx + 1, hy - 2, 3, 1, "#3d2a1f");
      break;
    case "atrasLargo":
      r(c, hx - 1, hy - 2, 10, 4, col);
      r(c, hx - 1, hy + 2, 1, 6, col); r(c, hx + 8, hy + 2, 1, 6, col);
      if (dir === 3) r(c, hx - 1, hy, 10, 9, col);
      r(c, hx + 2, hy - 2, 4, 1, "#33241a");
      break;
    case "corto":
      r(c, hx - 1, hy - 1, 10, 3, col); r(c, hx, hy - 2, 8, 1, col);
      if (dir === 3) r(c, hx - 1, hy, 10, 6, col); else { r(c, hx - 1, hy + 2, 1, 2, col); r(c, hx + 8, hy + 2, 1, 2, col); }
      break;
    case "ralo":
      r(c, hx + 1, hy - 1, 6, 1, p.piel);
      r(c, hx - 1, hy + 1, 2, 4, col); r(c, hx + 7, hy + 1, 2, 4, col);
      r(c, hx + 2, hy - 1, 1, 1, col); r(c, hx + 4, hy - 2, 2, 1, col); r(c, hx + 6, hy - 1, 1, 1, col);
      if (dir === 3) r(c, hx - 1, hy + 2, 10, 4, col);
      break;
    case "dueno":
      r(c, hx - 1, hy - 2, 10, 4, col); r(c, hx + 6, hy + 2, 2, 1, col);
      if (dir === 3) r(c, hx - 1, hy, 10, 6, col); else { r(c, hx - 1, hy + 2, 1, 3, col); r(c, hx + 8, hy + 2, 1, 3, col); }
      break;
  }
}

// ---------------------------------------------------------------- retratos (diálogo), 40x40
export function dibujarRetrato(c, id, t = 0, hablando = false) {
  const p = PERSONAJES[id];
  c.clearRect(0, 0, 40, 40);
  r(c, 0, 0, 40, 40, "#2b2238");
  r(c, 0, 30, 40, 10, "#241c30");
  // hombros
  const hw = p.ancho ? 34 : 30, hx = (40 - hw) / 2;
  r(c, hx, 31, hw, 9, p.saco || p.camisa);
  r(c, hx + 2, 29, hw - 4, 2, p.saco || p.camisa);
  if (p.saco) { r(c, 16, 29, 8, 11, p.camisa); r(c, 15, 30, 2, 10, "rgba(0,0,0,0.25)"); r(c, 23, 30, 2, 10, "rgba(0,0,0,0.25)"); if (p.corbata) { r(c, 19, 30, 2, 2, p.corbata); r(c, 18, 32, 4, 8, p.corbata); } }
  if (p.capucha) { r(c, 13, 29, 14, 3, "#2f6e44"); r(c, 17, 32, 1, 5, "#e8e8e8"); r(c, 22, 32, 1, 5, "#e8e8e8"); }
  if (id === "gadzhi") { r(c, 16, 30, 8, 1, PAL.amarillo); r(c, 19, 31, 2, 1, PAL.amarillo); }
  // cuello
  r(c, 17, 25, 6, 6, p.pielSombra);
  // cara
  r(c, 11, 8, 18, 19, p.piel);
  r(c, 12, 7, 16, 1, p.piel); r(c, 12, 27, 16, 1, p.piel); r(c, 14, 28, 12, 1, p.pielSombra);
  r(c, 10, 14, 1, 6, p.piel); r(c, 29, 14, 1, 6, p.piel);
  r(c, 9, 15, 1, 4, p.pielSombra); r(c, 30, 15, 1, 4, p.pielSombra);
  // pelo
  const col = p.pelo;
  switch (p.peinado) {
    case "calvo": r(c, 13, 6, 14, 2, p.piel); r(c, 15, 8, 5, 2, "#f8d7bd"); r(c, 11, 12, 1, 3, p.pielSombra); r(c, 28, 12, 1, 3, p.pielSombra); break;
    case "volumen": r(c, 10, 3, 20, 7, col); r(c, 12, 2, 15, 1, col); r(c, 10, 10, 2, 6, col); r(c, 28, 10, 2, 6, col); r(c, 14, 3, 8, 2, "#3d2a1f"); r(c, 12, 10, 4, 1, col); break;
    case "atrasLargo": r(c, 10, 4, 20, 6, col); r(c, 9, 8, 2, 14, col); r(c, 29, 8, 2, 14, col); r(c, 14, 4, 10, 1, "#33241a"); r(c, 12, 10, 2, 2, col); r(c, 26, 10, 2, 2, col); break;
    case "corto": r(c, 10, 5, 20, 5, col); r(c, 11, 4, 18, 1, col); r(c, 10, 10, 2, 5, col); r(c, 28, 10, 2, 5, col); r(c, 13, 10, 6, 1, col); break;
    case "ralo": r(c, 13, 6, 14, 2, p.piel); r(c, 9, 10, 3, 8, col); r(c, 28, 10, 3, 8, col); r(c, 15, 6, 2, 1, col); r(c, 19, 5, 3, 1, col); r(c, 24, 6, 2, 1, col); r(c, 10, 8, 2, 3, col); r(c, 28, 8, 2, 3, col); break;
    case "dueno": r(c, 10, 3, 20, 7, col); r(c, 10, 10, 2, 5, col); r(c, 28, 10, 2, 5, col); r(c, 20, 10, 6, 2, col); break;
  }
  // cejas
  const ceja = p.cejas || (col || "#6b4a35");
  r(c, 13, 13, 5, 1, ceja); r(c, 22, 13, 5, 1, ceja);
  if (p.cejas) { r(c, 13, 12, 5, 1, ceja); r(c, 22, 12, 5, 1, ceja); }
  // ojos (parpadeo)
  const parpadeo = Math.floor(t / 100) % 40 === 0;
  if (parpadeo) { r(c, 14, 16, 4, 1, PAL.ink); r(c, 22, 16, 4, 1, PAL.ink); }
  else { r(c, 14, 15, 4, 3, "#ffffff"); r(c, 22, 15, 4, 3, "#ffffff"); r(c, 15, 15, 2, 3, PAL.ink); r(c, 23, 15, 2, 3, PAL.ink); r(c, 15, 15, 1, 1, "#ffffff"); r(c, 23, 15, 1, 1, "#ffffff"); }
  if (p.gafas) {
    r(c, 12, 13, 7, 1, PAL.ink); r(c, 21, 13, 7, 1, PAL.ink); r(c, 12, 19, 7, 1, PAL.ink); r(c, 21, 19, 7, 1, PAL.ink);
    r(c, 12, 13, 1, 7, PAL.ink); r(c, 18, 13, 1, 7, PAL.ink); r(c, 21, 13, 1, 7, PAL.ink); r(c, 27, 13, 1, 7, PAL.ink); r(c, 19, 15, 2, 1, PAL.ink);
    r(c, 10, 15, 2, 1, PAL.ink); r(c, 28, 15, 2, 1, PAL.ink);
  }
  // nariz
  r(c, 19, 17, 2, 4, p.pielSombra); r(c, 18, 20, 4, 1, p.pielSombra);
  // boca
  const abre = hablando && Math.floor(t / 110) % 2;
  if (p.barba) {
    const corta = p.barbaCorta;
    r(c, 11, corta ? 20 : 19, 18, corta ? 7 : 8, p.barba); r(c, 13, 27, 14, corta ? 1 : 3, p.barba);
    if (!corta) r(c, 11, 15, 2, 5, p.barba), r(c, 27, 15, 2, 5, p.barba);
    r(c, 16, 22, 8, abre ? 3 : 1, abre ? "#5a1f1f" : "#7a3b2e");
    r(c, 15, 20, 10, 1, p.barba);
  } else if (p.sonrisa) {
    r(c, 15, 22, 10, abre ? 3 : 2, "#7a3b2e"); r(c, 16, 22, 8, 1, "#ffffff"); r(c, 14, 21, 1, 1, "#7a3b2e"); r(c, 25, 21, 1, 1, "#7a3b2e");
  } else {
    r(c, 16, 23, 8, abre ? 2 : 1, abre ? "#5a1f1f" : "#9a5544");
  }
  if (id === "buffett") { r(c, 13, 21, 1, 3, p.pielSombra); r(c, 26, 21, 1, 3, p.pielSombra); }
  if (id === "wickman") r(c, 14, 24, 12, 1, p.pielSombra);
}
