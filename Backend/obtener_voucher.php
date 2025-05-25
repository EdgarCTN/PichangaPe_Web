<?php
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Methods: POST, GET, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type");
header('Content-Type: application/json');

if (!isset($_POST['id_reserva']) || empty($_POST['id_reserva'])) {
    echo json_encode(["success" => false, "error" => "Falta el parámetro id_reserva"]);
    exit;
}

$id_reserva = intval($_POST['id_reserva']);

$conexion = mysqli_connect(
    "pichangapedb-pichangapedb-08a3.l.aivencloud.com",  // Host
    "avnadmin",                                          // Usuario
    "AVNS_WAohlqwbsIAlQVeVmWH",                          // Contraseña
    "defaultdb",                                         // Nombre de la base de datos
    20298                                                // Puerto
);

if (!$conexion) {
    echo json_encode(["success" => false, "error" => "Error al conectar con la base de datos"]);
    exit;
}
$conexion->set_charset("utf8");

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
