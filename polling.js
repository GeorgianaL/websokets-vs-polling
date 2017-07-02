let http = require('http');
let url = require('url');
let fs = require('fs');

let updatesAvailable = false;
let myFile = {};

appendToJSON = (obj, filePath) => {
  let rawFile = fs.readFileSync(filePath);
  let jsonFile = JSON.parse(rawFile);
  jsonFile.push(obj);
  fs.writeFileSync(filePath, JSON.stringify(jsonFile));
}

fs.readFile('polling.html', function (err, html) {
  if (err) {
    throw err;
  }

  http.createServer(function(req, res) {

    let reqParsed = url.parse(req.url);
    let pathName = reqParsed.pathname;

    if (req.method === "GET" && pathName === "/") {
      res.writeHeader(200, {"Content-Type": "text/html"});
      res.write(html);
      res.end();
      updatesAvailable = false;
    }

    if (req.method === "POST" && pathName === "/check") {
      let body = '';
      req.on('data', function(data) {
        body += data;
      });
      req.on('end', function() {
        if (body.split("=")[1] != myFile.length)
          updatesAvailable = true;
        res.writeHeader(200, {"Content-Type": "application/json"});
        res.end(JSON.stringify({status: updatesAvailable}));
      });
    }

    if (req.method === "GET" && pathName === "/tasks") {
      myFile = JSON.parse(fs.readFileSync('tasks.json').toString());
      updatesAvailable = false;
      res.writeHeader(200, {"Content-Type": "application/json"});
      res.end(JSON.stringify(myFile));
    }

    if (req.method === "POST" && pathName === "/tasks") {
      let body = '';
      req.on('data', function(data) {
        body += data;
      });
      req.on('end', function() {
        if (body !== '' && body['taskTitle'] !== '' && body['user'] !== '') {
          let taskTitleStr = (body.split('&')[0]).split('=')[1];
          let userStr = (body.split('&')[1]).split('=')[1];
          let newObject = {
            taskTitle: taskTitleStr,
            user: userStr
          }
          appendToJSON(newObject, './tasks.json');
          updatesAvailable = true;
          console.log('post');
          res.writeHead(200, {'Content-Type': 'aplication/json'});
          console.log("Task added succesfully");
          res.end();
        }
      });
    }

  }).listen(8000);

});
