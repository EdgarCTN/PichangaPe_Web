<?php
require_once 'cors.php';
require_once 'conexion.php';
configurarCORS();

// Mostrar errores en entorno de desarrollo
error_reporting(E_ALL);
ini_set('display_errors', 1);

/**
 * Registra una nueva cancha en la base de datos.
 *
 * @param array $data Datos del formulario que contienen la información de la cancha.
 * @param mysqli|null $conexion Conexión activa (se usa global si no se proporciona).
 * @return array Resultado con mensaje de éxito o error.
 * @throws ConexionException Si falla la conexión a la base de datos.
 * @throws PreparacionConsultaException Si falla la preparación de la consulta.
 * @throws InsercionException Si ocurre un error al ejecutar el INSERT.
 */
function registrarCancha(array $data, $conexion = null): array {
    // Usar conexión global si no se proporciona
    if (!$conexion) {
        global $conexion;
    }

    // Campos obligatorios que deben existir en $data
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

    // Si hay campos vacíos, se devuelve un error detallando los nombres
    if (!empty($missing_fields)) {
        return ["error" => "Campos faltantes: " . implode(', ', $missing_fields)];
    }

    // Validar que el precio sea numérico
    if (!is_numeric($data['precio_por_hora'])) {
        return ["error" => "El precio debe ser un número válido"];
    }

    // Verificar la conexión a la base de datos
    if ($conexion->connect_error) {
        throw new ConexionException("Error de conexión: " . $conexion->connect_error);
    }

    $conexion->set_charset("utf8"); // Asegurar codificación UTF-8 para evitar errores de acento

    // Preparar consulta para insertar la cancha
    $stmt = $conexion->prepare("
        INSERT INTO canchas (id_dueno, nombre, direccion, precio_por_hora, tipoCancha, horasDisponibles, fechas_abiertas, estado)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    ");
    if (!$stmt) {
        throw new PreparacionConsultaException("Error en la preparación de la consulta: " . $conexion->error);
    }

    // Asociar los parámetros a la consulta preparada
    $stmt->bind_param(
        "issdssss", // Tipos: int, string, string, double, string, string, string, string
        $data['id_dueno'],
        $data['nombre'],
        $data['direccion'],
        $data['precio_por_hora'],
        $data['tipoCancha'],
        $data['horasDisponibles'],
        $data['fechas_abiertas'],
        $data['estado']
    );

    // Ejecutar inserción
    if ($stmt->execute()) {
        $stmt->close();

        // Cerrar la conexión si no estamos en entorno de pruebas
        if (!defined('TESTING')) {
            $conexion->close();
        }

        return ["success" => true, "message" => "Cancha registrada exitosamente"];
    } else {
        // En caso de error al ejecutar, lanzar excepción personalizada
        throw new InsercionException("Error al insertar: " . $stmt->error);
    }
}

// Solo ejecuta si no estamos en modo de pruebas automatizadas
if (!defined('TESTING') || !TESTING) {
    // Solo se permite acceso por método POST
    if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
        echo json_encode(["error" => "Se requiere una solicitud POST"]);
        exit;
    }

    // Ejecutar la función de registro
    try {
        $resultado = registrarCancha($_POST);
        echo json_encode($resultado);
    } catch (Exception $e) {
        // Capturar y devolver cualquier excepción como error en formato JSON
        echo json_encode(["error" => $e->getMessage()]);
    }
}
