<?php
use PHPUnit\Framework\TestCase;

define('TESTING', true);
require_once __DIR__ . '/../CMostrarCancha.php';

class MostrarCanchaTest extends TestCase
{
    private $conexion;

    protected function setUp(): void
    {
        $this->conexion = new mysqli(
            'mysql-24ded9fd-pichangape-test.i.aivencloud.com',
            'avnadmin',
            'AVNS_li53tVxNBHhJHDlPp9V',
            'defaultdb',
            11961
        );

        if ($this->conexion->connect_error) {
            $this->fail("Conexión fallida: " . $this->conexion->connect_error);
        }

        $GLOBALS['conexion'] = $this->conexion;

        // Limpiar tablas y poblar datos
        $this->conexion->query("DELETE FROM canchas");
        $this->conexion->query("DELETE FROM clientes");

        $this->conexion->query("INSERT INTO clientes 
        (id_cliente, nombre, apellido, numeroCel, correo, documento, tipoDoc, fechaNac, usuario, password, rol)
        VALUES 
        (1, 'Luis', 'Ramos', '999999999', 'luis@example.com', '11223344', 'DNI', '1990-01-01', 'usuario_test', '1234', 'cliente')");

        $this->conexion->query("INSERT INTO canchas 
        (id_cancha, id_dueno, nombre, direccion, precio_por_hora, tipoCancha, horasDisponibles, fechas_abiertas, estado)
        VALUES 
        (1, 1, 'Cancha A', 'Av. Principal 123', 60.00, 'Fútbol', '08:00-20:00', '2025-06-15', 'activa')");
    }

    protected function tearDown(): void
    {
        $this->conexion->close();
    }

    public function testObtenerCanchasPorDuenoExistente(): void {
        $resultado = obtenerCanchasPorDueno(1, $this->conexion);
        $this->assertArrayHasKey('canchas', $resultado);
        $this->assertNotEmpty($resultado['canchas']);
        $this->assertEquals('Cancha A', $resultado['canchas'][0]['nombre']);
    }

    public function testObtenerCanchasConDuenoInvalido(): void {
        $resultado = obtenerCanchasPorDueno(-1, $this->conexion);
        $this->assertArrayHasKey('error', $resultado);
    }

    public function testObtenerCanchasSinResultados(): void {
        $resultado = obtenerCanchasPorDueno(123456, $this->conexion); 
        $this->assertArrayHasKey('canchas', $resultado);
        $this->assertEmpty($resultado['canchas']);
    }
}
