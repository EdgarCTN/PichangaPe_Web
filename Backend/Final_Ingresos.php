<?php
require_once 'cors.php';
require_once 'conexion.php';
require_once 'logica_final_ingresos.php';

// Configurar cabeceras CORS para permitir el acceso al endpoint
configurarCORS();

// Validar que se haya enviado el parámetro 'id_cliente'
if (!isset($_POST['id_cliente']) || empty($_POST['id_cliente'])) {
    http_response_code(400); // Error de solicitud
    echo json_encode(["error" => "No se ha proporcionado id_cliente"]);
    exit();
}

// Obtener el ID del cliente desde el POST
$id_cliente = $_POST['id_cliente'];

// Establecer conexión con la base de datos
$conexion = obtenerConexion();

// Ejecutar la lógica que obtiene los datos del cliente
$resultado = obtenerDatosCliente($conexion, $id_cliente);

// Devolver el código de estado correspondiente
http_response_code($resultado['status']);

// Enviar los datos o mensaje de error en formato JSON
echo json_encode($resultado['data']);

// Cerrar la conexión con la base de datos
$conexion->close();
