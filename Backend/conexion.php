<?php
if (!function_exists('obtenerConexion')) {
    class ConexionException extends Exception {}

    function obtenerConexion() {
        $conexion = mysqli_connect(
            "interchange.proxy.rlwy.net:56080",
            "root",
            "hINUjRXhDdLfyfaLILippsIhLBKXcEJq",
            "railway",
            56080
        );
        if (!$conexion) {
            throw new ConexionException("Error al conectar con la base de datos");
        }
        $conexion->set_charset("utf8");
        return $conexion;
    }
}

if (!defined('TESTING')) {
    try {
        $conexion = obtenerConexion();
    } catch (ConexionException $e) {
        http_response_code(500);
        echo json_encode(["error" => $e->getMessage()]);
        exit();
    }
}
