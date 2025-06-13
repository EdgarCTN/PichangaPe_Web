<?php
require_once 'cors.php';
require_once 'conexion.php';

error_reporting(E_ALL);
ini_set('display_errors', 1);

function registrarCancha(array $data, $conexion = null): array {

    if (!$conexion) {
        global $conexion;
    }

    $required_fields = ['id_dueno', 'nombre', 'direccion', 'precio_por_hora', 'tipoCancha', 'horasDisponibles', 'fechas_abiertas', 'estado'];
    $missing_fields = [];
    foreach ($required_fields as $field) {
        if (!isset($data[$field]) || trim($data[$field]) === '') {
            $missing_fields[] = $field;
        }
    }
    if (!empty($missing_fields)) {
        return ["error" => "Campos faltantes: " . implode(', ', $missing_fields)];
    }

    if (!is_numeric($data['precio_por_hora'])) {
        return ["error" => "El precio debe ser un número válido"];
    }

    if ($conexion->connect_error) {
        throw new ConexionException("Error de conexión: " . $conexion->connect_error);
    }

    $conexion->set_charset("utf8");

    $stmt = $conexion->prepare("INSERT INTO canchas (id_dueno, nombre, direccion, precio_por_hora, tipoCancha, horasDisponibles, fechas_abiertas, estado) VALUES (?, ?, ?, ?, ?, ?, ?, ?)");
    if (!$stmt) {
        throw new PreparacionConsultaException("Error en la preparación de la consulta: " . $conexion->error);
    }

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

    if ($stmt->execute()) {
        $stmt->close();
        // Solo cerramos la conexión si estamos en uso normal (no en pruebas)
        if (!defined('TESTING')) {
            $conexion->close();
        }
        return ["success" => true, "message" => "Cancha registrada exitosamente"];
    } else {
        throw new InsercionException("Error al insertar: " . $stmt->error);
    }
}

// Solo ejecutamos la lógica principal si no estamos en modo de prueba
if (!defined('TESTING')) {
    if (!isset($_SERVER['REQUEST_METHOD']) || $_SERVER['REQUEST_METHOD'] !== 'POST') {
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
