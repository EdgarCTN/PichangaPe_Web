<?php

/**
 * Verifica las credenciales del usuario dueño en la base de datos.
 *
 * @param mysqli $conexion Conexión activa a la base de datos.
 * @param string $usuario Nombre de usuario.
 * @param string $password Contraseña en texto plano.
 * @return array Datos del usuario si son válidos o mensaje de error.
 */
function login(mysqli $conexion, string $usuario, string $password): array {
    $query = "
        SELECT * FROM clientes
        WHERE usuario = ? AND password = ? AND rol = 'dueño'
    ";

    $stmt = $conexion->prepare($query);
    if (!$stmt) {
        return ["error" => "Error al preparar la consulta: " . $conexion->error];
    }

    $stmt->bind_param("ss", $usuario, $password);
    $stmt->execute();
    $resultado = $stmt->get_result();

    if ($resultado && $resultado->num_rows > 0) {
        return $resultado->fetch_assoc();
    }

    return ["error" => "Credenciales incorrectas o acceso denegado"];
}
