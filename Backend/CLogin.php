<?php

require 'cors.php';
require 'conexion.php';


$usuario    = $_POST['usuario']    ?? '';
$password   = $_POST['password']   ?? '';

$query = "SELECT * FROM clientes 
          WHERE usuario='$usuario' 
            AND password='$password' 
            AND rol='dueño'";
$resultado = mysqli_query($conexion, $query);

if ($resultado && $resultado->num_rows > 0) {
    $fila = mysqli_fetch_assoc($resultado);
    echo json_encode($fila);
} else {
    echo json_encode(["error" => "Credenciales incorrectas o acceso denegado"]);
}

mysqli_close($conexion);
