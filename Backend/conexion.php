<?php
// Funcion para obtener la conexión a la base de datos
class ConexionException extends Exception {}
// Con Railway se vence en 24/06/2025 ... Xd
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

// Conexión global
try {
    $conexion = obtenerConexion();
} catch (ConexionException $e) {
    http_response_code(500);
    echo json_encode(["error" => $e->getMessage()]);
    exit();
}
