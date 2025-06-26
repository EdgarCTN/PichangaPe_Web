<?php
/**
 * Obtiene el voucher de pago y el estado de una reserva específica.
 *
 * @param mysqli $conexion Conexión activa a la base de datos.
 * @param int $id_reserva ID de la reserva.
 * @return array Arreglo con la estructura:
 *               - status: Código HTTP simulado.
 *               - data: Resultado o mensaje de error.
 */
function obtenerVoucherReserva($conexion, $id_reserva) {
    // Validar que el ID de reserva sea numérico y positivo
    if (!is_numeric($id_reserva) || intval($id_reserva) <= 0) {
        return ["status" => 400, "data" => ["success" => false, "error" => "ID de reserva no válido"]];
    }

    // Preparar consulta para obtener el voucher y estado
    $stmt = $conexion->prepare("SELECT voucher_pago, estado FROM reservas WHERE id_reserva = ?");
    if (!$stmt) {
        return ["status" => 500, "data" => ["success" => false, "error" => "Error en la preparación de la consulta"]];
    }

    // Ejecutar y obtener resultados
    $stmt->bind_param("i", $id_reserva);
    $stmt->execute();
    $stmt->bind_result($voucher_pago, $estado);
    $stmt->fetch();
    $stmt->close();

    // Verificar si el voucher está vacío
    if (empty($voucher_pago)) {
        return ["status" => 404, "data" => ["success" => false, "error" => "No se encontró voucher para el id_reserva proporcionado"]];
    }

    // Verificar si el voucher es una URL válida
    if (!filter_var($voucher_pago, FILTER_VALIDATE_URL)) {
        return ["status" => 400, "data" => ["success" => false, "error" => "El voucher_pago no es una URL válida"]];
    }

    // Devolver resultado exitoso
    return [
        "status" => 200,
        "data" => [
            "success" => true,
            "image_url" => $voucher_pago,
            "estado" => $estado
        ]
    ];
}
