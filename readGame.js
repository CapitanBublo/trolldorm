/**
 * ==============================
 * FUNCIONES DE CONEXION AL JUEGO
 * ============================== 
 */

var started = false

function startTracker(){
    if(!started){
        started = true;
        connectToSocket();
    }
}

function stopTracker(){
    if(started){
        started = false;
        closeConection();
    }
}

var serverHost = "ws://localhost:8080"; //Por defecto, el puerto del WebServer del QUsb2Snes es el 8080
var socket = null;
var consoleName = null;

function setConectionText(text){
    document.getElementById("conectionStatus").innerHTML = text;
}

function connectToSocket(){
    setConectionText("Conectando...");
    socket = new WebSocket(serverHost); //Conectar al QUsb2Snes
    socket.binaryType = 'arraybuffer';

    socket.onerror = function(event) {
        closeConection();
        setConectionText("Error");
    }

    socket.onopen = lookForConsole;
}

function lookForConsole(event){
    setConectionText("Conectado, buscando dispositivo...");
    socket.send(JSON.stringify({
        Opcode: "DeviceList",
        Space: "SNES"
    }));

    socket.onmessage = connectToConsole;
}

function connectToConsole(event){
    var results = JSON.parse(event.data).Results;
    if (results.length < 1) {
        setConectionText("No hay ningun dispositivo");
        return;
    }
    consoleName = results[0];

    socket.send(JSON.stringify({ //Conexión a la consola
        Opcode : "Attach",
        Space : "SNES",
        Operands : [consoleName]
    }));
    socket.send(JSON.stringify({
        Opcode : "Info",
        Space : "SNES"
    }));
    socket.onmessage = empezarALeer; //Una vez confirmada la conexión, comenzamos a leer la memoria del juego
    setConectionText("Conectado a " + consoleName);

}

function closeConection(){
    if (socket !== null) {
        socket.onopen = function () {};
        socket.onclose = function () {};
        socket.onmessage = function () {};
        socket.onerror = function () {};
        socket.close();
        socket = null;
        setConectionText("Desconectado");
    }
    clearInterval(intervaloLectura);
}

/**
 * ======================================
 * FUNCIONES LEYENDO LA MEMORIA DEL JUEGO
 * ======================================
*/

var INICIO_MEMORIAS = 0xF50000

function setSpinSpeed(text){
    document.getElementById("spinSpeed").innerHTML = text;
}


var chestTurn = 0;
function setChestTurn(){ 
    chestTurn++;
    document.getElementById("chestTurn").innerHTML = (chestTurn + " chest turns PogChamp");
}

var sala, frase;
var muerte = false;
var caida = false;
function checkMuerte(salaID, uw){
    if(!uw){
        sala = getSalaOW(salaID);
    }
    else{
        sala = getSalaUW(salaID);
    }
    frase = getFraseMuerte(sala);
    if(frase !== undefined){
        document.getElementById("deathCheck").innerHTML = frase;
    }
}

function checkCaida(salaID){
    sala = getSalaUW(salaID);
    frase = getFraseCaida(sala);
    if(frase !== undefined){
        document.getElementById("caidaCheck").innerHTML = frase;
    }
}

var nBonks = 0;
var bonked = false;
function setBonkCount(){
    if(!bonked){
        nBonks++;
        document.getElementById("bonkCount").innerHTML = ("Y con ese bonk, ya van " + nBonks);
    }
}

function leerMemoria(dir, tam, fun){ //Por algún motivo, si llamo directamente a socket.send, no puedo leer la respuesta
    socket.send(JSON.stringify({
        Opcode : "GetAddress",
        Space : "SNES",
        Operands : [dir.toString(16), tam.toString(16)]
    }));

    socket.onmessage = fun;
}

var datos = new Uint8Array();

function leer(){  //Así que encapsulo socket.send en otra función, y con esto si que puedo leer la respuesta??? No entiendo JS
    leerMemoria(INICIO_MEMORIAS, 0xFF, function(event){ //Shoutouts a Stack Overflow
        leerMemoria(INICIO_MEMORIAS + 0x354, 0xFF, function(event2){
            var datos = new Uint8Array([...new Uint8Array(event.data), ...new Uint8Array(event2.data)]);
            actualizaDatos(datos);
        });
    });
}
// DATOS: [0...254] = [0x00...0xFF] ; [255...509] = [0x354...0x453]


function actualizaDatos(datos){
    document.getElementById("debug").innerHTML = datos[278];

    //Check muerte en 0x36B, escribir una frase
    if(datos[278] == 1){
        if(!muerte){
            muerte = true;
            if(datos[27] == 0){ //Check over o under world en 0x1B
                checkMuerte(datos[138], false); //Check pantalla del overworld en 0x8A
            }
            else{
                checkMuerte(datos[160], true) //Check pantalla del underworld en 0xA0
            }
        }
    }
    else{
        muerte = false;
    }

    //Check for super speed: spin, hookshot or medallion animation on 0x354 and dashing flag on 0x372
    if((datos[255] == 15||datos[255] == 32||datos[255] == 21) && datos[285] == 1){
        setSpinSpeed("¡Spinspeed!");
    }
    else if(datos[285] == 0){
        setSpinSpeed("No spinspeed");
    }

    //Check caida en 0x5B. Todas las caidas son en underworld así que no hace falta checkear eso.
    if((datos[91] == 2) || (datos[91] == 3)){
        if(!caida){
            caida = true;
            checkCaida(datos[160]); //Check pantalla del underworld en 0xA0
        }
    }
    else{
        caida = false;
    }
}

function empezarALeer(){
    intervaloLectura = setInterval(leer, 200);
}

/** 
 * * Conectar a la consola (poner nombre para comprobar conexión correcta) HECHO
 * TODO: Leer la zona de memoria correcta cada x tiempo
 * TODO: Actualizar la info según la lectura
 *  
*/