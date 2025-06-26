<?php

/**
 * Obtiene el ID del dueño desde $_POST de forma segura.
 *
 * Valida que el parámetro 'id_dueno' exista, sea numérico y mayor que 0.
 * Si es válido, lo convierte a entero y lo devuelve.
 * En caso contrario, devuelve 0 como valor por defecto.
 *
 * @return int ID del dueño o 0 si es inválido.
 */
function obtenerIdDueno(): int {
    return isset($_POST['id_dueno']) && is_numeric($_POST['id_dueno']) && $_POST['id_dueno'] > 0
        ? intval($_POST['id_dueno'])
        : 0;
}

/**
 * Envía una respuesta de error en formato JSON y detiene la ejecución del script.
 *
 * Este método es útil para devolver errores consistentes en formato API RESTful.
 *
 * @param string $mensaje Mensaje de error a mostrar al cliente.
 * @param int $codigoHttp Código de estado HTTP que se desea enviar (por defecto 500).
 * @return void No retorna, termina la ejecución con exit().
 */
function responderError(string $mensaje, int $codigoHttp = 500): void {
    http_response_code($codigoHttp); // Establece el código de respuesta HTTP
    echo json_encode(["error" => $mensaje]); // Devuelve un JSON con el mensaje de error
    exit; // Detiene la ejecución
}

/**
 * Obtiene todas las canchas registradas por un dueño específico.
 *
 * Realiza una consulta a la base de datos para obtener los campos clave de cada cancha
 * asociada al ID del dueño especificado.
 *
 * @param mysqli $conexion Conexión activa a la base de datos MySQL.
 * @param int $id_dueno ID del dueño cuyas canchas se desean obtener.
 * @return array Arreglo con las canchas encontradas o un mensaje de error.
 */
function obtenerCanchasPorDueno(mysqli $conexion, int $id_dueno): array {
    // Consulta SQL para obtener los datos de las canchas del dueño
    $sql = "
        SELECT id_cancha, nombre, direccion, precio_por_hora, estado
        FROM canchas
        WHERE id_dueno = ?
    ";

    // Preparación de la sentencia SQL
    $stmt = $conexion->prepare($sql);

    // Validación de la preparación de la consulta
    if (!$stmt) {
        return ["error" => "Error al preparar la consulta: " . $conexion->error];
    }

    // Enlaza el parámetro (ID del dueño) a la consulta
    $stmt->bind_param("i", $id_dueno);

    // Ejecuta la consulta
    $stmt->execute();

    // Obtiene los resultados como un conjunto de datos
    $resultado = $stmt->get_result();

    // Arreglo para almacenar las canchas encontradas
    $canchas = [];
    while ($fila = $resultado->fetch_assoc()) {
        $canchas[] = $fila; // Agrega cada fila al arreglo
    }

    // Libera los recursos asociados a la consulta
    $stmt->close();

    // Devuelve el resultado en un arreglo asociativo
    return ["canchas" => $canchas];
}
