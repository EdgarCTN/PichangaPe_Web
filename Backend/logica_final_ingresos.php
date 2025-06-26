<?php
/**
 * Obtiene los datos básicos del cliente a partir de su ID.
 *
 * @param mysqli $conexion Conexión activa a la base de datos.
 * @param int $id_cliente ID del cliente a consultar.
 * @return array Arreglo con estructura:
 *               - 'status': Código HTTP simulado (200, 400, 404, 500)
 *               - 'data': Resultado o mensaje de error
 */
function obtenerDatosCliente($conexion, $id_cliente) {
    // Validar que el ID sea un número positivo
    if (!is_numeric($id_cliente) || intval($id_cliente) <= 0) {
        return ["status" => 400, "data" => ["error" => "ID de cliente no válido"]];
    }

    // Consulta SQL para obtener los datos del cliente
    $query = "SELECT id_cliente, nombre, apellido FROM clientes WHERE id_cliente = ?";

    $stmt = $conexion->prepare($query);
    if (!$stmt) {
        return ["status" => 500, "data" => ["error" => "Error en la preparación de la consulta"]];
    }

    // Asignar el parámetro y ejecutar
    $stmt->bind_param("i", $id_cliente);
    $stmt->execute();
    $resultado = $stmt->get_result();

    // Si hay resultados, devolver los datos del cliente
    if ($resultado->num_rows > 0) {
        $row = $resultado->fetch_assoc();
        $stmt->close();
        return [
            "status" => 200,
            "data" => [
                "success" => "Datos obtenidos correctamente",
                "id_cliente" => $row['id_cliente'],
                "nombre" => $row['nombre'],
                "apellido" => $row['apellido']
            ]
        ];
    } else {
        $stmt->close();
        return ["status" => 404, "data" => ["error" => "No se encontraron datos para el id_cliente proporcionado"]];
    }
}
