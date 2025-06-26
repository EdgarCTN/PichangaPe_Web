<?php
require_once 'cors.php';
require_once 'conexion.php';
require_once 'logica_eliminar_cancha.php';

// Configurar CORS para permitir solicitudes desde cualquier origen
configurarCORS();

// Leer datos JSON enviados en el cuerpo de la solicitud
$data = json_decode(file_get_contents("php://input"), true);

// Obtener el ID de la cancha a eliminar, asegurando que sea entero
$id_cancha = isset($data['id_cancha']) ? intval($data['id_cancha']) : 0;

// Obtener conexión a la base de datos
$conexion = obtenerConexion();

// Llamar a la función que realiza la eliminación lógica
$resultado = eliminarCancha($conexion, $id_cancha);

// Configurar código HTTP según resultado
http_response_code($resultado['status']);

// Enviar respuesta en formato JSON
echo json_encode($resultado['data']);
