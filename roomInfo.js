/**
 * ======================
 * LISTAS DE HABITACIONES
 * ======================
 */

const salasOverworld = new Map([
    []
    //TODO: Cangrejos, Montaña donde caen rocas, etc
]);

const salasUnderworld = new Map([
    [0x07, "Moldorm"],
    [0x1A, "Hammerjump"],
    [0x57, "SWBK"],
    [0x20, "Aga1"]
    //TODO: Todos los jefes
]);

/**
 * ===========================
 * FUNCIONES PARA BUSCAR SALAS
 * ===========================
 */

function getSalaOW(salaID){
    return salasOverworld.get(salaID);
}

function getSalaUW(salaID){
    return salasUnderworld.get(salaID);
}