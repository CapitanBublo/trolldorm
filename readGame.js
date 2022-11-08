var serverHost = "ws://localhost:8080"; //Por defecto, el puerto del WebServer del QUsb2Snes es el 8080
var socket = new WebSocket(serverHost);
var consoleName = null;

/* TODO: Una vez conectado al server:
 - Conectar a la consola (poner nombre para comprobar conexión correcta)
 - Leer la zona de memoria correcta cada x tiempo
 - Actualizar la info según la lectura
 - 
awd
*/