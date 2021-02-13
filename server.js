require('dotenv').config()
const { DROPBOX_TOKEN, DEFAULT_PW, BACKEND_URL, DB_URL, IMAGE_PROXY, DROPBOX_PATH} = process.env;
const jo = require('jpeg-autorotate');
const app = require("express")();
const imageSize = require("image-size");
const http = require("http").createServer(app);
const MongoClient = require("mongodb").MongoClient(DB_URL, {
  useUnifiedTopology: true
});
const VideoThumbnailGenerator = require('video-thumbnail-generator').default;
const getVideoDimensions = require('get-video-dimensions');
const bcrypt = require("bcryptjs");
const bodyParser = require("body-parser");
const cors = require("cors");
const multerConfig = require("./multer.js");
const fs = require("fs");
const ExifImage = require("exif").ExifImage;
const axios = require("axios");
const uuid = require("uuid/v4");
const ObjectId = require("mongodb").ObjectId;
const dropboxV2 = require('dropbox-v2-api');
const dropbox = dropboxV2.authenticate({token: DROPBOX_TOKEN});
const Jimp = require('jimp');
app.use(bodyParser.json({limit: '100mb', extended: true}));
let db;

app.use(cors());

MongoClient.connect(async (err, client) => {
  console.log("Connected successfully to server");
  const _db = client.db("wenzel_penzberg");
  const users = _db.collection("users");
  const images = _db.collection("images");
  const posts = _db.collection("posts");
  db = { users, images, posts };

  //create admin account if not exists
  const allUsers = await users.find().toArray();
  if (allUsers.length === 0) {
    const account = {
      username: "admin",
      password: DEFAULT_PW,
      admin: true,
      permissions: {
        post: true
      }
    };
    const { password } = account;
    const pwd = bcrypt.hashSync(password, bcrypt.genSaltSync(10));
    const newToken = bcrypt.hashSync(pwd, bcrypt.genSaltSync(10));
    await db.users.insertOne({ ...account, pwd, token: newToken });
  }
});

app.use(require("express").static(__dirname + "/dist"));
app.post("/login", async (req, res) => {
  const { username, pwd } = req.body;
  const user = await db.users.findOne({ username });
  const valid = user ? bcrypt.compareSync(pwd, user.pwd) : false;
  if (valid) {
    delete user._id;
    delete user.pwd;
    res.send({ valid, user });
  } else {
    res.send({ valid });
  }
});
app.post("/check_token", async (req, res) => {
  const { token } = req.body;
  const user = await db.users.findOne({ token });
  if (user) {
    delete user._id;
    delete user.pwd;
    res.send(user);
  } else {
    res.send(false);
  }
});
app.post("/createAccount", async (req, res) => {
  const { token, account } = req.body;
  const user = await db.users.findOne({ token });

  if (!user || !user.admin) {
    res.send({ success: false });
    return;
  }
  const already_exists = !!(await db.users.findOne({
    username: account.username
  }));
  if (already_exists) {
    res.send({ success: false, already_exists });
    return;
  }
  const { password } = account;
  const pwd = bcrypt.hashSync(password, bcrypt.genSaltSync(10));
  const newToken = bcrypt.hashSync(pwd, bcrypt.genSaltSync(10));
  delete account.password;
  await db.users.insertOne({ ...account, pwd, token: newToken });
  res.send({ success: true });
});
app.post("/deletePost", async (req, res) => {
  const { token, id } = req.body;
  const user = await db.users.findOne({ token });
  if (!user || !user.permissions || !user.permissions.post) {
    res.send({ success: false });
    return;
  }
  const _id = ObjectId(id);
  const post = db.posts.findOne({_id});
  if(!post) return;
  await db.posts.deleteOne({_id});
  res.send({success: true});
})
app.post("/deleteAccount", async (req, res) => {
  const { token, accountToDelete } = req.body;
  const user = await db.users.findOne({ token });

  if (!user || !user.admin) {
    res.send({ success: false });
    return;
  }
  const account = await db.users.findOne({
    username: accountToDelete.username
  });
  if (!account) {
    res.send({ success: false });
    return;
  }
  await db.users.deleteOne(account);
  res.send({ success: true });
});
app.post("/getAllUsers", async (req, res) => {
  const { token } = req.body;
  const user = await db.users.findOne({ token });
  if (!user.admin) {
    res.sendStatus(401);
  } else {
    const users = await db.users.find({}).toArray();
    for (const user of users) {
      delete user.pwd;
      delete user.token;
    }
    res.send({ users });
  }
});

