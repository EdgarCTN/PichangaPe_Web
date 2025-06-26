<?php
require_once 'cors.php';
require_once 'conexion.php';
require_once 'logica_estadisticas_cancha.php';

// Configura los encabezados CORS para aceptar solicitudes externas
configurarCORS();

// Verifica que se haya enviado el parámetro 'id_cliente'
if (!isset($_POST['id_cliente']) || trim($_POST['id_cliente']) === '') {
    http_response_code(400); // Solicitud incorrecta
    echo json_encode(["error" => "No se ha proporcionado id_cliente"]);
    exit();
}

// Se asegura de obtener el valor del id_cliente
$id_cliente = $_POST['id_cliente'];

// Establece conexión con la base de datos
$conexion = obtenerConexion();

// Llama a la lógica para obtener estadísticas de las canchas del dueño
$resultado = obtenerEstadisticasPorDueno($conexion, $id_cliente);

// Envía el código HTTP de acuerdo al resultado
http_response_code($resultado['status']);

// Devuelve los datos en formato JSON
echo json_encode($resultado['data']);

// Cierra la conexión con la base de datos
$conexion->close();
