<?php
require_once 'cors.php';
require_once 'conexion.php';
configurarCORS();

// Mostrar todos los errores en desarrollo
error_reporting(E_ALL);
ini_set('display_errors', 1);

/**
 * Registra una nueva cancha en la base de datos.
 *
 * @param array $data Datos de la cancha a registrar.
 * @param mysqli|null $conexion Conexión a la base de datos (opcional).
 * @return array Resultado con mensaje de éxito o error.
 * @throws ConexionException Si hay un error al conectar a la base de datos.
 * @throws PreparacionConsultaException Si falla la preparación de la consulta.
 * @throws InsercionException Si ocurre un error al ejecutar la inserción.
 */
function registrarCancha(array $data, $conexion = null): array {
    // Usar la conexión global si no se pasa como parámetro
    if (!$conexion) {
        global $conexion;
    }

    // Campos requeridos
    $required_fields = [
        'id_dueno', 'nombre', 'direccion', 'precio_por_hora',
        'tipoCancha', 'horasDisponibles', 'fechas_abiertas', 'estado'
    ];

    // Verificación de campos faltantes
    $missing_fields = [];
    foreach ($required_fields as $field) {
        if (!isset($data[$field]) || trim($data[$field]) === '') {
            $missing_fields[] = $field;
        }
    }

    if (!empty($missing_fields)) {
        return ["error" => "Campos faltantes: " . implode(', ', $missing_fields)];
    }

    // Validación del precio
    if (!is_numeric($data['precio_por_hora'])) {
        return ["error" => "El precio debe ser un número válido"];
    }

    // Validar conexión
    if ($conexion->connect_error) {
        throw new ConexionException("Error de conexión: " . $conexion->connect_error);
    }

    $conexion->set_charset("utf8");

    // Preparar sentencia SQL para insertar cancha
    $stmt = $conexion->prepare("
        INSERT INTO canchas (id_dueno, nombre, direccion, precio_por_hora, tipoCancha, horasDisponibles, fechas_abiertas, estado)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    ");
    if (!$stmt) {
        throw new PreparacionConsultaException("Error en la preparación de la consulta: " . $conexion->error);
    }

    // Asociar parámetros a la consulta
    $stmt->bind_param(
        "issdssss",
        $data['id_dueno'],
        $data['nombre'],
        $data['direccion'],
        $data['precio_por_hora'],
        $data['tipoCancha'],
        $data['horasDisponibles'],
        $data['fechas_abiertas'],
        $data['estado']
    );

    // Ejecutar la consulta
    if ($stmt->execute()) {
        $stmt->close();

        // Cerrar conexión si no estamos en modo test
        if (!defined('TESTING')) {
            $conexion->close();
        }

        return ["success" => true, "message" => "Cancha registrada exitosamente"];
    } else {
        throw new InsercionException("Error al insertar: " . $stmt->error);
    }
}

// Solo ejecutar si no está en modo de prueba
if (!defined('TESTING') || !TESTING) {
    if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
        echo json_encode(["error" => "Se requiere una solicitud POST"]);
        exit;
    }

    try {
        $resultado = registrarCancha($_POST);
        echo json_encode($resultado);
    } catch (Exception $e) {
        echo json_encode(["error" => $e->getMessage()]);
    }
}