app.post("/upload", multerConfig.saveToUploads, async (req, res) => {
  const { token } = req.body;
  const { file } = req;
  const user = await db.users.findOne({ token });

  if (!file || !user){
    res.status(500);
    return;
  }
  const { filename, path } = file;

  const extention = filename.split('.').pop();
  let type = 'image';
  if(extention === 'mp4'){
    type = 'video';
  }

  const meta = await getMeta(path);

  const src = await uploadToDropbox(path, filename);
  const thumbnail_url = await generateThumbnail(path, filename);

  const image = { ...meta, parent: token, thumbnail_url, src, filename, type};
  await db.images.insertOne({
    ...image
  });
  res.send(image);
});

app.get("/image/:encoded_filename", async (req, res) => {
  const { encoded_filename } = req.params;
  const filename = decodeURIComponent(encoded_filename);
  const url = `https://www.dropbox.com/${filename}?raw=1`;
  if(!IMAGE_PROXY){
    res.redirect(url);
  }else{
    axios({
      method: 'get',
      url,
      responseType: 'arraybuffer'
    })
        .then(function (response) {
          var headers = {'Content-Type': 'image/jpeg'};
          res.writeHead(200, headers);
          res.end(response.data, 'binary');
        })
        .catch(function (error) {
          res.send("error:" + error);
        });
  }
});
app.post("/importFromDropbox", async (req, res) => {
  const { url, token } = req.body;
  const user = await db.users.findOne({ token });
  if (!user) {
    res.statusCode(401);
    return;
  }

  const extention = url.replace('?raw=1','').split('.').pop();
  const filename = `${uuid()}.${extention}`;
  const path = `/tmp/${filename}`;
  let type = 'image';
  if(extention === 'mp4'){
    type = 'video';
  }
  const imageBuffer = await axios
    .get(url, { responseType: "arraybuffer" })
    .then(response => Buffer.from(response.data, "binary"));
  fs.writeFileSync(path, imageBuffer);

  const meta = await getMeta(path);
  const src = await uploadToDropbox(path, filename);
  const thumbnail_url = await generateThumbnail(`/tmp/${filename}`, filename);

  const image = {
    ...meta, parent: token, thumbnail_url, src, filename, type
  };
  await db.images.insertOne(image);
  res.send(image);
});

async function generateThumbnail(path, filename){
  const extention = filename.split('.').pop();

  if(extention === 'mp4'){
    const { width, height } = await getMeta(path);
    path = await new Promise((resolve) => {
      new VideoThumbnailGenerator({sourcePath: path, thumbnailPath: '/tmp/'})
      .generateOneByPercent(1, {size: `${width}x${height}`})
      .then((filename) => {
        resolve('/tmp/' + filename)
      })
    })
    filename = filename.replace(extention, '.png');
  }
  const thumbnailPath = `/tmp/thumbnail/${filename}`;
  return new Promise((resolve) => {
    Jimp.read(path, (err, image) => {
      if (err) throw err;
      image
        .resize(20, Jimp.AUTO)
        .write(thumbnailPath, async () => {
          const url = await uploadToDropbox(thumbnailPath, `thumbnail/${filename}`);
          resolve(url);
        })
    });
  });
}

