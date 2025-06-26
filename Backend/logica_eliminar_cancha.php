<?php
/**
 * Elimina una cancha si no tiene reservas futuras pagadas.
 * Si existen reservas pendientes futuras, estas se cancelan antes de eliminar.
 *
 * @param mysqli $conexion Conexión activa a la base de datos.
 * @param int $id_cancha ID de la cancha a eliminar.
 * @return array Resultado con código HTTP y mensaje de éxito o error.
 */
function eliminarCancha($conexion, $id_cancha) {
    if ($id_cancha <= 0) {
        return ["status" => 400, "data" => ["error" => "ID de cancha no válido"]];
    }

    // Verificar si existen reservas futuras ya pagadas
    $sqlVerificar = "
        SELECT COUNT(*) AS cantidad
        FROM reservas
        WHERE id_cancha = ?
          AND fecha_hora_inicio > NOW()
          AND estado = 'pagado'
    ";

    $stmt = $conexion->prepare($sqlVerificar);
    $stmt->bind_param("i", $id_cancha);
    $stmt->execute();
    $stmt->bind_result($cantidadPagadas);
    $stmt->fetch();
    $stmt->close();

    // Si hay reservas pagadas futuras, no se puede eliminar
    if ($cantidadPagadas > 0) {
        return ["status" => 403, "data" => ["error" => "La cancha no puede eliminarse porque tiene reservas futuras pagadas."]];
    }

    // Cancelar reservas pendientes futuras
    $sqlCancelar = "
        UPDATE reservas
        SET estado = 'cancelado'
        WHERE id_cancha = ?
          AND fecha_hora_inicio > NOW()
          AND estado = 'pendiente'
    ";
    $stmt = $conexion->prepare($sqlCancelar);
    $stmt->bind_param("i", $id_cancha);
    $stmt->execute();
    $stmt->close();

    // Eliminar la cancha de la base de datos
    $sqlEliminar = "DELETE FROM canchas WHERE id_cancha = ?";
    $stmt = $conexion->prepare($sqlEliminar);
    $stmt->bind_param("i", $id_cancha);
    $exito = $stmt->execute();
    $stmt->close();

    // Retornar mensaje dependiendo del resultado de la eliminación
    if ($exito) {
        return ["status" => 200, "data" => ["mensaje" => "Cancha eliminada correctamente."]];
    } else {
        return ["status" => 500, "data" => ["error" => "Error al eliminar la cancha."]];
    }
}
