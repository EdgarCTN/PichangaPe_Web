<?php
require_once 'cors.php';
require_once 'conexion.php';
require_once 'logica_reservaciones_clientes.php';

configurarCORS();

/**
 * Este archivo maneja la lógica para obtener el detalle de una reservación específica
 * mediante el parámetro `id_reserva`, recibido por POST o GET.
 */

// Obtener el valor de id_reserva dependiendo del método HTTP utilizado
$id_reserva = null;
if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    $id_reserva = $_POST['id_reserva'] ?? null;
} elseif ($_SERVER['REQUEST_METHOD'] === 'GET') {
    $id_reserva = $_GET['id_reserva'] ?? null;
} else {
    // Método no permitido
    http_response_code(405);
    echo json_encode(["error" => "Método no permitido"]);
    exit;
}

// Validar que se haya enviado el parámetro id_reserva
if (empty($id_reserva)) {
    http_response_code(400);
    echo json_encode(["error" => "No se ha enviado el parámetro id_reserva"]);
    exit;
}

$conexion = obtenerConexion(); // Abrir conexión con la base de datos

// Obtener los datos de la reserva desde la lógica del sistema
$resultado = obtenerDetalleReservacion($conexion, $id_reserva);

// Enviar respuesta HTTP con código de estado correspondiente
http_response_code($resultado['status']);
echo json_encode($resultado['data'], JSON_UNESCAPED_UNICODE);

$conexion->close(); // Cerrar la conexión a la base de datos
