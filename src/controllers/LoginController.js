const bcrypt = require('bcrypt');

function login(req, res) {
    if (req.session.loggedin) {
        res.redirect('/'); // Redirige al inicio si ya está logueado
    } else {
        res.render('login/index'); // Muestra la página de login si no está logueado
    }
}

function auth(req, res) {
    const data = req.body;
    req.getConnection((err, conn) => {
        if (err) {
            return res.render('login/index', { error: 'Error de conexión a la base de datos.' });
        }

        conn.query('SELECT * FROM users WHERE email = ?', [data.email], (err, results) => {
            if (err) {
                return res.render('login/index', { error: 'Error al consultar la base de datos.' });
            }

            if (results.length > 0) {
                const user = results[0];
                bcrypt.compare(data.password, user.password, (err, isMatch) => {
                    if (err) {
                        return res.render('login/index', { error: 'Error al verificar la contraseña.' });
                    }

                    if (isMatch) {
                        req.session.loggedin = true;
                        req.session.user = user;
                        req.session.name = user.name;
                        res.redirect('/');
                    } else {
                        res.render('login/index', { error: 'Contraseña incorrecta.' });
                    }
                });
            } else {
                res.render('login/index', { error: 'No existe un usuario con ese email.' });
            }
        });
    });
}

function register(req, res) {
    res.render('login/register');
}

function storeUser(req, res) {
  req.getConnection((err, conn) => {
      if (err) {
          console.error('Error al obtener la conexión:', err);
          return res.status(500).send('Error en la conexión a la base de datos');
      }

      conn.query('SELECT * FROM users WHERE email = ?', [req.body.email], (err, userdata) => {
          if (err) {
              console.error('Error al consultar los datos:', err);
              return res.status(500).send('Error al verificar el usuario');
          }

          if (userdata.length > 0) {
              console.log('Usuario ya creado');
              return res.status(400).send('Usuario ya registrado con este correo electrónico');
          } else {
              bcrypt.hash(req.body.password, 12).then(hash => {
                  req.body.password = hash;
                  req.getConnection((err, conn) => {
                      if (err) {
                          console.error('Error al obtener la conexión para insertar:', err);
                          return res.status(500).send('Error en la conexión a la base de datos para insertar');
                      }

                      conn.query('INSERT INTO users SET ?', [req.body], (err, rows) => {
                          if (err) {
                              console.error('Error al insertar los datos:', err);
                              return res.status(500).send('Error al registrar el usuario');
                          }
                          res.redirect('/');
                      });
                  });
              }).catch(error => {
                  console.error('Error al cifrar la contraseña:', error);
                  return res.status(500).send('Error al cifrar la contraseña');
              });
          }
      });
  });
}

function logout(req, res) {
    if (req.session.loggedin === true) {
        req.session.destroy(() => {
            res.redirect('/login'); // Redirige a la página de login tras destruir la sesión
        });
    } else {
        res.redirect('/login'); // Redirige directamente si no estaba logueado
    }
}

module.exports = {
    login,
    auth,
    register,
    storeUser,
    logout
};
