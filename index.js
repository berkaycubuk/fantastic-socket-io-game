const express = require('express');
const app = express();
const http = require('http');
const server = http.createServer(app);
const { Server } = require("socket.io");
const io = new Server(server);

let gameMap = [
    [0,0,0,0,0,0,0,0,0,0],
    [0,0,0,0,1,1,1,0,0,0],
    [0,0,0,0,1,1,1,0,0,0],
    [0,0,0,0,1,1,1,0,0,0],
    [0,0,0,0,1,1,1,0,0,0],
    [0,0,0,0,1,1,1,0,0,0],
    [0,0,0,0,0,0,0,0,0,0],
    [0,0,0,0,0,0,0,0,0,0],
    [0,0,0,0,0,0,0,0,0,0],
    [0,0,0,0,0,0,0,0,0,0],
];

let players = {};
let objects = {
    0: {
        type: 'tree',
        x: 400,
        y: 60
    },
    1: {
        type: 'tree_2',
        x: 20,
        y: 200
    },
    2: {
        type: 'tree_3',
        x: 200,
        y: 400
    },
};
let lastId = 0;
let lastObjectId = 0;

app.use(express.static('static'));

app.get('/', (req, res) => {
    res.sendFile(__dirname + '/index.html');
});

io.on('connection', (socket) => {
    lastId += 1;
    players[socket.id] = {id: lastId, x: 0, y: 0, color: 'blue', animationKey: 'idle_6'};
    io.to(socket.id).emit('set id', lastId);
    io.emit('chat message', {
        from: "System",
        msg: "New user connected."
    });
    io.emit('map', gameMap);
    io.emit('players', players);
    io.emit('objects', objects);

    socket.on('chat message', (data) => {
        io.emit('chat message', data);
    });

    socket.on('player move', (data) => {
        players[data.id].x = data.x;
        players[data.id].y = data.y;
        players[data.id].animationKey = data.animationKey;

        io.emit('players', players);
    });

    socket.on('disconnect', () => {
        delete players[socket.id];
        io.emit('chat message', {
            from: "System",
            msg: "User disconnected."
        });
        io.emit('players', players);
    });
});

server.listen(3000, () => {
    console.log('listening on port 3000');
});
