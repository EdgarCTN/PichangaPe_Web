<?php
function obtenerDetalleReservacion($conexion, $id_reserva) {
    if (!is_numeric($id_reserva) || intval($id_reserva) <= 0) {
        return ["status" => 400, "data" => ["error" => "ID de reserva no válido"]];
    }

    $query = "SELECT
        DATE(r.fecha_hora_inicio) AS fecha,
        DATE_FORMAT(r.fecha_hora_inicio, '%H:%i') AS hora_inicio,
        DATE_FORMAT(r.fecha_hora_fin, '%H:%i') AS hora_fin,
        cl.id_cliente,
        cl.nombre AS nombre_reservador,
        cl.apellido AS apellido_reservador,
        cl.numeroCel AS celular,
        r.estado AS estado_reserva
    FROM reservas r
    JOIN clientes cl ON r.id_reservador = cl.id_cliente
    WHERE r.id_reserva = ?";

    $stmt = $conexion->prepare($query);
    if (!$stmt) {
        return ["status" => 500, "data" => ["error" => "Error en la preparación de la consulta: " . $conexion->error]];
    }

    $stmt->bind_param("i", $id_reserva);
    if (!$stmt->execute()) {
        return ["status" => 500, "data" => ["error" => "Error al ejecutar la consulta: " . $stmt->error]];
    }

    $resultado = $stmt->get_result();
    $stmt->close();

    if ($resultado->num_rows > 0) {
        return ["status" => 200, "data" => $resultado->fetch_assoc()];
    } else {
        return ["status" => 404, "data" => ["error" => "No se encontró la reserva con el id proporcionado"]];
    }
}
