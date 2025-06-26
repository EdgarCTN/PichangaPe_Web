<?php
require_once 'cors.php';
require_once 'conexion.php';
require_once 'logica_reporte.php';

// Configura las cabeceras necesarias para permitir solicitudes desde otros orígenes
configurarCORS();

// Validar que se haya proporcionado el parámetro 'id_cancha' vía GET
if (!isset($_GET['id_cancha'])) {
    http_response_code(400); // Solicitud incorrecta
    echo json_encode(["error" => "El parámetro 'id_cancha' es requerido."]);
    exit;
}

// Convertir y validar el parámetro 'id_cancha'
$id_cancha = intval($_GET['id_cancha']);

// Establecer conexión a la base de datos
$conexion = obtenerConexion();

// Obtener la información detallada del reporte de la cancha y sus reservas
$resultado = obtenerReporteCancha($conexion, $id_cancha);

// Retornar la respuesta con el código de estado HTTP y la respuesta formateada en JSON
http_response_code($resultado['status']);
echo json_encode($resultado['data'], JSON_UNESCAPED_UNICODE | JSON_PRETTY_PRINT);

// Cerrar conexión a la base de datos
$conexion->close();
