<?php

// Verifica si la función ya fue definida (útil para pruebas unitarias)
if (!function_exists('configurarCORS')) {
    /**
     * Configura las cabeceras necesarias para permitir CORS.
     * Esta función se ejecuta en cada archivo que maneja solicitudes externas.
     */
    function configurarCORS() {
        // Evitar aplicar cabeceras si se ejecuta desde línea de comandos (PHPUnit)
        if (php_sapi_name() === 'cli') {
            return;
        }

        // Permitir acceso desde cualquier origen
        header("Access-Control-Allow-Origin: *");
        header("Access-Control-Allow-Methods: POST, GET, OPTIONS");
        header("Access-Control-Allow-Headers: Content-Type, Authorization, X-Requested-With");

        // Si es una solicitud de preflight (OPTIONS), terminar sin cuerpo
        if (
            isset($_SERVER['REQUEST_METHOD']) &&
            $_SERVER['REQUEST_METHOD'] === 'OPTIONS'
        ) {
            http_response_code(200);
            exit();
        }
    }
}
