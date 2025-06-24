<?php
if (!function_exists('obtenerConexion')) {
    class ConexionException extends Exception {}

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

// Detecta entorno de PHPUnit (CLI)
if (!defined('TESTING')) {
    define('TESTING', php_sapi_name() === 'cli');
}

// Si NO estamos en modo prueba, conecta normalmente
if (!TESTING) {
    try {
        $conexion = obtenerConexion();
    } catch (ConexionException $e) {
        http_response_code(500);
        echo json_encode(["error" => $e->getMessage()]);
        exit();
    }
} else {
    // Si estamos en prueba, define una variable nula
    $conexion = null;
}
