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

const hashComplete = (password, the_hash) => {
    bcrypt.compare(password, the_hash, (err, res) =>{
        console.log('async: ' + res);
    })
}

exports.loginAuth = async (req, res) => {
    await client.connect();

    if(req.body.username == undefined || req.body.password == undefined){
        res.redirect('/login');
    } else {
        const filteredDocs = await users.find({username: req.body.username}).toArray();

        if (bcrypt.compareSync(req.body.password, filteredDocs[0].password)){
            req.session.user = {
                isAuthenticated: true,
                username: filteredDocs[0].username
            }
            console.log("Username: " + req.body.username)
            res.redirect('/feed/'+req.body.username)
        } else {
            res.redirect('/login')
        }
    }
    client.close();
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
    const postsResults = await (await posts.find({}).toArray()).reverse();
    const usersResults = await users.find({}).toArray();
    let rawuser ={
        username:req.params.username
    }
    console.log("Username: " + rawuser.username);
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
        message: req.body.message
    }
    const insertResult = await users.insertOne(person);
    client.close();
    res.redirect('/login');
};

exports.userProfile = async (req, res) => {
    await client.connect();
    const filteredDocs = await users.findOne({username: req.params.id});
    let rawuser =  filteredDocs ; 
    //search through array of user.friends then see what to do 
    const postsResults = await posts.find({user: req.params.id}).toArray();
    console.log(postsResults);
    console.log(rawuser);
    client.close();
    res.render('userProfile', {
        user: filteredDocs,
        postArray:  postsResults 
    });
};






// POST ROUTES
//


exports.viewPost = async (req, res) => {
    await client.connect();
    var id = Math.floor(req.params.id);
    console.log(id)
    const filteredDocs = await posts.findOne({postId: id});
    const mainUser = await users.findOne({username: req.params.username});
    console.log(filteredDocs)
    client.close();
    res.render('post', {
        post: filteredDocs,
        user:mainUser
    });
};

exports.newPost = (req, res) => {
    res.render('newPost')
}

exports.createPost = async (req, res) => {
    await client.connect();
    let ts = Date.now();

    let date_ob = new Date(ts);
    let date = date_ob.getDate();
    let month = date_ob.getMonth() + 1;
    let year = date_ob.getFullYear();
   // current hours
    let hours = date_ob.getHours()-12;

    // current minutes
    let minutes = date_ob.getMinutes();
    if(minutes<10){
        minutes = "0"+minutes
    }
    // prints date & time in YYYY-MM-DD format
    var rawDate = ( month +"-" + date+ "-"+ year);
    let post = {
        user: req.body.username,
        title: req.body.title,
        message: req.body.message,
        date:rawDate,
        time: (hours+":"+minutes),
        postId: await (await posts.countDocuments()).valueOf()
    }
    const insertResult = await posts.insertOne(post);
    client.close();
    // CHANGE THIS REDIRECT TO SOMEWHERE ELSE
    res.redirect('/feed/'+post.user);
};


exports.deletePost = async (req, res) => {
    await client.connect();
    const deleteResult = await posts.deleteOne(req.params.id, req.params.username)
    client.close();
    res.redirect('/feed');
};

exports.deleteUser = async (req, res) => {
    await client.connect();
    const deleteResult = await users.deleteOne(req.body.username)
    client.close();
    res.redirect('/login');
};