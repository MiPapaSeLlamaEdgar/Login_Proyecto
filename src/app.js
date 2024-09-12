const express = require('express');
const { engine } = require('express-handlebars');
const mysql = require('mysql2/promise'); // mysql2/promise para usar promesas
const session = require('express-session');
const MySQLStore = require('express-mysql-session')(session);
const bodyParser = require('body-parser');
const path = require('path');

// Ajusta las rutas de acuerdo a tu estructura de proyecto
const loginRoutes = require('./routes/login.js');
const chatRoutes = require('./routes/chatRoutes.js');
const evaluacionRoutes = require('./routes/evaluacionRoutes.js');
const profileRoutes = require('./routes/profileRoutes.js');
const openaiService = require('../openaiService');
const authorizeRoles = require('./middleware/authMiddleware.js');

const app = express();
app.set('port', 5000);

// Configuración del motor de plantillas Handlebars con helpers personalizados
app.engine('.html', engine({
  extname: '.html',
  defaultLayout: 'main',
  layoutsDir: path.join(__dirname, 'views/layouts'),
  helpers: {
    ifCond: function (v1, operator, v2, options) {
      switch (operator) {
        case '==':
          return (v1 == v2) ? options.fn(this) : options.inverse(this);
        case '===':
          return (v1 === v2) ? options.fn(this) : options.inverse(this);
        case '!=':
          return (v1 != v2) ? options.fn(this) : options.inverse(this);
        case '!==':
          return (v1 !== v2) ? options.fn(this) : options.inverse(this);
        case '<':
          return (v1 < v2) ? options.fn(this) : options.inverse(this);
        case '<=':
          return (v1 <= v2) ? options.fn(this) : options.inverse(this);
        case '>':
          return (v1 > v2) ? options.fn(this) : options.inverse(this);
        case '>=':
          return (v1 >= v2) ? options.fn(this) : options.inverse(this);
        case '&&':
          return (v1 && v2) ? options.fn(this) : options.inverse(this);
        case '||':
          return (v1 || v2) ? options.fn(this) : options.inverse(this);
        default:
          return options.inverse(this);
      }
    }
  }
}));

app.set('view engine', 'html');
app.set('views', path.join(__dirname, 'views'));

// Middleware para manejar sesiones y solicitudes
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

// Configuración de la conexión a la base de datos para almacenar sesiones
const sessionStore = new MySQLStore({
  host: '127.0.0.1',
  user: 'root',
  password: '1234', // Reemplaza con tu contraseña
  port: 3306,
  database: 'GestionAgricola'
});

// Configuración de la sesión con express-session
app.use(session({
  key: 'session_cookie_name',
  secret: 'your-secret-key',
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

// Configuración de archivos estáticos
app.use(express.static(path.join(__dirname, 'public')));

// Middleware para establecer conexión a la base de datos usando mysql2/promise
app.use(async (req, res, next) => {
  try {
    const connection = await mysql.createConnection({
      host: '127.0.0.1',
      user: 'root',
      password: '1234', // Cambia esto por tu contraseña de MySQL
      database: 'GestionAgricola',
      port: 3306
    });

    // Asignar la conexión al objeto de la solicitud
    req.db = connection;

    // Cerrar la conexión cuando termine la solicitud
    res.on('finish', () => {
      if (req.db) {
        req.db.end();
      }
    });

    next();
  } catch (err) {
    console.error('Error al conectar con la base de datos:', err);
    res.status(500).send('Error al conectar con la base de datos.');
  }
});

// Rutas
app.use('/', loginRoutes);
app.use('/', chatRoutes);
app.use('/', evaluacionRoutes);
app.use('/', profileRoutes); // Usa las rutas de edición de perfil

// Iniciar el servidor
app.listen(app.get('port'), () => {
  console.log('Servidor corriendo en el puerto', app.get('port'));
});
