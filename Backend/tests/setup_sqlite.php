<?php
$db = new PDO('sqlite::memory:');
$db->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);

// Crear la tabla
$db->exec("
    CREATE TABLE clientes (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        usuario TEXT NOT NULL,
        password TEXT NOT NULL,
        rol TEXT NOT NULL
    );
");

// Insertar datos de prueba
$db->exec("
    INSERT INTO clientes (usuario, password, rol)
    VALUES ('daniel', '1234', 'dueño');
");

return $db;
