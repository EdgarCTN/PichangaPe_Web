<?php
use PHPUnit\Framework\TestCase;

if (!defined('TESTING')) {
    define('TESTING', true);
}

require_once __DIR__ . '/../logica_reservaciones.php';

class ReservacionesTest extends TestCase {
    private $conexion;

    protected function setUp(): void {
        $this->conexion = new mysqli(
            'mysql-24ded9fd-pichangape-test.i.aivencloud.com',
            'avnadmin',
            'AVNS_li53tVxNBHhJHDlPp9V',
            'defaultdb',
            11961
        );

        // Limpiar e insertar datos
        $this->conexion->query("DELETE FROM reservas");
        $this->conexion->query("DELETE FROM canchas");
        $this->conexion->query("DELETE FROM clientes");

        $this->conexion->query("INSERT INTO clientes (id_cliente, nombre, apellido, numeroCel, correo, documento, tipoDoc, fechaNac, usuario, password, rol)
            VALUES (1, 'Carlos', 'Ramos', '999888777', 'carlos@test.com', '10101010', 'DNI', '1985-01-01', 'carlosr', '1234', 'cliente')");

        $this->conexion->query("INSERT INTO canchas (id_cancha, id_dueno, nombre, direccion, precio_por_hora, tipoCancha, horasDisponibles, fechas_abiertas, estado)
            VALUES (1, 1, 'Cancha Norte', 'Av. Arequipa 456', 40.00, 'fútbol', '08:00-20:00', '2025-12-12', 'activa')");

        $this->conexion->query("INSERT INTO reservas (id_reserva, id_reservador, id_cancha, fecha_hora_inicio, fecha_hora_fin, precio_total, voucher_pago, estado, validado)
            VALUES (1, 1, 1, '2025-12-12 10:00:00', '2025-12-12 11:00:00', 40.00, 'https://voucher.com/2.jpg', 'pagado', 1)");
    }

    protected function tearDown(): void {
        $this->conexion->close();
    }

    public function testObtenerReservasPorCanchaExistente() {
        $res = obtenerReservasPorCancha($this->conexion, 1);
        $this->assertEquals(200, $res['status']);
        $this->assertCount(1, $res['data']['reservas']);
        $this->assertEquals('Alquilada', $res['data']['reservas'][0]['estado_reserva']);
    }

    public function testObtenerReservasPorCanchaSinReservas() {
        $this->conexion->query("DELETE FROM reservas");
        $res = obtenerReservasPorCancha($this->conexion, 1);
        $this->assertEquals(200, $res['status']);
        $this->assertCount(0, $res['data']['reservas']);
    }

    public function testObtenerReservasConIdInvalido() {
        $res = obtenerReservasPorCancha($this->conexion, 'abc');
        $this->assertEquals(400, $res['status']);
        $this->assertEquals('ID de cancha no válido', $res['data']['error']);
    }
}
