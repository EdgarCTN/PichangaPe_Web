<?php
require_once 'cors.php';
require_once 'conexion.php';
require_once 'logica_estado_cancha.php'; // Aquí estará la función

configurarCORS();

// Solo permitir método POST
if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    http_response_code(405);
    echo json_encode(["error" => "Método no permitido"]);
    exit();
}

$datos = json_decode(file_get_contents("php://input"), true);

if (!isset($datos['id_cancha']) || !isset($datos['estado'])) {
    http_response_code(400);
    echo json_encode(["error" => "Faltan datos obligatorios"]);
    exit();
}

$conexion = obtenerConexion();
$resultado = actualizarEstadoCancha($conexion, (int)$datos['id_cancha'], $datos['estado']);

http_response_code($resultado['status']);
echo json_encode($resultado['data']);
