<?php

function obtenerIdDueno() {
    return isset($_POST['id_dueno']) && is_numeric($_POST['id_dueno']) && $_POST['id_dueno'] > 0
        ? intval($_POST['id_dueno'])
        : 0;
}

function responderError($mensaje, $codigoHttp = 500) {
    http_response_code($codigoHttp);
    echo json_encode(["error" => $mensaje]);
    exit;
}

function obtenerCanchasPorDueno($conexion, $id_dueno) {
    $sql = "SELECT id_cancha, nombre, direccion, precio_por_hora, estado
            FROM canchas
            WHERE id_dueno = ?";

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
