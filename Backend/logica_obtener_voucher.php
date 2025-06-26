<?php

/**
 * Obtiene el URL del voucher de pago y estado de una reserva específica.
 *
 * @param mysqli $conexion Conexión activa a la base de datos.
 * @param mixed $id_reserva ID de la reserva.
 * @return array Arreglo con estado HTTP simulado y datos o mensajes de error.
 */
function obtenerVoucherReserva($conexion, $id_reserva) {
    if (!is_numeric($id_reserva) || intval($id_reserva) <= 0) {
        return ["status" => 400, "data" => ["success" => false, "error" => "ID de reserva no válido"]];
    }

    $stmt = $conexion->prepare("SELECT voucher_pago, estado FROM reservas WHERE id_reserva = ?");
    if (!$stmt) {
        return ["status" => 500, "data" => ["success" => false, "error" => "Error en la preparación de la consulta"]];
    }

    $stmt->bind_param("i", $id_reserva);
    $stmt->execute();
    $stmt->bind_result($voucher_pago, $estado);
    $stmt->fetch();
    $stmt->close();

    // Verifica que exista un voucher asociado
    if (empty($voucher_pago)) {
        return ["status" => 404, "data" => ["success" => false, "error" => "No se encontró voucher para el id_reserva proporcionado"]];
    }

    // Verifica que el valor del voucher sea una URL válida
    if (!filter_var($voucher_pago, FILTER_VALIDATE_URL)) {
        return ["status" => 400, "data" => ["success" => false, "error" => "El voucher_pago no es una URL válida"]];
    }

    return [
        "status" => 200,
        "data" => [
            "success" => true,
            "image_url" => $voucher_pago,
            "estado" => $estado
        ]
    ];
}
