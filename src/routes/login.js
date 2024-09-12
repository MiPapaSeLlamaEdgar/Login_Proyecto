const express = require('express');
const LoginController = require('../controllers/LoginController');
const authorizeRoles = require('../middleware/authMiddleware'); // Importa el middleware para autorización de roles

const router = express.Router();

// Middleware para verificar si el usuario está autenticado
function isAuthenticated(req, res, next) {
    if (req.session && req.session.user) {
        next();
    } else {
        res.status(401).json({ success: false, message: 'No estás autenticado.' });
    }
}

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

// Ruta para mostrar la página de Admin, accesible solo para administradores
router.get('/admin', isAuthenticated, authorizeRoles(['Administrador']), LoginController.admin);

// Rutas para los dashboards según el rol del usuario
router.get('/admin-dashboard', isAuthenticated, authorizeRoles(['Administrador']), LoginController.adminDashboard);
router.get('/agricultor-dashboard', isAuthenticated, authorizeRoles(['Agricultores/Productores']), LoginController.agricultorDashboard);
router.get('/comerciante-dashboard', isAuthenticated, authorizeRoles(['Comerciantes de Productos Agrícolas']), LoginController.comercianteDashboard);
router.get('/user-dashboard', isAuthenticated, authorizeRoles(['Usuarios']), LoginController.userDashboard);

// Ruta para actualizar el perfil, accesible para todos los usuarios autenticados
router.post('/update-profile', isAuthenticated, async (req, res) => {
    const { first_name, last_name, document_type, document_number, phone, address } = req.body;
    const email = req.session.user.email; // Se asume que el correo del usuario está almacenado en la sesión

    try {
        // Usando la conexión a la base de datos con async/await
        const [result] = await req.db.query(
            'UPDATE Users SET first_name = ?, last_name = ?, document_type = ?, document_number = ?, phone = ?, address = ? WHERE email = ?',
            [first_name, last_name, document_type, document_number, phone, address, email]
        );

        // Verificar si la actualización fue exitosa
        if (result.affectedRows === 0) {
            return res.json({ success: false, message: 'No se encontró el usuario o no se realizaron cambios.' });
        }

        // Actualizar la sesión con los nuevos datos
        req.session.user.first_name = first_name;
        req.session.user.last_name = last_name;
        req.session.user.document_type = document_type;
        req.session.user.document_number = document_number;
        req.session.user.phone = phone;
        req.session.user.address = address;

        // Guardar la sesión actualizada
        req.session.save((err) => {
            if (err) {
                console.error('Error guardando la sesión:', err);
                return res.status(500).json({ success: false, message: 'Error guardando la sesión.' });
            }

            // Responder con éxito
            return res.json({ success: true, message: 'Perfil actualizado con éxito.' });
        });

    } catch (err) {
        console.error('Error al actualizar los datos del perfil:', err);
        return res.status(500).json({ success: false, message: 'Error al actualizar los datos del perfil.' });
    }
});

module.exports = router;
