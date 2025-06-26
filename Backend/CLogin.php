<?php
require_once 'cors.php';
require_once 'conexion.php';
require_once 'CLogin_func.php';
configurarCORS();

$usuario  = $_POST['usuario'] ?? '';
$password = $_POST['password'] ?? '';

// ⚠️ Verificar que la conexión esté disponible antes de usarla
if (!isset($conexion) || !$conexion instanceof mysqli) {
    if (!defined('TESTING') || !TESTING) {
        echo json_encode(["error" => "Conexión no disponible"]);
    }
    exit;
}


$resultado = login($conexion, $usuario, $password);
echo json_encode($resultado);

mysqli_close($conexion);
