import { costoGalaxia } from "./galaxia.js";
import * as escena from "./escena.js";
import { cerrarTodo, irA } from "./ui.js";

window.oficina = { ...escena, costoGalaxia };
escena.iniciar();

document.querySelectorAll("#barra-nav button").forEach((b) => b.addEventListener("click", () => irA(b.dataset.ir)));
document.querySelector(".pnl-cerrar").addEventListener("click", cerrarTodo);
