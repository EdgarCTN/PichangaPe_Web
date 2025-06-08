<?php
require_once 'cors.php';
require_once 'conexion.php';

// Verificar que se haya enviado id_cliente
if (!isset($_POST['id_cliente']) || trim($_POST['id_cliente']) === '') {
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
    echo json_encode(["error" => "Error en la preparación de la consulta: " . $conexion->error]);
    $conexion->close();
    exit();
}

$stmt->bind_param("s", $id_cliente);

if (!$stmt->execute()) {
    http_response_code(500);
    echo json_encode(["error" => "Error en la ejecución de la consulta: " . $stmt->error]);
    $stmt->close();
    $conexion->close();
    exit();
}

$resultado = $stmt->get_result();

if (!$resultado) {
    http_response_code(500);
    echo json_encode(["error" => "Error al obtener resultados"]);
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
