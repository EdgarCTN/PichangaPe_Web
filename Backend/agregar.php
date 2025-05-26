<?php
// Habilitar el reporte de errores (comentarlo si es producción)
error_reporting(E_ALL);
ini_set('display_errors', 1);

require 'cors.php';
require 'conexion.php'; 


// Verificar si es una solicitud POST
if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    echo json_encode(["error" => "Se requiere una solicitud POST"]);
    exit;
}

// Verificar que todos los campos necesarios estén presentes
$required_fields = ['id_dueno', 'nombre', 'direccion', 'precio_por_hora', 'tipoCancha', 'horasDisponibles', 'fechas_abiertas', 'estado'];
$missing_fields = [];

foreach ($required_fields as $field) {
    if (!isset($_POST[$field]) || trim($_POST[$field]) === '') {
        $missing_fields[] = $field;
    }
}

if (!empty($missing_fields)) {
    echo json_encode(["error" => "Campos faltantes: " . implode(', ', $missing_fields)]);
    exit;
}

// Obtener datos del POST
$id_dueno = $_POST['id_dueno'];
$nombre = $_POST['nombre'];
$direccion = $_POST['direccion'];
$precio_por_hora = $_POST['precio_por_hora'];
$tipoCancha = $_POST['tipoCancha'];
$horasDisponibles = $_POST['horasDisponibles'];
$fechas_abiertas = $_POST['fechas_abiertas'];
$estado = $_POST['estado'];

// Validar que el precio sea numérico
if (!is_numeric($precio_por_hora)) {
    echo json_encode(["error" => "El precio debe ser un número válido"]);
    exit;
}

try {
<<<<<<< HEAD
    // Crear conexión
    $conexion = new mysqli($host, $user, $password, $database, $port);

    // Verificar conexión
=======
    
>>>>>>> 06665a7 (Agregando conexion)
    if ($conexion->connect_error) {
        throw new Exception("Error de conexión: " . $conexion->connect_error);
    }

<<<<<<< HEAD
    // Establecer charset
=======
>>>>>>> 06665a7 (Agregando conexion)
    $conexion->set_charset("utf8");

    // Preparar la consulta SQL
    $stmt = $conexion->prepare("INSERT INTO canchas (id_dueno, nombre, direccion, precio_por_hora, tipoCancha, horasDisponibles, fechas_abiertas, estado) VALUES (?, ?, ?, ?, ?, ?, ?, ?)");

    if (!$stmt) {
        throw new Exception("Error en la preparación de la consulta: " . $conexion->error);
    }

    // Vincular parámetros
    $stmt->bind_param("issdssss", $id_dueno, $nombre, $direccion, $precio_por_hora, $tipoCancha, $horasDisponibles, $fechas_abiertas, $estado);

    // Ejecutar consulta
    if ($stmt->execute()) {
        echo json_encode(["success" => true, "message" => "Cancha registrada exitosamente"]);
    } else {
        throw new Exception("Error al insertar: " . $stmt->error);
    }

    // Cerrar conexiones
    $stmt->close();
    $conexion->close();

} catch (Exception $e) {
    echo json_encode(["error" => $e->getMessage()]);
}
<<<<<<< HEAD
?>
=======
>>>>>>> 06665a7 (Agregando conexion)
