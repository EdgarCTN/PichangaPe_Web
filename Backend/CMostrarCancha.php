<?php
require_once 'cors.php';
require_once 'conexion.php';
require_once 'cancha_model.php';

configurarCORS();

$conexion = obtenerConexion();
if (!$conexion) {
    responderError("Error de conexión a la base de datos", 500);
}

$id_dueno = obtenerIdDueno();

if (!$id_dueno) {
    responderError("ID de dueño no válido", 400);
}

$respuesta = obtenerCanchasPorDueno($conexion, $id_dueno);
$conexion->close();

header('Content-Type: application/json');
echo json_encode($respuesta);
