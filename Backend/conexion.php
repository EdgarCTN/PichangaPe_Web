<?php
// Funcion para obtener la conexión a la base de datos
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

// Conexión global
try {
    $conexion = obtenerConexion();
} catch (ConexionException $e) {
    http_response_code(500);
    echo json_encode(["error" => $e->getMessage()]);
    exit();
}