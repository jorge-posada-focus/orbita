// Fondo de galaxia: nebulosas, un brazo espiral que gira muy despacio, estrellas
// lejanas fijas y estrellas cercanas que titilan, más alguna estrella fugaz.
// Las capas se mueven distinto cuando arrastras la oficina o mueves el mouse
// (paralaje), para que se sienta profundidad. En cuadraditos, como el pixel art.
//
// Para que no pese: lo que casi no cambia (nebulosas, espiral, estrellas lejanas)
// se dibuja una sola vez en imágenes aparte y en cada cuadro solo se pegan;
// cuadro a cuadro solo se dibujan las estrellas que titilan.
import { camara } from "./mover.js";

const lienzo = document.getElementById("galaxia");
const g = lienzo.getContext("2d");
const PX = 2;
const COLORES = ["#ffffff", "#dfe6ff", "#b8c8ff", "#c9b5ff", "#ffe2b8", "#9fdcff"];
let W = 0, H = 0, semilla = 11;
let imgNebulosa, imgEspiral, imgLejanas, titilan = [], fugaz = null, proximaFugaz = 0;
const azar = () => ((semilla = (semilla * 16807) % 2147483647) / 2147483647);
const lienzoNuevo = (w, h) => { const c = document.createElement("canvas"); c.width = Math.max(1, Math.round(w)); c.height = Math.max(1, Math.round(h)); return c; };
const cuadrito = (c, x, y, t) => c.fillRect(Math.round(x / PX) * PX, Math.round(y / PX) * PX, t * PX, t * PX);

function armar() {
  const dpr = Math.min(1.5, devicePixelRatio || 1);
  W = innerWidth; H = innerHeight;
  lienzo.width = Math.round(W * dpr); lienzo.height = Math.round(H * dpr);
  g.setTransform(dpr, 0, 0, dpr, 0, 0);
  semilla = 11;
  const area = (W * H) / 10000;

  // nebulosas: a un cuarto de resolución y suavizadas al ampliarlas
  imgNebulosa = lienzoNuevo(W / 4, H / 4);
  const n = imgNebulosa.getContext("2d");
  n.fillStyle = "#05061a"; n.fillRect(0, 0, W / 4, H / 4);
  for (const [x, y, r, [R, G, B]] of [[0.22, 0.3, 0.42, [107, 63, 209]], [0.78, 0.68, 0.46, [43, 84, 232]], [0.62, 0.18, 0.3, [190, 70, 170]], [0.3, 0.82, 0.34, [40, 160, 190]]]) {
    const cx = (x * W) / 4, cy = (y * H) / 4, rr = (r * Math.max(W, H)) / 4;
    const gr = n.createRadialGradient(cx, cy, 0, cx, cy, rr);
    gr.addColorStop(0, `rgba(${R},${G},${B},0.24)`); gr.addColorStop(0.5, `rgba(${R},${G},${B},0.08)`); gr.addColorStop(1, `rgba(${R},${G},${B},0)`);
    n.fillStyle = gr; n.fillRect(0, 0, W / 4, H / 4);
  }

  // núcleo de la galaxia: un resplandor detrás del logo del negocio
  const nc = n.createRadialGradient(W / 8, H / 8, 0, W / 8, H / 8, Math.max(W, H) / 10);
  nc.addColorStop(0, "rgba(200,190,255,0.28)"); nc.addColorStop(0.35, "rgba(140,120,255,0.12)"); nc.addColorStop(1, "rgba(140,120,255,0)");
  n.fillStyle = nc; n.fillRect(0, 0, W / 4, H / 4);

  // brazo espiral: dos brazos de polvo de estrellas, dibujados una vez y luego rotados
  const R = Math.max(W, H) * 0.7;
  imgEspiral = lienzoNuevo(R * 2, R * 2);
  const e = imgEspiral.getContext("2d");
  for (let i = 0; i < area * 16; i++) {
    const brazo = i % 2, f = Math.pow(azar(), 0.7);
    const ang = f * Math.PI * 3.2 + brazo * Math.PI + (azar() - 0.5) * 0.9 * (1 - f * 0.5);
    const d = (azar() - 0.5) * 40 * (0.3 + f), r = 30 + f * R * 0.95;
    e.globalAlpha = 0.3 + (1 - f) * 0.6 * azar();
    e.fillStyle = azar() < 0.5 ? "#b9a6ff" : "#9cc2ff";
    cuadrito(e, R + Math.cos(ang) * r + Math.cos(ang + 1.57) * d, R + Math.sin(ang) * r + Math.sin(ang + 1.57) * d, 1);
  }

  // estrellas lejanas: fijas, en una imagen que se repite como mosaico
  imgLejanas = lienzoNuevo(W, H);
  const l = imgLejanas.getContext("2d");
  for (let i = 0; i < area * 8; i++) {
    l.globalAlpha = 0.2 + azar() * 0.45;
    l.fillStyle = COLORES[Math.floor(azar() * COLORES.length)];
    cuadrito(l, azar() * W, azar() * H, 1);
  }

  // estrellas que titilan, en dos profundidades
  titilan = [];
  for (const [cuantas, tam, par, brillo] of [[area * 2.4, [1, 2], 0.2, 0.85], [area * 0.7, [2, 3], 0.38, 1]]) {
    for (let i = 0; i < cuantas; i++) titilan.push({
      x: azar() * W, y: azar() * H, par, brillo,
      t: tam[0] + Math.floor(azar() * (tam[1] - tam[0] + 1)),
      color: COLORES[Math.floor(azar() * COLORES.length)],
      fase: azar() * Math.PI * 2, vel: 0.6 + azar() * 2.2,
      cruz: tam[1] >= 3 && azar() < 0.3,
    });
  }
  titilan.sort((a, b) => (a.color < b.color ? -1 : 1)); // menos cambios de color al dibujar
}

