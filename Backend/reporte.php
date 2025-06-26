<?php
require_once 'cors.php';
require_once 'conexion.php';
require_once 'logica_reporte.php';

configurarCORS();

/**
 * Este script maneja la solicitud GET para obtener un reporte detallado de una cancha.
 * Se espera que se envíe el parámetro 'id_cancha' por la URL.
 */

// Validar que se haya proporcionado el parámetro requerido
if (!isset($_GET['id_cancha'])) {
    http_response_code(400);
    echo json_encode(["error" => "El parámetro 'id_cancha' es requerido."]);
    exit;
}

$id_cancha = intval($_GET['id_cancha']);
$conexion = obtenerConexion();

// Obtener reporte desde la lógica separada
$resultado = obtenerReporteCancha($conexion, $id_cancha);

// Enviar respuesta en formato JSON legible y UTF-8
http_response_code($resultado['status']);
echo json_encode($resultado['data'], JSON_UNESCAPED_UNICODE | JSON_PRETTY_PRINT);

$conexion->close();
