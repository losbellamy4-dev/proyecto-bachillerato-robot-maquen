# Seguridad Vial con micro:bit · App controladora

Web app para controlar desde el móvil, por **Bluetooth Low Energy**, un coche robot **Maqueen** con una **BBC micro:bit v2**.
Todo está en un único archivo: [`index.html`](index.html) (HTML + CSS + JavaScript, sin librerías ni frameworks).

Al abrirla: intro animada (logo 3D → «modo programación» en verde → explosión) → diálogo de bienvenida (guía sí/no, tema, color, vibración) → guía opcional → pantalla de control.

---

## 1. Cómo abrirla

Web Bluetooth **solo funciona en páginas `https://` o en `localhost`**, y en navegadores basados en Chromium.

| Dónde | Navegador | ¿Funciona el Bluetooth? |
|---|---|---|
| Android | Chrome / Edge | ✅ |
| Windows, macOS, ChromeOS | Chrome / Edge | ✅ |
| iPhone / iPad | Safari, Chrome | ❌ → usa la app gratuita **Bluefy** |
| Linux | Chrome | ⚠️ puede requerir activar `chrome://flags/#enable-experimental-web-platform-features` |

### Opción A — GitHub Pages (la más fácil para el móvil)
1. En GitHub, abre el repositorio → **Settings** → **Pages**.
2. En *Build and deployment*: **Source = Deploy from a branch**, rama **`claude/cool-franklin-7ql2xm`** y carpeta **/ (root)** → **Save**.
3. En 1–2 minutos estará en **https://losbellamy4-dev.github.io/proyecto-bachillerato-robot-maquen/**
4. Ábrela en **Chrome del móvil Android** escribiendo esa dirección (no desde WhatsApp, Drive ni el gestor de archivos: ahí no hay Bluetooth). Consejo: menú ⋮ → *Añadir a pantalla de inicio* para abrirla como una app.

> GitHub Pages en repositorios **privados** requiere un plan de pago. Si el repo es privado, hazlo público o usa la opción B.

### Opción B — Servidor local (en el ordenador)
En la carpeta del proyecto:

```bash
python -m http.server 8000      # o bien:  npx serve
```

Abre **http://localhost:8000** en Chrome o Edge del ordenador (que tenga Bluetooth).

> Ojo: abrir `http://192.168.x.x:8000` desde el móvil **no** sirve (no es HTTPS ni localhost). Para el móvil, usa GitHub Pages.

Con doble clic en `index.html` se ve toda la interfaz, pero la conexión Bluetooth puede no estar permitida desde `file://`.

---

## 2. Cómo conectar con el micro:bit, paso a paso

