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

//app.get('/', routes.index);
// have this redirect to some shit (like the feed)

app.get('/login', routes.login);
app.post('/login', urlencodedParser, routes.loginAuth)
app.get('/logout', routes.logout);
app.get('/feed', checkAuth, routes.feed);
// app.get('/feed/:username', checkAuth, routes.feed);
app.get('/createUser', routes.create);
app.post('/createUser', urlencodedParser, routes.createUser);
app.get('/user/:id', checkAuth, routes.userProfile);
//app.get('/user/', checkAuth, routes.userProfile);
// this should be a page that defaults to current
// logged in user's page (somehow pass a default value)

app.get('/post/:id', checkAuth, routes.viewPost);
app.get('/post', checkAuth, routes.newPost);


app.listen(3000);
