<?php
function obtenerEstadisticasPorDueño($conexion, $id_cliente) {
    if (!is_numeric($id_cliente) || intval($id_cliente) <= 0) {
        return ["status" => 400, "data" => ["error" => "ID de cliente no válido"]];
    }

    $query = "
        SELECT
            c.id_cancha,
            c.nombre,
            IFNULL(SUM(CASE WHEN r.estado = 'pagado' THEN r.precio_total ELSE 0 END), 0) AS ganancias,
            COUNT(r.id_reserva) AS total_reservas,
            COUNT(CASE WHEN r.estado = 'pagado' THEN 1 ELSE NULL END) AS total_reservas_pagadas
        FROM
            canchas c
        LEFT JOIN
            reservas r ON c.id_cancha = r.id_cancha
        WHERE
            c.id_dueno = ?
        GROUP BY
            c.id_cancha, c.nombre
    ";

    $stmt = $conexion->prepare($query);
    if (!$stmt) {
        return ["status" => 500, "data" => ["error" => "Error al preparar la consulta: " . $conexion->error]];
    }

    $stmt->bind_param("i", $id_cliente);

    if (!$stmt->execute()) {
        $stmt->close();
        return ["status" => 500, "data" => ["error" => "Error en la ejecución de la consulta: " . $stmt->error]];
    }

    $resultado = $stmt->get_result();
    if (!$resultado) {
        $stmt->close();
        return ["status" => 500, "data" => ["error" => "Error al obtener resultados"]];
    }

    $datos = [];
    while ($fila = $resultado->fetch_assoc()) {
        $datos[] = $fila;
    }

    $stmt->close();
    return ["status" => 200, "data" => $datos];
}