const envolver = (v, m) => ((v % m) + m) % m;
function mosaico(img, dx, dy) {
  const x = envolver(dx, W), y = envolver(dy, H);
  for (const ox of [x - W, x]) for (const oy of [y - H, y]) g.drawImage(img, ox, oy, W, H);
}

let costo = 0; // ms promedio por cuadro, para revisar en la consola: oficina.costoGalaxia()
export const costoGalaxia = () => costo.toFixed(1);
function pintar(ms) {
  const t0 = performance.now();
  const s = ms / 1000;
  g.globalAlpha = 1;
  g.imageSmoothingEnabled = true;
  g.drawImage(imgNebulosa, camara.x * 0.04 - 20, camara.y * 0.04 - 20, W + 40, H + 40);
  g.imageSmoothingEnabled = false;

  // espiral girando despacio detrás de la oficina
  g.save();
  g.translate(W / 2 + camara.x * 0.12, H / 2 + camara.y * 0.12);
  g.scale(1, 0.55);
  g.rotate(s * 0.012);
  g.drawImage(imgEspiral, -imgEspiral.width / 2, -imgEspiral.height / 2);
  g.restore();

  mosaico(imgLejanas, camara.x * 0.08 + s * 0.8, camara.y * 0.08);

  // las que titilan
  let color = null;
  for (const e of titilan) {
    const x = envolver(e.x + camara.x * e.par + s * 4 * e.par, W), y = envolver(e.y + camara.y * e.par, H);
    const tit = 0.5 + 0.5 * Math.sin(s * e.vel + e.fase);
    if (e.color !== color) { color = e.color; g.fillStyle = color; }
    g.globalAlpha = e.brillo * (0.2 + 0.8 * tit * tit);
    cuadrito(g, x, y, e.t);
    if (e.cruz && tit > 0.8) {
      const l = Math.round((tit - 0.8) * 5 * 3) * PX;
      g.globalAlpha *= 0.55;
      const bx = Math.round(x / PX) * PX, by = Math.round(y / PX) * PX;
      g.fillRect(bx - l, by + PX, e.t * PX + l * 2, PX);
      g.fillRect(bx + PX, by - l, PX, e.t * PX + l * 2);
    }
  }

  // estrella fugaz de vez en cuando
  if (!fugaz && ms > proximaFugaz) {
    const izq = Math.random() < 0.5;
    fugaz = { x: izq ? Math.random() * W * 0.5 : W * (0.5 + Math.random() * 0.5), y: Math.random() * H * 0.4, vx: (izq ? 1 : -1) * (520 + Math.random() * 300), vy: 220 + Math.random() * 160, t0: ms, dur: 900 + Math.random() * 500 };
  }
  if (fugaz) {
    const k = (ms - fugaz.t0) / fugaz.dur;
    if (k >= 1) { fugaz = null; proximaFugaz = ms + 5000 + Math.random() * 9000; }
    else {
      const x = fugaz.x + fugaz.vx * k * (fugaz.dur / 1000), y = fugaz.y + fugaz.vy * k * (fugaz.dur / 1000);
      g.fillStyle = "#ffffff";
      for (let i = 0; i < 14; i++) {
        const f = i / 14;
        g.globalAlpha = (1 - f) * Math.sin(k * Math.PI);
        cuadrito(g, x - fugaz.vx * 0.04 * f, y - fugaz.vy * 0.04 * f, i < 2 ? 2 : 1);
      }
    }
  }
  g.globalAlpha = 1;
  costo = costo * 0.9 + (performance.now() - t0) * 0.1;
  requestAnimationFrame(pintar);
}

let espera;
addEventListener("resize", () => { clearTimeout(espera); espera = setTimeout(armar, 150); });
armar();
proximaFugaz = performance.now() + 2500;
requestAnimationFrame(pintar);
