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

router.post('/storeUser', LoginController.storeUser);

module.exports = router;
