<?php
require 'cors.php';
require 'conexion.php';

function actualizarEstadoReserva($conexion, $id_reserva, $estado_nuevo) {
    if (!$id_reserva || !$estado_nuevo) {
        return ["success" => false, "error" => "No se han enviado los parámetros id_reserva y estado"];
    }

    $id_reserva = intval($id_reserva);

    // Obtener estado actual
    $stmtSelect = $conexion->prepare("SELECT estado FROM reservas WHERE id_reserva = ?");
    if (!$stmtSelect) {
        return ["success" => false, "error" => "Error en la preparación de la consulta (SELECT)"];
    }
    $stmtSelect->bind_param("i", $id_reserva);
    $stmtSelect->execute();
    $result = $stmtSelect->get_result();

    if ($result->num_rows === 0) {
        return ["success" => false, "error" => "El id_reserva no existe"];
    }

    $row = $result->fetch_assoc();
    $estado_actual = $row['estado'];
    $stmtSelect->close();

    // Verificar si ya no está pendiente
    if ($estado_actual !== "pendiente") {
        $mensaje = "El estado de la reserva ya no es 'pendiente' y no se puede modificar.";
        if ($estado_actual == "pagado") $mensaje = "La reserva ya ha sido aprobada.";
        if ($estado_actual == "cancelado") $mensaje = "La reserva ya ha sido rechazada.";
        return ["success" => false, "error" => $mensaje];
    }

    // Actualizar estado
    $stmtUpdate = $conexion->prepare("
        UPDATE reservas 
        SET estado = ?, validado = CASE WHEN ? = 'pagado' THEN 1 ELSE validado END 
        WHERE id_reserva = ? AND estado = 'pendiente'
    ");

    if (!$stmtUpdate) {
        return ["success" => false, "error" => "Error en la preparación de la consulta (UPDATE)"];
    }
    $stmtUpdate->bind_param("ssi", $estado_nuevo, $estado_nuevo, $id_reserva);
    $stmtUpdate->execute();

    if ($stmtUpdate->affected_rows > 0) {
        // Obtener dueño
        $stmtDueno = $conexion->prepare("
            SELECT c.id_dueno, cli.nombre AS nombre_dueño, cli.apellido AS apellido_dueño
            FROM reservas r
            JOIN canchas c ON r.id_cancha = c.id_cancha
            JOIN clientes cli ON c.id_dueno = cli.id_cliente
            WHERE r.id_reserva = ?
        ");
        if (!$stmtDueno) {
            return ["success" => false, "error" => "Error en la preparación de la consulta para obtener el dueño"];
        }
        $stmtDueno->bind_param("i", $id_reserva);
        $stmtDueno->execute();
        $resultDueno = $stmtDueno->get_result();

        if ($resultDueno->num_rows > 0) {
            $dueno = $resultDueno->fetch_assoc();
            $stmtDueno->close();
            $stmtUpdate->close();
            return [
                "success" => true,
                "message" => "Reserva actualizada correctamente",
                "id_cliente" => $dueno['id_dueno'],
                "nombre" => $dueno['nombre_dueño'],
                "apellido" => $dueno['apellido_dueño']
            ];
        } else {
            $stmtDueno->close();
            $stmtUpdate->close();
            return ["success" => true, "message" => "Reserva actualizada, pero no se encontró el dueño de la cancha"];
        }
    } else {
        $stmtUpdate->close();
        return ["success" => false, "error" => "No se pudo actualizar la reserva. Puede que ya no esté en estado pendiente."];
    }
}

// Solo si se llama directamente (no desde test)
if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    $response = actualizarEstadoReserva(
        $conexion,
        $_POST['id_reserva'] ?? null,
        $_POST['estado'] ?? null
    );
    echo json_encode($response);
    $conexion->close();
}
?>
