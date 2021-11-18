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

exports.create = (req, res) => {
    res.render('create')
}

exports.createUser = async (req, res) => {
    await client.connect();
    let person = {
        name: req.body.username,
        password: req.body.password,
        display: req.body.displayName,
        image: req.body.profilePic
    }
    const insertResult = await collection.insertOne(person);
    client.close();
    res.redirect('/');
};

exports.userProfile = (req, res) => {

}

exports.feed = (req, res) => {

}