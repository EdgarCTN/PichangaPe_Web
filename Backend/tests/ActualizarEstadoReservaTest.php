<?php
use PHPUnit\Framework\TestCase;

define('TESTING', true);
require_once __DIR__ . '/../actualizar_estado_reserva.php';

class ActualizarEstadoReservaTest extends TestCase {
    private $conexion;

    protected function setUp(): void {
        $this->conexion = new mysqli(
            'mysql-24ded9fd-pichangape-test.i.aivencloud.com',
            'avnadmin',
            'AVNS_li53tVxNBHhJHDlPp9V',
            'defaultdb',
            11961
        );
        $this->conexion->query("DELETE FROM reservas");
        $this->conexion->query("DELETE FROM canchas");
        $this->conexion->query("DELETE FROM clientes");

        // Insertar cliente dueño
        $this->conexion->query("INSERT INTO clientes (id_cliente, nombre, apellido, numeroCel, correo, documento, tipoDoc, fechaNac, usuario, password, rol) 
            VALUES (1, 'Dueño', 'Test', '987654321', 'dueno@test.com', '12345678', 'DNI', '1990-01-01', 'dueno1', '1234', 'dueño')");

        // Insertar cancha
        $this->conexion->query("INSERT INTO canchas (id_cancha, id_dueno, nombre, direccion, precio_por_hora, tipoCancha, horasDisponibles, fechas_abiertas, estado)
            VALUES (1, 1, 'Cancha Test', 'Av. Test 123', 50.00, 'fútbol', '08:00-22:00', '2025-05-30', 'activa')");

        // Insertar reserva pendiente
        $this->conexion->query("INSERT INTO reservas (id_reserva, id_reservador, id_cancha, fecha_hora_inicio, fecha_hora_fin, precio_total, voucher_pago, estado, validado)
            VALUES (1, 1, 1, '2025-05-30 10:00:00', '2025-05-30 11:00:00', 50.00, 'https://example.com/voucher.jpg', 'pendiente', 0)");
    }

    protected function tearDown(): void {
        $this->conexion->close();
    }

    public function testActualizarEstadoReservaCorrectamente() {
        $resultado = actualizarEstadoReserva($this->conexion, 1, 'pagado');
        $this->assertTrue($resultado['success']);
        $this->assertEquals('Reserva actualizada correctamente', $resultado['message']);
        $this->assertEquals(1, $resultado['id_cliente']);
        $this->assertEquals('Dueño', $resultado['nombre']);
    }

    public function testActualizarEstadoReservaEstadoNoPendiente() {
        // Primero actualizamos a pagado
        actualizarEstadoReserva($this->conexion, 1, 'pagado');
        // Intentamos actualizar nuevamente, debería fallar
        $resultado = actualizarEstadoReserva($this->conexion, 1, 'cancelado');
        $this->assertFalse($resultado['success']);
        $this->assertStringContainsString('ya ha sido aprobada', $resultado['error']);
    }

    public function testActualizarEstadoReservaIdInexistente() {
        $resultado = actualizarEstadoReserva($this->conexion, 9999, 'pagado');
        $this->assertFalse($resultado['success']);
        $this->assertEquals('El id_reserva no existe', $resultado['error']);
    }
}
