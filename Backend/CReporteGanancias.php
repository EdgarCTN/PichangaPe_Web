<?php

require_once 'cors.php';
require_once 'conexion.php';

$id_dueno = $_POST['id_dueno'] ?? null;

if (!$id_dueno) {
    echo json_encode(["error" => "Falta el parámetro id_dueno"]);
    exit;
}

try {
    $query = "
        SELECT c.nombre, COALESCE(SUM(r.precio_total), 0) AS total
        FROM canchas c
        LEFT JOIN reservas r ON c.id_cancha = r.id_cancha AND r.estado = 'pagado' AND r.validado = 1
        WHERE c.id_dueno = ?
        GROUP BY c.id_cancha
        ORDER BY total DESC
    ";



    $stmt = $conexion->prepare($query);
    if (!$stmt) {
        echo json_encode(["error" => "Error en la preparación de la consulta"]);
        exit;
    }

    $stmt->bind_param("i", $id_dueno);
    $stmt->execute();
    $resultado = $stmt->get_result();

    $ganancias = [];
    while ($fila = $resultado->fetch_assoc()) {
        $ganancias[] = [
            "nombre" => $fila["nombre"],
            "total" => number_format((float)$fila["total"], 2, '.', '')
        ];
    }

    $stmt->close();
    $conexion->close();

    echo json_encode(["ganancias" => $ganancias]);
} catch (Exception $e) {
    echo json_encode(["error" => "Error del servidor: " . $e->getMessage()]);
}
