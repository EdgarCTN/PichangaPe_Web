-- Crear base de datos y seleccionar su uso
CREATE DATABASE IF NOT EXISTS PichangaPeDB DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci;
USE PichangaPeDB;

-- Tabla clientes
CREATE TABLE `clientes` (
  `id_cliente` INT NOT NULL AUTO_INCREMENT,
  `nombre` VARCHAR(100) COLLATE utf8mb4_general_ci NOT NULL,
  `apellido` VARCHAR(100) COLLATE utf8mb4_general_ci NOT NULL,
  `numeroCel` VARCHAR(15) COLLATE utf8mb4_general_ci NOT NULL,
  `correo` VARCHAR(100) COLLATE utf8mb4_general_ci NOT NULL,
  `documento` VARCHAR(45) COLLATE utf8mb4_general_ci NOT NULL,
  `tipoDoc` VARCHAR(20) COLLATE utf8mb4_general_ci NOT NULL,
  `fechaNac` DATE NOT NULL,
  `usuario` VARCHAR(45) COLLATE utf8mb4_general_ci NOT NULL,
  `password` VARCHAR(255) COLLATE utf8mb4_general_ci NOT NULL,
  `rol` ENUM('admin','cliente','dueño') COLLATE utf8mb4_general_ci NOT NULL DEFAULT 'cliente',
  `numYape` VARCHAR(15) COLLATE utf8mb4_general_ci DEFAULT NULL,
  `numTransfer` VARCHAR(15) COLLATE utf8mb4_general_ci DEFAULT NULL,
  PRIMARY KEY (`id_cliente`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- Tabla canchas
CREATE TABLE `canchas` (
  `id_cancha` INT NOT NULL AUTO_INCREMENT,
  `id_dueno` INT NOT NULL,
  `nombre` VARCHAR(100) COLLATE utf8mb4_general_ci NOT NULL,
  `direccion` VARCHAR(255) COLLATE utf8mb4_general_ci NOT NULL,
  `precio_por_hora` DECIMAL(10,2) NOT NULL,
  `tipoCancha` ENUM('fútbol','voley','basket','otro') COLLATE utf8mb4_general_ci NOT NULL,
  `horasDisponibles` TEXT COLLATE utf8mb4_general_ci NOT NULL,
  `fechas_abiertas` TEXT COLLATE utf8mb4_general_ci NOT NULL,
  `estado` ENUM('activa','inactiva','mantenimiento') COLLATE utf8mb4_general_ci NOT NULL DEFAULT 'activa',
  PRIMARY KEY (`id_cancha`),
  KEY `id_dueno` (`id_dueno`),
  CONSTRAINT `canchas_ibfk_1` FOREIGN KEY (`id_dueno`) REFERENCES `clientes` (`id_cliente`) ON DELETE CASCADE,
  CONSTRAINT `canchas_chk_1` CHECK (`precio_por_hora` >= 0)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- Tabla reservas
CREATE TABLE `reservas` (
  `id_reserva` INT NOT NULL AUTO_INCREMENT,
  `id_reservador` INT NOT NULL,
  `id_cancha` INT NOT NULL,
  `fecha_hora_inicio` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `fecha_hora_fin` DATETIME NOT NULL,
  `precio_total` DECIMAL(10,2) NOT NULL,
  `voucher_pago` TEXT COLLATE utf8mb4_general_ci NOT NULL,
  `estado` ENUM('pendiente','pagado','cancelado') COLLATE utf8mb4_general_ci NOT NULL DEFAULT 'pendiente',
  `validado` TINYINT(1) NOT NULL DEFAULT 0,
  PRIMARY KEY (`id_reserva`),
  KEY `id_reservador` (`id_reservador`),
  KEY `id_cancha` (`id_cancha`),
  CONSTRAINT `reservas_ibfk_1` FOREIGN KEY (`id_reservador`) REFERENCES `clientes` (`id_cliente`) ON DELETE CASCADE,
  CONSTRAINT `reservas_ibfk_2` FOREIGN KEY (`id_cancha`) REFERENCES `canchas` (`id_cancha`) ON DELETE CASCADE,
  CONSTRAINT `reservas_chk_1` CHECK (`precio_total` >= 0)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- Insertar datos en clientes
INSERT INTO `clientes` VALUES 
(1,'Juan','Perez','987654321','juan.perez@email.com','12345678','DNI','1990-05-12','juanpe','111','cliente','987654321','123456789'),
(2,'Maria','Gomez','986543210','maria.gomez@email.com','87654321','DNI','1988-08-24','mariag','222','dueño','986543210','123776789'),
(3,'Carlos','Ramirez','985432109','carlos.ramirez@email.com','45678912','DNI','1995-02-17','carlitos','333','cliente','123776789','958741236'),
(4,'Edgardo Juan Julián','Barboza Rincón','9654288','edgardo@gmail.com','70355949','DNI','2003-02-22','ejjbr','ejjbr22','dueño','9654289','9658289'),
(5,'Ana','Lopez','987651234','ana.lopez@example.com','32165498','DNI','1992-06-15','analopez','pass','cliente','987651234','987651234'),
(6,'Pedro','Martinez','987653210','pedro.martinez@example.com','11223344','DNI','1985-04-10','pedrom','pass','cliente','987653210','987653210'),
(7,'Laura','Gomez','987654321','laura.gomez@example.com','55667788','DNI','1990-09-09','laurag','pass','cliente','987654321','987654321'),
(8,'Roberto','Sanchez','987600123','roberto.sanchez@example.com','44332211','DNI','1978-03-25','robertos','pass','dueño','987600123','987600123');

-- Insertar datos en canchas
INSERT INTO `canchas` VALUES 
(1,2,'Cancha Los Angeles','Av. Primavera 123, Lima',50.00,'fútbol','08:00-22:00','2025-02-18,2025-02-19,2025-02-20','activa'),
(2,2,'Cancha San Marcos','Jr. Los Olivos 456, Lima',40.00,'voley','09:00-21:00','2025-02-18,2025-02-20','activa'),
(3,4,'Cancha Central','Av. Central 456, Lima',60.00,'basket','07:00-23:00','2025-02-18,2025-02-20,2025-02-22','activa'),
(4,2,'Cancha El Recreo','Av. Recreo 789, Lima',55.00,'fútbol','08:00-20:00','2025-02-19,2025-02-21','mantenimiento'),
(5,2,'Cancha Municipal','Av. Central 456, Lima',60.00,'fútbol','07:00-23:00','2025-03-01,2025-03-02','activa'),
(18,2,'Canchera Limeña','Olivos',55.00,'fútbol','08:00-13:00','2025-05-17','activa');

-- Insertar datos en reservas
INSERT INTO `reservas` VALUES 
(1,1,1,'2025-02-18 10:00:00','2025-02-18 11:00:00',50.00,'https://i.ibb.co/d4YBVT8G/imagen-1.jpg','pagado',1),
(2,3,2,'2025-02-18 15:00:00','2025-02-18 16:00:00',60.00,'https://i.ibb.co/CdYsDgX/imagen-2.jpg','pagado',1),
(3,5,3,'2025-03-01 09:00:00','2025-03-01 10:30:00',90.00,'https://i.ibb.co/d0JDg1D4/imagen-3.jpg','pendiente',0),
(4,6,3,'2025-03-01 11:00:00','2025-03-01 12:00:00',60.00,'https://i.ibb.co/d4YBVT8G/imagen-1.jpg','pendiente',0),
(5,7,4,'2025-03-02 14:00:00','2025-03-02 15:00:00',55.00,'https://i.ibb.co/CdYsDgX/imagen-2.jpg','pagado',1),
(6,8,1,'2025-03-03 16:00:00','2025-03-03 17:00:00',50.00,'https://i.ibb.co/d0JDg1D4/imagen-3.jpg','pagado',1),
(7,1,2,'2025-03-04 10:00:00','2025-03-04 11:00:00',40.00,'https://i.ibb.co/d4YBVT8G/imagen-1.jpg','pagado',1);
