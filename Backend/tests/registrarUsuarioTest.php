<?php
use PHPUnit\Framework\TestCase;
$_SERVER['REQUEST_METHOD'] = 'POST';
define('TESTING', true);

require_once __DIR__ . '/../registrar_usuario.php';


class RegistrarUsuarioTest extends TestCase
{
    private $conexion;

    protected function setUp(): void
    {
        // 👇 Conexión directa a la base de datos de pruebas
        $this->conexion = new mysqli(
            'mysql-24ded9fd-pichangape-test.i.aivencloud.com',
            'avnadmin',
            'AVNS_li53tVxNBHhJHDlPp9V',
            'defaultdb',
            11961
        );

        if ($this->conexion->connect_error) {
            die("Error de conexión en test: " . $this->conexion->connect_error);
        }

        $this->conexion->query("DELETE FROM clientes"); // Limpieza de tabla
    }

    protected function tearDown(): void
    {
        $this->conexion->close();
    }

    public function testRegistroExitoso()
    {
        $datos = [
            'usuario' => 'usuario_test',
            'password' => '123456',
            'nombre' => 'Juan',
            'apellido' => 'Pérez',
            'numeroCel' => '123456789',
            'correo' => 'juan@example.com',
            'documento' => '987654321',
            'tipoDoc' => 'DNI',
            'fechaNac' => '1990-01-01',
            'rol' => 'cliente'
        ];

        $resultado = registrarUsuario($this->conexion, $datos);

        $this->assertArrayHasKey('mensaje', $resultado);
        $this->assertEquals('Usuario registrado con éxito', $resultado['mensaje']);
    }

    public function testUsuarioYaRegistrado()
    {
        // Inserta usuario duplicado
        $this->conexion->query("
            INSERT INTO clientes (nombre, apellido, numeroCel, correo, documento, tipoDoc, fechaNac, usuario, password, rol)
            VALUES ('Juan', 'Pérez', '123456789', 'juan@example.com', '987654321', 'DNI', '1990-01-01', 'usuario_test', '123456', 'cliente')
        ");

        $datos = [
            'usuario' => 'usuario_test',
            'password' => '123456',
            'nombre' => 'Juan',
            'apellido' => 'Pérez',
            'numeroCel' => '123456789',
            'correo' => 'juan@example.com',
            'documento' => '987654321',
            'tipoDoc' => 'DNI',
            'fechaNac' => '1990-01-01',
            'rol' => 'cliente'
        ];

        $resultado = registrarUsuario($this->conexion, $datos);

        $this->assertArrayHasKey('error', $resultado);
        $this->assertEquals('El nombre de usuario ya está registrado', $resultado['error']);
    }
}
