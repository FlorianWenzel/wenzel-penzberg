const multer  = require('multer');
const uuid = require('uuid/v4');
const path = require('path');

const diskStorageToUploads = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, '/tmp')
    },
    filename: (req, file, cb) => {
        cb(null, uuid() + path.extname(file.originalname));
    }
});

const saveToUploads = multer({storage: diskStorageToUploads});

module.exports = {
    saveToUploads: saveToUploads.single('file')
};
