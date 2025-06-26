<?php
// Importar configuración de CORS y conexión a base de datos
require_once 'cors.php';
require_once 'conexion.php';

// Configurar cabeceras CORS
configurarCORS();

/**
 * Registra un nuevo usuario en la base de datos.
 *
 * @param mysqli $conexion Conexión activa a la base de datos.
 * @param array $datos Datos enviados por POST (usuario, contraseña, etc.).
 * @return array Mensaje de éxito o error.
 */
function registrarUsuario($conexion, $datos) {
    // Obtener campos del arreglo de datos, usar valor vacío si no está presente
    $usuario   = $datos['usuario']   ?? '';
    $password  = $datos['password']  ?? '';
    $nombre    = $datos['nombre']    ?? '';
    $apellido  = $datos['apellido']  ?? '';
    $numeroCel = $datos['numeroCel'] ?? '';
    $correo    = $datos['correo']    ?? '';
    $documento = $datos['documento'] ?? '';
    $tipoDoc   = $datos['tipoDoc']   ?? '';
    $fechaNac  = $datos['fechaNac']  ?? '';
    $rol       = $datos['rol']       ?? 'cliente'; // Valor por defecto: 'cliente'

    // Verificar si el nombre de usuario ya está registrado
    $verificar = "SELECT * FROM clientes WHERE usuario='$usuario'";
    $existe = mysqli_query($conexion, $verificar);

    // Si existe al menos un usuario con ese nombre, devolver error
    if ($existe && $existe->num_rows > 0) {
        return ["error" => "El nombre de usuario ya está registrado"];
    }

    // Crear consulta SQL para insertar nuevo usuario
    $query = "
        INSERT INTO clientes
        (nombre, apellido, numeroCel, correo, documento, tipoDoc, fechaNac, usuario, password, rol)
        VALUES
        ('$nombre', '$apellido', '$numeroCel', '$correo', '$documento', '$tipoDoc', '$fechaNac', '$usuario', '$password', '$rol')
    ";

    // Ejecutar inserción y verificar resultado
    if (mysqli_query($conexion, $query)) {
        return ["mensaje" => "Usuario registrado con éxito"];
    } else {
        // En caso de error, incluir detalle del error de MySQL
        return ["error" => "Error al registrar usuario: " . mysqli_error($conexion)];
    }
}

// Ejecutar solo si no estamos en entorno de pruebas automatizadas
if (!defined('TESTING') || !TESTING) {
    // Obtener datos desde POST y asegurarse de que todos los campos estén presentes
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
        'rol'       => $_POST['rol']       ?? 'cliente' // Valor por defecto: cliente
    ];

    // Llamar a la función para registrar al usuario
    $resultado = registrarUsuario($conexion, $datos);

    // Devolver resultado en formato JSON
    echo json_encode($resultado);

    // Cerrar conexión a la base de datos
    mysqli_close($conexion);
}
