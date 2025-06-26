<?php
use PHPUnit\Framework\TestCase;

if (!defined('TESTING')) {
    define('TESTING', true);
}

require_once __DIR__ . '/../logica_estado_cancha.php';

class CambiarEstadoCanchaTest extends TestCase {
    private $conexion;

    protected function setUp(): void {
        $this->conexion = new mysqli(
            'mysql-24ded9fd-pichangape-test.i.aivencloud.com',
            'avnadmin',
            'AVNS_li53tVxNBHhJHDlPp9V',
            'defaultdb',
            11961
        );

        // Limpiar registros
        $this->conexion->query("DELETE FROM canchas");
        $this->conexion->query("DELETE FROM clientes");

        // Insertar dueño
        $this->conexion->query("INSERT INTO clientes (id_cliente, nombre, apellido, numeroCel, correo, documento, tipoDoc, fechaNac, usuario, password, rol) 
            VALUES (1, 'Dueño', 'Test', '987654321', 'dueno@test.com', '12345678', 'DNI', '1990-01-01', 'dueno1', '1234', 'dueño')");

        // Insertar cancha de prueba
        $this->conexion->query("INSERT INTO canchas (id_cancha, id_dueno, nombre, direccion, precio_por_hora, tipoCancha, horasDisponibles, fechas_abiertas, estado)
            VALUES (1, 1, 'Cancha Test', 'Av. Test 123', 50.00, 'fútbol', '08:00-22:00', '2025-05-30', 'activa')");
    }

    protected function tearDown(): void {
        $this->conexion->close();
    }

    public function testCambiarEstadoCorrectamente() {
        $resultado = actualizarEstadoCancha($this->conexion, 1, 'mantenimiento');
        $this->assertEquals(200, $resultado['status']);
        $this->assertEquals('Estado actualizado correctamente', $resultado['data']['mensaje']);
    }

    public function testEstadoInvalido() {
        $resultado = actualizarEstadoCancha($this->conexion, 1, 'cerrado');
        $this->assertEquals(400, $resultado['status']);
        $this->assertEquals('Estado inválido', $resultado['data']['error']);
    }

    public function testCanchaNoExiste() {
        $resultado = actualizarEstadoCancha($this->conexion, 9999, 'activa');
        $this->assertEquals(404, $resultado['status']);
        $this->assertEquals('La cancha no existe', $resultado['data']['error']);
    }
}
