-- Crear la base de datos
CREATE DATABASE IF NOT EXISTS GestionAgricola;
USE GestionAgricola;

-- Tabla ProductoAgricola
CREATE TABLE IF NOT EXISTS ProductoAgricola (
    idProducto INT AUTO_INCREMENT PRIMARY KEY,
    nombre VARCHAR(255) NOT NULL,
    categoria VARCHAR(255),
    precio DECIMAL(10, 2),
    cantidad INT
);

-- Tabla Cultivo
CREATE TABLE IF NOT EXISTS Cultivo (
    idCultivo INT AUTO_INCREMENT PRIMARY KEY,
    tipoCultivo VARCHAR(255) NOT NULL,
    fechaSiembra DATE,
    fechaCosecha DATE,
    idProducto INT,
    FOREIGN KEY (idProducto) REFERENCES ProductoAgricola(idProducto)
);

-- Tabla Inventario
CREATE TABLE IF NOT EXISTS Inventario (X
    idInventario INT AUTO_INCREMENT PRIMARY KEY,
    idProducto INT,
    cantidadDisponible INT,
    fechaUltimaActualizacion DATE,
    FOREIGN KEY (idProducto) REFERENCES ProductoAgricola(idProducto)
);

-- Tabla Viabilidad
CREATE TABLE IF NOT EXISTS Viabilidad (
    idViabilidad INT AUTO_INCREMENT PRIMARY KEY,
    demandaMercado VARCHAR(255),
    costosProduccion DECIMAL(10, 2),
    condicionesClimaticas VARCHAR(255),
    idCultivo INT,
    FOREIGN KEY (idCultivo) REFERENCES Cultivo(idCultivo)
);

-- Tabla DatosMercado
CREATE TABLE IF NOT EXISTS DatosMercado (
    idDatosMercado INT AUTO_INCREMENT PRIMARY KEY,
    datosActualizados TEXT
);

-- Tabla Alerta
CREATE TABLE IF NOT EXISTS Alerta (
    idAlerta INT AUTO_INCREMENT PRIMARY KEY,
    tipoAlerta VARCHAR(255),
    descripcion TEXT,
    fecha DATE,
    idViabilidad INT,
    idDatosMercado INT,
    FOREIGN KEY (idViabilidad) REFERENCES Viabilidad(idViabilidad),
    FOREIGN KEY (idDatosMercado) REFERENCES DatosMercado(idDatosMercado)
);

-- Tabla OptimizacionCostos
CREATE TABLE IF NOT EXISTS OptimizacionCostos (
    idOptimizacion INT AUTO_INCREMENT PRIMARY KEY,
    costosProduccion DECIMAL(10, 2),
    estrategias TEXT,
    idViabilidad INT,
    FOREIGN KEY (idViabilidad) REFERENCES Viabilidad(idViabilidad)
);

-- Tabla Venta
CREATE TABLE IF NOT EXISTS Venta (
    idVenta INT AUTO_INCREMENT PRIMARY KEY,
    idProducto INT,
    comprador VARCHAR(255),
    fechaVenta DATE,
    FOREIGN KEY (idProducto) REFERENCES ProductoAgricola(idProducto)
);

-- Tabla Soporte
CREATE TABLE IF NOT EXISTS Soporte (
    idSoporte INT AUTO_INCREMENT PRIMARY KEY,
    problemaReportado TEXT,
    estado VARCHAR(255),
    idProducto INT,
    FOREIGN KEY (idProducto) REFERENCES ProductoAgricola(idProducto)
);

-- Tabla Users
CREATE TABLE IF NOT EXISTS Users (
    email VARCHAR(100) NOT NULL PRIMARY KEY,
    name VARCHAR(50) NOT NULL,
    password VARCHAR(255) NOT NULL
);

-- Tabla Roles
CREATE TABLE IF NOT EXISTS Roles (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(100) NOT NULL
);

