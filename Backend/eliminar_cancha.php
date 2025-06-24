<?php
require 'cors.php';
require 'conexion.php';
require 'logica_eliminar_cancha.php';

configurarCORS();

$data = json_decode(file_get_contents("php://input"), true);
$id_cancha = isset($data['id_cancha']) ? intval($data['id_cancha']) : 0;

$conexion = obtenerConexion();
$resultado = eliminarCancha($conexion, $id_cancha);

http_response_code($resultado['status']);
echo json_encode($resultado['data']);
