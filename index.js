const express = require('express');
const pug = require('pug');
const path = require('path');
const expressSession = require('express-session');
const routes = require('./routes/routes.js');

const app = express();

app.set('view engine', 'pug');
app.set('views', __dirname + "/views");
app.use(express.static(path.join(__dirname, '/public')));

app.use(expressSession({
    secret: 'wh4t3v3r',
    saveUninitialized: true,
    resave: true
}));

const urlencodedParser = express.urlencoded({
    extended: false
})

const checkAuth = (req, res, next) => {
    if (req.session.user && req.session.user.isAuthenticated){
        next();
    } else {
        res.redirect('/login');
    }
}

app.get('/login', routes.login);
app.get('/create', routes.createUser);
app.get('/logout', routes.logout);
app.get('/userProfile', checkAuth, routes.userProfile);
app.get('/feed', checkAuth, routes.feed);

app.listen(3000);