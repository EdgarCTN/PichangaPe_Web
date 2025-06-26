<?php
require_once 'cors.php';
require_once 'conexion.php';
configurarCORS();

/**
 * Actualiza el estado de una reserva en la base de datos.
 * Solo permite pasar de estado 'pendiente' a 'pagado' o 'cancelado'.
 * @param mysqli $conexion Conexión activa a la base de datos.
 * @param int $id_reserva ID de la reserva a actualizar.
 * @param string $estado_nuevo Nuevo estado que se desea asignar.
 * @return array Respuesta con éxito o mensaje de error.
 */
function actualizarEstadoReserva($conexion, $id_reserva, $estado_nuevo) {
    $respuesta = ["success" => false, "error" => "Error desconocido"];

    // Validación básica de entrada
    if (!$id_reserva || !$estado_nuevo) {
        $respuesta["error"] = "No se han enviado los parámetros id_reserva y estado";
        return $respuesta;
    }

    $id_reserva = intval($id_reserva);

    // Consultar estado actual de la reserva
    $stmtSelect = $conexion->prepare("SELECT estado FROM reservas WHERE id_reserva = ?");
    if (!$stmtSelect) {
        $respuesta["error"] = "Error en la preparación de la consulta (SELECT)";
        return $respuesta;
    }

    $stmtSelect->bind_param("i", $id_reserva);
    $stmtSelect->execute();
    $result = $stmtSelect->get_result();

    // Si no existe la reserva
    if ($result->num_rows === 0) {
        $respuesta["error"] = "El id_reserva no existe";
        $stmtSelect->close();
        return $respuesta;
    }

    $row = $result->fetch_assoc();
    $estado_actual = $row['estado'];
    $stmtSelect->close();

    // Solo se permite actualizar si está en estado 'pendiente'
    if ($estado_actual !== "pendiente") {
        if ($estado_actual === "pagado") {
            $respuesta["error"] = "La reserva ya ha sido aprobada.";
        } elseif ($estado_actual === "cancelado") {
            $respuesta["error"] = "La reserva ya ha sido rechazada.";
        } else {
            $respuesta["error"] = "El estado de la reserva ya no es 'pendiente' y no se puede modificar.";
        }
        return $respuesta;
    }

    // Preparar la consulta para actualizar el estado
    $stmtUpdate = $conexion->prepare("
        UPDATE reservas
        SET estado = ?, validado = CASE WHEN ? = 'pagado' THEN 1 ELSE validado END
        WHERE id_reserva = ? AND estado = 'pendiente'
    ");
    if (!$stmtUpdate) {
        $respuesta["error"] = "Error en la preparación de la consulta (UPDATE)";
        return $respuesta;
    }

    $stmtUpdate->bind_param("ssi", $estado_nuevo, $estado_nuevo, $id_reserva);
    $stmtUpdate->execute();

    // Si se actualizó correctamente
    if ($stmtUpdate->affected_rows > 0) {
        // Consultar datos del dueño de la cancha relacionada a la reserva
        $stmtDueno = $conexion->prepare("
            SELECT c.id_dueno, cli.nombre AS nombre_dueño, cli.apellido AS apellido_dueño
            FROM reservas r
            JOIN canchas c ON r.id_cancha = c.id_cancha
            JOIN clientes cli ON c.id_dueno = cli.id_cliente
            WHERE r.id_reserva = ?
        ");
        if ($stmtDueno) {
            $stmtDueno->bind_param("i", $id_reserva);
            $stmtDueno->execute();
            $resultDueno = $stmtDueno->get_result();

            // Incluir datos del dueño si se encuentran
            if ($resultDueno->num_rows > 0) {
                $dueno = $resultDueno->fetch_assoc();
                $respuesta = [
                    "success" => true,
                    "message" => "Reserva actualizada correctamente",
                    "id_cliente" => $dueno['id_dueno'],
                    "nombre" => $dueno['nombre_dueño'],
                    "apellido" => $dueno['apellido_dueño']
                ];
            } else {
                $respuesta = [
                    "success" => true,
                    "message" => "Reserva actualizada, pero no se encontró el dueño de la cancha"
                ];
            }
            $stmtDueno->close();
        } else {
            $respuesta["error"] = "Error en la preparación de la consulta para obtener el dueño";
        }
    } else {
        $respuesta["error"] = "No se pudo actualizar la reserva. Puede que ya no esté en estado pendiente.";
    }

    $stmtUpdate->close();
    return $respuesta;
}

// Solo ejecuta si la petición es POST (evita ejecuciones accidentales)
if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    $response = actualizarEstadoReserva(
        $conexion,
        $_POST['id_reserva'] ?? null,
        $_POST['estado'] ?? null
    );
    echo json_encode($response);
    $conexion->close();
}
