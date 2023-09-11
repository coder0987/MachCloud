const http = require('http');
const https = require('https');
const url = require('url');
const fs = require('fs');
const path = require('path');

const express = require('express');
const app = express();
const multer = require('multer');

const MIME_TYPE = {
    '.ico': 'image/png',
    '.html': 'text/html',
    '.js': 'text/javascript',
    '.json': 'application/json',
    '.css': 'text/css',
    '.png': 'image/png',
    '.jpg': 'image/jpeg',
    '.wav': 'audio/wav',
    '.mp3': 'audio/mpeg',
    '.svg': 'image/svg+xml',
    '.pdf': 'application/pdf',
    '.doc': 'application/msword',
    '.xml': 'application/rss+xml',
    '.php': 'text/x-php'
};



const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    //Verify user info
    let currentCookies = getCookies(req);
    if (usersCache[currentCookies['username'].toLowerCase()] &&
        usersCache[currentCookies['username'].toLowerCase()] == currentCookies['token']) {
        cb(null, path.join(path.join(__dirname,'userdata'), getCookies(req)['username'].toLowerCase()));
        return;
    }
    console.log(currentCookies['username'] + JSON.stringify(usersCache));
    verifyUserInfo(currentCookies['username'], currentCookies['token']);
    cb(new Error('No username'), null);
  },
  filename: function (req, file, cb) {
    cb(null, file.originalname)
  }
})

const upload = multer({
    dest: '/userdata/',
//destination folder is automatically created if it's not available
    limits: {
        fileSize: 5000000000 // 5gb
    },
    fileFilter: (req, file, callback) => {
        //console.log(file);
        callback(undefined, true);
    },
    storage: storage
})



app.post('/userdata/', upload.single('standardUpload'), (req, res) => {
    return res.end();
});

app.post('/signIn', (req, res) => {
    let currentCookies = getCookies(req);
    verifyUserInfo(currentCookies['username'], currentCookies['token']);
});

app.use(express.static(__dirname + '/public'));

const server = app.get(function (req, res) {
    let q = url.parse(req.url, true);
    let filename = '.' + q.pathname;

    let filenameItemization = filename.split('/');
    if (filenameItemization[1] == 'userdata') {
        //Retrieving data or uploading file
        let currentCookies = getCookies(req);
        if (usersCache[currentCookies['username']] == currentCookies['token']) {
            //Verified

            //User will be authorized in 2 cases: folder name matches username or item is shared with user. Shared items will be stored via symlink in /userdata/USERNAME/shared
            if (filenameItemization[2] == username.toLowerCase) {
                //User is allowed
                switch (req.method) {
                    case 'GET':
                        //File retrieval
                        if (filename.lastIndexOf('/') >= filename.length - 1) {
                            //Return a manifest of the folder
                            return retrieveManifest(filename, res);
                        } else {
                            return retrieveFile(filename, res);
                        }
                }
            } else {
                //Restricted area
                res.writeHead(403);
                return res.end();
            }

        } else {
            verifyUserInfo(currentCookies['username'], currentCookies['token']);
            res.writeHead(403);
            return res.end();
        }
    }
});

function retrieveFile(filename, res) {
    let ext = path.parse(filename).ext;
    let exists = false;
    try {
        fs.accessSync(filename);
        exists = true;
    } catch (err) {
    }

    if (!exists) {
        filename = '404.html';
    }

    fs.readFile(filename, function(err, data) {
      if (err) {
            res.writeHead(404, {'Content-Type': 'text/html'});
      } else {
          res.writeHead(200, {'Content-Type': MIME_TYPE[ext] || 'text/plain'});
          res.write(data);
      }
      return res.end();
    });
}
function retrieveManifest(filename, res) {
    //Todo error handling if dir doesn't exist
    res.writeHead(200, {'Content-Type': 'text/plain'});
    res.write(getAllFilesFromFolder(filename));
    return res.end();
}

function getAllFilesFromFolder(dir) {
    const results = [];

    filesystem.readdirSync(dir).forEach(function(file) {
        file = dir+'/'+file;
        let stat = filesystem.statSync(file);
        results.push(file);
    });

    return results;
};

const usersCache = {};

function verifyUserInfo(username, token) {
    console.log('Attempting user verification for user ' + username);
    try {
        username = username.toLowerCase()

        const options = {
            hostname: 'sso.smach.us',
            path: '/verify',
            method: 'POST',
            protocol: 'https:',
            headers: {
                'Authorization': username + ':' + token
            }
        };
        const req = https.request(options, (res) => {
            if (res.statusCode == 200) {
                console.log('User ' + username + ' successfully signed in');
                usersCache[username] = token;
                if (!fs.existsSync(path.join(__dirname,path.join('userdata', username)))) {
                    console.log('Creating user home directory ' + path.join(__dirname,path.join('userdata', username)));
                    fs.mkdir(path.join(__dirname,path.join('userdata', username)), (err) => {
                        if (err) {
                            return console.error(err);
                        }
                    });
                }
            } else {
                console.log('User verification for ' + username + ' failed with status code ' + res.statusCode);
            }
        }).on("error", (err) => {
            console.log("Error: ", err);
        }).end();
    } catch (err) {
        console.log(err);
    }
}

function getCookies(req) {
  const cookies = {};
  req.headers && req.headers.cookie.split(';').forEach(function(cookie) {
    let parts = cookie.match(/(.*?)=(.*)$/)
    cookies[ parts[1].trim() ] = (parts[2] || '').trim();
  });
  return cookies;
};


app.listen(8408, () => {
    console.log('Listening at http://localhost:8408/');
});