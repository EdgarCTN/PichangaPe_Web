<?php
// conexion.php
$conexion = mysqli_connect(
    "pichangapedb-pichangapedb-08a3.l.aivencloud.com",
    "avnadmin",
    "AVNS_WAohlqwbsIAlQVeVmWH",
    "defaultdb",
    20298
);

if (!$conexion) {
    http_response_code(500);
    echo json_encode(["error" => "Error al conectar con la base de datos"]);
    exit();
}

$conexion->set_charset("utf8");
?>
