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
2. En *Build and deployment*: **Source = Deploy from a branch**, elige la rama y la carpeta **/ (root)** → **Save**.
3. En 1–2 minutos tendrás una dirección `https://<usuario>.github.io/<repositorio>/`.
4. Ábrela en **Chrome del móvil Android**. (Consejo: menú ⋮ → *Añadir a pantalla de inicio* para abrirla como una app.)

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

1. Descarga el programa de MakeCode al micro:bit y enciende el coche (con pilas cargadas).
2. Activa el **Bluetooth** del móvil (en Android, también la **ubicación**).
3. Abre la app (opción A o B) y pulsa **Conectar coche**. Verás el anillo de radar girando.
4. En la lista, elige **BBC micro:bit [xxxxx]** y pulsa *Emparejar / Conectar*.
5. Destello verde + estado **Conectado** en la cabecera = listo. La app manda `parar` y la velocidad actual para sincronizar.
6. Conduce:
   - **Mantén pulsada** una flecha para moverte; al **soltar**, el coche para solo.
   - **PARAR** (botón rojo central) frena siempre al instante.
   - En el ordenador: flechas o WASD (mantener), **Espacio** = parar, **H** = bocina.
7. Para terminar, pulsa **Desconectar** (manda `parar` antes de cortar).

Si se pierde la conexión, la app intenta **reconectar sola** 2 veces; si no lo consigue, aparece un aviso con el botón **Reconectar**.

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

### Referencia rápida para MakeCode (JavaScript)
No hace falta cambiar tu programa; esto es solo para comprobar que coincide:

```javascript
bluetooth.startUartService()
bluetooth.onUartDataReceived(serial.delimiters(Delimiters.NewLine), function () {
    let cmd = bluetooth.uartReadUntil(serial.delimiters(Delimiters.NewLine))
    if (cmd == "avanzar") {
        // motores hacia delante
    } else if (cmd == "parar") {
        // motores parados
    } else if (cmd.substr(0, 3) == "vel") {
        let velocidad = parseFloat(cmd.substr(3))   // 0..100
    }
    // ... atras, izquierda, derecha, bocina, luces, seguridad
})
// Recomendado por seguridad: si se corta el Bluetooth, parar el coche.
bluetooth.onBluetoothDisconnected(function () {
    // motores parados
})
```

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
| No aparece el micro:bit en la lista | Comprueba que el programa tiene el servicio UART iniciado, que el micro:bit no está conectado a otro móvil/PC y acércate. Reinicia el micro:bit (botón de reinicio, en la parte trasera). |
| «Servicio UART no encontrado» | En MakeCode, usa el bloque *bluetooth iniciar servicio UART* y vuelve a descargar el programa. |
| Conecta pero el coche no responde | Revisa que el micro:bit lee hasta el salto de línea (`Delimiters.NewLine`) y que los nombres de comando coinciden exactamente. |
| En Android pide emparejar con código | En MakeCode, *Configuración del proyecto* → *No Pairing Required*. Si el móvil lo emparejó antes con otro programa, «olvida» el dispositivo en los ajustes de Bluetooth. |

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
- **Editor**: colores, autocompletado (también ids, clases y archivos del proyecto), cierre de etiquetas y paréntesis, abreviaturas tipo `ul>li*3` + Tab, buscar y reemplazar, ordenar sangrías y «Explicar esta línea».
- **Corrector**: encuentra errores típicos, explica por qué importan y muchos los arregla con un clic. Si pones CSS o JavaScript donde no toca, lo mueve a su carpeta y lo enlaza.
- **Vista previa en directo** con consola, tamaños de móvil y tablet, y «abrir en pestaña nueva» (necesario para Web Bluetooth).
- **Asistente**: sin clave funciona en local (corrector, glosario y recetas). Con una clave de la API de Claude puede escribir código contigo; antes de aplicar un cambio enseña las diferencias y guarda una versión.
- **Guardado local** (IndexedDB) con historial de versiones, plantillas (incluida una del control remoto), descarga en `.zip`, en un solo `.html` o solo la memoria.
