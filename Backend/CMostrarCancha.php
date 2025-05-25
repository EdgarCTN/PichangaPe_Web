<?php
header("Content-Type: application/json");
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Methods: POST, GET, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type");

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit;
}

// Conexión a la base de datos
$conexion = mysqli_connect(
    "pichangapedb-pichangapedb-08a3.l.aivencloud.com",  // Host
    "avnadmin",                                          // Usuario
    "AVNS_WAohlqwbsIAlQVeVmWH",                          // Contraseña
    "defaultdb",                                         // Nombre de la base de datos
    20298                                                // Puerto
);

if (!$conexion) {
    http_response_code(500);
    echo json_encode(["error" => "Error de conexión: " . mysqli_connect_error()]);
    exit;
}

$conexion->set_charset("utf8");

// Validar id_dueno
$id_dueno = isset($_POST['id_dueno']) ? intval($_POST['id_dueno']) : 0;

if ($id_dueno <= 0) {
    http_response_code(400);
    echo json_encode(["error" => "ID de dueño no válido"]);
    exit;
}

// Consulta preparada
$sql = "SELECT id_cancha, nombre, direccion, precio_por_hora FROM canchas WHERE id_dueno = ?";
$stmt = $conexion->prepare($sql);

if (!$stmt) {
    http_response_code(500);
    echo json_encode(["error" => "Error al preparar la consulta: " . $conexion->error]);
    exit;
}

$stmt->bind_param("i", $id_dueno);
$stmt->execute();

$resultado = $stmt->get_result();

$canchas = [];
while ($fila = $resultado->fetch_assoc()) {
    $canchas[] = $fila;
}

$stmt->close();
$conexion->close();

// Enviar respuesta
echo json_encode(["canchas" => $canchas]);
?>
