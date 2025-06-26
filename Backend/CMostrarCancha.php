<?php
require_once 'cors.php';
require_once 'conexion.php';
require_once 'cancha_model.php';

configurarCORS();

$conexion = obtenerConexion();

/**
 * Verifica si la conexión fue exitosa. Si no, responde con un error 500.
 */
if (!$conexion) {
    responderError("Error de conexión a la base de datos", 500);
}

$id_dueno = obtenerIdDueno();

/**
 * Verifica que el ID del dueño sea válido. Si no, responde con error 400.
 */
if (!$id_dueno) {
    responderError("ID de dueño no válido", 400);
}

/**
 * Obtiene las canchas asociadas al dueño mediante su ID.
 */
$respuesta = obtenerCanchasPorDueno($conexion, $id_dueno);

$conexion->close();

header('Content-Type: application/json');
echo json_encode($respuesta);
