<?php
use PHPUnit\Framework\TestCase;

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
