<?php
require_once 'cors.php';
require_once 'conexion.php';
require_once 'logica_estadisticas_cancha.php';

configurarCORS();

/**
 * Verifica que se haya enviado el parámetro id_cliente en la solicitud.
 */
if (!isset($_POST['id_cliente']) || trim($_POST['id_cliente']) === '') {
    http_response_code(400);
    echo json_encode(["error" => "No se ha proporcionado id_cliente"]);
    exit();
}

$id_cliente = $_POST['id_cliente'];

/**
 * Establece la conexión y obtiene las estadísticas para el dueño especificado.
 */
$conexion = obtenerConexion();
$resultado = obtenerEstadisticasPorDueno($conexion, $id_cliente);

// Devuelve la respuesta con el código HTTP y los datos correspondientes
http_response_code($resultado['status']);
echo json_encode($resultado['data']);

$conexion->close();
