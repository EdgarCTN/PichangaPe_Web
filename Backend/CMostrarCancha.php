<?php
require_once 'cors.php';
require_once 'conexion.php';

function obtenerCanchasPorDueno(int $id_dueno, mysqli $conexion): array {
    if ($id_dueno <= 0) {
        return ["error" => "ID de dueño no válido"];
    }

    $sql = "SELECT id_cancha, nombre, direccion, precio_por_hora FROM canchas WHERE id_dueno = ?";
    $stmt = $conexion->prepare($sql);

    if (!$stmt) {
        return ["error" => "Error al preparar la consulta: " . $conexion->error];
    }

    $stmt->bind_param("i", $id_dueno);
    $stmt->execute();
    $resultado = $stmt->get_result();

    $canchas = [];
    while ($fila = $resultado->fetch_assoc()) {
        $canchas[] = $fila;
    }

    $stmt->close();
    if (!defined('TESTING')) {
        $conexion->close();
    }

    return ["canchas" => $canchas];
}

// Solo ejecuta si no es prueba
if (!defined('TESTING')) {
    $id_dueno = isset($_POST['id_dueno']) ? intval($_POST['id_dueno']) : 0;
    $respuesta = obtenerCanchasPorDueno($id_dueno, $conexion);  // Usa la conexión que viene de conexion.php
    echo json_encode($respuesta);
}
