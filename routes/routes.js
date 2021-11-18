const { MongoClient, ObjectId }= require('mongodb')

const url = 'mongodb+srv://ADMIN:Neumont@thehubusers.2xiyk.mongodb.net/Userbase?retryWrites=true&w=majority';

const client = new MongoClient(url);

const dbName = 'Userbase';
const db = client.db(dbName);
const collection = db.collection('Users');

exports.login = (req, res) => {
    res.render('login')
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

exports.createUser = (req, res) => {
    res.render('createUser')
}

exports.userProfile = (req, res) => {

}

exports.feed = (req, res) => {

}