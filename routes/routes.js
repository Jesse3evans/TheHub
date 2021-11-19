const { MongoClient, ObjectId }= require('mongodb')
const bcrypt = require('bcryptjs');

const url = 'mongodb+srv://ADMIN:Neumont@thehubusers.2xiyk.mongodb.net/Userbase?retryWrites=true&w=majority';

const client = new MongoClient(url);

const dbName = 'Userbase';
const db = client.db(dbName);
const collection = db.collection('Users');

exports.login = (req, res) => {
    res.render('login')
}

exports.loginAuth = async (req, res) => {
    await client.connect();
    let salt = bcrypt.genSaltSync(10);
    const filteredDocs = await collection.findOne({name: req.body.username}).toArray();
    let hash = filteredDocs.password;
    if ((req.body.username && req.body.password) == (filteredDocs.name && bcrypt.compareSync(req.body.password, hash))){
        req.session.user = {
            isAuthenticated: true,
            username: req.body.username
        }
        res.redirect('/feed')
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

exports.create = (req, res) => {
    res.render('create')
}

exports.createUser = async (req, res) => {
    await client.connect();
    let salt = bcrypt.genSaltSync(10);
    let hash = bcrypt.hashSync(req.body.password, salt);
    let person = {
        name: req.body.username,
        password: hash,
        display: req.body.displayName,
        image: req.body.profilePic
    }
    const insertResult = await collection.insertOne(person);
    client.close();
    res.redirect('/');
};

exports.userProfile = (req, res) => {
    res.render('userProfile')
}

exports.feed = (req, res) => {

}