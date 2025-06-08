<?php
require_once 'cors.php';
require_once 'conexion.php';
require_once 'CLogin_func.php';

$usuario  = $_POST['usuario'] ?? '';
$password = $_POST['password'] ?? '';

$resultado = login($conexion, $usuario, $password);
echo json_encode($resultado);

mysqli_close($conexion);
