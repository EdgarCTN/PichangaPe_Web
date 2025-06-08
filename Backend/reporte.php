<?php

require_once 'cors.php';
require_once 'conexion.php';


// Verificar que se haya enviado el parámetro 'id_cancha'
if (!isset($_GET['id_cancha'])) {
    http_response_code(400);
    echo json_encode(["error" => "El parámetro 'id_cancha' es requerido."]);
    mysqli_close($conexion);
    exit;
}

$id_cancha = intval($_GET['id_cancha']);

// ==================== CONSULTA 1: DATOS DE LA CANCHA ====================
$queryCancha = "
    SELECT
        c.id_cancha,
        c.nombre AS nombre_cancha,
        c.direccion,
        c.precio_por_hora,
        c.tipoCancha,
        c.horasDisponibles,
        c.fechas_abiertas,
        c.estado AS estado_cancha,
        cl.nombre AS nombre_dueno,
        cl.apellido AS apellido_dueno,
        cl.numeroCel AS celular_dueno,
        cl.correo AS correo_dueno
    FROM canchas c
    JOIN clientes cl ON c.id_dueno = cl.id_cliente
    WHERE c.id_cancha = ?
";

$stmt = mysqli_prepare($conexion, $queryCancha);
if (!$stmt) {
    http_response_code(500);
    echo json_encode(["error" => "Error en la consulta de la cancha: " . mysqli_error($conexion)]);
    mysqli_close($conexion);
    exit;
}

mysqli_stmt_bind_param($stmt, "i", $id_cancha);
mysqli_stmt_execute($stmt);
$resultCancha = mysqli_stmt_get_result($stmt);
$cancha = mysqli_fetch_assoc($resultCancha);
mysqli_stmt_close($stmt);

if (!$cancha) {
    http_response_code(404);
    echo json_encode(["error" => "No se encontró la cancha con id_cancha = $id_cancha"]);
    mysqli_close($conexion);
    exit;
}

// Formatear 'horasDisponibles' (opcional)
if (isset($cancha["horasDisponibles"])) {
    $cancha["horasDisponibles"] = date("H:i", strtotime($cancha["horasDisponibles"]));
}

// ==================== CONSULTA 2: RESERVAS ====================
$queryReservas = "
    SELECT
        r.id_reserva,
        r.id_reservador,
        r.fecha_hora_inicio,
        r.fecha_hora_fin,
        r.precio_total,
        r.estado AS estado_reserva,
        r.validado,
        cr.nombre AS nombre_reservador,
        cr.apellido AS apellido_reservador,
        cr.numeroCel AS celular_reservador,
        cr.correo AS correo_reservador
    FROM reservas r
    JOIN clientes cr ON r.id_reservador = cr.id_cliente
    WHERE r.id_cancha = ?
    ORDER BY r.fecha_hora_inicio
";

$stmt2 = mysqli_prepare($conexion, $queryReservas);
if (!$stmt2) {
    http_response_code(500);
    echo json_encode(["error" => "Error en la consulta de reservas: " . mysqli_error($conexion)]);
    mysqli_close($conexion);
    exit;
}

mysqli_stmt_bind_param($stmt2, "i", $id_cancha);
mysqli_stmt_execute($stmt2);
$resultReservas = mysqli_stmt_get_result($stmt2);

$reservas = [];
while ($row = mysqli_fetch_assoc($resultReservas)) {
    // Formatear fechas para mostrar "día/mes/año hora:minutos"
    if (isset($row["fecha_hora_inicio"])) {
        $row["fecha_hora_inicio"] = date("d/m/Y H:i", strtotime($row["fecha_hora_inicio"]));
    }
    if (isset($row["fecha_hora_fin"])) {
        $row["fecha_hora_fin"] = date("d/m/Y H:i", strtotime($row["fecha_hora_fin"]));
    }
    $reservas[] = $row;
}
mysqli_stmt_close($stmt2);

// ==================== RESPUESTA FINAL ====================
$response = [
    "success"  => true,
    "cancha"   => $cancha,
    "reservas" => $reservas
];

echo json_encode($response, JSON_UNESCAPED_UNICODE | JSON_PRETTY_PRINT);

// Cerrar conexión
mysqli_close($conexion);