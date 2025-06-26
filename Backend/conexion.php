<?php

// Verifica si la función ya fue declarada para evitar redefiniciones en pruebas
if (!function_exists('obtenerConexion')) {
    /**
     * Clase personalizada para excepciones de conexión.
     */
    class ConexionException extends Exception {}

    /**
     * Establece una conexión a la base de datos MySQL.
     *
     * @throws ConexionException Si falla la conexión.
     * @return mysqli Conexión activa.
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

        // Establecer el charset para evitar problemas con caracteres especiales
        $conexion->set_charset("utf8");
        return $conexion;
    }
}

// Definir modo de prueba si no está definido
if (!defined('TESTING')) {
    define('TESTING', false);
}

// Intentar conectar solo si no está en modo de prueba
if (!TESTING) {
    try {
        $conexion = obtenerConexion();
    } catch (ConexionException $e) {
        http_response_code(500);
        echo json_encode(["error" => $e->getMessage()]);
        exit();
    }
} else {
    // En modo de pruebas, se puede simular la conexión
    $conexion = null;
}
