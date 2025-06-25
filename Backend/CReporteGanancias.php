<?php
require_once 'cors.php';
require_once 'conexion.php';
configurarCORS();

function obtenerGananciasPorDueno(int $id_dueno, mysqli $conexion): array {
    if (!$id_dueno) {
        return ["error" => "Falta el parámetro id_dueno"];
    }

    // Validar que el dueño exista en la base de datos
    $stmtCheck = $conexion->prepare("SELECT 1 FROM clientes WHERE id_cliente = ?");
    $stmtCheck->bind_param("i", $id_dueno);
    $stmtCheck->execute();
    $resultCheck = $stmtCheck->get_result();

    if ($resultCheck->num_rows === 0) {
        $stmtCheck->close();
        return ["error" => "Dueño no válido"];
    }
    $stmtCheck->close();

    try {
        $query = "
            SELECT c.nombre, COALESCE(SUM(r.precio_total), 0) AS total
            FROM canchas c
            LEFT JOIN reservas r ON c.id_cancha = r.id_cancha AND r.estado = 'pagado' AND r.validado = 1
            WHERE c.id_dueno = ?
            GROUP BY c.id_cancha
            ORDER BY total DESC
        ";

        $stmt = $conexion->prepare($query);
        if (!$stmt) {
            return ["error" => "Error en la preparación de la consulta: " . $conexion->error];
        }

        $stmt->bind_param("i", $id_dueno);
        $stmt->execute();
        $resultado = $stmt->get_result();

        $ganancias = [];
        while ($fila = $resultado->fetch_assoc()) {
            $ganancias[] = [
                "nombre" => $fila["nombre"],
                "total" => number_format((float)$fila["total"], 2, '.', '')
            ];
        }

        $stmt->close();
        if (!defined('TESTING')) {
            $conexion->close();
        }

        return ["ganancias" => $ganancias];
    } catch (Exception $e) {
        return ["error" => "Error del servidor: " . $e->getMessage()];
    }
}

// Solo ejecuta si no es prueba
if (!defined('TESTING')) {
    header('Content-Type: application/json'); 
    $id_dueno = isset($_POST['id_dueno']) ? intval($_POST['id_dueno']) : 0;
    $respuesta = obtenerGananciasPorDueno($id_dueno, $conexion);
    echo json_encode($respuesta);
}

