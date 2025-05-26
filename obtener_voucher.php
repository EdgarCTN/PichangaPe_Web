<?php
require 'cors.php';
require 'conexion.php';

// Consulta
$stmt = $conexion->prepare("SELECT voucher_pago FROM reservas WHERE id_reserva = ?");
if (!$stmt) {
    echo json_encode(["success" => false, "error" => "Error en la preparación de la consulta"]);
    exit;
}
$stmt->bind_param("i", $id_reserva);
$stmt->execute();
$stmt->bind_result($voucher_pago);
$stmt->fetch();
$stmt->close();
$conexion->close();

// Verificaciones
if (empty($voucher_pago)) {
    echo json_encode(["success" => false, "error" => "No se encontró voucher para el id_reserva proporcionado"]);
    exit;
}

if (!filter_var($voucher_pago, FILTER_VALIDATE_URL)) {
    echo json_encode(["success" => false, "error" => "El voucher_pago no es una URL válida"]);
    exit;
}

// Respuesta exitosa
echo json_encode(["success" => true, "image_url" => $voucher_pago]);
?>
