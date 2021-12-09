const express = require('express');
const pug = require('pug');
const path = require('path');
const expressSession = require('express-session');
const routes = require('./routes/routes.js');
const port = process.env.PORT || 3000;


const app = express();

app.set('view engine', 'pug');
app.set('views', __dirname + "/views");
app.use(express.static(path.join(__dirname, '/public')));

app.use(expressSession({
    secret: 'wh4t3v3r',
    saveUninitialized: true,
    resave: true
}));

app.use((req, res, next) => {
    res.header('Access-Control-Allow-Origin', '*');
    res.header('Acess-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept')
    next();
});

const urlencodedParser = express.urlencoded({
    extended: false
})

const checkAuth = (req, res, next) => {
    if (req.session.user && req.session.user.isAuthenticated) {
        next();
    } else {
        res.redirect('/login');
    }
}

app.get('/', checkAuth, routes.feed);
app.get('/login', routes.login);
app.post('/login', urlencodedParser, routes.loginAuth)
app.get('/logout', routes.logout);

app.get('/feed/:username', checkAuth, urlencodedParser, routes.feed);

app.get('/createUser', routes.create);
app.post('/createUser', urlencodedParser, routes.createUser);
app.get('/user/:id', checkAuth, routes.userProfile);
app.get('/user/:mainUser/:otherUser', checkAuth, routes.otherProfile);
app.post('/post', checkAuth, urlencodedParser, routes.createPost);
app.get('/post/:id/:username', checkAuth, routes.viewPost);
app.get('/post', checkAuth, routes.newPost);
app.get('/deletePost/:postId/:user', checkAuth, routes.deletePost);
app.get('/editPostView/:postId/:user', checkAuth, routes.editPostView);
app.get('/explore/:mainUser', checkAuth, routes.exploreUsers);
app.post('/editPost/:user', checkAuth, urlencodedParser, routes.editPost);
app.post('/deletePost/:id/:username', checkAuth, routes.deletePost)
app.post('/deleteUser/:username', routes.deleteUser)
app.get('/editUserView/:user', checkAuth, routes.editUserView);
app.post('/editUser/:user', checkAuth, urlencodedParser, routes.updateUser);
app.post('/searchUsers/:user', checkAuth, urlencodedParser, routes.searchUser);
app.get('/joke/:user',checkAuth,routes.joke);
app.listen(port);
