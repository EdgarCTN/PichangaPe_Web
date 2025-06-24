<?php
require_once 'cors.php';
require_once 'conexion.php';
configurarCORS();

// Solo permitir método POST
if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    http_response_code(405);
    echo json_encode(["error" => "Método no permitido"]);
    exit();
}

// Obtener y validar datos JSON del cuerpo de la solicitud
$datos = json_decode(file_get_contents("php://input"), true);

if (!isset($datos['id_cancha']) || !isset($datos['estado'])) {
    http_response_code(400);
    echo json_encode(["error" => "Faltan datos obligatorios"]);
    exit();
}

$id_cancha = (int)$datos['id_cancha'];
$estado = $datos['estado'];
$estados_permitidos = ['activa', 'inactiva', 'mantenimiento'];

if (!in_array($estado, $estados_permitidos)) {
    http_response_code(400);
    echo json_encode(["error" => "Estado inválido"]);
    exit();
}

// Verificar si existe la cancha
$stmt = $conexion->prepare("SELECT COUNT(*) FROM canchas WHERE id_cancha = ?");
$stmt->bind_param("i", $id_cancha);
$stmt->execute();
$stmt->bind_result($existe);
$stmt->fetch();
$stmt->close();

if ($existe == 0) {
    http_response_code(404);
    echo json_encode(["error" => "La cancha no existe"]);
    exit();
}

// Actualizar estado
$stmt = $conexion->prepare("UPDATE canchas SET estado = ? WHERE id_cancha = ?");
$stmt->bind_param("si", $estado, $id_cancha);

if ($stmt->execute()) {
    echo json_encode(["mensaje" => "Estado actualizado correctamente"]);
} else {
    http_response_code(500);
    echo json_encode(["error" => "Error al actualizar estado"]);
}

$stmt->close();
?>
