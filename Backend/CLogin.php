<?php
require_once 'cors.php';
require_once 'conexion.php';
require_once 'CLogin_func.php';

configurarCORS();

$usuario  = $_POST['usuario'] ?? '';
$password = $_POST['password'] ?? '';

/**
 * Verifica que la conexión a la base de datos esté disponible.
 * En caso de no estar disponible y no estar en modo TESTING, se devuelve un error en formato JSON.
 */
if (!isset($conexion) || !$conexion instanceof mysqli) {
    if (!defined('TESTING') || !TESTING) {
        echo json_encode(["error" => "Conexión no disponible"]);
    }
    exit;
}

/**
 * Llama a la función login con los datos proporcionados por el cliente.
 * Retorna el resultado en formato JSON.
 */
$resultado = login($conexion, $usuario, $password);
echo json_encode($resultado);

mysqli_close($conexion);
