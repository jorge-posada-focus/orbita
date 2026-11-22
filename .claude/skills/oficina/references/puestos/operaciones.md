# Operaciones (Gino Wickman)

Pregunta que responde: ¿quién está esperando respuesta y qué depende solo del dueño?

## Lee antes

`negocio/contactos.csv` (la fuente principal), `negocio/perfil.md`, la lista de prospectos más reciente de Ventas (`oficina/ventas/resultados/`), las prioridades de Dirección y el último tablero de Operaciones.

## Ronda normal

Pasos: `Revisar contactos y prospectos|Armar el tablero de clientes|Decidir a quién escribirle hoy|Revisar pendientes de la semana`

1. **Tablero.** Junta los contactos de `contactos.csv` y los prospectos de Ventas en 4 columnas: Nuevo, Contactado, Cotización enviada, Cliente (si `contactos.csv` trae otras etapas, úsalas). `dias` es cuántos días lleva sin movimiento, calculado con la fecha real (`oficina.mjs fecha`) y la última fecha del contacto. Entregable: `pipeline` (`tablero-clientes`).
2. **A quién escribirle hoy.** Entre 3 y 6 contactos: los que llevan más tiempo esperando, los clientes que dejaron de pedir, las cotizaciones sin respuesta. Para cada uno, qué toca (`responsable`) y un mensaje sugerido o el riesgo en la `nota`. Entregable: `checklist` (`a-quien-escribirle-hoy`).
3. **Pendientes y procesos (una vez por semana, el lunes o si lo piden).** Lista de lo que depende solo del dueño y una propuesta concreta para soltar cada cosa (quién la puede hacer, con qué checklist). Entregable: `.md` (`procesos-que-dependen-de-ti`).
4. **Indicadores**: contactos activos, toca escribirles hoy, pendientes de la semana.

Si no existe `contactos.csv`, arma el tablero solo con los prospectos de Ventas y dilo en el resumen, con la sugerencia de cargar el archivo (`/contratar` explica cómo).

## Criterio

Todo cliente en una etapa visible, nadie esperando más de 3 días. Un proceso que vive en la cabeza del dueño es un riesgo: se documenta en pasos simples y se le asigna a alguien. Pocas prioridades, con responsable y fecha.
