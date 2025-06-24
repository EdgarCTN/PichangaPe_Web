<?php
require_once 'cors.php';
require_once 'conexion.php';
require_once 'logica_reporte.php';

configurarCORS();

if (!isset($_GET['id_cancha'])) {
    http_response_code(400);
    echo json_encode(["error" => "El parámetro 'id_cancha' es requerido."]);
    exit;
}

$id_cancha = intval($_GET['id_cancha']);
$conexion = obtenerConexion();

$resultado = obtenerReporteCancha($conexion, $id_cancha);
http_response_code($resultado['status']);
echo json_encode($resultado['data'], JSON_UNESCAPED_UNICODE | JSON_PRETTY_PRINT);

$conexion->close();
