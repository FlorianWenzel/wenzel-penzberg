const app = require('express')();
const http = require('http').createServer(app);
const io = require('socket.io')(http);
const url = 'mongodb://localhost:27017';
const MongoClient = require('mongodb').MongoClient(url,{ useUnifiedTopology: true });

// Connection URL

// Database Name
const dbName = 'myproject';

// Use connect method to connect to the server
MongoClient.connect((err, client) => {
    console.log("Connected successfully to server");
    const db = client.db(dbName);

    client.close();
});

app.use(require('express').static(__dirname + 'public'));

app.get('/', function(req, res){
    res.sendFile(__dirname + '/public/index.html');
});

io.on('connection', function(socket){
    console.log('a user connected');
});

http.listen(3000, function(){
    console.log('listening on *:3000');
});