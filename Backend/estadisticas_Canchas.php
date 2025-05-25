<?php
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Methods: POST, GET, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type");
header('Content-Type: application/json; charset=utf-8');

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit();
}

// Conexión a la base de datos
$conexion = mysqli_connect(
    "pichangapedb-pichangapedb-08a3.l.aivencloud.com",  // Host
    "avnadmin",                                          // Usuario
    "AVNS_WAohlqwbsIAlQVeVmWH",                          // Contraseña
    "defaultdb",                                         // Nombre de la base de datos
    20298                                                // Puerto
);

if (!$conexion) {
    http_response_code(500);
    echo json_encode(["error" => "Error al conectar con la base de datos"]);
    exit();
}
$conexion->set_charset("utf8");

// Verificar que se haya enviado id_cliente
if (!isset($_POST['id_cliente']) || empty($_POST['id_cliente'])) {
    http_response_code(400);
    echo json_encode(["error" => "No se ha proporcionado id_cliente"]);
    $conexion->close();
    exit();
}

$id_cliente = $_POST['id_cliente'];

// Consulta SQL segura con prepared statement
$query = "
    SELECT 
        c.id_cancha,
        c.nombre,
        IFNULL(SUM(CASE WHEN r.estado = 'pagado' THEN r.precio_total ELSE 0 END), 0) AS ganancias,
        COUNT(r.id_reserva) AS total_reservas,
        COUNT(CASE WHEN r.estado = 'pagado' THEN 1 ELSE NULL END) AS total_reservas_pagadas
    FROM 
        canchas c
    LEFT JOIN 
        reservas r ON c.id_cancha = r.id_cancha
    WHERE
        c.id_dueno = ?
    GROUP BY 
        c.id_cancha, c.nombre
";

$stmt = $conexion->prepare($query);
if (!$stmt) {
    http_response_code(500);
    echo json_encode(["error" => "Error en la preparación de la consulta"]);
    $conexion->close();
    exit();
}

$stmt->bind_param("s", $id_cliente);
$stmt->execute();
$resultado = $stmt->get_result();

if (!$resultado) {
    http_response_code(500);
    echo json_encode(["error" => "Error en la ejecución de la consulta"]);
    $stmt->close();
    $conexion->close();
    exit();
}

// Recopilar resultados
$datos = [];
while ($fila = $resultado->fetch_assoc()) {
    $datos[] = $fila;
}

// Devolver datos como JSON
echo json_encode($datos);

// Cerrar conexiones
$stmt->close();
$conexion->close();
?>
