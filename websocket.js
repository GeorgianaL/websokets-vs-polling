let http = require('http');
let fs = require('fs');


fs.readFile('websocket.html', function (err, html) {
    if (err) {
        throw err;
    }
    let server = http.createServer(function(request, response) {
        response.writeHeader(200, {"Content-Type": "text/html"});
        response.write(html);
        response.end();
    }).listen(8000);

    let myFile = JSON.parse(fs.readFileSync('tasks.json').toString());

    let io = require('socket.io')(server);

    connections = [];

    io.on('connection', function(socket) {
        connections.push(socket);
        console.log(" %s sockets connected", connections.length);

        socket.on('send task', function(t, u) {
            io.emit('new task', {task: t, username: u});
            let newTaskObject = {
              taskTitle: t,
              user: u
            };
            myFile.push(newTaskObject);
          });

    });
});
