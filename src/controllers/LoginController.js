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

// Handle user authentication
function auth(req, res) {
    const data = req.body;

    req.getConnection((err, conn) => {
        if (err) {
            console.error('Error connecting to the database:', err);
            return res.render('login/login', { error: 'Error connecting to the database.' });
        }

        // Query to find the user by email
        conn.query('SELECT * FROM Users WHERE email = ?', [data.email], (err, results) => {
            if (err) {
                console.error('Error querying the database:', err);
                return res.render('login/login', { error: 'Error querying the database.' });
            }

            // Check if the user exists
            if (results.length > 0) {
                const user = results[0];

                // Compare the entered password with the stored one using bcrypt
                bcrypt.compare(data.password, user.password, (err, isMatch) => {
                    if (err) {
                        console.error('Error verifying the password:', err);
                        return res.render('login/login', { error: 'Error verifying the password.' });
                    }

                    // If the password matches
                    if (isMatch) {
                        // Query to get the user role
                        conn.query('SELECT r.name FROM Roles r INNER JOIN UserRoles ur ON r.id = ur.role_id WHERE ur.user_email = ?', [user.email], (err, roles) => {
                            if (err) {
                                console.error('Error verifying the user role:', err);
                                return res.render('login/login', { error: 'Error verifying the user role.' });
                            }

                            // Check if the user has an assigned role
                            if (roles.length > 0) {
                                const userRole = roles[0].name.trim();

                                // Regenerate the session to prevent session fixation
                                req.session.regenerate((err) => {
                                    if (err) {
                                        console.error('Error regenerating session:', err);
                                        return res.status(500).json({ success: false, message: 'Error starting session.' });
                                    }

                                    // Set user details in the session
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

                                    // Save the session before redirecting
                                    req.session.save((err) => {
                                        if (err) {
                                            console.error('Error saving session:', err);
                                            return res.status(500).json({ success: false, message: 'Error starting session.' });
                                        }

                                        // Redirect based on user role
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
                                console.error('User has no assigned role.');
                                return res.render('login/login', { error: 'User has no assigned role.' });
                            }
                        });
                    } else {
                        console.error('Incorrect password.');
                        return res.render('login/login', { error: 'Incorrect password.' });
                    }
                });
            } else {
                console.error('No user exists with that email.');
                return res.render('login/login', { error: 'No user exists with that email.' });
            }
        });
    });
}

// Function to display the registration page
function register(req, res) {
    res.render('login/register'); // Render register page
}

// Handle new user registration
function storeUser(req, res) {
    req.getConnection((err, conn) => {
        if (err) {
            console.error('Error getting connection:', err);
            return res.render('login/register', { error: 'Error connecting to the database.' });
        }

        const { email, name, password, role } = req.body;

        // Set "Usuarios" as default if no role is selected
        const userRole = role || 'Usuarios';

        // Check if the user already exists
        conn.query('SELECT * FROM Users WHERE email = ?', [email], (err, userdata) => {
            if (err) {
                console.error('Error querying data:', err);
                return res.render('login/register', { error: 'Error checking user.' });
            }

            if (userdata.length > 0) {
                console.log('User already created');
                return res.render('login/register', { error: 'User already registered with this email.' });
            } else {
                // Hash the password
                bcrypt.hash(password, 12).then(hash => {
                    const userData = {
                        email,
                        name,
                        password: hash
                    };

                    // Start the transaction
                    conn.beginTransaction(err => {
                        if (err) {
                            console.error('Error starting transaction:', err);
                            return res.render('login/register', { error: 'Error starting transaction.' });
                        }

                        // Insert user into 'Users' table
                        conn.query('INSERT INTO Users SET ?', [userData], (err, rows) => {
                            if (err) {
                                console.error('Error inserting user data:', err);
                                return conn.rollback(() => {
                                    return res.render('login/register', { error: 'Error registering user.' });
                                });
                            }

                            // Insert user role into 'UserRoles' table
                            conn.query('INSERT INTO UserRoles (user_email, role_id) VALUES (?, (SELECT id FROM Roles WHERE name = ?))',
                                [email, userRole], (err, result) => {
                                    if (err) {
                                        console.error('Error inserting user role:', err);
                                        return conn.rollback(() => {
                                            return res.render('login/register', { error: 'Error assigning role to user.' });
                                        });
                                    }

                                    // Commit the transaction
                                    conn.commit(err => {
                                        if (err) {
                                            console.error('Error committing transaction:', err);
                                            return conn.rollback(() => {
                                                return res.render('login/register', { error: 'Error confirming user registration.' });
                                            });
                                        }

                                        // Redirect to login after successful registration
                                        res.redirect('/login');
                                    });
                                });
                        });
                    });
                }).catch(error => {
                    console.error('Error hashing password:', error);
                    return res.render('login/register', { error: 'Error hashing password.' });
                });
            }
        });
    });
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

// Handle profile update
function updateProfile(req, res) {
    const { first_name, last_name, document_type, document_number, phone, address } = req.body;
    const email = req.session.user.email;

    req.getConnection((err, conn) => {
        if (err) {
            console.error('Error connecting to the database:', err);
            return res.render('dashboard/functions/edit_profile', { error: 'Error connecting to the database.', user: req.session.user });
        }

        conn.query(
            'UPDATE Users SET first_name = ?, last_name = ?, document_type = ?, document_number = ?, phone = ?, address = ? WHERE email = ?',
            [first_name, last_name, document_type, document_number, phone, address, email],
            (err, result) => {
                if (err) {
                    console.error('Error updating profile data:', err);
                    return res.render('dashboard/functions/edit_profile', { error: 'Error updating profile.', user: req.session.user });
                }

                // Update the session user data
                req.session.user = { ...req.session.user, first_name, last_name, document_type, document_number, phone, address };

                return res.render('dashboard/functions/edit_profile', { success: 'Profile updated successfully.', user: req.session.user });
            }
        );
    });
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
