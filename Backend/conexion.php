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

// Modo seguro: por defecto TESTING es falso
if (!defined('TESTING')) {
    define('TESTING', false); 
}

// Conecta solo si no estás en prueba
if (!TESTING) {
    try {
        $conexion = obtenerConexion();
    } catch (ConexionException $e) {
        http_response_code(500);
        echo json_encode(["error" => $e->getMessage()]);
        exit();
    }
} else {
    // En pruebas puedes simular o mockear
    $conexion = null;
}
