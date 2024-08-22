const express = require('express');
const LoginController = require('../controllers/LoginController');

const router = express.Router();

// Ruta para mostrar la página de login
router.get('/login', LoginController.login);

// Ruta para mostrar la página de registro
router.get('/register', LoginController.register);

// Ruta para manejar la autenticación (POST de login)
router.post('/auth', LoginController.auth);

// Ruta para manejar el cierre de sesión
router.get('/logout', LoginController.logout);

// Ruta para manejar la autenticación (POST de Register)
router.post('/storeUser', LoginController.storeUser);

// Ruta para mostrar la página de Index
router.get('/index', LoginController.index);

// Ruta para mostrar la página de Reset Password
router.get('/reset-password', LoginController.resetPassword);

// Ruta para mostrar la página de Admin
router.get('/admin', LoginController.admin);

// Rutas para los dashboards según el rol del usuario
router.get('/admin-dashboard', LoginController.adminDashboard);
router.get('/agricultor-dashboard', LoginController.agricultorDashboard);
router.get('/analista-dashboard', LoginController.analistaDashboard);
router.get('/gestor-dashboard', LoginController.gestorDashboard);
router.get('/comerciante-dashboard', LoginController.comercianteDashboard);
router.get('/consultor-dashboard', LoginController.consultorDashboard);
router.get('/user-dashboard', LoginController.userDashboard);

module.exports = router;
