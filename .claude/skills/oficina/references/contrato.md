# Contrato de archivos de la oficina

La página (`npm start`, http://localhost:4740) no llama a ninguna IA: lee la carpeta `oficina/` cada pocos segundos y muestra lo que encuentra. Los empleados trabajan en Claude Code y dejan archivos con este formato. Si el formato se rompe, el empleado desaparece o el entregable no se ve.

## Dónde vive cada cosa

```
negocio/                 lo que cargó el dueño con /contratar (solo se lee)
  negocio.json           nombre, dueno, ciudad, pais, moneda, sector, logo
  perfil.md              qué vende, a quién, precios, horarios, equipo
  cliente-ideal.md       a quién le quiere vender más
  voz.md                 cómo habla el negocio, palabras que sí y que no
  competencia.md         negocios parecidos y sus redes
  contactos.csv          (opcional) clientes y prospectos
  finanzas.csv           (opcional) ingresos y gastos

oficina/
  negocio.json           copia que usa la página
  <puesto>/
    puesto.json          quién es y qué hace (no se toca)
    estado.json          estado, tarea, pasos, bitácora en vivo, indicadores
    historial.jsonl      una línea por evento
    resultados/          entregables: AAAA-MM-DD-slug.json o .md
```

Puestos: `direccion`, `marketing`, `ventas`, `operaciones`, `finanzas`.

## Regla de oro

`estado.json` e `historial.jsonl` **solo se cambian con el script**, nunca a mano:

```bash
node app/scripts/oficina.mjs fecha                                   # fecha y hora reales
node app/scripts/oficina.mjs empezar ventas "Buscar cafeterías en Laureles" "Buscar|Descartar las que no encajan|Sacar contactos|Escribir mensajes"
node app/scripts/oficina.mjs nota ventas "Encontré 23 cafeterías con buenas reseñas"
node app/scripts/oficina.mjs paso ventas 1
node app/scripts/oficina.mjs archivo ventas "cafeterias que podrian comprarte" json   # imprime la ruta del entregable
node app/scripts/oficina.mjs indicadores ventas '[{"etiqueta":"Prospectos en la lista","valor":"12","nota":"+17 por revisar"}]'
node app/scripts/oficina.mjs terminar ventas                         # valida y anota "Entregó: ..." en el historial
```

- `empezar` pone al empleado a trabajar en la oficina (burbuja, barra de progreso).
- `nota` es lo que el dueño ve en la bitácora en vivo: escribe notas concretas y cortas mientras trabajas, como un empleado que cuenta lo que va haciendo ("Descarté 6 que ya hornean su propio pan"), no "Procesando datos".
- `paso` avanza la barra. Marca cada paso cuando de verdad lo termines.
- `archivo` da la ruta con la fecha de hoy (relativa y absoluta). Escribe ahí el entregable con Write usando la absoluta.
- `indicadores`: máximo 3, los que el dueño querría ver de un vistazo. Valor corto ("12", "$860.000", "Reel"), nota corta.
- `terminar` valida cada entregable nuevo. Si falla, corrige el archivo y vuelve a correrlo. No termines con errores.
- `terminar <puesto> durmiendo` si después de esto el puesto no vuelve a trabajar hasta su horario.

## Si falta algo

Si lo que tu protocolo dice leer no existe (otro puesto todavía no entregó, el dueño no cargó un archivo), sigue con lo que hay y déjalo en una `nota` y en el `resumen`. No esperes ni inventes lo que falta. Si un indicador no se puede calcular, no lo pongas: mejor dos indicadores reales que tres con uno inventado.

## Entregables

Formatos y ejemplos en `entregables.md`. Un entregable es algo que el dueño puede usar ya: copiar y publicar, mandar, decidir. Nunca un informe sobre lo que el empleado haría.
