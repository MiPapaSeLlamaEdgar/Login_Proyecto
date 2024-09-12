// controllers/userController.js

// Obtener todos los usuarios
exports.getUsers = async (req, res) => {
    try {
        const [rows] = await req.db.query('SELECT * FROM Users');
        res.json(rows);
    } catch (error) {
        console.error('Error al obtener los usuarios:', error);
        res.status(500).send('Error al obtener los usuarios.');
    }
};

// Agregar un nuevo usuario
exports.addUser = async (req, res) => {
    const { name, email, password, role } = req.body;

    if (!name || !email || !password || !role) {
        return res.status(400).send('Todos los campos son obligatorios.');
    }

    try {
        const [result] = await req.db.query('INSERT INTO Users (name, email, password, role) VALUES (?, ?, ?, ?)', [name, email, password, role]);
        if (result.affectedRows > 0) {
            res.status(201).send('Usuario creado exitosamente.');
        } else {
            res.status(500).send('Error al crear el usuario.');
        }
    } catch (error) {
        console.error('Error al crear el usuario:', error);
        res.status(500).send('Error al crear el usuario.');
    }
};

// Actualizar un usuario existente
exports.updateUser = async (req, res) => {
    const { name, role } = req.body;
    const { email } = req.params;

    if (!name || !role) {
        return res.status(400).send('Todos los campos son obligatorios.');
    }

    try {
        const [result] = await req.db.query('UPDATE Users SET name = ?, role = ? WHERE email = ?', [name, role, email]);
        if (result.affectedRows > 0) {
            res.send('Usuario actualizado exitosamente.');
        } else {
            res.status(404).send('Usuario no encontrado.');
        }
    } catch (error) {
        console.error('Error al actualizar el usuario:', error);
        res.status(500).send('Error al actualizar el usuario.');
    }
};

// Eliminar un usuario
exports.deleteUser = async (req, res) => {
    const { email } = req.params;

    try {
        const [result] = await req.db.query('DELETE FROM Users WHERE email = ?', [email]);
        if (result.affectedRows > 0) {
            res.send('Usuario eliminado exitosamente.');
        } else {
            res.status(404).send('Usuario no encontrado.');
        }
    } catch (error) {
        console.error('Error al eliminar el usuario:', error);
        res.status(500).send('Error al eliminar el usuario.');
    }
};
