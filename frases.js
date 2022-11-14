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

var Hammerjump = [
    "Habría sido mejor dar la vuelta"
]

var SWBK = [
    "a"
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
    switch(sala){
        case "Moldorm":
            return Moldorm[getRandomInt(Moldorm.length)];
            break;
    }
}

function getFraseCaida(sala){
    switch(sala){
        case "Moldorm":
            return Moldorm[getRandomInt(Moldorm.length)];
            break;
        case "Hammerjump":
            return Hammerjump[getRandomInt(Hammerjump.length)];
            break;
        case "SWBK":
            return SWBK[getRandomInt(SWBK.length)];
    }

}