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
}

/**
 * ======================================
 * FUNCIONES LEYENDO LA MEMORIA DEL JUEGO
 * ======================================
*/

var INICIO_MEMORIAS = 0xF50000

function setOverOrUnderText(text){
    document.getElementById("overOrUnder").innerHTML = text;
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

function leer(){  //Así que encapsulo socket.send en otra función, y con esto si que puedo leer la respuesta??? No entiendo JS
    leerMemoria(INICIO_MEMORIAS, 0xFF, function(event){ //Shoutouts a Stack Overflow
        var datos = new Uint8Array(event.data); //Array de casi todos los valores de memoria
        actualizaDatos(datos);
    });
}

function actualizaDatos(datos){

    if(datos[27] == 0){ //Indica en que seccion del mundo estas
        setOverOrUnderText("¡Estas en el Overworld!");
    }
    else{
        setOverOrUnderText("¡Estas en el Underworld!");
    }
    if(datos[39] == 24 || datos[40] == 24){  //!ESTO NO FUNCIONA Indica si has bonkeado  
        setBonkCount();
        bonked = true;
    }
    else{
        bonked = false;
    }
}

function empezarALeer(){
    setInterval(leer, 200);
}

/** 
 * * Conectar a la consola (poner nombre para comprobar conexión correcta) HECHO
 * TODO: Leer la zona de memoria correcta cada x tiempo
 * TODO: Actualizar la info según la lectura
 *  
*/