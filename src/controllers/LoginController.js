const bcrypt = require('bcrypt');


// Muestra la página de login
function login(req, res) {
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
        res.render('login/login'); // Verifica que 'login.html' existe en 'views/login/'
    }
}

// Maneja la autenticación de usuarios
function auth(req, res) {
    const data = req.body;

    req.getConnection((err, conn) => {
        if (err) {
            return res.render('login/login', { error: 'Error de conexión a la base de datos.' });
        }

        conn.query('SELECT * FROM Users WHERE email = ?', [data.email], (err, results) => {
            if (err) {
                return res.render('login/login', { error: 'Error al consultar la base de datos.' });
            }

            if (results.length > 0) {
                const user = results[0];

                bcrypt.compare(data.password, user.password, (err, isMatch) => {
                    if (err) {
                        return res.render('login/login', { error: 'Error al verificar la contraseña.' });
                    }

                    if (isMatch) {
                        // Obtener el rol del usuario
                        conn.query('SELECT r.name FROM Roles r INNER JOIN UserRoles ur ON r.id = ur.role_id WHERE ur.user_email = ?', [user.email], (err, roles) => {
                            if (err) {
                                return res.render('login/login', { error: 'Error al verificar el rol del usuario.' });
                            }

                            if (roles.length > 0) {
                                const userRole = roles[0].name;

                                // Configurar la sesión del usuario
                                req.session.loggedin = true;
                                req.session.user = user;
                                req.session.name = user.name;
                                req.session.role = userRole;

                                // Redirigir según el rol del usuario
                                switch (userRole) {
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
                                return res.render('login/login', { error: 'El usuario no tiene un rol asignado.' });
                            }
                        });
                    } else {
                        return res.render('login/login', { error: 'Contraseña incorrecta.' });
                    }
                });
            } else {
                return res.render('login/login', { error: 'No existe un usuario con ese email.' });
            }
        });
    });
}

// Muestra la página de registro
function register(req, res) {
    res.render('login/register'); // Verifica que 'register.html' existe en 'views/login/'
}

// Maneja el registro de nuevos usuarios
function storeUser(req, res) {
    req.getConnection((err, conn) => {
        if (err) {
            console.error('Error al obtener la conexión:', err);
            return res.render('login/register', { error: 'Error en la conexión a la base de datos.' });
        }

        const { email, name, password, role } = req.body;

        // Verificar si el usuario ya existe
        conn.query('SELECT * FROM Users WHERE email = ?', [email], (err, userdata) => {
            if (err) {
                console.error('Error al consultar los datos:', err);
                return res.render('login/register', { error: 'Error al verificar el usuario.' });
            }

            if (userdata.length > 0) {
                console.log('Usuario ya creado');
                return res.render('login/register', { error: 'Usuario ya registrado con este correo electrónico.' });
            } else {
                // Hash de la contraseña
                bcrypt.hash(password, 12).then(hash => {
                    const userData = {
                        email,
                        name,
                        password: hash
                    };

                    // Iniciar la transacción
                    conn.beginTransaction(err => {
                        if (err) {
                            console.error('Error al iniciar la transacción:', err);
                            return res.render('login/register', { error: 'Error al iniciar la transacción.' });
                        }

                        // Insertar usuario en la tabla 'Users'
                        conn.query('INSERT INTO Users SET ?', [userData], (err, rows) => {
                            if (err) {
                                console.error('Error al insertar los datos del usuario:', err);
                                return conn.rollback(() => {
                                    return res.render('login/register', { error: 'Error al registrar el usuario.' });
                                });
                            }

                            // Insertar el rol del usuario en la tabla 'UserRoles'
                            conn.query('INSERT INTO UserRoles (user_email, role_id) VALUES (?, (SELECT id FROM Roles WHERE name = ?))',
                                [email, role], (err, result) => {
                                    if (err) {
                                        console.error('Error al insertar el rol del usuario:', err);
                                        return conn.rollback(() => {
                                            return res.render('login/register', { error: 'Error al asignar el rol al usuario.' });
                                        });
                                    }

                                    // Confirmar la transacción
                                    conn.commit(err => {
                                        if (err) {
                                            console.error('Error al confirmar la transacción:', err);
                                            return conn.rollback(() => {
                                                return res.render('login/register', { error: 'Error al confirmar el registro del usuario.' });
                                            });
                                        }

                                        // Redirigir al login después del registro exitoso
                                        res.redirect('/login');
                                    });
                                });
                        });
                    });
                }).catch(error => {
                    console.error('Error al cifrar la contraseña:', error);
                    return res.render('login/register', { error: 'Error al cifrar la contraseña.' });
                });
            }
        });
    });
}

// Muestra la página de administración
function admin(req, res) {
    res.render('login/admin', { name: req.session.name, role: req.session.role });
}

// Muestra la página de inicio
function index(req, res) {
    res.render('login/index'); // Verifica que 'index.html' existe en 'views/login/'
}

// Muestra la página de restablecimiento de contraseña
function resetPassword(req, res) {
    res.render('login/reset-password'); // Verifica que 'reset-password.html' existe en 'views/login/'
}

// Maneja el cierre de sesión del usuario
function logout(req, res) {
    if (req.session.loggedin) {
        req.session.destroy(() => {
            res.redirect('/login');
        });
    } else {
        res.redirect('/login');
    }
}
// Muestra el dashboard de administrador
function adminDashboard(req, res) {
    res.render('dashboard/admin-dashboard', { name: req.session.name });
}

// Muestra el dashboard de agricultores/productores
function agricultorDashboard(req, res) {
    res.render('dashboard/agricultor-dashboard', { name: req.session.name });
}

// Muestra el dashboard de analistas de datos agrícolas
function analistaDashboard(req, res) {
    res.render('dashboard/analista-dashboard', { name: req.session.name });
}

// Muestra el dashboard de gestores de operaciones agrícolas
function gestorDashboard(req, res) {
    res.render('dashboard/gestor-dashboard', { name: req.session.name });
}

// Muestra el dashboard de comerciantes de productos agrícolas
function comercianteDashboard(req, res) {
    res.render('dashboard/comerciante-dashboard', { name: req.session.name });
}

// Muestra el dashboard de consultores agrícolas
function consultorDashboard(req, res) {
    res.render('dashboard/consultor-dashboard', { name: req.session.name });
}

// Muestra el dashboard por defecto (para usuarios sin un rol específico)
function userDashboard(req, res) {
    res.render('dashboard/user-dashboard', { name: req.session.name });
}

module.exports = {
    login,
    auth,
    register,
    storeUser,
    logout,
    index,
    resetPassword,
    admin,
    adminDashboard,
    agricultorDashboard,
    analistaDashboard,
    gestorDashboard,
    comercianteDashboard,
    consultorDashboard,
    userDashboard
};
