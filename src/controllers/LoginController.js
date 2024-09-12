const bcrypt = require('bcrypt');

// Function to display the login page
function login(req, res) {
    if (req.session.loggedin) {
        // Redirect based on user role
        switch (req.session.user.role) {
            case 'Administrador':
                return res.redirect('/admin-dashboard');
            case 'Agricultores/Productores':
                return res.redirect('/agricultor-dashboard');
            case 'Comerciantes de Productos Agrícolas':
                return res.redirect('/comerciante-dashboard');
            default:
                return res.redirect('/user-dashboard');
        }
    } else {
        res.render('login/login'); // Render login page
    }
}

// Handle user authentication using async/await
async function auth(req, res) {
    const data = req.body;

    try {
        // Check if the user exists
        const [results] = await req.db.query('SELECT * FROM Users WHERE email = ?', [data.email]);

        if (results.length > 0) {
            const user = results[0];

            // Compare the entered password with the stored one using bcrypt
            const isMatch = await bcrypt.compare(data.password, user.password);

            if (isMatch) {
                const [roles] = await req.db.query(
                    'SELECT r.name FROM Roles r INNER JOIN UserRoles ur ON r.id = ur.role_id WHERE ur.user_email = ?',
                    [user.email]
                );

                if (roles.length > 0) {
                    const userRole = roles[0].name.trim();

                    req.session.regenerate(async (err) => {
                        if (err) {
                            console.error('Error regenerating session:', err);
                            return res.render('login/login', { error: 'Error al iniciar la sesión. Inténtalo de nuevo.' });
                        }

                        req.session.loggedin = true;
                        req.session.user = {
                            email: user.email,
                            name: user.name,
                            role: userRole,
                            first_name: user.first_name,
                            last_name: user.last_name,
                            document_type: user.document_type,
                            document_number: user.document_number,
                            phone: user.phone,
                            address: user.address
                        };

                        req.session.save((err) => {
                            if (err) {
                                console.error('Error saving session:', err);
                                return res.render('login/login', { error: 'Error al guardar la sesión. Inténtalo de nuevo.' });
                            }

                            switch (userRole) {
                                case 'Administrador':
                                    return res.redirect('/admin-dashboard');
                                case 'Agricultores/Productores':
                                    return res.redirect('/agricultor-dashboard');
                                case 'Comerciantes de Productos Agrícolas':
                                    return res.redirect('/comerciante-dashboard');
                                default:
                                    return res.redirect('/user-dashboard');
                            }
                        });
                    });
                } else {
                    return res.render('login/login', { error: 'El usuario no tiene ningún rol asignado.' });
                }
            } else {
                return res.render('login/login', { error: 'Contraseña incorrecta.' });
            }
        } else {
            return res.render('login/login', { error: 'No existe un usuario con ese correo electrónico.' });
        }
    } catch (err) {
        console.error('Error querying the database:', err);
        return res.render('login/login', { error: 'Error al consultar la base de datos.' });
    }
}

// Function to display the registration page
function register(req, res) {
    res.render('login/register'); // Render register page
}

// Handle new user registration using async/await
async function storeUser(req, res) {
    const { email, name, password, role } = req.body;
    const userRole = role || 'Usuarios';

    try {
        const [userdata] = await req.db.query('SELECT * FROM Users WHERE email = ?', [email]);

        if (userdata.length > 0) {
            return res.render('login/register', { error: 'El usuario ya está registrado con este correo electrónico.' });
        } else {
            const hash = await bcrypt.hash(password, 12);
            const userData = { email, name, password: hash };

            await req.db.beginTransaction();
            await req.db.query('INSERT INTO Users SET ?', [userData]);
            await req.db.query(
                'INSERT INTO UserRoles (user_email, role_id) VALUES (?, (SELECT id FROM Roles WHERE name = ?))',
                [email, userRole]
            );
            await req.db.commit();

            return res.redirect('/login');
        }
    } catch (err) {
        console.error('Error during registration process:', err);
        await req.db.rollback();
        return res.render('login/register', { error: 'Hubo un error al registrar al usuario.' });
    }
}


// Function to display admin page
function admin(req, res) {
    res.render('login/admin', { user: req.session.user });
}

// Function to display index page
function index(req, res) {
    res.render('login/index');
}

// Function to display reset password page
function resetPassword(req, res) {
    res.render('login/reset-password');
}

// Handle user logout
function logout(req, res) {
    if (req.session.loggedin) {
        req.session.destroy(err => {
            if (err) {
                console.error('Error destroying session:', err);
                return res.status(500).send('Error logging out.');
            }
            res.clearCookie('session_cookie_name'); // Ensure session cookie is cleared
            res.redirect('/login');
        });
    } else {
        res.redirect('/login');
    }
}

// Function to display admin dashboard
function adminDashboard(req, res) {
    res.render('dashboard/admin-dashboard', { 
        user: req.session.user, 
        role: req.session.user.role 
    });
}

// Function to display farmer/producer dashboard
function agricultorDashboard(req, res) {
    res.render('dashboard/agricultor-dashboard', { 
        user: req.session.user, 
        role: req.session.user.role 
    });
}

// Function to display agricultural product traders dashboard
function comercianteDashboard(req, res) {
    res.render('dashboard/comerciante-dashboard', { 
        user: req.session.user, 
        role: req.session.user.role 
    });
}

// Function to display default dashboard (for users without a specific role)
function userDashboard(req, res) {
    res.render('dashboard/user-dashboard', { 
        user: req.session.user, 
        role: req.session.user.role 
    });
}

// Function to display the edit profile page
function editProfile(req, res) {
    res.render('dashboard/functions/edit_profile', { 
        user: req.session.user 
    });
}

// Handle profile update using async/await
async function updateProfile(req, res) {
    const { first_name, last_name, document_type, document_number, phone, address } = req.body;
    const email = req.session.user.email;

    try {
        const [result] = await req.db.query(
            'UPDATE Users SET first_name = ?, last_name = ?, document_type = ?, document_number = ?, phone = ?, address = ? WHERE email = ?',
            [first_name, last_name, document_type, document_number, phone, address, email]
        );

        req.session.user = { ...req.session.user, first_name, last_name, document_type, document_number, phone, address };
        return res.render('dashboard/functions/edit_profile', { success: 'Perfil actualizado con éxito.', user: req.session.user });
    } catch (err) {
        console.error('Error updating profile data:', err);
        return res.render('dashboard/functions/edit_profile', { error: 'Error al actualizar el perfil.', user: req.session.user });
    }
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
    comercianteDashboard,
    userDashboard,
    editProfile,
    updateProfile
};
