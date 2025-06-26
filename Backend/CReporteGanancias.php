<?php
// Inclusión de archivos necesarios para conexión y CORS
require_once 'cors.php';
require_once 'conexion.php';
configurarCORS();

/**
 * Obtiene las ganancias agrupadas por cancha de un dueño.
 *
 * @param int $id_dueno ID del dueño.
 * @param mysqli $conexion Conexión activa a la base de datos.
 * @return array Resultado con la lista de ganancias o mensaje de error.
 */
function obtenerGananciasPorDueno(int $id_dueno, mysqli $conexion): array {
    // Validar parámetro recibido
    if (!$id_dueno) {
        return ["error" => "Falta el parámetro id_dueno"];
    }

    // Verificar existencia del dueño en la base de datos
    $stmtCheck = $conexion->prepare("SELECT 1 FROM clientes WHERE id_cliente = ?");
    $stmtCheck->bind_param("i", $id_dueno);
    $stmtCheck->execute();
    $resultCheck = $stmtCheck->get_result();

    if ($resultCheck->num_rows === 0) {
        $stmtCheck->close(); // Cierra consulta
        return ["error" => "Dueño no válido"];
    }
    $stmtCheck->close(); // Cierra la consulta si existe el dueño

    try {
        // Consulta SQL para calcular las ganancias por cancha (solo si el estado es 'pagado' y validado)
        $query = "
            SELECT 
                c.nombre, 
                COALESCE(SUM(r.precio_total), 0) AS total
            FROM canchas c
            LEFT JOIN reservas r 
                ON c.id_cancha = r.id_cancha 
                AND r.estado = 'pagado' 
                AND r.validado = 1
            WHERE c.id_dueno = ?
            GROUP BY c.id_cancha
            ORDER BY total DESC
        ";

        // Preparar y ejecutar la consulta
        $stmt = $conexion->prepare($query);
        if (!$stmt) {
            return ["error" => "Error en la preparación de la consulta: " . $conexion->error];
        }

        // Vincular parámetros
        $stmt->bind_param("i", $id_dueno);
        $stmt->execute();
        $resultado = $stmt->get_result();

        $ganancias = [];

        // Recorrer resultados y dar formato al total
        while ($fila = $resultado->fetch_assoc()) {
            $ganancias[] = [
                "nombre" => $fila["nombre"],
                "total" => number_format((float)$fila["total"], 2, '.', '')
            ];
        }

        $stmt->close(); // Cerrar statement

        // Cerrar conexión si no estamos en test
        if (!defined('TESTING')) {
            $conexion->close();
        }

        return ["ganancias" => $ganancias];
    } catch (Exception $e) {
        // Manejo de errores inesperados
        return ["error" => "Error del servidor: " . $e->getMessage()];
    }
}

// Ejecutar solo si no estamos en modo de pruebas
if (!defined('TESTING') || !TESTING) {
    // Indicar tipo de contenido
    header('Content-Type: application/json');

    // Obtener el id_dueno desde POST
    $id_dueno = isset($_POST['id_dueno']) ? intval($_POST['id_dueno']) : 0;

    // Ejecutar función y retornar resultado en JSON
    $respuesta = obtenerGananciasPorDueno($id_dueno, $conexion);
    echo json_encode($respuesta);
}
