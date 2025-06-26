<?php

/**
 * Obtiene las reservas registradas para una cancha específica,
 * incluyendo fecha, hora y estado traducido a un formato más comprensible.
 *
 * @param mysqli $conexion Conexión activa a la base de datos.
 * @param mixed $id_cancha ID de la cancha a consultar.
 * @return array Arreglo con estado HTTP simulado y lista de reservas o mensaje de error.
 */
function obtenerReservasPorCancha($conexion, $id_cancha) {
    // Validar que el ID sea un número válido y mayor a cero
    if (!is_numeric($id_cancha) || intval($id_cancha) <= 0) {
        return ["status" => 400, "data" => ["error" => "ID de cancha no válido"]];
    }

    // Consulta SQL que extrae los datos relevantes de las reservas
    $query = "
        SELECT
            r.id_reserva,
            DATE(r.fecha_hora_inicio) AS fecha_inicio, -- Fecha de inicio (solo día)
            DATE_FORMAT(r.fecha_hora_inicio, '%H:%i') AS hora_inicio, -- Hora en formato HH:MM
            -- Si la fecha de inicio y fin son el mismo día, solo se muestra la hora final,
            -- de lo contrario, se concatena fecha + hora para mayor claridad
            CASE
                WHEN DATE(r.fecha_hora_inicio) = DATE(r.fecha_hora_fin)
                    THEN DATE_FORMAT(r.fecha_hora_fin, '%H:%i')
                ELSE CONCAT(DATE(r.fecha_hora_fin), ' ', DATE_FORMAT(r.fecha_hora_fin, '%H:%i'))
            END AS hora_fin,
            -- Traducir el estado 'pagado' a 'Alquilada' para mostrarlo al cliente
            CASE
                WHEN r.estado = 'pagado' THEN 'Alquilada'
                ELSE r.estado
            END AS estado_reserva
        FROM reservas r
        WHERE r.id_cancha = ?
        ORDER BY r.fecha_hora_inicio
    ";

    // Preparar la consulta SQL para ejecución segura
    $stmt = $conexion->prepare($query);
    if (!$stmt) {
        return ["status" => 500, "data" => ["error" => "Error en la preparación de la consulta"]];
    }

    // Asegurar tipo entero para el parámetro y enlazarlo a la consulta
    $id_cancha = intval($id_cancha);
    $stmt->bind_param("i", $id_cancha);

    // Ejecutar la consulta preparada
    $stmt->execute();
    $resultado = $stmt->get_result();

    // Recolectar los resultados en un arreglo
    $reservas = [];
    while ($fila = $resultado->fetch_assoc()) {
        $reservas[] = $fila;
    }

    // Liberar recursos
    $stmt->close();

    // Devolver éxito con los datos encontrados
    return ["status" => 200, "data" => ["reservas" => $reservas]];
}
