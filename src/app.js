const express = require('express');
const { engine } = require('express-handlebars');
const myconnection = require('express-myconnection');
const mysql = require('mysql');
const session = require('express-session');
const bodyParser = require('body-parser')
const login = require('./routes/login');
const { redirect } = require('express/lib/response');


const app = express();
app.set('port', 5000);

app.set('views', __dirname + '/views');
app.engine('.hbs', engine({
	extname: '.hbs',
}));
app.set('view engine', 'hbs');

app.use(bodyParser.urlencoded({
  extended: true
}));
app.use(bodyParser.json());

app.use(myconnection(mysql, {
 host: '127.0.0.1',
 user: 'root',
 password: '1234',
 port: 3306,
 database: 'nodelogin'
}, 'single'));

app.use(session({
	secret: 'secret',
	resave: true,
	saveUninitialized: true
}));

app.listen(app.get('port'), () => {
 console.log('listening on port ', app.get('port'));
});

app.use('/', login);

app.get('/', (req, res) => {
    if (req.session.loggedin) {
        res.render('home', { name: req.session.name });
    } else {
        res.redirect('/index');
    }
});


