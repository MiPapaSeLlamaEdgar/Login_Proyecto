// src/app.js
const express = require('express');
const { engine } = require('express-handlebars');
const myconnection = require('express-myconnection');
const mysql = require('mysql');
const session = require('express-session');
const bodyParser = require('body-parser');
const path = require('path');

const loginRoutes = require('./routes/login');
const chatRoutes = require('./routes/chatRoutes'); // Asegúrate de que esta ruta sea correcta
const evaluacionRoutes = require('./routes/evaluacionRoutes');

const openaiService = require('../openaiService'); // Asegúrate de que esta ruta sea correcta

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
        default:
          return options.inverse(this);
      }
    }
  }
}));

app.set('view engine', 'html');
app.set('views', path.join(__dirname, 'views'));

app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

app.use(myconnection(mysql, {
  host: '127.0.0.1',
  user: 'root',
  password: '1234', // Reemplaza con tu contraseña
  port: 3306,
  database: 'GestionAgricola'
}, 'single'));

app.use(session({
  secret: 'secret',
  resave: true,
  saveUninitialized: true
}));

app.use(express.static(path.join(__dirname, 'public')));
app.use('/', loginRoutes);
app.use('/', chatRoutes);
app.use('/', evaluacionRoutes);

app.post('/submit-evaluation', async (req, res) => {
    const {
        productName, productDescription, technicalRequirements, technologyAvailability,
        technicalComments, testedRegions, performanceResults, fieldTestComments,
        developmentCosts, productionCosts, roiEstimate, economicComments, requiredResources,
        resourceAvailability, resourceComments, overallViability, generalComments
    } = req.body;

    const message = `
    Evaluación del Producto Agrícola:
    Producto: ${productName}
    Descripción: ${productDescription}
    Requisitos Técnicos: ${technicalRequirements}
    Disponibilidad de Tecnología: ${technologyAvailability}
    Comentarios Técnicos: ${technicalComments}
    Regiones Probadas: ${testedRegions}
    Resultados de Rendimiento: ${performanceResults}
    Comentarios sobre Pruebas de Campo: ${fieldTestComments}
    Costos de Desarrollo: ${developmentCosts}
    Costos de Producción: ${productionCosts}
    ROI Estimado: ${roiEstimate}
    Comentarios Económicos: ${economicComments}
    Recursos Necesarios: ${requiredResources}
    Disponibilidad de Recursos: ${resourceAvailability}
    Comentarios sobre Recursos: ${resourceComments}
    Viabilidad Global del Producto: ${overallViability}
    Comentarios Generales: ${generalComments}
    `;

    try {
        const gptResponse = await openaiService.getChatGPTResponse(message);

        req.getConnection((err, connection) => {
            if (err) throw err;

            const query = `
                INSERT INTO Viabilidad (
                    demandaMercado, costosProduccion, condicionesClimaticas, requisitosTecnicos,
                    disponibilidadTecnologia, comentariosTecnicos, regionesProbadas, resultadosRendimiento,
                    comentariosPruebasCampo, costosDesarrollo, roiEstimado, comentariosEconomicos,
                    recursosNecesarios, disponibilidadRecursos, comentariosRecursos, viabilidadGlobal,
                    comentariosGenerales, idProducto
                ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
            `;

            const values = [
                overallViability, productionCosts, fieldTestComments, technicalRequirements,
                technologyAvailability, technicalComments, testedRegions, performanceResults,
                fieldTestComments, developmentCosts, roiEstimate, economicComments,
                requiredResources, resourceAvailability, resourceComments, overallViability,
                generalComments, productName // Asegúrate de relacionar esto con el producto correcto
            ];

            connection.query(query, values, (error, results) => {
                if (error) throw error;
                res.json({ response: gptResponse });
            });
        });

    } catch (error) {
        console.error('Error en la evaluación de viabilidad:', error.message);
        res.status(500).json({ error: 'Error al evaluar la viabilidad del producto' });
    }
});

app.get('/', (req, res) => {
  if (req.session.loggedin) {
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

app.listen(app.get('port'), () => {
  console.log('Listening on port', app.get('port'));
});
