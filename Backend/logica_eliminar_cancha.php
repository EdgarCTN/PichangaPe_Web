<?php
function eliminarCancha($conexion, $id_cancha) {
    if ($id_cancha <= 0) {
        return ["status" => 400, "data" => ["error" => "ID de cancha no válido"]];
    }

    // Verificar reservas futuras pagadas
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

    if ($cantidadPagadas > 0) {
        return ["status" => 403, "data" => ["error" => "La cancha no puede eliminarse porque tiene reservas futuras pagadas."]];
    }

    // Cancelar reservas futuras pendientes
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

    // Eliminar cancha
    $sqlEliminar = "DELETE FROM canchas WHERE id_cancha = ?";
    $stmt = $conexion->prepare($sqlEliminar);
    $stmt->bind_param("i", $id_cancha);
    $exito = $stmt->execute();
    $stmt->close();

    if ($exito) {
        return ["status" => 200, "data" => ["mensaje" => "Cancha eliminada correctamente."]];
    } else {
        return ["status" => 500, "data" => ["error" => "Error al eliminar la cancha."]];
    }
}
