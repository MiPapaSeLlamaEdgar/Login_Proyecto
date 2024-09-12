const express = require('express');
const router = express.Router();

// Ruta para obtener los usuarios
router.get('/api/users', async (req, res) => {
  try {
    // Usamos req.db para obtener la conexión a la base de datos del middleware
    const [users] = await req.db.query(`
      SELECT u.name, u.email, r.name AS role
      FROM Users u
      INNER JOIN UserRoles ur ON u.email = ur.user_email
      INNER JOIN Roles r ON ur.role_id = r.id
    `);
    res.json(users);
  } catch (error) {
    console.error('Error al obtener los usuarios:', error);
    res.status(500).json({ error: 'Error al obtener los usuarios' });
  }
});

// Ruta para eliminar un usuario
router.delete('/api/users/:email', async (req, res) => {
  const { email } = req.params;

  if (!email) {
    return res.status(400).json({ error: 'El email es requerido' });
  }

  try {
    // Eliminar primero los roles asociados al usuario
    await req.db.query('DELETE FROM UserRoles WHERE user_email = ?', [email]);

    // Luego, eliminar al usuario
    const [result] = await req.db.query('DELETE FROM Users WHERE email = ?', [email]);

    if (result.affectedRows === 0) {
      return res.status(404).json({ error: 'Usuario no encontrado' });
    }

    res.json({ success: true, message: 'Usuario eliminado con éxito' });
  } catch (error) {
    console.error('Error al eliminar el usuario:', error);
    res.status(500).json({ error: 'Error al eliminar el usuario' });
  }
});

// Ruta para editar un usuario
router.put('/api/users/:email', async (req, res) => {
  const { email } = req.params;
  const { name, role } = req.body;

  if (!email || !name || !role) {
    return res.status(400).json({ error: 'Todos los campos (email, name, role) son requeridos' });
  }

  try {
    // Actualizar el nombre del usuario
    const [updateUserResult] = await req.db.query('UPDATE Users SET name = ? WHERE email = ?', [name, email]);

    if (updateUserResult.affectedRows === 0) {
      return res.status(404).json({ error: 'Usuario no encontrado' });
    }

    // Actualizar el rol del usuario
    const [updateRoleResult] = await req.db.query(
      'UPDATE UserRoles SET role_id = (SELECT id FROM Roles WHERE name = ?) WHERE user_email = ?',
      [role, email]
    );

    if (updateRoleResult.affectedRows === 0) {
      return res.status(404).json({ error: 'Rol no encontrado o no se pudo asignar' });
    }

    res.json({ success: true, message: 'Usuario actualizado con éxito' });
  } catch (error) {
    console.error('Error al editar el usuario:', error);
    res.status(500).json({ error: 'Error al editar el usuario' });
  }
});

module.exports = router;
