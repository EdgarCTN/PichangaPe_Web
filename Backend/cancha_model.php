<?php

/**
 * Obtiene el ID del dueño desde $_POST de forma segura.
 *
 * @return int ID del dueño o 0 si es inválido.
 */
function obtenerIdDueno(): int {
    return isset($_POST['id_dueno']) && is_numeric($_POST['id_dueno']) && $_POST['id_dueno'] > 0
        ? intval($_POST['id_dueno'])
        : 0;
}

/**
 * Envía una respuesta de error en formato JSON y detiene la ejecución.
 *
 * @param string $mensaje Mensaje de error a mostrar.
 * @param int $codigoHttp Código de estado HTTP (por defecto 500).
 */
function responderError(string $mensaje, int $codigoHttp = 500): void {
    http_response_code($codigoHttp);
    echo json_encode(["error" => $mensaje]);
    exit;
}

/**
 * Obtiene las canchas registradas por un dueño específico.
 *
 * @param mysqli $conexion Conexión activa a la base de datos.
 * @param int $id_dueno ID del dueño de las canchas.
 * @return array Arreglo con las canchas encontradas o error.
 */
function obtenerCanchasPorDueno(mysqli $conexion, int $id_dueno): array {
    $sql = "
        SELECT id_cancha, nombre, direccion, precio_por_hora, estado
        FROM canchas
        WHERE id_dueno = ?
    ";

    $stmt = $conexion->prepare($sql);

    if (!$stmt) {
        return ["error" => "Error al preparar la consulta: " . $conexion->error];
    }

    $stmt->bind_param("i", $id_dueno);
    $stmt->execute();
    $resultado = $stmt->get_result();

    $canchas = [];
    while ($fila = $resultado->fetch_assoc()) {
        $canchas[] = $fila;
    }

    $stmt->close();
    return ["canchas" => $canchas];
}
