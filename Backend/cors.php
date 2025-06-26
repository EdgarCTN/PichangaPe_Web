<?php

if (!function_exists('configurarCORS')) {
    function configurarCORS() {
        // No hacer nada si está en modo CLI (PHPUnit)
        if (php_sapi_name() === 'cli') {
            return;
        }

        header("Access-Control-Allow-Origin: *");
        header("Access-Control-Allow-Methods: POST, GET, OPTIONS");
        header("Access-Control-Allow-Headers: Content-Type, Authorization, X-Requested-With");

        // Si es preflight, responder sin cuerpo
        if (
            isset($_SERVER['REQUEST_METHOD']) &&
            $_SERVER['REQUEST_METHOD'] === 'OPTIONS'
        ) {
            http_response_code(200);
            exit();
        }
    }
}
