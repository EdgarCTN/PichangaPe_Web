<?php

/**
 * Actualiza el estado de una cancha si existe y el nuevo estado es válido.
 *
 * @param mysqli $conexion Conexión activa a la base de datos.
 * @param int $id_cancha ID de la cancha a actualizar.
 * @param string $estado Nuevo estado a asignar ('activa', 'inactiva' o 'mantenimiento').
 * @return array Arreglo con estado HTTP simulado y mensaje o error.
 */
function actualizarEstadoCancha($conexion, $id_cancha, $estado) {
    $estados_permitidos = ['activa', 'inactiva', 'mantenimiento'];

    // Validar estado permitido
    if (!in_array($estado, $estados_permitidos)) {
        return ["status" => 400, "data" => ["error" => "Estado inválido"]];
    }

    // Verificar si la cancha existe
    $stmt = $conexion->prepare("SELECT COUNT(*) FROM canchas WHERE id_cancha = ?");
    $stmt->bind_param("i", $id_cancha);
    $stmt->execute();
    $stmt->bind_result($existe);
    $stmt->fetch();
    $stmt->close();

    if ($existe == 0) {
        return ["status" => 404, "data" => ["error" => "La cancha no existe"]];
    }

    // Actualizar el estado de la cancha
    $stmt = $conexion->prepare("UPDATE canchas SET estado = ? WHERE id_cancha = ?");
    $stmt->bind_param("si", $estado, $id_cancha);

    if ($stmt->execute()) {
        $stmt->close();
        return ["status" => 200, "data" => ["mensaje" => "Estado actualizado correctamente"]];
    } else {
        $stmt->close();
        return ["status" => 500, "data" => ["error" => "Error al actualizar estado"]];
    }
}
