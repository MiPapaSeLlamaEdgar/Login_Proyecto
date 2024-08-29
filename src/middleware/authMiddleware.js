// src/middleware/authMiddleware.js

function authorizeRoles(allowedRoles) {
  return (req, res, next) => {
      const user = req.session.user; // Verificar que el usuario esté almacenado en la sesión

      // Verifica si el usuario está autenticado
      if (!user) {
          console.error('Acceso denegado: No estás autenticado.');
          return res.redirect('/login'); // Redirigir a la página de inicio de sesión en lugar de devolver JSON
      }

      // Asegúrate de que la propiedad 'role' esté definida en la sesión del usuario
      if (!user.role) {
          console.error('Error: El rol del usuario no está definido en la sesión.');
          console.log('Contenido de la sesión:', req.session); // Log para verificar el contenido de la sesión
          return res.redirect('/login'); // Redirigir a la página de inicio de sesión en lugar de devolver JSON
      }

      // Normaliza la comparación de roles para evitar errores debido a mayúsculas o espacios adicionales
      const normalizedUserRole = user.role.trim().toLowerCase();
      const normalizedAllowedRoles = allowedRoles.map(role => role.trim().toLowerCase());

      // Verifica si el rol del usuario está permitido
      if (!normalizedAllowedRoles.includes(normalizedUserRole)) {
          console.warn('Acceso denegado: Rol no autorizado:', user.role);
          return res.status(403).json({ success: false, message: 'No tienes permiso para acceder a esta página.' });
      }

      // Si pasa todas las verificaciones, continúa con la siguiente función de middleware o ruta
      next();
  };
}

module.exports = authorizeRoles;
