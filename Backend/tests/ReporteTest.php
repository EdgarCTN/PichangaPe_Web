<?php
use PHPUnit\Framework\TestCase;

if (!defined('TESTING')) {
    define('TESTING', true);
}

require_once __DIR__ . '/../logica_reporte.php';

class ReporteTest extends TestCase {
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
            VALUES (1, 'Pedro', 'Gomez', '999123456', 'pedro@test.com', '11112222', 'DNI', '1990-01-01', 'pedrog', '1234', 'dueño'),
                   (2, 'Carlos', 'Ramirez', '987654321', 'carlos@test.com', '22223333', 'DNI', '1995-05-05', 'carlosr', '1234', 'cliente')");

        $this->conexion->query("INSERT INTO canchas (id_cancha, id_dueno, nombre, direccion, precio_por_hora, tipoCancha, horasDisponibles, fechas_abiertas, estado)
            VALUES (1, 1, 'Cancha Test', 'Av. Siempre Viva 123', 60.00, 'fútbol', '08:00-20:00', '2025-10-10', 'activa')");

        $this->conexion->query("INSERT INTO reservas (id_reserva, id_reservador, id_cancha, fecha_hora_inicio, fecha_hora_fin, precio_total, voucher_pago, estado, validado)
            VALUES (1, 2, 1, '2025-10-10 10:00:00', '2025-10-10 11:00:00', 60.00, 'https://test.com/voucher.jpg', 'pagado', 1)");
    }

    protected function tearDown(): void {
        $this->conexion->close();
    }

    public function testReporteCorrecto() {
        $res = obtenerReporteCancha($this->conexion, 1);
        $this->assertEquals(200, $res['status']);
        $this->assertTrue($res['data']['success']);
        $this->assertEquals('Cancha Test', $res['data']['cancha']['nombre_cancha']);
        $this->assertCount(1, $res['data']['reservas']);
        $this->assertEquals('Carlos', $res['data']['reservas'][0]['nombre_reservador']);
    }

    public function testCanchaNoExiste() {
        $res = obtenerReporteCancha($this->conexion, 9999);
        $this->assertEquals(404, $res['status']);
        $this->assertStringContainsString("No se encontró la cancha", $res['data']['error']);
    }

    public function testIdCanchaInvalido() {
        $res = obtenerReporteCancha($this->conexion, 'abc');
        $this->assertEquals(400, $res['status']);
        $this->assertEquals('ID de cancha no válido', $res['data']['error']);
    }
}
