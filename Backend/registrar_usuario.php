<?php

require 'cors.php';
require 'conexion.php';


// Capturar datos enviados desde el frontend
$usuario    = $_POST['usuario']    ?? '';
$password   = $_POST['password']   ?? '';
$nombre     = $_POST['nombre']     ?? '';
$apellido   = $_POST['apellido']   ?? '';
$numeroCel  = $_POST['numeroCel']  ?? '';
$correo     = $_POST['correo']     ?? '';
$documento  = $_POST['documento']  ?? '';
$tipoDoc    = $_POST['tipoDoc']    ?? '';
$fechaNac   = $_POST['fechaNac']   ?? '';
$rol        = $_POST['rol']        ?? 'cliente'; // Por defecto cliente

// Verificar si el usuario ya existe
$verificar = "SELECT * FROM clientes WHERE usuario='$usuario'";
$existe = mysqli_query($conexion, $verificar);

if ($existe && $existe->num_rows > 0) {
    echo json_encode(["error" => "El nombre de usuario ya está registrado"]);
    mysqli_close($conexion);
    exit;
}

// Insertar nuevo usuario
$query = "INSERT INTO clientes 
    (nombre, apellido, numeroCel, correo, documento, tipoDoc, fechaNac, usuario, password, rol) 
    VALUES 
    ('$nombre', '$apellido', '$numeroCel', '$correo', '$documento', '$tipoDoc', '$fechaNac', '$usuario', '$password', '$rol')";

if (mysqli_query($conexion, $query)) {
    echo json_encode(["mensaje" => "Usuario registrado con éxito"]);
} else {
    echo json_encode(["error" => "Error al registrar usuario: " . mysqli_error($conexion)]);
}

mysqli_close($conexion);
