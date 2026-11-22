// Mover la oficina: arrastrar con el mouse (o el dedo), acercar con la rueda,
// doble clic en el vacío para volver al centro. Mientras no la arrastras, la
// oficina se inclina apenas hacia el cursor. La galaxia lee esta misma cámara
// para moverse en paralaje.
export const camara = { x: 0, y: 0, s: 1 };

const escena = document.getElementById("escena");
const mundo = document.getElementById("mundo");
const objetivo = { x: 0, y: 0, s: 1 };
const raton = { x: 0, y: 0 };
let arrastre = null, inercia = { x: 0, y: 0 }, recienArrastro = false;

const hayVentana = () => !document.getElementById("dialogo").hidden || !document.getElementById("panel").hidden;
const limites = () => { const r = escena.getBoundingClientRect(); return { x: r.width * (0.18 + (objetivo.s - 1) * 0.5), y: r.height * (0.18 + (objetivo.s - 1) * 0.5) }; };
const sujetar = () => { const l = limites(); objetivo.x = Math.max(-l.x, Math.min(l.x, objetivo.x)); objetivo.y = Math.max(-l.y, Math.min(l.y, objetivo.y)); };

document.addEventListener("pointerdown", (e) => {
  if (e.button !== 0 || hayVentana() || e.target.closest(".hud, .barra-nav, .mision, .logro, #dialogo, #panel, #toast-simple")) return;
  arrastre = { id: e.pointerId, x0: e.clientX, y0: e.clientY, ox: objetivo.x, oy: objetivo.y, ux: e.clientX, uy: e.clientY, ut: performance.now(), movio: false };
  inercia = { x: 0, y: 0 };
});
addEventListener("pointermove", (e) => {
  raton.x = e.clientX / innerWidth - 0.5; raton.y = e.clientY / innerHeight - 0.5;
  if (!arrastre || e.pointerId !== arrastre.id) return;
  const dx = e.clientX - arrastre.x0, dy = e.clientY - arrastre.y0;
  if (!arrastre.movio && Math.hypot(dx, dy) > 5) { arrastre.movio = true; document.body.classList.add("arrastrando"); }
  if (!arrastre.movio) return;
  objetivo.x = arrastre.ox + dx; objetivo.y = arrastre.oy + dy; sujetar();
  const ahora = performance.now(), dt = Math.max(1, ahora - arrastre.ut);
  const tope = (v) => Math.max(-14, Math.min(14, v));
  inercia = { x: tope(((e.clientX - arrastre.ux) / dt) * 16), y: tope(((e.clientY - arrastre.uy) / dt) * 16) };
  arrastre.ux = e.clientX; arrastre.uy = e.clientY; arrastre.ut = ahora;
});
const soltar = (e) => {
  if (!arrastre || (e.pointerId !== undefined && e.pointerId !== arrastre.id)) return;
  recienArrastro = arrastre.movio;
  arrastre = null;
  document.body.classList.remove("arrastrando");
  setTimeout(() => (recienArrastro = false), 0);
};
addEventListener("pointerup", soltar);
addEventListener("pointercancel", soltar);
// si arrastraste, el clic que viene al soltar no abre la oficina que quedó debajo
escena.addEventListener("click", (e) => { if (recienArrastro) { e.stopPropagation(); e.preventDefault(); } }, true);

document.addEventListener("wheel", (e) => {
  if (hayVentana()) return;
  e.preventDefault();
  const r = escena.getBoundingClientRect();
  const px = e.clientX - (r.left + r.width / 2), py = e.clientY - (r.top + r.height / 2);
  const s0 = objetivo.s, s1 = Math.max(0.8, Math.min(1.5, s0 * Math.exp(-Math.sign(e.deltaY) * Math.min(Math.abs(e.deltaY), 100) * 0.0009)));
  // acerca hacia donde está el cursor
  objetivo.x = px - ((px - objetivo.x) * s1) / s0;
  objetivo.y = py - ((py - objetivo.y) * s1) / s0;
  objetivo.s = s1; sujetar();
}, { passive: false });

document.addEventListener("dblclick", (e) => {
  if (hayVentana() || e.target.closest("button")) return;
  objetivo.x = 0; objetivo.y = 0; objetivo.s = 1;
});

function bucle() {
  if (!arrastre && (Math.abs(inercia.x) > 0.05 || Math.abs(inercia.y) > 0.05)) {
    objetivo.x += inercia.x; objetivo.y += inercia.y; sujetar();
    inercia.x *= 0.92; inercia.y *= 0.92;
  }
  // inclinación suave hacia el cursor cuando nadie arrastra
  const tx = objetivo.x + (arrastre || hayVentana() ? 0 : -raton.x * 18);
  const ty = objetivo.y + (arrastre || hayVentana() ? 0 : -raton.y * 12);
  const k = arrastre ? 0.5 : 0.12;
  camara.x += (tx - camara.x) * k; camara.y += (ty - camara.y) * k; camara.s += (objetivo.s - camara.s) * 0.15;
  mundo.style.transform = `translate(${camara.x.toFixed(1)}px, ${camara.y.toFixed(1)}px) scale(${camara.s.toFixed(3)}) perspective(1200px) rotateX(${(raton.y * -3).toFixed(2)}deg) rotateY(${(raton.x * 4).toFixed(2)}deg)`;
  requestAnimationFrame(bucle);
}
requestAnimationFrame(bucle);
