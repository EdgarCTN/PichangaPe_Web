<?php
require_once 'cors.php';
require_once 'conexion.php';
configurarCORS();
// Función para actualizar el estado de una reserva
function actualizarEstadoReserva($conexion, $id_reserva, $estado_nuevo) {
    $respuesta = ["success" => false, "error" => "Error desconocido"];
// Verificar que se hayan enviado los parámetros necesarios
    if (!$id_reserva || !$estado_nuevo) {
        $respuesta["error"] = "No se han enviado los parámetros id_reserva y estado";
        return $respuesta;
    }
// Validar que el estado nuevo sea uno de los permitidos
    $id_reserva = intval($id_reserva);

    $stmtSelect = $conexion->prepare("SELECT estado FROM reservas WHERE id_reserva = ?");
    if (!$stmtSelect) {
        $respuesta["error"] = "Error en la preparación de la consulta (SELECT)";
        return $respuesta;
    }

    $stmtSelect->bind_param("i", $id_reserva);
    $stmtSelect->execute();
    $result = $stmtSelect->get_result();
// Verificar si la reserva existe
    if ($result->num_rows === 0) {
        $respuesta["error"] = "El id_reserva no existe";
        $stmtSelect->close();
        return $respuesta;
    }

    $row = $result->fetch_assoc();
    $estado_actual = $row['estado'];
    $stmtSelect->close();

    if ($estado_actual !== "pendiente") {
        $mensaje = "El estado de la reserva ya no es 'pendiente' y no se puede modificar.";
        if ($estado_actual == "pagado") {
            $mensaje = "La reserva ya ha sido aprobada.";
        }
        if ($estado_actual == "cancelado") {
            $mensaje = "La reserva ya ha sido rechazada.";
        }
        $respuesta["error"] = $mensaje;
        return $respuesta;
    }

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

    if ($stmtUpdate->affected_rows > 0) {
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

// Solo si se llama directamente (no desde test)
if (isset($_SERVER['REQUEST_METHOD']) && $_SERVER['REQUEST_METHOD'] === 'POST') {
    $response = actualizarEstadoReserva(
        $conexion,
        $_POST['id_reserva'] ?? null,
        $_POST['estado'] ?? null
    );
    echo json_encode($response);
    $conexion->close();
}
