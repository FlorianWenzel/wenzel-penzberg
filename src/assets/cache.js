import axios from 'axios';
import { openDB, deleteDB} from 'idb';
import md5 from 'md5';
const DB_VERION = 1;

async function loadDB(){
  const db = await  openDB("requests", DB_VERION, {
    upgrade: (db) => {
      db.createObjectStore('get');
      db.createObjectStore('post');
    }
  })
  return db;
}
const post = (url, data) => {
  if(navigator.onLine)
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
  else
    return new Promise((resolve, reject) => {
      getRequest({type: 'post', url, data})
          .then(response => {
            if(response)
              resolve(response)
            else
              reject();
          })
  })
}

const get = url => {
  if(navigator.onLine)
    return new Promise((resolve, reject) => {
      const p = axios.get(url)
      p.catch(() => {
        getRequest({type: 'get', url})
            .then(response => {
              if(response)
                resolve(response);
              else
                reject();
            })
      })
      p.then(e => {
        storeRequest({type: 'get', url}, e)
            .then(() => resolve(e));
      })
    })
  else
    return new Promise((resolve, reject) => {
      getRequest({type: 'get', url})
          .then(response => {
            if(response)
              resolve(response);
            else
              reject();
          })
    })
}

const reset = () => {
  return deleteDB('requests', {
    blocked() {
      console.log('ressource blocked :/')
    }
  });
}

async function getRequest(req){
  const db = await loadDB();
  const reqHash = md5(JSON.stringify(req));
  const res = await db.get(req.type, reqHash);
  await db.close();
  if(res){
    return JSON.parse(res);
  }else{
    return false;
  }
}

async function storeRequest(req, res){
  const db = await loadDB();
  const reqHash = md5(JSON.stringify(req));
  res = JSON.stringify(res);
  await db.put(req.type, res, reqHash)
  await db.close();
}
export { post, get, reset};
