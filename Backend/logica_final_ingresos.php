<?php
function obtenerDatosCliente($conexion, $id_cliente) {
    if (!is_numeric($id_cliente) || intval($id_cliente) <= 0) {
        return ["status" => 400, "data" => ["error" => "ID de cliente no válido"]];
    }

    $query = "SELECT id_cliente, nombre, apellido FROM clientes WHERE id_cliente = ?";
    $stmt = $conexion->prepare($query);
    if (!$stmt) {
        return ["status" => 500, "data" => ["error" => "Error en la preparación de la consulta"]];
    }

    $stmt->bind_param("i", $id_cliente);
    $stmt->execute();
    $resultado = $stmt->get_result();

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
