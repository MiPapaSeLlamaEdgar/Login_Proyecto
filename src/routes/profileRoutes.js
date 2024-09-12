const express = require('express');
const router = express.Router();
const authorizeRoles = require('../middleware/authMiddleware.js'); // Asegúrate de que la ruta sea correcta

// Ruta GET para mostrar el formulario de edición de perfil
router.get('/dashboard/functions/edit-profile', authorizeRoles(['Administrador', 'Agricultores/Productores', 'Comerciantes de Productos Agrícolas', 'Usuarios']), (req, res) => {
    res.render('dashboard/functions/edit-profile', {
        layout: 'main',
        user: req.session.user
    });
});

// Ruta POST para manejar la actualización del perfil
router.post('/dashboard/functions/edit-profile', authorizeRoles(['Administrador', 'Agricultores/Productores', 'Comerciantes de Productos Agrícolas', 'Usuarios']), async (req, res) => {
    const { first_name, last_name, document_type, document_number, phone, address } = req.body;
    const email = req.session.user.email; // Asumiendo que tienes la sesión configurada con el correo del usuario

    // Validación básica de datos
    if (!first_name || !last_name || !document_type || !document_number || !phone || !address) {
        return res.render('dashboard/functions/edit-profile', {
            error: 'Todos los campos son obligatorios.',
            user: req.session.user
        });
    }

    try {
        const query = `
            UPDATE Users 
            SET first_name = ?, last_name = ?, document_type = ?, document_number = ?, phone = ?, address = ? 
            WHERE email = ?
        `;
        const params = [first_name, last_name, document_type, document_number, phone, address, email];

        // Usando la conexión a la base de datos con async/await
        const [result] = await req.db.query(query, params);

        // Verificar si la actualización fue exitosa
        if (result.affectedRows === 0) {
            return res.render('dashboard/functions/edit-profile', {
                error: 'No se encontró el usuario o no se realizaron cambios.',
                user: req.session.user
            });
        }

        // Actualizar la información en la sesión del usuario
        req.session.user = { ...req.session.user, first_name, last_name, document_type, document_number, phone, address };

        // Guardar la sesión actualizada
        req.session.save((err) => {
            if (err) {
                console.error('Error guardando la sesión:', err);
                return res.status(500).render('dashboard/functions/edit-profile', {
                    error: 'Error guardando la sesión.',
                    user: req.session.user
                });
            }

            // Responder con éxito
            return res.render('dashboard/functions/edit-profile', {
                success: 'Perfil actualizado con éxito.',
                user: req.session.user
            });
        });

    } catch (err) {
        console.error('Error al actualizar los datos del perfil:', err);
        return res.render('dashboard/functions/edit-profile', {
            error: 'Error al actualizar el perfil.',
            user: req.session.user
        });
    }
});

module.exports = router;
