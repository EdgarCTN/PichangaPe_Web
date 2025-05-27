<?php
require 'cors.php';
require 'conexion.php';
require 'CLogin_func.php';

$usuario  = $_POST['usuario'] ?? '';
$password = $_POST['password'] ?? '';

$resultado = login($conexion, $usuario, $password);
echo json_encode($resultado);

mysqli_close($conexion);
