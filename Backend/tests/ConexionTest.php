<?php
use PHPUnit\Framework\TestCase;
if (!defined('TESTING')) {
    define('TESTING', true);
}

require_once __DIR__ . '/../conexion.php';


class ConexionTest extends TestCase
{
    public function testConexionExitosa()
    {
        $conexion = obtenerConexion();
        $this->assertInstanceOf(mysqli::class, $conexion);
        $this->assertTrue($conexion->ping());
    }
}
