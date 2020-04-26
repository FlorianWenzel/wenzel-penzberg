import axios from 'axios';
import { openDB } from 'idb';
import md5 from 'md5';
const DB_VERION = 1;
let db;
async function loadDB(){
  if(db)
    return db;
  db = await  openDB("requests", DB_VERION, {
    upgrade: (db) => {
      db.createObjectStore('get');
      db.createObjectStore('post');
    }
  })
  return db;
}
const post = (url, data) => {
  return new Promise((resolve, reject) => {
      const p = axios.post(url, data)
      p.catch(() => {
        getRequest({type: 'post', url, data})
        .then(response => {
          if(response)
            resolve(response)
          else
            reject();
        })
      })
      p.then(e => {
        storeRequest({type: 'post', url, data}, e)
        .then(() => resolve(e));
      })
  })
}

const get = url => {
  return new Promise((resolve, reject) => {
    const p = axios.get(url)
    p.catch(() => {
      getRequest({type: 'get', url})
          .then(response => {
            if(response)
              resolve(response)
            else
              reject();
          })
    })
    p.then(e => {
      storeRequest({type: 'get', url}, e)
          .then(() => resolve(e));
    })
  })
}

async function getRequest(req){
  await loadDB();
  const reqHash = md5(JSON.stringify(req));
  console.log('trying to load... ', reqHash);
  const res = await  db.get(req.type, reqHash);
  if(res){
    return JSON.parse(res);
  }else{
    return false;
  }
}

async function storeRequest(req, res){
  await loadDB();
  const reqHash = md5(JSON.stringify(req));
  res = JSON.stringify(res);
  await db.put(req.type, res, reqHash)
}
export { post, get};
