/* =====================================================================
   SEGURIDAD VIAL CON MICRO:BIT — programa del coche (Maqueen + micro:bit v2)
   © 2026 Adrián Bellamy Encinas · PolyForm Noncommercial 1.0.0

   Recibe por Bluetooth (servicio UART) los comandos de la app, uno por
   línea: avanzar, atras, izquierda, derecha, parar, vel0…vel100, bocina,
   luces y seguridad.

   ANTES DE DESCARGARLO (si no, el móvil no podrá conectar):
   rueda dentada ⚙ → Configuración del proyecto →
   «No Pairing Required: Anyone can connect via Bluetooth» → Guardar.

   Pantalla del micro:bit:
     símbolo de Bluetooth = programa en marcha, esperando al móvil
     ✔ = conectado y parado · flecha = hacia dónde se mueve
   ===================================================================== */

let velocidad = 60          // 0-100: la manda la app con "velNN"
let movimiento = "parar"    // lo que está haciendo el coche ahora
let lucesOn = false
let seguridadOn = false     // frenada automática con el sensor de ultrasonidos
let conectado = false
let saludar = false         // contestar "listo" al primer comando tras conectar
let bocinaPendiente = false
let pantalla = ""           // lo último que se ha dibujado en la pantalla
let distanciaFreno = 15     // cm

// La app manda la velocidad de 0 a 100 y los motores van de 0 a 255.
// Por debajo de 45 los motores no tienen fuerza para mover el coche,
// así que 1-100 se reparte entre 45 y 255.
function velMotor(): number {
    if (velocidad <= 0) {
        return 0
    }
    return Math.round(Math.map(velocidad, 1, 100, 45, 255))
}

// Mueve el coche. Izquierda y derecha giran sobre sí mismo
// (una rueda hacia delante y la otra hacia atrás).
function mover(accion: string) {
    let v = velMotor()
    movimiento = accion
    if (accion == "avanzar") {
        maqueen.motorRun(maqueen.Motors.All, maqueen.Dir.CW, v)
    } else if (accion == "atras") {
        maqueen.motorRun(maqueen.Motors.All, maqueen.Dir.CCW, v)
    } else if (accion == "izquierda") {
        maqueen.motorRun(maqueen.Motors.M1, maqueen.Dir.CCW, v)
        maqueen.motorRun(maqueen.Motors.M2, maqueen.Dir.CW, v)
    } else if (accion == "derecha") {
        maqueen.motorRun(maqueen.Motors.M1, maqueen.Dir.CW, v)
        maqueen.motorRun(maqueen.Motors.M2, maqueen.Dir.CCW, v)
    } else {
        movimiento = "parar"
        maqueen.motorStop(maqueen.Motors.All)
    }
}

function ponerLuces(encendidas: boolean) {
    lucesOn = encendidas
    if (encendidas) {
        maqueen.writeLED(maqueen.LED.LEDLeft, maqueen.LEDswitch.turnOn)
        maqueen.writeLED(maqueen.LED.LEDRight, maqueen.LEDswitch.turnOn)
    } else {
        maqueen.writeLED(maqueen.LED.LEDLeft, maqueen.LEDswitch.turnOff)
        maqueen.writeLED(maqueen.LED.LEDRight, maqueen.LEDswitch.turnOff)
    }
}

bluetooth.onBluetoothConnected(function () {
    conectado = true
    saludar = true
})

// Si se corta la conexión (móvil lejos, app cerrada…) el coche se para.
// Luces y seguridad vuelven a OFF porque la app empieza así al reconectar.
bluetooth.onBluetoothDisconnected(function () {
    conectado = false
    mover("parar")
    ponerLuces(false)
    seguridadOn = false
})

// Llega un comando de la app. Aquí solo se hacen cosas rápidas: lo lento
// (pantalla, bocina, sensor) va en los bucles "para siempre" de abajo,
// para que un "parar" nunca tenga que esperar.
bluetooth.onUartDataReceived(serial.delimiters(Delimiters.NewLine), function () {
    let cmd = bluetooth.uartReadUntil(serial.delimiters(Delimiters.NewLine))
    if (cmd == "avanzar" || cmd == "atras" || cmd == "izquierda" || cmd == "derecha" || cmd == "parar") {
        mover(cmd)
    } else if (cmd.substr(0, 3) == "vel") {
        let n = parseFloat(cmd.substr(3, 3))
        if (n >= 0 && n <= 100) {
            velocidad = Math.round(n)
            // si ya se está moviendo, la nueva velocidad se aplica al momento
            if (movimiento != "parar") {
                mover(movimiento)
            }
        }
    } else if (cmd == "bocina") {
        bocinaPendiente = true
    } else if (cmd == "luces") {
        ponerLuces(!(lucesOn))
    } else if (cmd == "seguridad") {
        seguridadOn = !(seguridadOn)
    }
    // La app enseña esto en "Recibido": así sabes que el coche te oye.
    if (saludar) {
        saludar = false
        bluetooth.uartWriteLine("listo")
    }
})

// Frenada de seguridad: si va hacia delante y hay algo muy cerca, frena.
basic.forever(function () {
    if (seguridadOn && movimiento == "avanzar") {
        if (maqueen.Ultrasonic() < distanciaFreno) {
            mover("parar")
            bocinaPendiente = true
            bluetooth.uartWriteLine("freno")
        }
    }
    basic.pause(20)
})

// Bocina (en su propio bucle para no retrasar los comandos).
basic.forever(function () {
    if (bocinaPendiente) {
        bocinaPendiente = false
        music.playTone(988, music.beat(BeatFraction.Eighth))
        music.playTone(784, music.beat(BeatFraction.Quarter))
    }
    basic.pause(20)
})

// Pantalla: dibuja el estado solo cuando cambia.
basic.forever(function () {
    let estado = movimiento
    if (!(conectado)) {
        estado = "esperando"
    }
    if (estado != pantalla) {
        pantalla = estado
        if (estado == "esperando") {
            basic.showLeds(`
                . . # # .
                # . # . #
                . # # # .
                # . # . #
                . . # # .
                `)
        } else if (estado == "avanzar") {
            basic.showArrow(ArrowNames.North)
        } else if (estado == "atras") {
            basic.showArrow(ArrowNames.South)
        } else if (estado == "izquierda") {
            basic.showArrow(ArrowNames.West)
        } else if (estado == "derecha") {
            basic.showArrow(ArrowNames.East)
        } else {
            basic.showIcon(IconNames.Yes)
        }
    }
    basic.pause(50)
})

// Al iniciar: el Bluetooth lo primero, y el coche quieto con las luces apagadas.
bluetooth.startUartService()
maqueen.motorStop(maqueen.Motors.All)
ponerLuces(false)
