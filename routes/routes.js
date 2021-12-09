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
        const filteredDocs = await users.find({username: req.body.username}).toArray()
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
    const postsResults = await (await posts.find({user: req.params.id}).toArray()).reverse();
    console.log(postsResults);
    console.log(rawuser);
    client.close();
    res.render('userProfile', {
        user: filteredDocs,
        postArray: postsResults 
    });
};
exports.otherProfile = async (req, res) => {
    await client.connect();
    const filteredDocs = await users.findOne({username: req.params.mainUser});
    const other = await users.findOne({username: req.params.otherUser});
    //search through array of user.friends then see what to do 
    const postsResults = await posts.find({user: req.params.otherUser}).toArray();
    console.log(postsResults);
    client.close();
    res.render('friendProfile', {
        user: filteredDocs,
        otherUser: other,
        postArray: postsResults 
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
    let hours = date_ob.getHours();

    // current minutes
    let minutes = date_ob.getMinutes();
    if(minutes<10){
        minutes = "0"+minutes
    }
    if(hours>=13){
        hours=hours-12
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
exports.editUserView = async (req, res) => {
    await client.connect();
    const user = await users.findOne({username: req.params.user});
    res.render('settings',{
        user:user
    })
}
exports.updateUser = async (req, res) => {
    await client.connect();
    // re-salting/hashing new password

    if (req.body.password == ''){
        const findResult = await users.find({ username: req.params.user }).toArray();
        const updateResult = await users.updateOne(
            //user id
            {username:req.params.user},
            //user info 
            { $set: {
                password: findResult[0].password,
                displayName: req.body.displayName,
                message: req.body.message
            }}
        )
    } else {
        let salt = bcrypt.genSaltSync(10);
        let hash = bcrypt.hashSync(req.body.password, salt);
        const updateResult = await users.updateOne(
            //user id
            {username:req.params.user},
            //user info 
            { $set: {
                password: hash,
                displayName: req.body.displayName,
                message: req.body.message
            }}
        )
    }
    client.close();
    res.redirect('/user/'+req.params.user);
};
exports.editPostView = async (req, res) => {
    await client.connect();
    var x = Math.floor(req.params.postId);
    const user = await users.findOne({username: req.params.user});
    const result = await posts.findOne({postId:x})
    res.render('editPost',{
        post:result,
        user:user
    })
}
exports.editPost = async (req, res) => {
    await client.connect();
    var x = Math.floor(req.body.postId);
    const updateResult = await posts.updateOne(
        //post id instead
        {postId:x},
        //title and message 
        { $set: {
            title: req.body.title,
            message: req.body.message
        }
    }
    )
    client.close();
    res.redirect('/post/'+x+'/'+req.params.user);
}
exports.deletePost = async (req, res) => {
    await client.connect();
    var x = Math.floor(req.params.postId);
    const deleteResult = await posts.deleteOne({postId:x})
    const filteredDocs = await posts.findOne({postId: i});
    const postsResults = await (await posts.find({}).toArray());
    var size = await (await posts.countDocuments()).valueOf();
    var i =0;
    for(i=0;i<postsResults.length;i++){
        if(postsResults[i].postId!=i){
            const updateResult = await posts.updateOne(
                //post id instead
                {postId:postsResults[i].postId},
                //title and message 
                { $set: {
                    postId:i
                }
            })
        }
        

    } 
    client.close();
    res.redirect('/feed/'+req.params.user);
};
exports.searchUser = async (req, res) => {
    await client.connect();
    const searchResult = await users.find({username:new RegExp('.*' + req.body.entry + '.*')}).toArray();
    console.log(req.body.entry)
    const filteredDocs = await users.findOne({username: req.params.user})
    client.close();

    if(searchResult!=null){
        res.render('explore',{
            userArray: searchResult,
            user: filteredDocs
        });
    }
    else {
        res.render('explore',{
            userArray:[{}],
            user:filteredDocs
        });
    }
};
exports.deleteUser = async (req, res) => {
    await client.connect();
    const deleteResult = await users.deleteOne(req.body.username)
    const deletePosts = await posts.deleteMany(req.body.username)
    client.close();
    res.redirect('/login');
};
//explore
exports.exploreUsers = async(req,res) =>{
    await client.connect();
    var usersResults =  await users.find({}).toArray()
    usersResults = usersResults.sort(() => Math.random() - 0.5)
    const filteredDocs = await users.findOne({username: req.params.mainUser})
    res.render('explore', {
        userArray: usersResults,
        user: filteredDocs
    });
}

exports.joke = (req, res) => {
    /*
    var result =     // get json
    var joke =       // get jokeString from result
    var punchline =  // get jokeAnswer from result
    */
    res.render('joke', {
        joke: joke,
        punchline: punchline
    });
}