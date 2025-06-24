<?php
use PHPUnit\Framework\TestCase;

if (!defined('TESTING')) {
    define('TESTING', true);
}

require_once __DIR__ . '/../logica_eliminar_cancha.php';

class EliminarCanchaTest extends TestCase {
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
        $this->conexion->query("DELETE FROM reservas");
        $this->conexion->query("DELETE FROM canchas");
        $this->conexion->query("DELETE FROM clientes");

        // Crear cliente
        $this->conexion->query("INSERT INTO clientes (id_cliente, nombre, apellido, numeroCel, correo, documento, tipoDoc, fechaNac, usuario, password, rol)
            VALUES (1, 'Dueño', 'Test', '987654321', 'dueno@test.com', '12345678', 'DNI', '1990-01-01', 'dueno1', '1234', 'dueño')");

        // Crear cancha
        $this->conexion->query("INSERT INTO canchas (id_cancha, id_dueno, nombre, direccion, precio_por_hora, tipoCancha, horasDisponibles, fechas_abiertas, estado)
            VALUES (1, 1, 'Cancha Test', 'Av. Test', 50.00, 'fútbol', '08:00-22:00', '2025-06-30', 'activa')");
    }

    protected function tearDown(): void {
        $this->conexion->close();
    }

    public function testEliminarCanchaCorrectamente() {
        $resultado = eliminarCancha($this->conexion, 1);
        $this->assertEquals(200, $resultado['status']);
        $this->assertEquals('Cancha eliminada correctamente.', $resultado['data']['mensaje']);
    }

    public function testEliminarCanchaConReservasPagadas() {
        // Crear reserva futura pagada
        $this->conexion->query("INSERT INTO reservas (id_reserva, id_reservador, id_cancha, fecha_hora_inicio, fecha_hora_fin, precio_total, voucher_pago, estado, validado)
            VALUES (1, 1, 1, NOW() + INTERVAL 1 DAY, NOW() + INTERVAL 2 DAY, 50.00, 'voucher.jpg', 'pagado', 0)");

        $resultado = eliminarCancha($this->conexion, 1);
        $this->assertEquals(403, $resultado['status']);
        $this->assertStringContainsString('no puede eliminarse', $resultado['data']['error']);
    }

    public function testEliminarCanchaIdInvalido() {
        $resultado = eliminarCancha($this->conexion, 0);
        $this->assertEquals(400, $resultado['status']);
        $this->assertEquals('ID de cancha no válido', $resultado['data']['error']);
    }
}
