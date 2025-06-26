<?php
require_once 'cors.php';
require_once 'conexion.php';
configurarCORS();

/**
 * Registra un nuevo usuario en la base de datos.
 *
 * @param mysqli $conexion Conexión activa a la base de datos.
 * @param array $datos Datos enviados por POST (usuario, contraseña, etc.).
 * @return array Mensaje de éxito o error.
 */
function registrarUsuario($conexion, $datos) {
    $usuario   = $datos['usuario']   ?? '';
    $password  = $datos['password']  ?? '';
    $nombre    = $datos['nombre']    ?? '';
    $apellido  = $datos['apellido']  ?? '';
    $numeroCel = $datos['numeroCel'] ?? '';
    $correo    = $datos['correo']    ?? '';
    $documento = $datos['documento'] ?? '';
    $tipoDoc   = $datos['tipoDoc']   ?? '';
    $fechaNac  = $datos['fechaNac']  ?? '';
    $rol       = $datos['rol']       ?? 'cliente';

    // Verificar si el usuario ya existe
    $verificar = "SELECT * FROM clientes WHERE usuario='$usuario'";
    $existe = mysqli_query($conexion, $verificar);

    if ($existe && $existe->num_rows > 0) {
        return ["error" => "El nombre de usuario ya está registrado"];
    }

    // Insertar nuevo usuario
    $query = "
        INSERT INTO clientes
        (nombre, apellido, numeroCel, correo, documento, tipoDoc, fechaNac, usuario, password, rol)
        VALUES
        ('$nombre', '$apellido', '$numeroCel', '$correo', '$documento', '$tipoDoc', '$fechaNac', '$usuario', '$password', '$rol')
    ";

    if (mysqli_query($conexion, $query)) {
        return ["mensaje" => "Usuario registrado con éxito"];
    } else {
        return ["error" => "Error al registrar usuario: " . mysqli_error($conexion)];
    }
}

// Ejecutar solo si no está en modo test
if (!defined('TESTING') || !TESTING) {
    $datos = [
        'usuario'   => $_POST['usuario']   ?? '',
        'password'  => $_POST['password']  ?? '',
        'nombre'    => $_POST['nombre']    ?? '',
        'apellido'  => $_POST['apellido']  ?? '',
        'numeroCel' => $_POST['numeroCel'] ?? '',
        'correo'    => $_POST['correo']    ?? '',
        'documento' => $_POST['documento'] ?? '',
        'tipoDoc'   => $_POST['tipoDoc']   ?? '',
        'fechaNac'  => $_POST['fechaNac']  ?? '',
        'rol'       => $_POST['rol']       ?? 'cliente'
    ];

    $resultado = registrarUsuario($conexion, $datos);
    echo json_encode($resultado);
    mysqli_close($conexion);
}
