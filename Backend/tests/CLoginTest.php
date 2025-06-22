<?php
use PHPUnit\Framework\TestCase;
define('TESTING', true);
require_once __DIR__ . '/../CLogin_func.php';

class CLoginTest extends TestCase
{
    private $db;

    protected function setUp(): void
    {
        // Utiliza una base de datos SQLite en memoria para pruebas
        $this->db = require __DIR__ . '/setup_sqlite.php';
    }
//     Prueba de login exitoso
    public function testLoginExitoso()
    {
        $usuario = 'daniel';
        $password = '1234';

        $stmt = $this->db->prepare("SELECT * FROM clientes WHERE usuario=? AND password=? AND rol='dueño'");
        $stmt->execute([$usuario, $password]);
        $result = $stmt->fetch(PDO::FETCH_ASSOC);

        $this->assertIsArray($result);
        $this->assertEquals('daniel', $result['usuario']);
    }
// Prueba de login fallido
    public function testLoginFallido()
    {
        $stmt = $this->db->prepare("SELECT * FROM clientes WHERE usuario=? AND password=? AND rol='dueño'");
        $stmt->execute(['invalido', 'wrong']);
        $result = $stmt->fetch(PDO::FETCH_ASSOC);

        $this->assertFalse($result);
    }
}
