<?php
use PHPUnit\Framework\TestCase;

if (!defined('TESTING')) {
    define('TESTING', true);
}

require_once __DIR__ . '/../logica_estadisticas_cancha.php';

class EstadisticasCanchaTest extends TestCase {
    private $conexion;

    protected function setUp(): void {
        $this->conexion = new mysqli(
            'mysql-24ded9fd-pichangape-test.i.aivencloud.com',
            'avnadmin',
            'AVNS_li53tVxNBHhJHDlPp9V',
            'defaultdb',
            11961
        );

        // Limpiar tablas
        $this->conexion->query("DELETE FROM reservas");
        $this->conexion->query("DELETE FROM canchas");
        $this->conexion->query("DELETE FROM clientes");

        // Insertar cliente dueño
        $this->conexion->query("INSERT INTO clientes (id_cliente, nombre, apellido, numeroCel, correo, documento, tipoDoc, fechaNac, usuario, password, rol)
            VALUES (1, 'Dueño', 'Test', '987654321', 'dueno@test.com', '12345678', 'DNI', '1990-01-01', 'dueno1', '1234', 'dueño')");

        // Insertar cancha
        $this->conexion->query("INSERT INTO canchas (id_cancha, id_dueno, nombre, direccion, precio_por_hora, tipoCancha, horasDisponibles, fechas_abiertas, estado)
            VALUES (1, 1, 'Cancha Test', 'Av. Test', 50.00, 'fútbol', '08:00-22:00', '2025-07-01', 'activa')");

        // Insertar reservas
        $this->conexion->query("INSERT INTO reservas (id_reserva, id_reservador, id_cancha, fecha_hora_inicio, fecha_hora_fin, precio_total, voucher_pago, estado, validado)
            VALUES (1, 1, 1, NOW() - INTERVAL 1 DAY, NOW(), 50.00, 'v1.jpg', 'pagado', 0)");

        $this->conexion->query("INSERT INTO reservas (id_reserva, id_reservador, id_cancha, fecha_hora_inicio, fecha_hora_fin, precio_total, voucher_pago, estado, validado)
            VALUES (2, 1, 1, NOW() + INTERVAL 1 DAY, NOW() + INTERVAL 2 DAY, 60.00, 'v2.jpg', 'pendiente', 0)");
    }

    protected function tearDown(): void {
        $this->conexion->close();
    }

    public function testEstadisticasCorrectas() {
        $resultado = obtenerEstadisticasPorDueño($this->conexion, 1);
        $this->assertEquals(200, $resultado['status']);
        $this->assertCount(1, $resultado['data']);
        $this->assertEquals('Cancha Test', $resultado['data'][0]['nombre']);
        $this->assertEquals(50.00, floatval($resultado['data'][0]['ganancias']));
        $this->assertEquals(2, intval($resultado['data'][0]['total_reservas']));
        $this->assertEquals(1, intval($resultado['data'][0]['total_reservas_pagadas']));
    }

    public function testIdClienteInvalido() {
        $resultado = obtenerEstadisticasPorDueño($this->conexion, 0);
        $this->assertEquals(400, $resultado['status']);
        $this->assertEquals('ID de cliente no válido', $resultado['data']['error']);
    }
}
