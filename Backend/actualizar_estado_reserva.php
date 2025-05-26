<?php
require 'cors.php';
require 'conexion.php';
if (!isset($_POST['id_reserva']) || !isset($_POST['estado'])) {
    echo json_encode(["success" => false, "error" => "No se han enviado los parámetros id_reserva y estado"]);
    exit;
}

$id_reserva = intval($_POST['id_reserva']);
$estado_nuevo = $_POST['estado'];

// Obtener estado actual
$stmtSelect = $conexion->prepare("SELECT estado FROM reservas WHERE id_reserva = ?");
if (!$stmtSelect) {
    echo json_encode(["success" => false, "error" => "Error en la preparación de la consulta (SELECT)"]);
    exit;
}
$stmtSelect->bind_param("i", $id_reserva);
$stmtSelect->execute();
$result = $stmtSelect->get_result();

if ($result->num_rows === 0) {
    echo json_encode(["success" => false, "error" => "El id_reserva no existe"]);
    exit;
}

$row = $result->fetch_assoc();
$estado_actual = $row['estado'];
$stmtSelect->close();

// Verificar si ya no está pendiente
if ($estado_actual !== "pendiente") {
    $mensaje = "El estado de la reserva ya no es 'pendiente' y no se puede modificar.";
    if ($estado_actual == "pagado") $mensaje = "La reserva ya ha sido aprobada.";
    if ($estado_actual == "cancelado") $mensaje = "La reserva ya ha sido rechazada.";
    echo json_encode(["success" => false, "error" => $mensaje]);
    exit;
}

// Actualizar estado
$stmtUpdate = $conexion->prepare("
    UPDATE reservas 
    SET estado = ?, validado = CASE WHEN ? = 'pagado' THEN 1 ELSE validado END 
    WHERE id_reserva = ? AND estado = 'pendiente'
");

if (!$stmtUpdate) {
    echo json_encode(["success" => false, "error" => "Error en la preparación de la consulta (UPDATE)"]);
    exit;
}
$stmtUpdate->bind_param("ssi", $estado_nuevo, $estado_nuevo, $id_reserva);
$stmtUpdate->execute();

if ($stmtUpdate->affected_rows > 0) {
    // Obtener dueño
    $stmtDueno = $conexion->prepare("
        SELECT c.id_dueno, cli.nombre AS nombre_dueño, cli.apellido AS apellido_dueño
        FROM reservas r
        JOIN canchas c ON r.id_cancha = c.id_cancha
        JOIN clientes cli ON c.id_dueno = cli.id_cliente
        WHERE r.id_reserva = ?
    ");
    if (!$stmtDueno) {
        echo json_encode(["success" => false, "error" => "Error en la preparación de la consulta para obtener el dueño"]);
        exit;
    }
    $stmtDueno->bind_param("i", $id_reserva);
    $stmtDueno->execute();
    $resultDueno = $stmtDueno->get_result();

    if ($resultDueno->num_rows > 0) {
        $dueno = $resultDueno->fetch_assoc();
        echo json_encode([
            "success" => true,
            "message" => "Reserva actualizada correctamente",
            "id_cliente" => $dueno['id_dueno'],
            "nombre" => $dueno['nombre_dueño'],
            "apellido" => $dueno['apellido_dueño']
        ]);
    } else {
        echo json_encode(["success" => true, "message" => "Reserva actualizada, pero no se encontró el dueño de la cancha"]);
    }
    $stmtDueno->close();
} else {
    echo json_encode(["success" => false, "error" => "No se pudo actualizar la reserva. Puede que ya no esté en estado pendiente."]);
}
$stmtUpdate->close();
$conexion->close();
?>
