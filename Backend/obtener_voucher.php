<?php
require_once 'cors.php';
require_once 'conexion.php';
require_once 'logica_obtener_voucher.php';

configurarCORS();

if (!isset($_POST['id_reserva']) || empty($_POST['id_reserva'])) {
    http_response_code(400);
    echo json_encode(["success" => false, "error" => "No se ha proporcionado id_reserva"]);
    exit();
}

$id_reserva = intval($_POST['id_reserva']);
$conexion = obtenerConexion();

$resultado = obtenerVoucherReserva($conexion, $id_reserva);
http_response_code($resultado['status']);
echo json_encode($resultado['data']);

$conexion->close();
