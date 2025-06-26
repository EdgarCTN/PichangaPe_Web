<?php
require_once 'cors.php';
require_once 'conexion.php';
require_once 'logica_eliminar_cancha.php';

configurarCORS();

/**
 * Decodifica el cuerpo JSON de la solicitud y obtiene el ID de la cancha.
 */
$data = json_decode(file_get_contents("php://input"), true);
$id_cancha = isset($data['id_cancha']) ? intval($data['id_cancha']) : 0;

/**
 * Establece conexión y ejecuta la lógica para eliminar la cancha.
 */
$conexion = obtenerConexion();
$resultado = eliminarCancha($conexion, $id_cancha);

// Devuelve la respuesta con el código HTTP correspondiente
http_response_code($resultado['status']);
echo json_encode($resultado['data']);
