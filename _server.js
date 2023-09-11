const http = require('http');
const url = require('url');
const fs = require('fs');
const path = require('path');

const server = http.createServer(function (req, res) {
    let q = url.parse(req.url, true);
    let filename = '.' + q.pathname;

    let filenameItemization = filename.split('/');
    if (filenameItemization[1] == 'userdata') {
        //Retrieving data

    } else if (filenameItemization.length <= 2) {
        //No sub-folders allowed
        if (filename=='.') {
            filename = './index.html';//Default to index.html
        }
        if (filename.lastIndexOf('/') >= filename.length - 1) {
            filename += 'index.html';//Only a directory? Default to index.html of that directory
        }
        if (filename.lastIndexOf('.') < filename.lastIndexOf('/')) {
            filename += '.html';//No file ending? Default to .html
        }

        let ext = path.parse(filename).ext;
        // maps file extension to MIME typere
        let MIME_TYPE = {
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
          if (err || filename.indexOf('_') != -1) {
                res.writeHead(404, {'Content-Type': 'text/html'});
          } else {
              res.writeHead(200, {'Content-Type': MIME_TYPE[ext] || 'text/plain'});
              res.write(data);
          }
          return res.end();
        });
    }
});

const usersCache = {};

function verifyUserInfo(username, token) {
    try {
        const options = {
            hostname: 'sso.samts.us',
            path: '/verify',
            method: 'POST',
            protocol: 'https:',
            headers: {
                'Authorization': username.toLowerCase() + ':' + token
            }
        };
        const req = https.request(options, (res) => {
            if (res.statusCode !== 200) {
                usersCache[username] = token;
            }
        }).on("error", (err) => {
            console.log("Error: ", err);
        }).end();
    } catch (err) {
        console.log(err);
    }
}




server.listen(8408);
console.log('Listening at http://localhost:8408/');