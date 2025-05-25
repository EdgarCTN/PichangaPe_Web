<?php
// Conexión a la base de datos
$conexion = mysqli_connect(
    "pichangapedb-pichangapedb-08a3.l.aivencloud.com",  // Host
    "avnadmin",                                          // Usuario
    "AVNS_WAohlqwbsIAlQVeVmWH",                          // Contraseña
    "defaultdb",                                         // Nombre de la base de datos
    20298                                                // Puerto
);

if (!$conexion) {
    echo json_encode(["error" => "Error al conectar con la base de datos"]);
    exit();
}
$conexion->set_charset("utf8");

// Verificar que se haya enviado el parámetro id_cliente
if (!isset($_POST['id_cliente']) || empty($_POST['id_cliente'])) {
    echo json_encode(["error" => "No se ha proporcionado id_cliente"]);
    exit();
}

$id_cliente = $_POST['id_cliente'];

// Consulta para obtener los datos del cliente
$query = "SELECT id_cliente, nombre, apellido FROM clientes WHERE id_cliente = ?";
$stmt = $conexion->prepare($query);
if (!$stmt) {
    echo json_encode(["error" => "Error en la preparación de la consulta"]);
    exit();
}

$stmt->bind_param("i", $id_cliente);
$stmt->execute();
$resultado = $stmt->get_result();

if ($resultado->num_rows > 0) {
    $row = $resultado->fetch_assoc();
    echo json_encode([
        "success"   => "Datos obtenidos correctamente",
        "id_cliente"=> $row['id_cliente'],
        "nombre"    => $row['nombre'],
        "apellido"  => $row['apellido']
    ]);
} else {
    echo json_encode(["error" => "No se encontraron datos para el id_cliente proporcionado"]);
}

$stmt->close();
mysqli_close($conexion);
?>
