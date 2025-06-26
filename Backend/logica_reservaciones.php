<?php

/**
 * Obtiene las reservas registradas para una cancha específica, incluyendo fecha, hora y estado.
 *
 * @param mysqli $conexion Conexión activa a la base de datos.
 * @param mixed $id_cancha ID de la cancha a consultar.
 * @return array Arreglo con estado HTTP simulado y lista de reservas o mensaje de error.
 */
function obtenerReservasPorCancha($conexion, $id_cancha) {
    if (!is_numeric($id_cancha) || intval($id_cancha) <= 0) {
        return ["status" => 400, "data" => ["error" => "ID de cancha no válido"]];
    }

    // Consulta de reservas con formato de fecha y estado personalizado
    $query = "
        SELECT
            r.id_reserva,
            DATE(r.fecha_hora_inicio) AS fecha_inicio,
            DATE_FORMAT(r.fecha_hora_inicio, '%H:%i') AS hora_inicio,
            CASE
                WHEN DATE(r.fecha_hora_inicio) = DATE(r.fecha_hora_fin)
                    THEN DATE_FORMAT(r.fecha_hora_fin, '%H:%i')
                ELSE CONCAT(DATE(r.fecha_hora_fin), ' ', DATE_FORMAT(r.fecha_hora_fin, '%H:%i'))
            END AS hora_fin,
            CASE
                WHEN r.estado = 'pagado' THEN 'Alquilada'
                ELSE r.estado
            END AS estado_reserva
        FROM reservas r
        WHERE r.id_cancha = ?
        ORDER BY r.fecha_hora_inicio
    ";

    $stmt = $conexion->prepare($query);
    if (!$stmt) {
        return ["status" => 500, "data" => ["error" => "Error en la preparación de la consulta"]];
    }

    $id_cancha = intval($id_cancha);
    $stmt->bind_param("i", $id_cancha);
    $stmt->execute();
    $resultado = $stmt->get_result();

    $reservas = [];
    while ($fila = $resultado->fetch_assoc()) {
        $reservas[] = $fila;
    }

    $stmt->close();
    return ["status" => 200, "data" => ["reservas" => $reservas]];
}
