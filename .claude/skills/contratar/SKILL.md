---
name: contratar
description: Carga el negocio del usuario en Órbita para que los empleados trabajen sobre él. Úsala cuando escriba /contratar, "quiero cargar mi negocio", "configura la oficina", "cambia el negocio", "empieza de cero", o cuando /oficina detecte que la oficina sigue con el negocio de ejemplo. Hace unas pocas preguntas, investiga lo que pueda por su cuenta y deja lista la carpeta negocio/ y la oficina con los cinco puestos.
argument-hint: "[nombre del negocio, link de Instagram o web]"
---

# Contratar: cargar tu negocio

Objetivo: en unos minutos y con pocas preguntas, dejar `negocio/` completo y la oficina lista. El dueño de un negocio pequeño no tiene tiempo: pregunta solo lo que no puedas averiguar.

## 1. Lo que ya se puede saber

- Si el usuario pasó un link (Instagram, web, Google Maps) o el nombre y la ciudad, investiga primero con WebFetch y WebSearch: qué vende, precios visibles, horarios, barrio, cómo escribe en redes, colores del logo, reseñas. Anota de dónde sacaste cada cosa.
- Si `negocio/` ya existe, léelo: es un cambio, no un arranque. Pregunta solo qué cambió.

## 2. Preguntas (una sola tanda)

Pide en un solo mensaje lo que falte de esta lista, en lenguaje simple y con un ejemplo en cada una. Acepta respuestas cortas y desordenadas.

1. Nombre del negocio, ciudad y barrio, y tu nombre (para firmar los mensajes).
2. Qué vendes y a qué precio (los 3 a 5 productos o servicios principales).
3. A quién le quieres vender más (por ejemplo: "cafeterías que compren pan al por mayor", "mamás del barrio", "empresas de 10 a 50 personas").
4. Tu Instagram o web, y 2 o 3 negocios que consideres tu competencia.
5. Cómo le hablas a tus clientes (de tú o de usted, serio o cercano) y alguna palabra que nunca usarías.
6. Opcional: tu logo (la ruta de la imagen), tu lista de clientes y tus ingresos y gastos (abajo está el formato; puede ser un Excel o un CSV, o pegarlos aquí).

Si con la investigación ya tienes alguna, confírmala en vez de preguntarla ("Vi en tu Instagram que vendes X a $Y, ¿sigue así?").

## 3. Escribir `negocio/`

- `negocio/negocio.json`: `{ "nombre", "dueno", "ciudad", "pais", "moneda", "sector", "logo" }`. `moneda` en código (COP, MXN, PEN, CLP, USD). `logo` es el nombre del archivo copiado dentro de `negocio/` (si no hay, no pongas la clave).
- `negocio/perfil.md`: qué vende y a qué precio, horarios, ubicación, equipo, canales de venta, colores de marca, y lo que encontraste investigando con su fuente.
- `negocio/cliente-ideal.md`: a quién le vende más hoy, a quién quiere venderle, qué le duele a ese cliente, dónde se encuentra (barrios, redes, lugares).
- `negocio/voz.md`: tú o usted, tono, palabras que sí y que no, dos o tres ejemplos de cómo escribe (de sus redes si los hay).
- `negocio/competencia.md`: cada competidor con su Instagram o web y qué hace bien.
- `negocio/contactos.csv` (si dio clientes): `nombre,telefono,instagram,etapa,ultimo_contacto,nota`. Etapa: Nuevo, Contactado, Cotización enviada o Cliente. Fecha en AAAA-MM-DD.
- `negocio/finanzas.csv` (si dio números): `fecha,tipo,concepto,producto,monto`. Tipo: ingreso o gasto. Monto sin puntos ni símbolos.

Si viene un Excel, conviértelo a CSV leyendo sus columnas; si no puedes leerlo, pídele que lo exporte como CSV. Lo que el dueño no dio, no lo inventes: deja el archivo sin crear y dile qué puesto lo va a extrañar (Operaciones sin contactos, Finanzas sin números).

## 4. Abrir la oficina

1. Avisa en una línea que esto reemplaza la oficina de ejemplo.
2. `node app/scripts/oficina.mjs iniciar`.
3. Dile cómo verla: `npm start` en otra terminal y http://localhost:4740. Mientras esa terminal esté abierta, cada empleado trabaja solo en su horario (y si el computador estaba apagado a la hora, recupera el turno al prender, hasta 12 horas después). Cada turno gasta de su plan de Claude, unos minutos por puesto.
4. Cierra con el siguiente paso, en una frase: "Escribe `/oficina ronda` y los cinco se ponen a trabajar en tu negocio (tarda unos minutos), o pídele algo a uno, por ejemplo `/oficina ventas búscame clientes`."

## Reglas

- Nada de datos inventados en `negocio/`. Lo supuesto se marca como supuesto.
- Los datos del negocio se quedan en este computador: no los mandes a ningún servicio fuera de las búsquedas necesarias, y nunca pongas teléfonos o datos de clientes en una búsqueda web.
