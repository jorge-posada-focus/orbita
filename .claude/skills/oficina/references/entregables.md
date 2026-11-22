# Formatos de entregables

Todo entregable va en `oficina/<puesto>/resultados/` con la ruta que da `oficina.mjs archivo`. Dos opciones:

- **`.md`**: un documento (una decisión, una oferta, un análisis de precios). Empieza con `# Título`. Usa `##`, listas, **negritas** y tablas con `|`.
- **`.json`**: `{ "tipo", "titulo", "resumen", "datos" }`. La página lo dibuja como algo visual según el `tipo`.

Reglas para todos:

- Español, con la voz del negocio cuando el texto lo va a leer un cliente (posts, mensajes). Revisa `negocio/voz.md`.
- `resumen`: una o dos frases que dicen la conclusión, no lo que hiciste ("Lo que más se ve es el proceso, no el producto", no "Analicé 6 cuentas").
- Nada de guiones largos (—). El validador los rechaza.
- Cifras en la moneda del negocio (`negocio/negocio.json`), con separador de miles local.
- Datos inventados nunca. Si un dato no se pudo encontrar, déjalo vacío y dilo en el resumen. Si trabajas con supuestos (porque el dueño no cargó sus números), dilo en el resumen: "Con números supuestos; carga finanzas.csv para el real".

## posts

Posts listos para publicar. La página dibuja la imagen de cada uno (fondo, ícono, titular) y pone botón de copiar.

```json
{
  "tipo": "posts",
  "titulo": "5 posts listos, semana 48",
  "resumen": "Uno por día. La idea de la semana: que se antoje. Nada de promociones todavía.",
  "datos": [
    {
      "dia": "Lunes",
      "formato": "Reel",
      "imagen": { "fondo": "#2b1a12", "acento": "#f1a33b", "titular": "5:00 a. m.", "sub": "la hora en que sale el primer pan", "icono": "horno" },
      "copy": "Mientras Medellín duerme, aquí ya huele a pan...",
      "hashtags": "#PanaderiaLaEspiga #Laureles"
    }
  ]
}
```

- `formato`: Reel, Carrusel, Post, Historia o Anuncio.
- `imagen.fondo` y `imagen.acento`: colores `#rrggbb` con buen contraste entre sí.
- `imagen.titular`: 1 a 3 palabras. `imagen.sub`: una línea corta.
- `imagen.icono`: uno de `estrella, corazon, reloj, chat, bolsa, regalo, grafica, megafono, casa, check, cafe, rayo, sol, pregunta, horno, pandebono, torta`.
- En un Reel, el `copy` es el texto del post; si hace falta guion del video, va en un `.md` aparte.

## calendario

```json
{ "tipo": "calendario", "titulo": "Plan de contenido, semana 48", "resumen": "...",
  "datos": [ { "dia": "Lun 23", "formato": "Reel", "tema": "El horno a las 5 de la mañana", "porque": "Formato que más le rinde a la competencia (3,4x su promedio)", "estado": "listo" } ] }
```

`estado`: `listo` o `pendiente`. `formato` puede ser también `Descanso`.

## competencia

```json
{ "tipo": "competencia", "titulo": "Lo que le funcionó a la competencia, semana 47", "resumen": "...",
  "datos": [ { "cuenta": "@panaderiadelparque", "seguidores": 18400, "mejor": "Video del horno abriéndose a las 5 a. m.", "vistas": 41200, "promedio": 12100, "porque": "La gente comenta \"huele hasta acá\"" } ] }
```

`seguidores`, `vistas` y `promedio` son números (promedio de vistas de la cuenta, mayor que 0). La página ordena por vistas sobre promedio. Solo cifras que viste en una fuente; si no las encontraste, no metas esa cuenta.

## prospectos

```json
{ "tipo": "prospectos", "titulo": "12 cafeterías que podrían comprarte", "resumen": "...",
  "datos": [ { "nombre": "Café Molienda", "barrio": "Laureles", "telefono": "300 000 0101", "instagram": "@cafemolienda", "porque": "Abrió hace 3 meses y busca proveedor", "estado": "mensaje listo", "mensaje": "Hola, soy de ..." } ] }
```

`estado`: `nuevo`, `mensaje listo`, `contactado` o `respondió`. `barrio`, `telefono` e `instagram` son texto, vacío si no se encontró. Opcionales: `direccion` y `fuente` (de dónde salió el contacto: "su web", "Google Maps", "portal de reservas, confirmar"). Si el teléfono no salió de la página del propio negocio, dilo en `fuente`. Cada prospecto lleva su primer mensaje escrito para él, no una plantilla con el nombre cambiado.

## pipeline

```json
{ "tipo": "pipeline", "titulo": "Tablero de clientes", "resumen": "...",
  "datos": [ { "columna": "Nuevo", "items": [ { "nombre": "Granos del Valle", "detalle": "Cafetería · mensaje listo", "dias": 0 } ] } ] }
```

`dias`: días sin movimiento (número). Más de 3 sale en rojo.

## checklist

```json
{ "tipo": "checklist", "titulo": "Prioridades de la semana 47", "resumen": "...",
  "datos": [ { "texto": "Cerrar dos cafeterías como clientes mayoristas", "responsable": "Ventas · Hormozi", "estado": "en curso", "nota": "Hay 12 prospectos y una oferta lista." } ] }
```

`estado`: `pendiente`, `en curso` o `hecho`. La primera prioridad de Dirección que no esté hecha sale como "Misión de la semana" en la oficina.

## finanzas

```json
{ "tipo": "finanzas", "titulo": "Reporte semanal, semana 47", "resumen": "...",
  "datos": {
    "semanas": [ { "s": "S46", "ventas": 4510000, "gastos": 3700000 }, { "s": "S47", "ventas": 4820000, "gastos": 3960000 } ],
    "productos": [ { "nombre": "Tortas por encargo", "ventas": 22, "ganancia": 41 } ],
    "alertas": [ { "nivel": "alta", "texto": "El queso subió 18 % en un mes..." } ]
  } }
```

- `semanas`: hasta 8, la más reciente al final. Números enteros.
- `productos`: `ventas` y `ganancia` son porcentajes del total (cada columna suma cerca de 100). Lista vacía si no hay datos por producto.
- `alertas`: `nivel` es `alta`, `media` u `ok`.
