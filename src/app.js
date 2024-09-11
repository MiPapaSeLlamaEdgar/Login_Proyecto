// src/app.js
const express = require('express');
const { engine } = require('express-handlebars');
const myconnection = require('express-myconnection');
const mysql = require('mysql');
const session = require('express-session');
const MySQLStore = require('express-mysql-session')(session); // Importación para almacenar sesiones en MySQL
const bodyParser = require('body-parser');
const path = require('path');

// Ajusta las rutas de acuerdo a tu estructura de proyecto
const loginRoutes = require('./routes/login.js');
const chatRoutes = require('./routes/chatRoutes.js');
const evaluacionRoutes = require('./routes/evaluacionRoutes.js');
const profileRoutes = require('./routes/profileRoutes.js'); // Importa el nuevo archivo de rutas para edición de perfil

const openaiService = require('../openaiService'); // Asegúrate de que esta ruta sea correcta
const authorizeRoles = require('./middleware/authMiddleware.js'); // Asegúrate de que esta ruta sea correcta

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
    secure: process.env.NODE_ENV === 'production', // Asegúrate de que esté configurado como true en producción
    httpOnly: true,
    maxAge: 1000 * 60 * 60 * 24, // 1 día
    sameSite: 'lax', // Protección adicional contra ataques CSRF
  }
}));

// Conexión a la base de datos para otras operaciones
app.use(myconnection(mysql, {
  host: '127.0.0.1',
  user: 'root',
  password: '1234', // Reemplaza con tu contraseña
  port: 3306,
  database: 'GestionAgricola'
}, 'single'));

// Configuración de archivos estáticos
app.use(express.static(path.join(__dirname, 'public')));


// Rutas
app.use('/', loginRoutes);
app.use('/', chatRoutes);
app.use('/', evaluacionRoutes);
app.use('/', profileRoutes); // Usa las rutas de edición de perfil

// Ruta principal
app.get('/', (req, res) => {
  if (req.session.loggedin) {
    switch (req.session.user.role) {
      case 'Administrador':
        return res.redirect('/admin-dashboard');
      case 'Agricultores/Productores':
        return res.redirect('/agricultor-dashboard');
      case 'Comerciantes de Productos Agrícolas':
        return res.redirect('/comerciante-dashboard');
      default:
        return res.redirect('/user-dashboard');
    }
  } else {
    res.redirect('/index');
  }
});

app.get('/admin-dashboard', authorizeRoles(['Administrador']), (req, res) => {
  console.log('Usuario en la sesión:', req.session.user); // Log para depurar
  res.render('dashboard/admin-dashboard', { user: req.session.user });
});

app.get('/agricultor-dashboard', authorizeRoles(['Agricultores/Productores']), (req, res) => {
  res.render('dashboard/agricultor-dashboard', { user: req.session.user });
});

app.get('/comerciante-dashboard', authorizeRoles(['Comerciantes de Productos Agrícolas']), (req, res) => {
  res.render('dashboard/comerciante-dashboard', { user: req.session.user });
});

app.get('/user-dashboard', authorizeRoles(['Usuarios']), (req, res) => {
  res.render('dashboard/user-dashboard', { user: req.session.user });
});

app.listen(app.get('port'), () => {
  console.log('Listening on port', app.get('port'));
});
