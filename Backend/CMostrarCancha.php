<?php
require 'cors.php';
require 'conexion.php';

function obtenerCanchasPorDueno($id_dueno, $conexion) {
    if (!is_numeric($id_dueno) || $id_dueno <= 0) {
        return ["error" => "ID de dueño no válido"];
    }

    $sql = "SELECT id_cancha, nombre, direccion, precio_por_hora, estado 
            FROM canchas 
            WHERE id_dueno = ?";
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
    return ["canchas" => $canchas];
}

// Solo ejecuta esta parte si **no estás en modo prueba**
if (!defined('TESTING')) {
    configurarCORS();

    $conexion = obtenerConexion();
    $id_dueno = $_POST['id_dueno'] ?? null;

    $resultado = obtenerCanchasPorDueno($id_dueno, $conexion);
    echo json_encode($resultado);

    $conexion->close();
}
