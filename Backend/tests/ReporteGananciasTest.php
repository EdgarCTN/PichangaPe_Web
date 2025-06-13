<?php
use PHPUnit\Framework\TestCase;

define('TESTING', true);
require_once __DIR__ . '/../CReporteGanancias.php';

class ReporteGananciasTest extends TestCase {
    private $conexion;

    protected function setUp(): void {
        $this->conexion = new mysqli(
            'mysql-24ded9fd-pichangape-test.i.aivencloud.com',
            'avnadmin',
            'AVNS_li53tVxNBHhJHDlPp9V',
            'defaultdb',
            11961
        );

        if ($this->conexion->connect_error) {
            $this->fail("Fallo de conexión: " . $this->conexion->connect_error);
        }

        // Limpiar tablas para pruebas
        $this->conexion->query("DELETE FROM reservas");
        $this->conexion->query("DELETE FROM canchas");
        $this->conexion->query("DELETE FROM clientes");

        // Insertar cliente: uno dueño y uno reservador
        $this->conexion->query("INSERT INTO clientes 
            (id_cliente, nombre, apellido, numeroCel, correo, documento, tipoDoc, fechaNac, usuario, password, rol)
            VALUES
            (1, 'Carlos', 'Dueño', '999999999', 'dueno@correo.com', '12345678', 'DNI', '1990-01-01', 'dueno1', 'pass123', 'dueño'),
            (2, 'Ana', 'Cliente', '888888888', 'cliente@correo.com', '87654321', 'DNI', '1995-01-01', 'cliente1', 'pass456', 'cliente')");

        // Insertar cancha para el dueño
        $this->conexion->query("INSERT INTO canchas 
            (id_cancha, id_dueno, nombre, direccion, precio_por_hora, tipoCancha, horasDisponibles, fechas_abiertas, estado)
            VALUES
            (1, 1, 'Cancha Test', 'Av. Siempre Viva 123', 60.00, 'fútbol', '08:00-22:00', '2025-06-10,2025-06-11', 'activa')");

        // Insertar reserva válida y pagada
        $this->conexion->query("INSERT INTO reservas (
            id_reservador, id_cancha, fecha_hora_inicio, fecha_hora_fin, precio_total, voucher_pago, estado, validado
        ) VALUES (
            2, 1, NOW(), DATE_ADD(NOW(), INTERVAL 1 HOUR), 100.00, 'VOUCHER001', 'pagado', 1
        )");
    }

    protected function tearDown(): void {
        $this->conexion->close();
    }

    public function testGananciasConReservas(): void {
        $resultado = obtenerGananciasPorDueno(1, $this->conexion);
        $this->assertArrayHasKey('ganancias', $resultado);
        $this->assertEquals('Cancha Test', $resultado['ganancias'][0]['nombre']);
        $this->assertEquals('100.00', $resultado['ganancias'][0]['total']);
    }

    public function testGananciasSinReservas(): void {
        // Crear otro dueño y su cancha sin reservas
        $this->conexion->query("INSERT INTO clientes 
            (id_cliente, nombre, apellido, numeroCel, correo, documento, tipoDoc, fechaNac, usuario, password, rol)
            VALUES
            (3, 'Laura', 'Dueña', '777777777', 'duena@correo.com', '56789012', 'DNI', '1988-01-01', 'duena1', 'pass789', 'dueño')");

        $this->conexion->query("INSERT INTO canchas 
            (id_cancha, id_dueno, nombre, direccion, precio_por_hora, tipoCancha, horasDisponibles, fechas_abiertas, estado)
            VALUES
            (2, 3, 'Cancha Vacía', 'Av. Fantasma 123', 50.00, 'voley', '09:00-21:00', '2025-06-12,2025-06-13', 'activa')");

        $resultado = obtenerGananciasPorDueno(3, $this->conexion);
        $this->assertArrayHasKey('ganancias', $resultado);
        $this->assertEquals('0.00', $resultado['ganancias'][0]['total']);
    }

    public function testGananciasConDuenoInvalido(): void {
        $resultado = obtenerGananciasPorDueno(9999, $this->conexion); // ID inexistente
        $this->assertArrayHasKey('error', $resultado);
    }
}
