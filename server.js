const app = require('express')();
const http = require('http').createServer(app);
const io = require('socket.io')(http);
const url = 'mongodb://localhost:27017';
const MongoClient = require('mongodb').MongoClient(url,{ useUnifiedTopology: true });
const bcrypt = require('bcryptjs');
const bodyParser = require('body-parser');
const cors = require('cors');
const multerConfig = require("./multer.js");
const jwt = require('jsonwebtoken');
const { exec } = require("child_process");
const fs = require('fs');
const env = require('./src/assets/env');
app.use(bodyParser.json());
let db;

app.use(cors());
// Use connect method to connect to the server
MongoClient.connect(async (err, client) => {
    console.log("Connected successfully to server");
    const _db = client.db('wenzel_penzberg');
    const users = _db.collection('users');
    const images = _db.collection('images');
    const posts = _db.collection('posts');
    db = {users, images, posts};


    //create admin account if not exists
    const allUsers = await users.find().toArray();
    if(allUsers.length === 0){
        const account = {
            username: "admin",
            password: env.default_admin_pwd,
            admin: true,
            permissions: {
                post: true
            }
        };
        const {password} = account;
        const pwd = bcrypt.hashSync(password, bcrypt.genSaltSync(10));
        const newToken = bcrypt.hashSync(pwd, bcrypt.genSaltSync(10))
        delete account.password;
        await db.users.insertOne({...account, pwd, token: newToken});
    }
});

app.use(require('express').static(__dirname + '/dist'));
app.post('/login', async (req, res) => {
    const { username, pwd } = req.body;
    const user = await db.users.findOne({username});
    const valid =  user ? bcrypt.compareSync(pwd, user.pwd) : false;
    if(valid){
        delete user._id;
        delete user.pwd;
        res.send({valid, user});
    }else{
        res.send({valid});
    }
});
app.post('/check_token', async (req, res) => {
    const { token } = req.body;
    const user = await db.users.findOne({token});
    if(user){
        delete user._id;
        delete user.pwd;
        res.send(user);
    }else{
        res.send(false);
    }
});
app.post('/createAccount', async (req, res) => {
    const {token, account} = req.body;
    const user = await db.users.findOne({token});

    if(!user || !user.admin){
        res.send({success: false});
        return;
    }
    const already_exists = !!(await db.users.findOne({username: account.username}));
    if(already_exists){
        res.send({success:false, already_exists});
        return;
    }
    const {password} = account;
    const pwd = bcrypt.hashSync(password, bcrypt.genSaltSync(10));
    const newToken = bcrypt.hashSync(pwd, bcrypt.genSaltSync(10))
    delete account.password;
    await db.users.insertOne({...account, pwd, token: newToken});
    res.send({success: true})
});
app.post('/deleteAccount', async (req, res) => {
    const {token, accountToDelete} = req.body;
    const user = await db.users.findOne({token});

    if(!user || !user.admin){
        res.send({success: false});
        return;
    }
    const account = await db.users.findOne({username: accountToDelete.username});
    if(!account){
        res.send({success:false});
        return;
    }
    await db.users.deleteOne(account);
    res.send({success: true})
});
app.post('/getAllUsers', async (req, res) => {
    const {token} = req.body;
    const user = await db.users.findOne({token});
    if(!user.admin){
        res.sendStatus(401);
    }else{
        const users = await db.users.find({}).toArray();
        for(const user of users){
            delete user.pwd;
            delete user.token;
        }
        res.send({users});
    }
});

app.post('/upload', multerConfig.saveToUploads, async (req, res) => {
    if(!req.file) {
        res.status(500);
    }
    const { token } = req.body;
    const { file } = req;
    const user = await db.users.findOne({token});
    if(!user || !file.mimetype.includes('image')){
        //TODO
        return;
    }
    exec("mogrify -auto-orient uploads/" + file.filename, async (error) => {
        if (error) {
            console.log(`error: ${error.message}`);
            return;
        }
        exec("convert uploads/" + file.filename + ' -resize 512@ uploads/prev_' + file.filename + '', async (error) => {
            if (error) {
                console.log(`error: ${error.message}`);
                return;
            }

            const img_token = jwt.sign(file.filename, token);
            await db.images.insertOne({parent: token, token: img_token , ...file});
            await db.images.insertOne({parent: token, token: img_token , ...file, filename: 'prev_' + file.filename, path: file.path.replace(file.filename, 'prev_' + file.filename)});
            res.send({valid: true, url: env.backend_url + "/image/" + file.filename + "?token=" + img_token, filename: file.filename});
        });
    });
});
app.get('/image/:filename', async (req, res) => {
    const { token } = req.query;
    const { filename } = req.params;
    const image = await db.images.findOne({filename});
    if(!image || image.token !== token){
        res.send(404);
        return;
    }
    res.sendFile(__dirname + '/' + image.path);
});
app.get('/posts', async (req, res) => {
    const {token} = req.query;
    let posts = await db.posts.find({publicity: 'public'}).toArray();
    const user = await db.users.findOne({token});

    if(user && user.publicity === 'family')
        Array.prototype.push.apply(posts, await (await db.posts.find({publicity: 'family'})).toArray());
    if(user && (user.publicity === 'family' || user.publicity === 'close'))
        Array.prototype.push.apply(posts, await (await db.posts.find({publicity: 'close'})).toArray());
    if(user && (user.publicity === 'family' || user.publicity === 'close'|| user.publicity === 'extended'))
        Array.prototype.push.apply(posts, await (await db.posts.find({publicity: 'extended'})).toArray());

    posts = posts.sort((a, b) => {
        if(a.timestamp < b.timestamp) return 1;
        if(a.timestamp > b.timestamp) return -1;
        return 0;
    });

    const result = [];
    for(const post of posts){
        const token = post.parent;
        const user = await db.users.findOne({token});
        if(user)
            post.author = {username: user.username};
        delete post.parent;
        result.push(post);
    }
    res.send(result);
});
app.post('/post', async (req, res) => {
    const {title, images, tags, text, publicity, timestamp, parent, album} = req.body;
    const user = await db.users.findOne({token: parent});
    if(!user || user.permissions.post !== true){
        res.sendStatus(666);
        return;
    }

    const result = await db.posts.insertOne({title, images, tags, text, publicity, timestamp, parent, album});
    res.send({valid: true});
});
app.get('*', async (req, res) => {
    res.sendFile(__dirname + '/dist/index.html');
});

io.on('connection', function(socket){
    console.log('a user connected');
});

http.listen(3000, function(){
    console.log('listening on *:3000');
});