<?php
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Methods: POST, GET, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type");

// Permitir preflight de OPTIONS
if ($_SERVER['REQUEST_METHOD'] == 'OPTIONS') {
    http_response_code(200);
    exit();
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
    die(json_encode(["error" => "Error al conectar con la base de datos"]));
}
$conexion->set_charset("utf8");

// Verificar que se haya enviado el id_cancha
if (!isset($_POST['id_cancha'])) {
    echo json_encode(["error" => "No se ha enviado el parámetro id_cancha"]);
    exit;
}

$id_cancha = $_POST['id_cancha'];

// Consulta SQL usando prepared statement para evitar inyección SQL
$query = "SELECT 
    r.id_reserva,
    DATE(r.fecha_hora_inicio) AS fecha_inicio,
    DATE_FORMAT(r.fecha_hora_inicio, '%H:%i') AS hora_inicio,
    CASE 
        WHEN DATE(r.fecha_hora_inicio) = DATE(r.fecha_hora_fin) 
          THEN DATE_FORMAT(r.fecha_hora_fin, '%H:%i')
        ELSE CONCAT(DATE(r.fecha_hora_fin), ' ', DATE_FORMAT(r.fecha_hora_fin, '%H:%i'))
    END AS hora_fin,
    CASE 
        WHEN r.estado = 'pagado' THEN 'Alquilada'
        ELSE r.estado
    END AS estado_reserva
FROM reservas r
WHERE r.id_cancha = ?
ORDER BY r.fecha_hora_inicio";

$stmt = $conexion->prepare($query);
if (!$stmt) {
    echo json_encode(["error" => "Error en la preparación de la consulta"]);
    exit;
}

// Forzar el id_cancha a tipo entero
$id_cancha = intval($id_cancha);

// Bind del parámetro
$stmt->bind_param("i", $id_cancha);
$stmt->execute();
$resultado = $stmt->get_result();

// Recopilar resultados
$reservas = [];
while ($fila = $resultado->fetch_assoc()) {
    $reservas[] = $fila;
}

// Devolver los datos en formato JSON
echo json_encode(["reservas" => $reservas]);

// Cerrar conexiones
$stmt->close();
mysqli_close($conexion);
?>
