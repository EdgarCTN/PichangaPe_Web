<?php
use PHPUnit\Framework\TestCase;

define('TESTING', true);
require_once __DIR__ . '/../agregar.php';

class AgregarTest extends TestCase
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
            $this->fail("Error de conexión en test: " . $this->conexion->connect_error);
        }

        // Hacer disponible en registrarCancha
        $GLOBALS['conexion'] = $this->conexion;

        // Limpia la tabla antes de cada prueba
        $this->conexion->query("DELETE FROM canchas");
        $this->conexion->query("DELETE FROM clientes");

        // Insertar un cliente de prueba
        $this->conexion->query("
            INSERT INTO clientes
        (id_cliente,nombre, apellido, numeroCel, correo, documento, tipoDoc, fechaNac, usuario, password, rol)
        VALUES
        ('1','Juan', 'Pérez', '123456789', 'juan@example.com', '987654321', 'DNI', '1990-01-01', 'usuario_test', '123456', 'cliente')
        ");
        
    }

    protected function tearDown(): void
    {
        $this->conexion->close();
    }

    public function testRegistroExitosoDeCancha()
    {
        $datos = [
            'id_dueno' => 1,
            'nombre' => 'Cancha Test',
            'direccion' => 'Av. Fútbol 123',
            'precio_por_hora' => 50.00,
            'tipoCancha' => 'Fútbol',
            'horasDisponibles' => '08:00-22:00',
            'fechas_abiertas' => '2024-06-01,2024-06-02',
            'estado' => 'activa'
        ];

        $resultado = registrarCancha($datos);

        $this->assertArrayHasKey('success', $resultado);
        $this->assertTrue($resultado['success']);
        $this->assertEquals('Cancha registrada exitosamente', $resultado['message']);
    }

    public function testCamposFaltantes()
    {
        $datos = [
            'id_dueno' => 1,
            'nombre' => '',
            'direccion' => 'Av. Fútbol 123',
            'precio_por_hora' => 50.00,
            // Falta tipoCancha, horasDisponibles, etc.
        ];

        $resultado = registrarCancha($datos);

        $this->assertArrayHasKey('error', $resultado);
        $this->assertStringContainsString('Campos faltantes', $resultado['error']);
    }

    public function testPrecioInvalido()
    {
        $datos = [
            'id_dueno' => 1,
            'nombre' => 'Cancha Test',
            'direccion' => 'Av. Fútbol 123',
            'precio_por_hora' => 'cincuenta',
            'tipoCancha' => 'Fútbol',
            'horasDisponibles' => '08:00-22:00',
            'fechas_abiertas' => '2024-06-01,2024-06-02',
            'estado' => 'disponible'
        ];

        $resultado = registrarCancha($datos);

        $this->assertArrayHasKey('error', $resultado);
        $this->assertEquals('El precio debe ser un número válido', $resultado['error']);
    }
}
