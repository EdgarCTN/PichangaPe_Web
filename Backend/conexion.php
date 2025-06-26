<?php

/**
 * Verifica si la función obtenerConexion ya existe para evitar redefiniciones.
 */
if (!function_exists('obtenerConexion')) {

    /**
     * Clase personalizada para lanzar excepciones relacionadas con la conexión.
     */
    class ConexionException extends Exception {}

    /**
     * Establece una conexión a la base de datos.
     * 
     * @return mysqli Objeto de conexión.
     * @throws ConexionException Si la conexión falla.
     */
    function obtenerConexion() {
        $conexion = mysqli_connect(
            "pichangapedb-pichangapedb-08a3.l.aivencloud.com",
            "avnadmin",
            "AVNS_WAohlqwbsIAlQVeVmWH",
            "defaultdb",
            20298
        );

        if (!$conexion) {
            throw new ConexionException("Error al conectar con la base de datos");
        }

        $conexion->set_charset("utf8");
        return $conexion;
    }
}

// Define la constante TESTING si no está definida
if (!defined('TESTING')) {
    define('TESTING', false);
}

/**
 * Si no se está en modo de prueba (TESTING), intenta conectar a la base de datos.
 * En caso de error, responde con código 500 y un mensaje en formato JSON.
 */
if (!TESTING) {
    try {
        $conexion = obtenerConexion();
    } catch (ConexionException $e) {
        http_response_code(500);
        echo json_encode(["error" => $e->getMessage()]);
        exit();
    }
} else {
    // En modo de prueba se puede simular la conexión
    $conexion = null;
}
