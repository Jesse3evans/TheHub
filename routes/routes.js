const { MongoClient, ObjectId } = require('mongodb')
const bcrypt = require('bcryptjs');

const url = 'mongodb+srv://ADMIN:Neumont@thehubusers.2xiyk.mongodb.net/Userbase?retryWrites=true&w=majority';

const client = new MongoClient(url);

const dbName = 'Userbase';
const db = client.db(dbName);
const users = db.collection('Users');
const posts = db.collection('Posts');


exports.login = (req, res) => {
    res.render('login')
}

exports.loginAuth = async (req, res) => {
    await client.connect();

    const filteredDocs = await users.findOne({username: req.body.username}).toArray();

    let hash = filteredDocs.password;
    if ((req.body.username && req.body.password) == (filteredDocs.username && bcrypt.compareSync(req.body.password, hash))) {
        req.session.user = {
            isAuthenticated: true,
            username: req.body.username
        }
        res.redirect('/feed/'+req.body.username)
    } else {
        res.redirect('/login');
    }
}

exports.logout = (req, res) => {
    req.session.destroy(err => {
        if (err) {
            console.log(err)
        } else {
            res.redirect('/login');
        }
    })
}
exports.feed = async (req, res) => {
    await client.connect();
    const postsResults = await posts.find({}).limit(6).toArray();
    const usersResults = await posts.find({}).toArray();
    console.log(req.body.username)
    let rawuser ={
        username:req.params.username
    }
    console.log(rawuser.username);
    const filteredDocs = await users.findOne({username: rawuser.username});
    client.close();
    res.render('feed', {
        postArray: postsResults,
        userArray: usersResults,
        user: filteredDocs
    });
}



// USER ROUTES
//

exports.create = (req, res) => {
    res.render('create')
}

exports.createUser = async (req, res) => {
    await client.connect();
    let salt = bcrypt.genSaltSync(10);
    let hash = bcrypt.hashSync(req.body.password, salt);
    let person = {
        username: req.body.username,
        password: hash,
        displayName: req.body.displayName,
        image: req.body.profilePic
    }
    const insertResult = await users.insertOne(person);
    client.close();
    res.redirect('/login');
};

exports.userProfile = async (req, res) => {
    await client.connect();
    const filteredDocs = await users.findOne({_id: ObjectId(req.params.id)});
    client.close();
    res.render('userProfile', {
        user: filteredDocs
    });
};






// POST ROUTES
//


exports.viewPost = async (req, res) => {
    await client.connect();
    const filteredDocs = await posts.findOne({_id: ObjectId(req.params.id)});
    client.close();
    res.render('post', {
        post: filteredDocs
    });
};

exports.newPost = (req, res) => {
    res.render('newPost')
}

exports.createPost = async (req, res) => {
    await client.connect();
    let post = {
        user: req.body.username,
        title: req.body.title,
        body: req.body.body,
        date: req.body.date
    }
    const insertResult = await posts.insertOne(post);
    client.close();
    // CHANGE THIS REDIRECT TO SOMEWHERE ELSE
    res.redirect('/feed');
};
