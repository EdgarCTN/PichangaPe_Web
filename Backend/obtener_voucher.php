<?php

require_once 'cors.php';
require_once 'conexion.php';

$id_reserva = intval($_POST['id_reserva']);

// Consulta para obtener voucher_pago y estado
$stmt = $conexion->prepare("SELECT voucher_pago, estado FROM reservas WHERE id_reserva = ?");
if (!$stmt) {
    echo json_encode(["success" => false, "error" => "Error en la preparación de la consulta"]);
    exit;
}
$stmt->bind_param("i", $id_reserva);
$stmt->execute();
$stmt->bind_result($voucher_pago, $estado);
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

// Respuesta exitosa con voucher y estado
echo json_encode([
    "success" => true,
    "image_url" => $voucher_pago,
    "estado" => $estado
]);
?>
