var express = require('express');
var app = express();
var bodyParser = require('body-parser')
var fs = require('fs');
var hashObject = require('hash-object');
var multer  =   require('multer');
var Sound = require('node-aplay');

const iconsFolder = './public/icons/';
const soundsFolder = './public/sounds/';

var iconsStorage =   multer.diskStorage({
        destination: function (req, file, callback) {
          callback(null, iconsFolder);
        },
        filename: function (req, file, callback) {
          callback(null, file.originalname);
        }
});
var soundsStorage =   multer.diskStorage({
        destination: function (req, file, callback) {
          callback(null, soundsFolder);
        },
        filename: function (req, file, callback) {
          callback(null, file.originalname);
        }
});

var uploadIcon = multer({storage: iconsStorage}).single('icon');
var uploadSound = multer({storage: soundsStorage}).single('sound');

var payload = {
        'message': 'It looks like you are trying to escape this room. Have you tried the door?',
        'size': '3em',
        'icon': 'none',
        'sound': 'none'
};

var hash = hashObject(payload);
payload['hash'] = hash;

var icons = ['none'];
var sounds = ['none'];

fs.readdir(iconsFolder, (err, files) => {
        files.forEach(file => {
          console.log(file);
          icons.push(file);
        });
});

fs.readdir(soundsFolder, (err, files) => {
        files.forEach(file => {
          console.log(file);
          sounds.push(file);
        });
});

app.set('view engine', 'ejs');
app.use(express.static('public'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({
        extended: true
})); 

app.get('/hi', function (req, res) {
        return res.render('hi', {'icons': icons, 'sounds': sounds});
});

app.post('/message', function (req, res) {
        payload = {
                'message': req.body.message,
                'size': req.body.size,
                'icon': req.body.icon,
                'sound': req.body.sound
        };
        var hash = hashObject(payload);
        payload['hash'] = hash;

        new Sound('./public/sounds/' + payload['sound']).play();

        return res.json({'message':'ok'});
});

app.get('/', function (req, res) {
        return res.render('main');
});

app.get('/update', function (req, res) {
        return res.json(payload);
});

app.get('/upload',function(req,res){
        return res.render('upload');
  });

app.post('/sound/upload', function(req, res) {
        return uploadSound(req, res, function(err) {
            if (err) {
                return res.end("Error uploading file.");
            }

            return res.end("File was uploaded!");
        });
});

app.post('/icon/upload', function(req, res) {
        return uploadIcon(req, res, function(err) {
            if (err) {
                return res.end("Error uploading file.");
            }

            return res.end("File was uploaded!");
        });
});

app.listen(3000, function () {
        console.log('Listening on port 3000!');
        return;
});
