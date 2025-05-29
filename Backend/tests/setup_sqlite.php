<?php
$db = new PDO('sqlite::memory:');
$db->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);

// Crear la tabla con todos los campos usados en el registro
$db->exec("
    CREATE TABLE clientes (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        nombre TEXT,
        apellido TEXT,
        numeroCel TEXT,
        correo TEXT,
        documento TEXT,
        tipoDoc TEXT,
        fechaNac TEXT,
        usuario TEXT NOT NULL UNIQUE,
        password TEXT NOT NULL,
        rol TEXT NOT NULL
    );
");

// Insertar datos de prueba (opcional)
$db->exec("
    INSERT INTO clientes (usuario, password, rol, nombre, apellido, numeroCel, correo, documento, tipoDoc, fechaNac)
    VALUES ('daniel', '1234', 'dueño', 'Daniel', 'Perez', '1234567890', 'daniel@email.com', '12345678', 'DNI', '1990-01-01');
");

return $db;

