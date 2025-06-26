<?php
require_once 'cors.php';
require_once 'conexion.php';
require_once 'cancha_model.php';

configurarCORS();

// Obtener conexión a la base de datos
$conexion = obtenerConexion();
if (!$conexion) {
    responderError("Error de conexión a la base de datos", 500);
}

// Obtener ID del dueño desde la solicitud
$id_dueno = obtenerIdDueno();

// Validar que el ID sea correcto
if (!$id_dueno) {
    responderError("ID de dueño no válido", 400);
}

// Consultar canchas asociadas al dueño
$respuesta = obtenerCanchasPorDueno($conexion, $id_dueno);

// Cerrar conexión para liberar recursos
$conexion->close();

// Devolver respuesta en formato JSON
header('Content-Type: application/json');
echo json_encode($respuesta);
