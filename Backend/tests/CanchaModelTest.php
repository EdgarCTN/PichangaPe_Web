<?php
use PHPUnit\Framework\TestCase;

require_once __DIR__ . '/../cancha_model.php'; // Asegúrate de tener la lógica separada aquí

class CanchaModelTest extends TestCase {
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
            $this->fail("Error de conexión: " . $this->conexion->connect_error);
        }

        // Limpieza de datos relacionados
        $this->conexion->query("DELETE FROM reservas");
        $this->conexion->query("DELETE FROM canchas");
        $this->conexion->query("DELETE FROM clientes");

        // Insertar cliente dueño
        $this->conexion->query("
            INSERT INTO clientes (
                id_cliente, nombre, apellido, numeroCel, correo, documento, tipoDoc,
                fechaNac, usuario, password, rol, numYape, numTransfer
            ) VALUES (
                99, 'Juan', 'Dueño', '987654321', 'dueno@test.com', '12345678', 'DNI',
                '1980-01-01', 'dueno_test', 'pass1234', 'dueño', NULL, NULL
            )
        ");

        // Insertar cancha del dueño 99
        $this->conexion->query("
            INSERT INTO canchas (
                id_cancha, id_dueno, nombre, direccion, precio_por_hora,
                tipoCancha, horasDisponibles, fechas_abiertas, estado
            ) VALUES (
                1, 99, 'Cancha Prueba', 'Dirección X', 50.00,
                'fútbol', '08:00-18:00', '2025-07-01', 'activa'
            )
        ");
    }

    protected function tearDown(): void {
        $this->conexion->close();
    }

    public function testCanchasExistentes() {
        $resultado = obtenerCanchasPorDueno($this->conexion, 99);
        $this->assertArrayHasKey("canchas", $resultado);
        $this->assertCount(1, $resultado["canchas"]);
        $this->assertEquals("Cancha Prueba", $resultado["canchas"][0]["nombre"]);
    }

    public function testIdDuenoInvalido() {
        $resultado = obtenerCanchasPorDueno($this->conexion, -1);
        $this->assertArrayHasKey("canchas", $resultado);
        $this->assertEmpty($resultado["canchas"]);
    }

    public function testIdDuenoSinCanchas() {
        // Insertar cliente sin canchas
        $this->conexion->query("
            INSERT INTO clientes (
                id_cliente, nombre, apellido, numeroCel, correo, documento, tipoDoc,
                fechaNac, usuario, password, rol
            ) VALUES (
                100, 'Luis', 'Cliente', '911111111', 'luis@test.com', '87654321', 'DNI',
                '1990-02-02', 'luis_test', 'pass5678', 'dueño'
            )
        ");

        $resultado = obtenerCanchasPorDueno($this->conexion, 100);
        $this->assertArrayHasKey("canchas", $resultado);
        $this->assertEmpty($resultado["canchas"]);
    }
}