async function uploadToDropbox(path, name){
  const dropboxPath = `${DROPBOX_PATH}/${name}`;
  return new Promise((resolve, reject) => {
    dropbox({
      resource: 'files/upload',
      parameters: {
        path: dropboxPath
      },
      readStream: fs.createReadStream(path)
    }, (err) => {
      if(err) {
        console.log('err:', err);
        reject();
      } else {
        dropbox({
          resource: 'sharing/create_shared_link_with_settings',
          parameters: {
            path: dropboxPath,
            settings: {
              "requested_visibility": "public",
              "audience": "public",
              "access": "viewer"
            }
          }
        }, (err, result) => {
          if(err) {
            console.log('err:', err);
            reject();
          }
          const proxy_url = `${BACKEND_URL}/image/${encodeURIComponent(result.url.replace('https://www.dropbox.com/', '').replace('?dl=0', ''))}`;
          resolve(proxy_url);
        });
      }
    });
  })
}

function getMeta(path){
  return new Promise(resolve => {
          const extention = path.split('.').pop();
          if(extention === 'mp4'){
            getVideoDimensions(path)
                .then((dimensions) => {
                  resolve({...dimensions})
                })
          }else{
            new ExifImage(
                { image: path },
                async (error, meta) => {
                  if(!meta) meta = {};
                  const { width, height } = imageSize(path);
                  const orientation = meta.image ? meta.image.Orientation : 1;
                  if(orientation !== 1){
                    await (jo.rotate(path, {quality: 100})
                        .then(({buffer}) => {
                          fs.writeFileSync(path, buffer);
                          resolve(getMeta(path));
                        })
                        .catch(() => {
                          resolve({meta, width, height});
                        }))
                  }
                  resolve({meta, width, height});
                }
            );
          }
        });
}
app.get("/posts", async (req, res) => {
  const { token } = req.query;
  let posts = await db.posts.find({ publicity: "public" }).toArray();
  const user = await db.users.findOne({ token });

  if (user && user.publicity === "family")
    Array.prototype.push.apply(
      posts,
      await (await db.posts.find({ publicity: "family" })).toArray()
    );
  if (user && (user.publicity === "family" || user.publicity === "close"))
    Array.prototype.push.apply(
      posts,
      await (await db.posts.find({ publicity: "close" })).toArray()
    );
  if (
    user &&
    (user.publicity === "family" ||
      user.publicity === "close" ||
      user.publicity === "extended")
  )
    Array.prototype.push.apply(
      posts,
      await (await db.posts.find({ publicity: "extended" })).toArray()
    );
  if (
    user &&
    (user.publicity === "family" ||
      user.publicity === "close" ||
      user.publicity === "extended" ||
      user.publicity === "other")
  )
    Array.prototype.push.apply(
      posts,
      await (await db.posts.find({ publicity: "other" })).toArray()
    );

  posts = posts.sort((a, b) => {
    if (a.timestamp < b.timestamp) return 1;
    if (a.timestamp > b.timestamp) return -1;
    return 0;
  });

  const result = [];
  for (const post of posts) {
    const token = post.parent;
    const user = await db.users.findOne({ token });
    if (user) post.author = { username: user.username };
    delete post.parent;
    result.push(post);
  }
  res.send(result);
});
app.post("/check_version", (req, res) => {
  const { version } = req.body;
  const currentVersion = require('./package.json').version;
  const update = version !== currentVersion;
  res.send({update});
})

app.post("/post", async (req, res) => {
  const {
    title, images, tags, text, publicity, timestamp, parent, album, id, hide_date, hide_author
  } = req.body;
  const user = await db.users.findOne({ token: parent });
  if (!user || user.permissions.post !== true) {
    res.sendStatus(666);
    return;
  }
  let edit = false;
  if (id) {
    const _id = ObjectId(id);
    edit = true;
    await db.posts.updateOne(
      { _id },
      {
        $set: {
          title, images, tags, text, publicity, timestamp, parent, album, id, hide_date, hide_author
        }
      }
    );
  } else {
    await db.posts.insertOne({
      title, images, tags, text, publicity, timestamp, parent, album, id, hide_date, hide_author
    });
  }
  res.send({ valid: true, edit});
});
app.get("*", async (req, res) => {
  res.sendFile(__dirname + "/dist/index.html");
});

http.listen(3311, function() {
  console.log("listening on *:3311");
});