-- Tabla intermedia para la relación Usuarios-Roles
CREATE TABLE IF NOT EXISTS UserRoles (
    user_email VARCHAR(100),
    role_id INT,
    FOREIGN KEY (user_email) REFERENCES Users(email) ON DELETE CASCADE,
    FOREIGN KEY (role_id) REFERENCES Roles(id) ON DELETE CASCADE,
    PRIMARY KEY (user_email, role_id)
);

-- Insertar roles en la tabla Roles
INSERT INTO Roles (name) VALUES 
('Agricultores/Productores'),
('Analistas de Datos Agrícolas'),
('Gestores de Operaciones Agrícolas'),
('Comerciantes de Productos Agrícolas'),
('Consultores Agrícolas'),
('Administrador');

-- Insertar algunos usuarios de ejemplo
INSERT INTO Users (email, name, password) VALUES 
('agricultor1@example.com', 'Agricultor Uno', 'password1'),
('analista1@example.com', 'Analista Uno', 'password2'),
('gestor1@example.com', 'Gestor Uno', 'password3');

-- Asignar roles a los usuarios
INSERT INTO UserRoles (user_email, role_id) VALUES 
('agricultor1@example.com', (SELECT id FROM Roles WHERE name = 'Agricultores/Productores')),
('analista1@example.com', (SELECT id FROM Roles WHERE name = 'Analistas de Datos Agrícolas')),
('gestor1@example.com', (SELECT id FROM Roles WHERE name = 'Gestores de Operaciones Agrícolas'));

-- Insertar productos agrícolas
INSERT INTO ProductoAgricola (nombre, categoria, precio, cantidad)
VALUES 
('Tomate', 'Vegetal', 3.50, 100),
('Papa', 'Tubérculo', 1.20, 200),
('Maíz', 'Cereal', 2.00, 150);

-- Insertar cultivos
INSERT INTO Cultivo (tipoCultivo, fechaSiembra, fechaCosecha, idProducto)
VALUES 
('Tomate', '2024-03-01', '2024-06-01', 1),
('Papa', '2024-04-15', '2024-07-15', 2);

-- Insertar inventarios
INSERT INTO Inventario (idProducto, cantidadDisponible, fechaUltimaActualizacion)
VALUES 
(1, 80, '2024-08-01'),
(2, 180, '2024-08-01');

-- Insertar evaluaciones de viabilidad
INSERT INTO Viabilidad (demandaMercado, costosProduccion, condicionesClimaticas, idCultivo)
VALUES 
('Alta', 2.50, 'Clima favorable', 1),
('Moderada', 1.10, 'Clima mixto', 2);

-- Insertar datos de mercado
INSERT INTO DatosMercado (datosActualizados)
VALUES 
('Demanda de tomate en aumento en Bogotá'),
('Demanda de papa estable en regiones montañosas');

-- Insertar alertas
INSERT INTO Alerta (tipoAlerta, descripcion, fecha, idViabilidad, idDatosMercado)
VALUES 
('Cambio en demanda', 'La demanda de tomate ha subido un 10%', '2024-08-01', 1, 1),
('Condiciones climáticas', 'Lluvias esperadas para la próxima semana', '2024-08-02', 2, 2);

-- Insertar optimización de costos
INSERT INTO OptimizacionCostos (costosProduccion, estrategias, idViabilidad)
VALUES 
(2.30, 'Optimización en riego y fertilización', 1),
(1.00, 'Reducción de costos de transporte', 2);

-- Insertar ventas
INSERT INTO Venta (idProducto, comprador, fechaVenta)
VALUES 
(1, 'Mercado Central Bogotá', '2024-08-03'),
(2, 'Supermercado Local', '2024-08-05');

-- Insertar soporte
INSERT INTO Soporte (problemaReportado, estado, idProducto)
VALUES 
('Problema con la actualización de inventario', 'Pendiente', 1),
('Error en la generación de alertas', 'Resuelto', 2);