1. Descarga al micro:bit el programa de MakeCode de este repositorio (ver [*Programa del micro:bit*](#programa-del-microbit-makecode)) **con «No Pairing Required»** y enciende el coche (con pilas cargadas). En la pantalla del micro:bit debe salir el **símbolo de Bluetooth**.
2. Activa el **Bluetooth** del móvil (en Android, también la **ubicación**).
3. Abre la app (opción A o B) y pulsa **Conectar coche**. Verás el anillo de radar girando.
4. En la lista, elige **BBC micro:bit [xxxxx]** y pulsa *Emparejar / Conectar*.
5. Destello verde + estado **Conectado** en la cabecera = listo. La app manda `parar` y la velocidad actual para sincronizar, el micro:bit contesta **`listo`** (sale abajo, en *Recibido*) y en su pantalla aparece ✔.
6. Conduce:
   - **Mantén pulsada** una flecha para moverte; al **soltar**, el coche para solo.
   - **PARAR** (botón rojo central) frena siempre al instante.
   - En el ordenador: flechas o WASD (mantener), **Espacio** = parar, **H** = bocina.
7. Para terminar, pulsa **Desconectar** (manda `parar` antes de cortar).

Si se pierde la conexión, la app intenta **reconectar sola** 2 veces; si no lo consigue, aparece un aviso con el botón **Reconectar**.

Si no conecta, pulsa el botón **?** de la cabecera (o *¿Qué hago?* en el aviso de error): sale una lista de comprobación que marca sola lo que puede comprobar (https, navegador, Bluetooth) y resalta la causa más probable del último error.

---

## 3. Comandos que envía la app

Cada comando es texto UTF-8 **terminado en salto de línea `\n`**.

| Comando | Cuándo se envía |
|---|---|
| `avanzar` | Al pulsar (y mantener) la flecha ↑ |
| `atras` | Al pulsar (y mantener) la flecha ↓ |
| `izquierda` | Al pulsar (y mantener) la flecha ← |
| `derecha` | Al pulsar (y mantener) la flecha → |
| `parar` | Al **soltar** una flecha, al pulsar **PARAR**, al conectar, al desconectar y si la app pasa a segundo plano mientras te mueves |
| `vel0` … `vel100` | Al mover el deslizador (máx. uno cada 80 ms, el valor final siempre llega) y al conectar. Ej.: `vel75` |
| `bocina` | Botón Bocina |
| `luces` | Botón Luces (alterna ON/OFF) |
| `seguridad` | Botón Seguridad (alterna ON/OFF la frenada de emergencia por sensor) |

Notas para cuadrarlo con MakeCode:
- Los comandos van **en minúsculas y sin acentos**, exactamente como en la tabla.
- `luces` y `seguridad` son **interruptores**: la app asume que al conectar ambos están en **OFF** (y así lo muestra). Haz que el micro:bit también arranque con ellos apagados.
- Lo que el micro:bit envíe por UART (por ejemplo con `bluetooth uart escribir línea`) aparece abajo en **Recibido**.

### Programa del micro:bit (MakeCode)

El programa completo está en [`main.ts`](main.ts) y el proyecto en [`pxt.json`](pxt.json) (extensiones **bluetooth** y **maqueen**, y el ajuste **No Pairing Required** ya puesto).

**Forma 1 — importarlo (ya trae el ajuste de emparejamiento):** en [makecode.microbit.org](https://makecode.microbit.org) → **Importar** → **Importar URL** → pega `https://github.com/losbellamy4-dev/proyecto-bachillerato-robot-maquen` → **Ir**.

**Forma 2 — copiar y pegar:**
1. Proyecto nuevo → **Extensiones**: añade **bluetooth** y **maqueen** (si pregunta por quitar *radio*, acepta).
2. Rueda dentada ⚙ → **Configuración del proyecto** → marca **«No Pairing Required: Anyone can connect via Bluetooth»** → **Guardar**. *(Sin esto el micro:bit ignora al móvil: es el fallo más común.)*
3. Cambia a **JavaScript**, borra todo, pega el contenido de `main.ts` y vuelve a **Bloques** si quieres verlo en bloques.

Después: **Descargar** al micro:bit (con el cable USB). Al encenderlo debe salir el **símbolo de Bluetooth**.

Qué hace:
- Cada comando se procesa al instante; lo lento (pantalla, bocina, sensor) va en bucles aparte, para que un `parar` nunca espere.
- `vel0…vel100` se pasa a la escala de los motores (0–255) empezando en 45, que es lo mínimo para que el coche se mueva. Si cambias la velocidad mientras se mueve, se aplica al momento.
- Si se corta el Bluetooth, el coche **se para** y luces y seguridad vuelven a OFF (como la app al reconectar).
- **Seguridad** ON: si va hacia delante y hay algo a menos de 15 cm, frena, pita y manda `freno` (sale en *Recibido*).
- Pantalla: símbolo de Bluetooth = esperando al móvil · ✔ = conectado y parado · flecha = dirección.

Es para el **Maqueen Lite** (extensión `maqueen` de DFRobot). El Maqueen Plus usa otra extensión y otros bloques de motor.

---

## 4. Detalle técnico: los UUID del UART

El servicio es el **Nordic UART Service** `6e400001-b5a3-f393-e0a9-e50e24dcca9e`.
En el estándar de Nordic, `6e400002` es para escribir y `6e400003` para recibir, **pero en el micro:bit es al revés**:

- `6e400002` → TX del micro:bit (*indicate*: el micro:bit nos manda datos)
- `6e400003` → RX del micro:bit (*write*: aquí escribe la app)

Para no depender de esto, la app pide las dos características y **elige por sus propiedades** (la que admite `write` es la de envío). Funciona con cualquiera de los dos convenios.

---

## 5. Solución de problemas

| Problema | Solución |
|---|---|
| «Este navegador no puede usar Bluetooth» | Usa Chrome/Edge (Android, PC, Mac). En iPhone, la app Bluefy. |
| «Abre la app por HTTPS» | Ábrela desde GitHub Pages o `localhost`. |
| «Has abierto el archivo directamente» | Ábrela con su dirección `https://…github.io/…` en Chrome, no desde el gestor de archivos, WhatsApp o Drive. |
| No aparece el micro:bit en la lista | Comprueba que en su pantalla sale el símbolo de Bluetooth (programa cargado), que no está conectado a otro móvil/PC y acércate. En Android, Chrome necesita **ubicación** y el permiso **Dispositivos cercanos**. En la ayuda (**?**) puedes pulsar **Ver todos los dispositivos**. |
| «El micro:bit no deja conectar» | Casi siempre es el emparejamiento: en MakeCode, *Configuración del proyecto* → **No Pairing Required** → vuelve a descargar. Y en el móvil, Ajustes → Bluetooth → «olvida» el micro:bit si lo emparejaste antes. |
| «El micro:bit no tiene el Bluetooth UART» | Su programa no inicia el servicio UART: descárgale el programa de `main.ts`. |
| «Conectado, pero el micro:bit no contesta» | Tiene un programa antiguo o distinto: el de este repositorio contesta `listo` al conectar. |
| Conecta pero el coche no se mueve | Velocidad a 0, pilas bajas o interruptor del Maqueen apagado. Si usas otro programa, que lea hasta el salto de línea (`Delimiters.NewLine`) y que los comandos coincidan exactamente. |

---

## 6. Cómo está hecho (para la presentación)

Todo el código está comentado en español dentro de `index.html`, por secciones:

1. **Tokens de diseño (CSS)**: colores, curvas de animación y radios en un solo sitio → temas claro/oscuro y color de acento.
2. **Fondo con parallax**: rejilla y luces que se mueven un poco con el giroscopio o el dedo (`deviceorientation`, `requestAnimationFrame`).
3. **Bluetooth (`class MicrobitUART`)**: conexión, detección de características, **cola de envíos** (el Bluetooth no admite dos escrituras a la vez), reconexión automática y traducción de errores a mensajes claros.
4. **Intro**: una línea de tiempo maestra en `requestAnimationFrame` que mueve el logo SVG (solo `transform`/`opacity`) y un `<canvas>` para las partículas de la explosión.
5. **Bienvenida y guía**: la guía resalta los elementos reales de la interfaz con un «foco».
6. **Controles**: *Pointer Events* para mantener pulsado (dedo, ratón o lápiz), multitáctil, teclado y vibración háptica (`navigator.vibrate`).

Medidas de seguridad incluidas: soltar = `parar`, botón PARAR siempre activo, `parar` al desconectar y «hombre muerto» si la app se minimiza mientras el coche se mueve.

---

## 7. Creador Web (`creador-web.html`)

Un editor para crear páginas web con HTML, CSS y JavaScript que funciona entero en el navegador, también en un solo archivo. Se abre igual que la app (GitHub Pages, `localhost` o haciendo doble clic).

- **Carpetas ordenadas**: `html/`, `css/`, `js/`, `img/` y `memoria/`. La carpeta `memoria` no se puede borrar: `memoria.html` se genera sola (archivos, mini explicación de cada uno, tus notas, glosario, diario de cambios y revisión) y `notas.md` es para tus apuntes.
- **Vista de bloques (como Scratch)**: el botón «Bloques» enseña el mismo archivo como bloques de colores (eventos, control, variables, funciones, página…; en HTML cada etiqueta es un bloque y en CSS cada regla). Se pueden arrastrar para cambiarlos de sitio, añadir bloques nuevos desde la paleta, escribir en los huecos blancos, duplicar, borrar (soltándolos en la paleta) y deshacer. Todo se escribe en el código de verdad; con doble clic vas a esa línea. Los bloques con errores salen marcados en rojo.
- **Editor**: colores, autocompletado (también ids, clases y archivos del proyecto), cierre de etiquetas y paréntesis (si escribes tú el cierre que el editor ya había puesto, no se repite), abreviaturas tipo `ul>li*3` + Tab, buscar y reemplazar, ordenar sangrías y «Explicar esta línea».
- **Corrector**: encuentra errores típicos, explica por qué importan y muchos los arregla con un clic. Si pones CSS o JavaScript donde no toca, lo mueve a su carpeta y lo enlaza.
- **Vista previa en directo** con consola, tamaños de móvil y tablet, y «abrir en pestaña nueva» (necesario para Web Bluetooth).
- **Asistente**: sin clave funciona en local (corrector, glosario y recetas). Con una clave de la API de Claude puede escribir código contigo; antes de aplicar un cambio enseña las diferencias y guarda una versión.
- **Guardado local** (IndexedDB) con historial de versiones, plantillas (incluida una del control remoto), descarga en `.zip`, en un solo `.html` o solo la memoria.
- **Si no se abre**: ya no se queda en blanco si internet va lento o bloquea las fuentes de Google (pasa en algunas redes de instituto). Si el navegador es muy antiguo, sale un aviso explicando qué hacer. Ábrelo con Chrome, Edge, Firefox o Safari actualizados, no con el visor de archivos del móvil.
- **Archivos grandes**: se puede pegar código largo (miles de líneas) sin que se quede pillado: en archivos grandes solo se colorea el trozo que se ve y el corrector no vuelve a revisar los archivos que no han cambiado.

---

## 8. Autoría y licencia

© 2026 **Adrián Bellamy Encinas** · contacto: [losbellamy4@gmail.com](mailto:losbellamy4@gmail.com)

Este proyecto es **código fuente disponible** con la licencia [PolyForm Noncommercial 1.0.0](https://polyformproject.org/licenses/noncommercial/1.0.0) (texto completo en [`LICENSE`](LICENSE)). En resumen, y sin sustituir a la licencia:

- **Se puede** usar, copiar, estudiar, modificar y compartir **sin fines comerciales** (uso personal, estudio, centros educativos, organizaciones benéficas, administraciones públicas…).
- **Hay que** conservar siempre el aviso de autoría (las líneas `Required Notice` del principio de `index.html`, `creador-web.html` y `LICENSE`) y la licencia en cualquier copia o versión, con o sin cambios. Quitarlo es incumplir la licencia.
- **Uso comercial** (venderlo, cobrar por usarlo, meterlo en un producto o servicio de pago o con publicidad, o sacar de él cualquier beneficio económico): solo con un acuerdo económico previo y por escrito con el autor.
- **Sin garantía**: se entrega «tal cual». El autor no responde de los daños que cause su uso ni de los cambios o versiones que hagan otras personas; cada cual responde de sus modificaciones.
- Si alguien la incumple, pierde el permiso salvo que lo corrija en los 32 días siguientes al primer aviso por escrito del autor.

Si hay diferencias entre este resumen y la licencia, vale lo que dice la licencia (en inglés).
