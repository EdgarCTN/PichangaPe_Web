<?php

/**
 * Obtiene un reporte detallado de una cancha específica, incluyendo información del dueño y sus reservas.
 *
 * @param mysqli $conexion Conexión activa a la base de datos.
 * @param mixed $id_cancha ID de la cancha a consultar.
 * @return array Arreglo con estado HTTP simulado y datos o mensajes de error.
 */
function obtenerReporteCancha($conexion, $id_cancha) {
    if (!is_numeric($id_cancha) || intval($id_cancha) <= 0) {
        return ["status" => 400, "data" => ["error" => "ID de cancha no válido"]];
    }

    // Consulta 1: Información de la cancha y del dueño
    $queryCancha = "
        SELECT
            c.id_cancha,
            c.nombre AS nombre_cancha,
            c.direccion,
            c.precio_por_hora,
            c.tipoCancha,
            c.horasDisponibles,
            c.fechas_abiertas,
            c.estado AS estado_cancha,
            cl.nombre AS nombre_dueno,
            cl.apellido AS apellido_dueno,
            cl.numeroCel AS celular_dueno,
            cl.correo AS correo_dueno
        FROM canchas c
        JOIN clientes cl ON c.id_dueno = cl.id_cliente
        WHERE c.id_cancha = ?
    ";

    $stmt = $conexion->prepare($queryCancha);
    if (!$stmt) {
        return ["status" => 500, "data" => ["error" => "Error en la consulta de la cancha: " . $conexion->error]];
    }

    $stmt->bind_param("i", $id_cancha);
    $stmt->execute();
    $resultCancha = $stmt->get_result();
    $cancha = $resultCancha->fetch_assoc();
    $stmt->close();

    if (!$cancha) {
        return ["status" => 404, "data" => ["error" => "No se encontró la cancha con id_cancha = $id_cancha"]];
    }

    // Formato opcional para 'horasDisponibles' (HH:MM)
    if (isset($cancha["horasDisponibles"])) {
        $cancha["horasDisponibles"] = date("H:i", strtotime($cancha["horasDisponibles"]));
    }

    // Consulta 2: Lista de reservas asociadas a la cancha
    $queryReservas = "
        SELECT
            r.id_reserva,
            r.id_reservador,
            r.fecha_hora_inicio,
            r.fecha_hora_fin,
            r.precio_total,
            r.estado AS estado_reserva,
            r.validado,
            cr.nombre AS nombre_reservador,
            cr.apellido AS apellido_reservador,
            cr.numeroCel AS celular_reservador,
            cr.correo AS correo_reservador
        FROM reservas r
        JOIN clientes cr ON r.id_reservador = cr.id_cliente
        WHERE r.id_cancha = ?
        ORDER BY r.fecha_hora_inicio
    ";

    $stmt2 = $conexion->prepare($queryReservas);
    if (!$stmt2) {
        return ["status" => 500, "data" => ["error" => "Error en la consulta de reservas: " . $conexion->error]];
    }

    $stmt2->bind_param("i", $id_cancha);
    $stmt2->execute();
    $resultReservas = $stmt2->get_result();

    $reservas = [];
    while ($row = $resultReservas->fetch_assoc()) {
        // Formatea fechas en formato legible
        if (isset($row["fecha_hora_inicio"])) {
            $row["fecha_hora_inicio"] = date("d/m/Y H:i", strtotime($row["fecha_hora_inicio"]));
        }
        if (isset($row["fecha_hora_fin"])) {
            $row["fecha_hora_fin"] = date("d/m/Y H:i", strtotime($row["fecha_hora_fin"]));
        }
        $reservas[] = $row;
    }
    $stmt2->close();

    // Devuelve los datos agrupados en el reporte
    return [
        "status" => 200,
        "data" => [
            "success" => true,
            "cancha" => $cancha,
            "reservas" => $reservas
        ]
    ];
}
