const express = require('express');
const { engine } = require('express-handlebars');
const myconnection = require('express-myconnection');
const mysql = require('mysql');
const session = require('express-session');
const bodyParser = require('body-parser');
const path = require('path');

const loginRoutes = require('./routes/login');
const chatRoutes = require('./routes/chatRoutes'); // Integrar las rutas de chat

const app = express();
app.set('port', 5000);

// Configurar el motor de plantillas Handlebars con el helper ifCond
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
        default:
          return options.inverse(this);
      }
    }
  }
}));

app.set('view engine', 'html');
app.set('views', path.join(__dirname, 'views')); // Asegura que las vistas se busquen en 'views'

// Configuración del bodyParser para manejar datos POST
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

// Configurar conexión a la base de datos MySQL
app.use(myconnection(mysql, {
  host: '127.0.0.1',
  user: 'root',
  password: '',
  port: 3306,
  database: 'gestionagricola'
}, 'single'));

// Configurar las sesiones
app.use(session({
  secret: 'secret',
  resave: true,
  saveUninitialized: true
}));

// Configurar el servidor para servir archivos estáticos desde 'public'
app.use(express.static(path.join(__dirname, 'public')));

// Definir las rutas de la aplicación
app.use('/', loginRoutes); // Rutas de inicio de sesión
app.use('/', chatRoutes);  // Rutas del chat

// Ruta para la página de inicio
app.get('/', (req, res) => {
  if (req.session.loggedin) {
    // Redirigir según el rol del usuario
    switch (req.session.role) {
      case 'Administrador':
        return res.redirect('/admin-dashboard');
      case 'Agricultores/Productores':
        return res.redirect('/agricultor-dashboard');
      case 'Analistas de Datos Agrícolas':
        return res.redirect('/analista-dashboard');
      case 'Gestores de Operaciones Agrícolas':
        return res.redirect('/gestor-dashboard');
      case 'Comerciantes de Productos Agrícolas':
        return res.redirect('/comerciante-dashboard');
      case 'Consultores Agrícolas':
        return res.redirect('/consultor-dashboard');
      default:
        return res.redirect('/user-dashboard');
    }
  } else {
    res.redirect('/index');
  }
});

// Iniciar el servidor
app.listen(app.get('port'), () => {
  console.log('Listening on port', app.get('port'));
});
