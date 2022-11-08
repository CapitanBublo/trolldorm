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
    socket = new WebSocket(serverHost);
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

    socket.send(JSON.stringify({
        Opcode : "Attach",
        Space : "SNES",
        Operands : [consoleName]
    }));
    socket.send(JSON.stringify({
        Opcode : "Info",
        Space : "SNES"
    }));
    socket.onmessage = empezarALeer;
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

function setHitText(text){
    document.getElementById("hitStatus").innerHTML = text;
}

function leerMemoria(dir, tam, fun){
    socket.send(JSON.stringify({
        Opcode : "GetAddress",
        Space : "SNES",
        Operands : [dir.toString(16), tam.toString(16)]
    }));

    socket.onmessage = fun;
}

function leer(){ 
    leerMemoria(INICIO_MEMORIAS, 0xFF, function(event){ 
        var datos = new Uint8Array(event.data);
        actualizaDatos(datos);
    });
}

function actualizaDatos(datos){
    if(datos[27] == 0){ //Busca en que seccion del mundo estas
        setOverOrUnderText("¡Estas en el Overworld!");
    }
    else{
        setOverOrUnderText("¡Estas en el Underworld!");
    }
    if(datos[93] !== 2){  //Busca si te han golpeado
        setHitText("Estoy bien :)");
    }
    else{
        setHitText("Oof");
    }
}


function empezarALeer(){
    setInterval(leer, 500);
}

/** 
 * * Conectar a la consola (poner nombre para comprobar conexión correcta) HECHO
 * TODO: Leer la zona de memoria correcta cada x tiempo
 * TODO: Actualizar la info según la lectura
 *  
*/