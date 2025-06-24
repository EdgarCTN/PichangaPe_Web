<?php
require 'cors.php';
require 'conexion.php';
configurarCORS();

// Leer JSON correctamente
$data = json_decode(file_get_contents("php://input"), true);
$id_cancha = isset($data['id_cancha']) ? intval($data['id_cancha']) : 0;

if ($id_cancha <= 0) {
    http_response_code(400);
    echo json_encode(["error" => "ID de cancha no válido"]);
    exit;
}

// Verificar si existen reservas futuras pagadas (no cancelables)
$sqlVerificar = "
    SELECT COUNT(*) AS cantidad 
    FROM reservas 
    WHERE id_cancha = ? 
      AND fecha_hora_inicio > NOW() 
      AND estado = 'pagado'
";
$stmt = $conexion->prepare($sqlVerificar);
$stmt->bind_param("i", $id_cancha);
$stmt->execute();
$stmt->bind_result($cantidadPagadas);
$stmt->fetch();
$stmt->close();

if ($cantidadPagadas > 0) {
    http_response_code(403);
    echo json_encode(["error" => "La cancha no puede eliminarse porque tiene reservas futuras pagadas."]);
    exit;
}

// Cancelar reservas futuras pendientes
$sqlCancelar = "
    UPDATE reservas 
    SET estado = 'cancelado' 
    WHERE id_cancha = ? 
      AND fecha_hora_inicio > NOW() 
      AND estado = 'pendiente'
";
$stmt = $conexion->prepare($sqlCancelar);
$stmt->bind_param("i", $id_cancha);
$stmt->execute();
$stmt->close();

// Eliminar cancha
$sqlEliminar = "DELETE FROM canchas WHERE id_cancha = ?";
$stmt = $conexion->prepare($sqlEliminar);
$stmt->bind_param("i", $id_cancha);
$exito = $stmt->execute();
$stmt->close();

if ($exito) {
    echo json_encode(["mensaje" => "Cancha eliminada correctamente."]);
} else {
    http_response_code(500);
    echo json_encode(["error" => "Error al eliminar la cancha."]);
}
?>
