const express = require('express');
const { engine } = require('express-handlebars');
const mysql = require('mysql2/promise'); // mysql2/promise para usar promesas
const session = require('express-session');
const MySQLStore = require('express-mysql-session')(session);
const bodyParser = require('body-parser');
const path = require('path');
require('dotenv').config(); // Para variables de entorno

// Rutas importadas
const loginRoutes = require('./routes/login.js');
const chatRoutes = require('./routes/chatRoutes.js');
const evaluacionRoutes = require('./routes/evaluacionRoutes.js');
const profileRoutes = require('./routes/profileRoutes.js');
const userRoutes = require('./routes/userRoutes'); // Asegúrate de que esta ruta esté correcta

const app = express();
app.set('port', process.env.PORT || 5000);

// Configuración del motor de plantillas Handlebars con helpers personalizados
app.engine('.html', engine({
  extname: '.html',
  defaultLayout: 'main',
  layoutsDir: path.join(__dirname, 'views/layouts'),
  helpers: {
    ifCond: function (v1, operator, v2, options) {
      switch (operator) {
        case '==': return (v1 == v2) ? options.fn(this) : options.inverse(this);
        case '===': return (v1 === v2) ? options.fn(this) : options.inverse(this);
        case '!=': return (v1 != v2) ? options.fn(this) : options.inverse(this);
        case '!==': return (v1 !== v2) ? options.fn(this) : options.inverse(this);
        case '<': return (v1 < v2) ? options.fn(this) : options.inverse(this);
        case '<=': return (v1 <= v2) ? options.fn(this) : options.inverse(this);
        case '>': return (v1 > v2) ? options.fn(this) : options.inverse(this);
        case '>=': return (v1 >= v2) ? options.fn(this) : options.inverse(this);
        case '&&': return (v1 && v2) ? options.fn(this) : options.inverse(this);
        case '||': return (v1 || v2) ? options.fn(this) : options.inverse(this);
        default: return options.inverse(this);
      }
    }
  }
}));

app.set('view engine', 'html');
app.set('views', path.join(__dirname, 'views'));

// Middleware para manejar solicitudes
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

// Configuración de la conexión a la base de datos para almacenar sesiones
const sessionStore = new MySQLStore({
  host: process.env.DB_HOST || '127.0.0.1',
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || '1234',
  port: process.env.DB_PORT || 3306,
  database: process.env.DB_NAME || 'GestionAgricola'
});

// Configuración de la sesión con express-session
app.use(session({
  key: 'session_cookie_name',
  secret: process.env.SESSION_SECRET || 'your-secret-key',
  store: sessionStore,
  resave: false,
  saveUninitialized: false,
  cookie: {
    secure: process.env.NODE_ENV === 'production',
    httpOnly: true,
    maxAge: 1000 * 60 * 60 * 24, // 1 día
    sameSite: 'lax', // Protección adicional contra ataques CSRF
  }
}));

// Conexión de base de datos usando pool de conexiones
const pool = mysql.createPool({
  host: process.env.DB_HOST || '127.0.0.1',
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || '1234',
  database: process.env.DB_NAME || 'GestionAgricola',
  port: process.env.DB_PORT || 3306,
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0
});

// Middleware para asignar una conexión de la base de datos a cada solicitud
app.use(async (req, res, next) => {
  try {
    const connection = await pool.getConnection(); // Obtener una conexión individual
    req.db = connection; // Asignar la conexión a `req.db`

    // Asegurarse de liberar la conexión después de la solicitud
    res.on('finish', () => {
      if (req.db) req.db.release();
    });

    next();
  } catch (err) {
    console.error('Error al conectar con la base de datos:', err);
    res.status(500).send('Error al conectar con la base de datos.');
  }
});

// Configuración de archivos estáticos
app.use(express.static(path.join(__dirname, 'public')));

// Rutas
app.use('/', loginRoutes);
app.use('/', chatRoutes);
app.use('/', evaluacionRoutes);
app.use('/', profileRoutes);
app.use('/', userRoutes); // Conectamos las rutas de usuario

// Manejo de errores global
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).send('Algo salió mal en el servidor.');
});

// Iniciar el servidor
app.listen(app.get('port'), () => {
  console.log('Servidor corriendo en el puerto', app.get('port'));
});
