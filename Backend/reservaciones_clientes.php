<?php
require_once 'cors.php';
require_once 'conexion.php';
require_once 'logica_reservaciones_clientes.php';

configurarCORS();

// Obtener id_reserva desde POST o GET
$id_reserva = null;
if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    $id_reserva = $_POST['id_reserva'] ?? null;
} elseif ($_SERVER['REQUEST_METHOD'] === 'GET') {
    $id_reserva = $_GET['id_reserva'] ?? null;
} else {
    http_response_code(405);
    echo json_encode(["error" => "Método no permitido"]);
    exit;
}

if (empty($id_reserva)) {
    http_response_code(400);
    echo json_encode(["error" => "No se ha enviado el parámetro id_reserva"]);
    exit;
}

$conexion = obtenerConexion();
$resultado = obtenerDetalleReservacion($conexion, $id_reserva);
http_response_code($resultado['status']);
echo json_encode($resultado['data'], JSON_UNESCAPED_UNICODE);

$conexion->close();
