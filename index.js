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

let entities = {};

let players = {};
let playerIds = [];
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
let lastSide = 'red';
let lastObjectId = 0;
let lastEntityId = 0;

app.use(express.static('static'));

app.get('/', (req, res) => {
    res.sendFile(__dirname + '/index.html');
});

io.on('connection', (socket) => {
    lastId += 1;
    if (lastSide == 'red') {
        lastSide = 'blue';
    } else {
        lastSide = 'red';
    }

    players[socket.id] = {
        id: lastId,
        x: 0, y: 0,
        color: 'blue',
        side: lastSide,
        entities: []
    };

    playerIds.push(socket.id);

    io.to(socket.id).emit('set id', lastId);
    io.emit('chat message', {
        from: "System",
        msg: "New user connected."
    });
    io.emit('map', gameMap);
    io.emit('players', players);
    io.emit('objects', objects);
    io.emit('entities', entities);

    socket.on('chat message', (data) => {
        io.emit('chat message', data);
    });

    socket.on('new entity', (data) => {
        lastEntityId += 1;

        if (players[socket.id].side == 'blue') {
            entities[lastEntityId] = {x: 20, y: 400, type: 'soldier', from: data.from, side: 'blue', state: 'walking'};
        } else {
            entities[lastEntityId] = {x: 760, y: 400, type: 'soldier', from: data.from, side: 'red', state: 'walking'};
        }

        players[socket.id].entities.push(lastEntityId);

        io.emit('entities', entities);
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

setInterval(function() {
    for (let key in entities) {
        let entity = entities[key];
        if (entity.state != 'walking') continue;
        
        if (entity.side == 'blue') {
            entities[key].x += 10;
        } else {
            entities[key].x -= 10;
        }
    }

    // collision detection
    if (playerIds.length >= 2 && players[playerIds[0]].entities.length && players[playerIds[1]].entities.length) {
        let entityA = entities[players[playerIds[0]].entities[0]];
        let entityB = entities[players[playerIds[1]].entities[0]];

        let diff = entityA.x - entityB.x;

        if (diff >= -20 && diff <= 20) {
            entityA.state = 'fighting';
            entityB.state = 'fighting';
        }
    }

    io.emit('entities', entities);
}, 200);

server.listen(3000, () => {
    console.log('listening on port 3000');
});
