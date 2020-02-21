const app = require('express')();
const http = require('http').createServer(app);
const io = require('socket.io')(http);
const url = 'mongodb://localhost:27017';
const MongoClient = require('mongodb').MongoClient(url,{ useUnifiedTopology: true });
const bcrypt = require('bcryptjs');
const bodyParser = require('body-parser');
var cors = require('cors')

app.use(bodyParser.json());
let db;
let users;
app.use(cors());
// Use connect method to connect to the server
MongoClient.connect((err, client) => {
    console.log("Connected successfully to server");
    db = client.db('wenzel_penzberg');
    users = db.collection('users');
});

app.use(require('express').static(__dirname + '/dist'));
app.post('/login', async (req, res) => {
    const { username, pwd } = req.body;
    const user = await users.findOne({username});
    const valid =  user ? bcrypt.compareSync(pwd, user.pwd) : false;
    if(valid){
        delete user._id;
        delete user.pwd;
        res.send({valid, user});
    }else{
        res.send({valid});
    }
});
app.get('/', async (req, res) => {
    res.sendFile(__dirname + '/dist/index.html');
});

io.on('connection', function(socket){
    console.log('a user connected');
});

http.listen(3000, function(){
    console.log('listening on *:3000');
});