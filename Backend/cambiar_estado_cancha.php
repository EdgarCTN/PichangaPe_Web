<?php
require_once 'cors.php';
require_once 'conexion.php';
require_once 'logica_estado_cancha.php'; // Contiene la lógica para actualizar el estado de la cancha

configurarCORS();

// Solo permitir método POST
if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    http_response_code(405); // Método no permitido
    echo json_encode(["error" => "Método no permitido"]);
    exit();
}

// Obtener los datos JSON del cuerpo de la solicitud
$datos = json_decode(file_get_contents("php://input"), true);

// Validar que se hayan enviado los datos necesarios
if (!isset($datos['id_cancha']) || !isset($datos['estado'])) {
    http_response_code(400); // Solicitud incorrecta
    echo json_encode(["error" => "Faltan datos obligatorios"]);
    exit();
}

// Obtener conexión a la base de datos
$conexion = obtenerConexion();

// Ejecutar la lógica para actualizar el estado de la cancha
$resultado = actualizarEstadoCancha($conexion, (int)$datos['id_cancha'], $datos['estado']);

// Devolver el código de respuesta y el resultado
http_response_code($resultado['status']);
echo json_encode($resultado['data']);
