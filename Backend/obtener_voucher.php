<?php
require_once 'cors.php';
require_once 'conexion.php';
require_once 'logica_obtener_voucher.php';

// Configura las cabeceras necesarias para permitir solicitudes CORS
configurarCORS();

// Validar si se recibió el parámetro 'id_reserva' por POST
if (!isset($_POST['id_reserva']) || empty($_POST['id_reserva'])) {
    http_response_code(400); // Error: Solicitud mal formada
    echo json_encode(["success" => false, "error" => "No se ha proporcionado id_reserva"]);
    exit();
}

// Obtener el ID de la reserva de forma segura
$id_reserva = intval($_POST['id_reserva']);

// Establecer conexión con la base de datos
$conexion = obtenerConexion();

// Obtener los datos del voucher asociado a la reserva
$resultado = obtenerVoucherReserva($conexion, $id_reserva);

// Devolver el código de estado HTTP y la respuesta en JSON
http_response_code($resultado['status']);
echo json_encode($resultado['data']);

// Cerrar conexión con la base de datos
$conexion->close();
