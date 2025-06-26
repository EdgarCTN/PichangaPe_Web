<?php
require_once 'cors.php';
require_once 'conexion.php';
require_once 'logica_reservaciones_clientes.php';

configurarCORS();

/**
 * Este script obtiene el detalle de una reservación.
 * Acepta solicitudes GET o POST y requiere el parámetro id_reserva.
 */

// Obtener id_reserva desde POST o GET según el método
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

// Validar presencia del parámetro id_reserva
if (empty($id_reserva)) {
    http_response_code(400);
    echo json_encode(["error" => "No se ha enviado el parámetro id_reserva"]);
    exit;
}

$conexion = obtenerConexion();

// Ejecutar lógica para obtener el detalle de la reserva
$resultado = obtenerDetalleReservacion($conexion, $id_reserva);

// Responder con el resultado en formato JSON
http_response_code($resultado['status']);
echo json_encode($resultado['data'], JSON_UNESCAPED_UNICODE);

$conexion->close();
