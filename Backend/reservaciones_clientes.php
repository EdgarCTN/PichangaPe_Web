<?php

require_once 'cors.php';
require_once 'conexion.php';
configurarCORS();


// Verificar si es una petición POST o GET
if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    $id_reserva = isset($_POST['id_reserva']) ? $_POST['id_reserva'] : null;
} elseif ($_SERVER['REQUEST_METHOD'] === 'GET') {
    $id_reserva = isset($_GET['id_reserva']) ? $_GET['id_reserva'] : null;
} else {
    echo json_encode(["error" => "Método no permitido"]);
    exit;
}

// Verificar que se haya enviado el parámetro id_reserva
if (empty($id_reserva)) {
    echo json_encode(["error" => "No se ha enviado el parámetro id_reserva"]);
    exit;
}

// Preparar la consulta SQL utilizando prepared statement para evitar inyección SQL
$query = "SELECT
    DATE(r.fecha_hora_inicio) AS fecha,
    DATE_FORMAT(r.fecha_hora_inicio, '%H:%i') AS hora_inicio,
    DATE_FORMAT(r.fecha_hora_fin, '%H:%i') AS hora_fin,
    cl.id_cliente,
    cl.nombre AS nombre_reservador,
    cl.apellido AS apellido_reservador,
    cl.numeroCel AS celular,
    r.estado AS estado_reserva
FROM reservas r
JOIN clientes cl ON r.id_reservador = cl.id_cliente
WHERE r.id_reserva = ?";
// Preparar la consulta
$stmt = $conexion->prepare($query);
if (!$stmt) {
    echo json_encode(["error" => "Error en la preparación de la consulta: " . $conexion->error]);
    exit;
}

// Enlazar el parámetro y ejecutar la consulta
$stmt->bind_param("i", $id_reserva);
$result = $stmt->execute();

if (!$result) {
    echo json_encode(["error" => "Error al ejecutar la consulta: " . $stmt->error]);
    exit;
}

$resultado = $stmt->get_result();

// Verificar si se obtuvo algún resultado
if ($resultado->num_rows > 0) {
    $datos = $resultado->fetch_assoc();
    echo json_encode($datos);
} else {
    echo json_encode(["error" => "No se encontró la reserva con el id proporcionado"]);
}

// Cerrar conexiones
$stmt->close();
mysqli_close($conexion);