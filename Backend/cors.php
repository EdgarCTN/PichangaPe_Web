<?php

if (!function_exists('configurarCORS')) {
    function configurarCORS() {
        // Evita enviar headers si estás en entorno CLI (como PHPUnit)
        if (php_sapi_name() === 'cli') {
            return;
        }

        header("Access-Control-Allow-Origin: *");
        header("Access-Control-Allow-Methods: POST, GET, OPTIONS");
        header("Access-Control-Allow-Headers: Content-Type");
        header('Content-Type: application/json; charset=utf-8');

        if (
            isset($_SERVER['REQUEST_METHOD']) &&
            $_SERVER['REQUEST_METHOD'] === 'OPTIONS'
        ) {
            http_response_code(200);
            exit();
        }
    }
}
