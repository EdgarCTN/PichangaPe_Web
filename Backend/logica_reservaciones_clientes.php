<?php

/**
 * Obtiene los detalles básicos de una reserva, incluyendo fecha, horas, cliente y estado.
 *
 * Esta función consulta la base de datos para obtener información detallada
 * sobre una reserva específica, incluyendo datos del cliente que realizó la reserva.
 *
 * @param mysqli $conexion Conexión activa a la base de datos.
 * @param mixed $id_reserva ID de la reserva a consultar.
 * @return array Arreglo con un código de estado HTTP simulado y datos de la reserva o un mensaje de error.
 */
function obtenerDetalleReservacion($conexion, $id_reserva) {
    // Validar que el ID sea numérico y mayor que cero
    if (!is_numeric($id_reserva) || intval($id_reserva) <= 0) {
        return ["status" => 400, "data" => ["error" => "ID de reserva no válido"]];
    }

    // Consulta SQL para obtener detalles de la reserva y del cliente que reservó
    $query = "
        SELECT
            DATE(r.fecha_hora_inicio) AS fecha,                        -- Fecha de la reserva
            DATE_FORMAT(r.fecha_hora_inicio, '%H:%i') AS hora_inicio, -- Hora de inicio (formato 24h)
            DATE_FORMAT(r.fecha_hora_fin, '%H:%i') AS hora_fin,       -- Hora de fin (formato 24h)
            cl.id_cliente,                                            -- ID del cliente
            cl.nombre AS nombre_reservador,                           -- Nombre del cliente
            cl.apellido AS apellido_reservador,                       -- Apellido del cliente
            cl.numeroCel AS celular,                                  -- Teléfono del cliente
            r.estado AS estado_reserva                                -- Estado de la reserva (pendiente, pagado, etc.)
        FROM reservas r
        JOIN clientes cl ON r.id_reservador = cl.id_cliente
        WHERE r.id_reserva = ?
    ";

    // Preparar la consulta SQL para evitar inyecciones y errores
    $stmt = $conexion->prepare($query);
    if (!$stmt) {
        // Si hubo un error al preparar la consulta, devolver mensaje de error
        return ["status" => 500, "data" => ["error" => "Error en la preparación de la consulta: " . $conexion->error]];
    }

    // Enlazar el parámetro a la consulta preparada (i = entero)
    $stmt->bind_param("i", $id_reserva);

    // Ejecutar la consulta SQL
    if (!$stmt->execute()) {
        // Si falla la ejecución, devolver mensaje de error
        return ["status" => 500, "data" => ["error" => "Error al ejecutar la consulta: " . $stmt->error]];
    }

    // Obtener el conjunto de resultados de la consulta
    $resultado = $stmt->get_result();

    // Liberar recursos cerrando la sentencia preparada
    $stmt->close();

    // Si se encontraron resultados, retornar los datos
    if ($resultado->num_rows > 0) {
        // Retornar un arreglo con estado 200 (OK) y los datos
        return ["status" => 200, "data" => $resultado->fetch_assoc()];
    } else {
        // Si no se encuentra ninguna reserva, retornar error 404
        return ["status" => 404, "data" => ["error" => "No se encontró la reserva con el id proporcionado"]];
    }
}
