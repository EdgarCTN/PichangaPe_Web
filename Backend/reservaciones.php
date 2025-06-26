<?php
require_once 'cors.php';
require_once 'conexion.php';
require_once 'logica_reservaciones.php';

configurarCORS();

/**
 * Este archivo se encarga de obtener las reservas asociadas a una cancha específica.
 * El parámetro requerido es 'id_cancha' enviado por POST.
 */

// Verifica que se haya enviado el parámetro id_cancha
if (!isset($_POST['id_cancha'])) {
    http_response_code(400);
    echo json_encode(["error" => "No se ha enviado el parámetro id_cancha"]);
    exit;
}

// Captura y valida el parámetro id_cancha
$id_cancha = $_POST['id_cancha'];

$conexion = obtenerConexion(); // Establece conexión con la base de datos

// Llama a la función que obtiene las reservas desde la lógica de negocio
$resultado = obtenerReservasPorCancha($conexion, $id_cancha);

// Devuelve la respuesta HTTP con los datos obtenidos
http_response_code($resultado['status']);
echo json_encode($resultado['data'], JSON_UNESCAPED_UNICODE);

$conexion->close(); // Cierra la conexión a la base de datos
