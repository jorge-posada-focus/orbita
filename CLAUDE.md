# Órbita

Una oficina de cinco empleados de IA para un negocio pequeño. Cada departamento lo lleva un subagente que piensa como un empresario conocido, a partir de su obra pública: Dirección (Jeff Bezos), Marketing (Iman Gadzhi), Ventas (Alex Hormozi), Operaciones (Gino Wickman) y Finanzas (Warren Buffett). Son simulaciones, no las personas.

- `/contratar`: el dueño carga su negocio en `negocio/`. Es lo único que tiene que hacer.
- `/oficina [puesto] [pedido]` o `/oficina ronda`: los empleados trabajan y dejan entregables en `oficina/<puesto>/resultados/`.
- `npm start`: la oficina visual en http://localhost:4740. Lee `oficina/` y avisa a la página en vivo. Mientras está abierta, lanza los turnos de cada puesto a su hora (`programa` en `app/puestos.json`) con `claude -p` (`app/lib/turnos.mjs`), y atiende los encargos y las consultas que el dueño hace desde la página (`app/lib/consultas.mjs`). Si no existe `oficina/`, carga sola el negocio de ejemplo.
- `npm run ejemplo`: vuelve a cargar el negocio de ejemplo (una panadería ficticia).
- `negocio/` y `oficina/` son de cada persona y no van al repo (`.gitignore`).

El contrato de archivos está en `.claude/skills/oficina/references/contrato.md` y los formatos de entregables en `entregables.md`, en la misma carpeta. `estado.json` e `historial.jsonl` se cambian solo con `node app/scripts/oficina.mjs`.

Reglas: nada de datos inventados (prospectos, cifras, números del negocio); nada se manda ni se publica solo; todo en español, sin guiones largos.
