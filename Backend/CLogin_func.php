<?php

/**
 * Verifica las credenciales del usuario dueño en la base de datos.
 *
 * Esta función intenta autenticar a un usuario con rol "dueño" verificando
 * que el usuario y contraseña coincidan con un registro en la tabla `clientes`.
 *
 * @param mysqli $conexion Conexión activa a la base de datos.
 * @param string $usuario Nombre de usuario proporcionado por el cliente.
 * @param string $password Contraseña en texto plano proporcionada por el cliente.
 * @return array Devuelve un arreglo asociativo con los datos del usuario si las credenciales son válidas,
 *               o un arreglo con un mensaje de error si son inválidas.
 */
function login(mysqli $conexion, string $usuario, string $password): array {
    // Consulta SQL segura para buscar al usuario con rol 'dueño'
    $query = "
        SELECT * FROM clientes
        WHERE usuario = ? AND password = ? AND rol = 'dueño'
    ";

    // Preparar la sentencia SQL
    $stmt = $conexion->prepare($query);

    // Verificar si la preparación fue exitosa
    if (!$stmt) {
        // En caso de error, devolver mensaje descriptivo
        return ["error" => "Error al preparar la consulta: " . $conexion->error];
    }

    // Asociar parámetros a la consulta preparada (usuario y contraseña)
    $stmt->bind_param("ss", $usuario, $password);

    // Ejecutar la consulta preparada
    $stmt->execute();

    // Obtener el resultado de la ejecución
    $resultado = $stmt->get_result();

    // Verificar si se encontró al menos un registro
    if ($resultado && $resultado->num_rows > 0) {
        // Retornar los datos del usuario autenticado
        return $resultado->fetch_assoc();
    }

    // Si no se encontró coincidencia, retornar mensaje de error
    return ["error" => "Credenciales incorrectas o acceso denegado"];
}
