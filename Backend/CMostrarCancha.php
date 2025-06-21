<?php
require 'cors.php';
require 'conexion.php';

// Validar id_dueno
$id_dueno = isset($_POST['id_dueno']) ? intval($_POST['id_dueno']) : 0;

if ($id_dueno <= 0) {
    http_response_code(400);
    echo json_encode(["error" => "ID de dueño no válido"]);
    exit;
}

// Consulta preparada que incluye el campo `estado`
$sql = "SELECT id_cancha, nombre, direccion, precio_por_hora, estado 
        FROM canchas 
        WHERE id_dueno = ?";
$stmt = $conexion->prepare($sql);

if (!$stmt) {
    http_response_code(500);
    echo json_encode(["error" => "Error al preparar la consulta: " . $conexion->error]);
    exit;
}

$stmt->bind_param("i", $id_dueno);
$stmt->execute();

$resultado = $stmt->get_result();

$canchas = [];
while ($fila = $resultado->fetch_assoc()) {
    $canchas[] = $fila;
}

$stmt->close();
$conexion->close();

// Enviar respuesta
echo json_encode(["canchas" => $canchas]);
?>
