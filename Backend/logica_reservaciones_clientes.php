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
            DATE(r.fecha_hora_inicio) AS fecha, -- Fecha de inicio de la reserva
            DATE_FORMAT(r.fecha_hora_inicio, '%H:%i') AS hora_inicio, -- Hora de inicio en formato HH:MM
            DATE_FORMAT(r.fecha_hora_fin, '%H:%i') AS hora_fin,       -- Hora de fin en formato HH:MM
            cl.id_cliente,              -- ID del cliente que reservó
            cl.nombre AS nombre_reservador, -- Nombre del cliente
            cl.apellido AS apellido_reservador, -- Apellido del cliente
            cl.numeroCel AS celular,    -- Número de celular del cliente
            r.estado AS estado_reserva  -- Estado actual de la reserva
        FROM reservas r
        JOIN clientes cl ON r.id_reservador = cl.id_cliente
        WHERE r.id_reserva = ?
    ";

    // Preparar la consulta SQL
    $stmt = $conexion->prepare($query);
    if (!$stmt) {
        // Error al preparar la consulta
        return ["status" => 500, "data" => ["error" => "Error en la preparación de la consulta: " . $conexion->error]];
    }

    // Asociar el parámetro ID a la consulta preparada
    $stmt->bind_param("i", $id_reserva);

    // Ejecutar la consulta y verificar errores
    if (!$stmt->execute()) {
        return ["status" => 500, "data" => ["error" => "Error al ejecutar la consulta: " . $stmt->error]];
    }

    // Obtener el resultado de la consulta
    $resultado = $stmt->get_result();
    $stmt->close(); // Cerrar la sentencia preparada

    // Si se encontró al menos un resultado, devolver los datos
    if ($resultado->num_rows > 0) {
        return ["status" => 200, "data" => $resultado->fetch_assoc()];
    } else {
        // Si no se encontró ninguna reserva con el ID dado
        return ["status" => 404, "data" => ["error" => "No se encontró la reserva con el id proporcionado"]];
    }
}
