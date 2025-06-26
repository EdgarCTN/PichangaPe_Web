<?php
/**
 * Obtiene estadísticas de todas las canchas registradas por un cliente.
 *
 * Devuelve información como:
 * - Ganancias por cancha
 * - Total de reservas
 * - Total de reservas pagadas
 *
 * @param mysqli $conexion Conexión activa a la base de datos.
 * @param int $id_cliente ID del dueño (cliente) que registra las canchas.
 * @return array Arreglo con estado HTTP y los datos o el error correspondiente.
 */
function obtenerEstadisticasPorDueno($conexion, $id_cliente) {
    // Validar que el ID del cliente sea numérico y positivo
    if (!is_numeric($id_cliente) || intval($id_cliente) <= 0) {
        return ["status" => 400, "data" => ["error" => "ID de cliente no válido"]];
    }

    // Consulta SQL que calcula estadísticas por cancha
    $query = "
        SELECT
            c.id_cancha,
            c.nombre,
            IFNULL(SUM(CASE WHEN r.estado = 'pagado' THEN r.precio_total ELSE 0 END), 0) AS ganancias,
            COUNT(r.id_reserva) AS total_reservas,
            COUNT(CASE WHEN r.estado = 'pagado' THEN 1 ELSE NULL END) AS total_reservas_pagadas
        FROM canchas c
        LEFT JOIN reservas r ON c.id_cancha = r.id_cancha
        WHERE c.id_dueno = ?
        GROUP BY c.id_cancha, c.nombre
    ";

    $stmt = $conexion->prepare($query);
    if (!$stmt) {
        return ["status" => 500, "data" => ["error" => "Error al preparar la consulta: " . $conexion->error]];
    }

    $stmt->bind_param("i", $id_cliente);

    // Ejecutar la consulta preparada
    if (!$stmt->execute()) {
        $stmt->close();
        return ["status" => 500, "data" => ["error" => "Error en la ejecución de la consulta: " . $stmt->error]];
    }

    // Obtener resultados
    $resultado = $stmt->get_result();
    if (!$resultado) {
        $stmt->close();
        return ["status" => 500, "data" => ["error" => "Error al obtener resultados"]];
    }

    // Arreglo para almacenar los datos finales
    $datos = [];
    while ($fila = $resultado->fetch_assoc()) {
        $datos[] = $fila;
    }

    $stmt->close();
    return ["status" => 200, "data" => $datos];
}
