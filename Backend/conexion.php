<?php
function obtenerConexion() {
    $conexion = mysqli_connect(
        "pichangapedb-pichangapedb-08a3.l.aivencloud.com",
        "avnadmin",
        "AVNS_WAohlqwbsIAlQVeVmWH",
        "defaultdb",
        20298
    );

    if (!$conexion) {
        throw new Exception("Error al conectar con la base de datos");
    }

    $conexion->set_charset("utf8");
    return $conexion;
}

// Para no alterar el código existente, se mantiene la conexión global
try {
    $conexion = obtenerConexion();
} catch (Exception $e) {
    http_response_code(500);
    echo json_encode(["error" => $e->getMessage()]);
    exit();
}
?>
