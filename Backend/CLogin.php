<?php
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Methods: POST, GET, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type");

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    // Responder inmediatamente al preflight
    exit(0);
}

$conexion = mysqli_connect(
    "pichangapedb-pichangapedb-08a3.l.aivencloud.com",  // Host
    "avnadmin",                                          // Usuario
    "AVNS_WAohlqwbsIAlQVeVmWH",                          // Contraseña
    "defaultdb",                                         // Nombre de la base de datos
    20298                                                // Puerto
);

$conexion->set_charset("utf8");

$usuario    = $_POST['usuario']    ?? '';
$password   = $_POST['password']   ?? '';

$query = "SELECT * FROM clientes 
          WHERE usuario='$usuario' 
            AND password='$password' 
            AND rol='dueño'";
$resultado = mysqli_query($conexion, $query);

if ($resultado && $resultado->num_rows > 0) {
    $fila = mysqli_fetch_assoc($resultado);
    echo json_encode($fila);
} else {
    echo json_encode(["error" => "Credenciales incorrectas o acceso denegado"]);
}

mysqli_close($conexion);
