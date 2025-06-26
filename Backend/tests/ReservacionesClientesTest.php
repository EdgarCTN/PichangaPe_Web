<?php
use PHPUnit\Framework\TestCase;

if (!defined('TESTING')) {
    define('TESTING', true);
}

require_once __DIR__ . '/../logica_reservaciones_clientes.php';

class ReservacionesClientesTest extends TestCase {
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

        $this->conexion->query("INSERT INTO clientes (id_cliente, nombre, apellido, numeroCel, correo, documento, tipoDoc, fechaNac, usuario, password, rol)
            VALUES (1, 'Luis', 'Perez', '998877665', 'luis@test.com', '11112222', 'DNI', '1993-01-01', 'luisp', '1234', 'cliente')");

        $this->conexion->query("INSERT INTO canchas (id_cancha, id_dueno, nombre, direccion, precio_por_hora, tipoCancha, horasDisponibles, fechas_abiertas, estado)
            VALUES (1, 1, 'Cancha Principal', 'Av. Lima 123', 50.00, 'fútbol', '07:00-19:00', '2025-12-12', 'activa')");

        $this->conexion->query("INSERT INTO reservas (id_reserva, id_reservador, id_cancha, fecha_hora_inicio, fecha_hora_fin, precio_total, voucher_pago, estado, validado)
            VALUES (1, 1, 1, '2025-12-12 09:00:00', '2025-12-12 10:00:00', 50.00, 'https://voucher.com/1.jpg', 'pagado', 1)");
    }

    protected function tearDown(): void {
        $this->conexion->close();
    }

    public function testReservacionExiste() {
        $res = obtenerDetalleReservacion($this->conexion, 1);
        $this->assertEquals(200, $res['status']);
        $this->assertEquals('Luis', $res['data']['nombre_reservador']);
        $this->assertEquals('09:00', $res['data']['hora_inicio']);
        $this->assertEquals('10:00', $res['data']['hora_fin']);
    }

    public function testReservacionNoExiste() {
        $res = obtenerDetalleReservacion($this->conexion, 999);
        $this->assertEquals(404, $res['status']);
        $this->assertEquals('No se encontró la reserva con el id proporcionado', $res['data']['error']);
    }

    public function testIdReservaInvalido() {
        $res = obtenerDetalleReservacion($this->conexion, 'abc');
        $this->assertEquals(400, $res['status']);
        $this->assertEquals('ID de reserva no válido', $res['data']['error']);
    }
}
