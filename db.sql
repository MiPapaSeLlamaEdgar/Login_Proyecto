DROP DATABASE IF EXISTS GestionAgricola;

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
CREATE TABLE IF NOT EXISTS Inventario (
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
    requisitosTecnicos TEXT,
    disponibilidadTecnologia VARCHAR(50),
    comentariosTecnicos TEXT,
    regionesProbadas VARCHAR(255),
    resultadosRendimiento TEXT,
    comentariosPruebasCampo TEXT,
    costosDesarrollo DECIMAL(10, 2),
    roiEstimado DECIMAL(5, 2),
    comentariosEconomicos TEXT,
    recursosNecesarios TEXT,
    disponibilidadRecursos VARCHAR(50),
    comentariosRecursos TEXT,
    viabilidadGlobal VARCHAR(50),
    comentariosGenerales TEXT,
    idCultivo INT,
    idProducto INT,
    FOREIGN KEY (idCultivo) REFERENCES Cultivo(idCultivo),
    FOREIGN KEY (idProducto) REFERENCES ProductoAgricola(idProducto)
);

CREATE TABLE IF NOT EXISTS DatosMercado (
    idDatosMercado INT AUTO_INCREMENT PRIMARY KEY,
    fecha DATETIME NOT NULL,  -- Fecha y hora del registro
    ventas INT,               -- Número de ventas realizadas en ese intervalo
    ingresos DECIMAL(10, 2),  -- Total de ingresos generados en ese intervalo
    clientes INT              -- Número de clientes en ese intervalo
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

-- Tabla DetallesUso para almacenar la información de uso del sistema
CREATE TABLE IF NOT EXISTS DetallesUso (
    idDetalle INT AUTO_INCREMENT PRIMARY KEY,
    usuarioEmail VARCHAR(100),      -- Email del usuario, relacionado con la tabla Users
    fecha DATETIME NOT NULL,        -- Fecha y hora de la acción
    accion VARCHAR(255) NOT NULL,   -- Descripción de la acción realizada
    duracionSesion VARCHAR(50),     -- Duración de la sesión (ej. '3h 20m')
    estado VARCHAR(50) NOT NULL,    -- Estado de la acción ('Exitoso', 'Error', etc.)
    FOREIGN KEY (usuarioEmail) REFERENCES Users(email) ON DELETE CASCADE  -- Clave foránea relacionada con Users
);

-- Insertar roles en la tabla Roles, solo los que se usan ahora más "Usuarios"
INSERT INTO Roles (name) VALUES 
('Agricultores/Productores'),
('Comerciantes de Productos Agrícolas'),
('Administrador'),
('Usuarios'); -- Añadir rol 'Usuarios'

-- Insertar algunos usuarios de ejemplo
INSERT INTO Users (email, name, password) VALUES 
('agricultor1@example.com', 'Agricultor Uno', 'password1'),
('comerciante1@example.com', 'Comerciante Uno', 'password2'),
('admin1@example.com', 'Admin Uno', 'password3'),
('usuario1@example.com', 'Usuario Uno', 'password4'); -- Añadir usuario para 'Usuarios'

-- Asignar roles a los usuarios
INSERT INTO UserRoles (user_email, role_id) VALUES 
('agricultor1@example.com', (SELECT id FROM Roles WHERE name = 'Agricultores/Productores')),
('comerciante1@example.com', (SELECT id FROM Roles WHERE name = 'Comerciantes de Productos Agrícolas')),
('admin1@example.com', (SELECT id FROM Roles WHERE name = 'Administrador')),
('usuario1@example.com', (SELECT id FROM Roles WHERE name = 'Usuarios')); -- Asignar rol 'Usuarios'

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
INSERT INTO Viabilidad (demandaMercado, costosProduccion, condicionesClimaticas, requisitosTecnicos, disponibilidadTecnologia,
comentariosTecnicos, regionesProbadas, resultadosRendimiento, comentariosPruebasCampo, costosDesarrollo,
roiEstimado, comentariosEconomicos, recursosNecesarios, disponibilidadRecursos, comentariosRecursos,
viabilidadGlobal, comentariosGenerales, idCultivo, idProducto)
VALUES 
('Alta', 2.50, 'Clima favorable', 'Requiere riego constante', 'Alta', 'Buena adaptabilidad técnica', 'Zona A, Zona B', 'Alto rendimiento', 'Pruebas de campo exitosas',
5.00, 20.00, 'Económicamente viable', 'Mano de obra, fertilizantes', 'Alta', 'Recursos disponibles en su mayoría', 'Alta', 'Producto con alta demanda y buen rendimiento', 1, 1),
('Moderada', 1.10, 'Clima mixto', 'Resistente a condiciones secas', 'Media', 'Requiere ajuste de técnicas', 'Zona C', 'Rendimiento moderado', 'Pruebas muestran variabilidad',
3.00, 15.00, 'Viabilidad moderada', 'Fertilizantes específicos', 'Media', 'Algunos recursos limitados', 'Media', 'Puede tener mercado en condiciones adecuadas', 2, 2);

-- Ejemplo de inserción de datos para esta tabla:
INSERT INTO DatosMercado (fecha, ventas, ingresos, clientes) VALUES
('2024-09-01 00:00:00', 40, 1200.50, 20),
('2024-09-01 01:00:00', 50, 1500.75, 25),
('2024-09-01 02:00:00', 30, 900.20, 15),
('2024-09-01 03:00:00', 70, 2100.00, 35),
('2024-09-01 04:00:00', 60, 1800.65, 30);

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

-- Ejemplo de inserción de datos para esta tabla
INSERT INTO DetallesUso (usuarioEmail, fecha, accion, duracionSesion, estado)
VALUES 
('admin1@example.com', '2024-09-01 10:00:00', 'Acceso al sistema', '3h 20m', 'Exitoso'),
('agricultor1@example.com', '2024-09-02 11:00:00', 'Editar perfil', '15m', 'Error');
