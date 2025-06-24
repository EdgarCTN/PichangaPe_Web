<?php
require_once 'cors.php';
require_once 'conexion.php';
require_once 'logica_estadisticas_cancha.php';

configurarCORS();

if (!isset($_POST['id_cliente']) || trim($_POST['id_cliente']) === '') {
    http_response_code(400);
    echo json_encode(["error" => "No se ha proporcionado id_cliente"]);
    exit();
}

$id_cliente = $_POST['id_cliente'];
$conexion = obtenerConexion();
$resultado = obtenerEstadisticasPorDueño($conexion, $id_cliente);

http_response_code($resultado['status']);
echo json_encode($resultado['data']);
$conexion->close();
