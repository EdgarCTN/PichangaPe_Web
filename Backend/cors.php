<?php

/**
 * Verifica si la función configurarCORS ya está definida para evitar redefiniciones.
 */
if (!function_exists('configurarCORS')) {

    /**
     * Configura los encabezados CORS para permitir peticiones desde cualquier origen.
     * 
     * No se ejecuta si el entorno es de línea de comandos (CLI), como cuando se usa PHPUnit.
     * También maneja correctamente las solicitudes preflight (OPTIONS).
     */
    function configurarCORS() {
        // Evita configurar CORS en entorno CLI
        if (php_sapi_name() === 'cli') {
            return;
        }

        header("Access-Control-Allow-Origin: *");
        header("Access-Control-Allow-Methods: POST, GET, OPTIONS");
        header("Access-Control-Allow-Headers: Content-Type, Authorization, X-Requested-With");

        // Si es una solicitud preflight, responde sin cuerpo
        if (
            isset($_SERVER['REQUEST_METHOD']) &&
            $_SERVER['REQUEST_METHOD'] === 'OPTIONS'
        ) {
            http_response_code(200);
            exit();
        }
    }
}
