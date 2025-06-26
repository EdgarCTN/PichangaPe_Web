<?php
use PHPUnit\Framework\TestCase;

if (!defined('TESTING')) {
    define('TESTING', true);
}

require_once __DIR__ . '/../conexion.php';
require_once __DIR__ . '/../CLogin_func.php';

class CLoginTest extends TestCase
{
    private $conexion;

    protected function setUp(): void
    {
        $this->conexion = new mysqli(
            'mysql-24ded9fd-pichangape-test.i.aivencloud.com',
            'avnadmin',
            'AVNS_li53tVxNBHhJHDlPp9V',
            'defaultdb',
            11961
        );

        if ($this->conexion->connect_error) {
            $this->fail("Error de conexión en test: " . $this->conexion->connect_error);
        }

        // Disponible para la función login()
        $GLOBALS['conexion'] = $this->conexion;

        // Limpiar tabla
        $this->conexion->query("DELETE FROM clientes");

        // Insertar usuario válido
        $this->conexion->query("
            INSERT INTO clientes (id_cliente, nombre, apellido, numeroCel, correo, documento, tipoDoc, fechaNac, usuario, password, rol)
            VALUES (1, 'Daniel', 'Prueba', '999999999', 'daniel@test.com', '12345678', 'DNI', '1990-01-01', 'daniel', '1234', 'dueño')
        ");
    }

    protected function tearDown(): void
    {
        $this->conexion->close();
    }

    public function testLoginExitoso()
    {
        $usuario = 'daniel';
        $password = '1234';

        $resultado = login($this->conexion, $usuario, $password);

        $this->assertIsArray($resultado);
        $this->assertEquals('daniel', $resultado['usuario']);
    }

    public function testLoginFallido()
    {
        $usuario = 'usuario_invalido';
        $password = 'clave_erronea';

        $resultado = login($this->conexion, $usuario, $password);

        $this->assertIsArray($resultado);
        $this->assertArrayHasKey('error', $resultado);
        $this->assertEquals('Credenciales incorrectas o acceso denegado', $resultado['error']);
    }
}
