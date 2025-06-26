<?php
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

    if (empty($voucher_pago)) {
        return ["status" => 404, "data" => ["success" => false, "error" => "No se encontró voucher para el id_reserva proporcionado"]];
    }

    if (!filter_var($voucher_pago, FILTER_VALIDATE_URL)) {
        return ["status" => 400, "data" => ["success" => false, "error" => "El voucher_pago no es una URL válida"]];
    }

    return ["status" => 200, "data" => [
        "success" => true,
        "image_url" => $voucher_pago,
        "estado" => $estado
    ]];
}
