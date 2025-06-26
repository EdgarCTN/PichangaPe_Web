<?php
require_once 'cors.php';
require_once 'conexion.php';
require_once 'CLogin_func.php';
configurarCORS();

// Obtener parámetros de entrada desde POST
$usuario  = $_POST['usuario'] ?? '';
$password = $_POST['password'] ?? '';

/**
 * Verificación de conexión a base de datos
 * Esto evita errores si la conexión no está disponible (por ejemplo, si fue mockeada en pruebas)
 */
if (!isset($conexion) || !$conexion instanceof mysqli) {
    if (!defined('TESTING') || !TESTING) {
        echo json_encode(["error" => "Conexión no disponible"]);
    }
    exit;
}

// Ejecutar función de login y devolver resultado
$resultado = login($conexion, $usuario, $password);
echo json_encode($resultado);

// Cierre de conexión para liberar recursos
mysqli_close($conexion);
