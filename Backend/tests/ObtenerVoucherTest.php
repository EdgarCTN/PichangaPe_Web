<?php
use PHPUnit\Framework\TestCase;

if (!defined('TESTING')) {
    define('TESTING', true);
}

require_once __DIR__ . '/../logica_obtener_voucher.php';

class ObtenerVoucherTest extends TestCase {
    private $conexion;

    protected function setUp(): void {
        $this->conexion = new mysqli(
            'mysql-24ded9fd-pichangape-test.i.aivencloud.com',
            'avnadmin',
            'AVNS_li53tVxNBHhJHDlPp9V',
            'defaultdb',
            11961
        );

        // Limpiar y poblar
        $this->conexion->query("DELETE FROM reservas");
        $this->conexion->query("DELETE FROM canchas");
        $this->conexion->query("DELETE FROM clientes");

        // Cliente y cancha
        $this->conexion->query("INSERT INTO clientes (id_cliente, nombre, apellido, numeroCel, correo, documento, tipoDoc, fechaNac, usuario, password, rol)
            VALUES (1, 'Ana', 'Lopez', '987654321', 'ana@test.com', '12345678', 'DNI', '1992-01-01', 'ana1', '1234', 'cliente')");

        $this->conexion->query("INSERT INTO canchas (id_cancha, id_dueno, nombre, direccion, precio_por_hora, tipoCancha, horasDisponibles, fechas_abiertas, estado)
            VALUES (1, 1, 'Cancha Ana', 'Calle 123', 40.00, 'fútbol', '08:00-20:00', '2025-08-01', 'activa')");

        // Reserva con voucher válido
        $this->conexion->query("INSERT INTO reservas (id_reserva, id_reservador, id_cancha, fecha_hora_inicio, fecha_hora_fin, precio_total, voucher_pago, estado, validado)
            VALUES (1, 1, 1, NOW(), NOW() + INTERVAL 1 HOUR, 40.00, 'https://test.com/voucher1.jpg', 'pagado', 0)");

        // Reserva sin voucher
        $this->conexion->query("INSERT INTO reservas (id_reserva, id_reservador, id_cancha, fecha_hora_inicio, fecha_hora_fin, precio_total, voucher_pago, estado, validado)
            VALUES (2, 1, 1, NOW(), NOW() + INTERVAL 1 HOUR, 40.00, '', 'pagado', 0)");

        // Reserva con URL inválida
        $this->conexion->query("INSERT INTO reservas (id_reserva, id_reservador, id_cancha, fecha_hora_inicio, fecha_hora_fin, precio_total, voucher_pago, estado, validado)
            VALUES (3, 1, 1, NOW(), NOW() + INTERVAL 1 HOUR, 40.00, 'not-a-url', 'pagado', 0)");
    }

    protected function tearDown(): void {
        $this->conexion->close();
    }

    public function testVoucherCorrecto() {
        $res = obtenerVoucherReserva($this->conexion, 1);
        $this->assertEquals(200, $res['status']);
        $this->assertTrue($res['data']['success']);
        $this->assertEquals('https://test.com/voucher1.jpg', $res['data']['image_url']);
        $this->assertEquals('pagado', $res['data']['estado']);
    }

    public function testReservaSinVoucher() {
        $res = obtenerVoucherReserva($this->conexion, 2);
        $this->assertEquals(404, $res['status']);
        $this->assertEquals('No se encontró voucher para el id_reserva proporcionado', $res['data']['error']);
    }

    public function testVoucherNoEsURLValida() {
        $res = obtenerVoucherReserva($this->conexion, 3);
        $this->assertEquals(400, $res['status']);
        $this->assertEquals('El voucher_pago no es una URL válida', $res['data']['error']);
    }

    public function testIdReservaInvalido() {
        $res = obtenerVoucherReserva($this->conexion, 'abc');
        $this->assertEquals(400, $res['status']);
        $this->assertEquals('ID de reserva no válido', $res['data']['error']);
    }
}
