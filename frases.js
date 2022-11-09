/**
 * =
 * LISTAS DE FRASES
 * =
 */
var Moldorm = [
    "Ni que fueses Matkap, perdiendo runs en Moldorm",
    "¿Que dificil es salir del Light World, no?",
    "Buen fail"
]






/**
 * =
 * FUNCION DE SALIDA DE FRASES
 * =
 */

function getRandomInt(max){
    return Math.floor(Math.random() * max);
}

function getFraseMuerte(sala){
    if(sala == "Moldorm"){
        return Moldorm[getRandomInt(Moldorm.length)];
    }
}