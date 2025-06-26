<?php
require_once 'cors.php';
require_once 'conexion.php';
require_once 'logica_reservaciones.php';

configurarCORS();

/**
 * Este script obtiene las reservas asociadas a una cancha específica.
 * Requiere que se envíe el parámetro 'id_cancha' por método POST.
 */

// Verificar si se envió el parámetro requerido
if (!isset($_POST['id_cancha'])) {
    http_response_code(400);
    echo json_encode(["error" => "No se ha enviado el parámetro id_cancha"]);
    exit;
}

$id_cancha = $_POST['id_cancha'];
$conexion = obtenerConexion();

// Ejecutar la lógica que consulta las reservas por cancha
$resultado = obtenerReservasPorCancha($conexion, $id_cancha);

// Responder con los resultados en formato JSON
http_response_code($resultado['status']);
echo json_encode($resultado['data'], JSON_UNESCAPED_UNICODE);

$conexion->close();
