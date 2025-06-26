<?php
use PHPUnit\Framework\TestCase;

if (!defined('TESTING')) {
    define('TESTING', true);
}

require_once __DIR__ . '/../logica_final_ingresos.php';

class FinalIngresosTest extends TestCase {
    private $conexion;

    protected function setUp(): void {
        $this->conexion = new mysqli(
            'mysql-24ded9fd-pichangape-test.i.aivencloud.com',
            'avnadmin',
            'AVNS_li53tVxNBHhJHDlPp9V',
            'defaultdb',
            11961
        );

        // Preparar datos
        $this->conexion->query("DELETE FROM clientes");
        $this->conexion->query("INSERT INTO clientes (id_cliente, nombre, apellido, numeroCel, correo, documento, tipoDoc, fechaNac, usuario, password, rol)
            VALUES (1, 'Luis', 'Ramírez', '999999999', 'luis@test.com', '87654321', 'DNI', '1994-06-01', 'luis123', '1234', 'cliente')");
    }

    protected function tearDown(): void {
        $this->conexion->close();
    }

    public function testObtenerDatosClienteCorrectamente() {
        $resultado = obtenerDatosCliente($this->conexion, 1);
        $this->assertEquals(200, $resultado['status']);
        $this->assertEquals('Luis', $resultado['data']['nombre']);
        $this->assertEquals('Ramírez', $resultado['data']['apellido']);
    }

    public function testClienteNoExiste() {
        $resultado = obtenerDatosCliente($this->conexion, 999);
        $this->assertEquals(404, $resultado['status']);
        $this->assertEquals('No se encontraron datos para el id_cliente proporcionado', $resultado['data']['error']);
    }

    public function testIdClienteInvalido() {
        $resultado = obtenerDatosCliente($this->conexion, 'abc');
        $this->assertEquals(400, $resultado['status']);
        $this->assertEquals('ID de cliente no válido', $resultado['data']['error']);
    }
}
