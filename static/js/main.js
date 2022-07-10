var socket = io();

let music = new Audio('/sound/bg.mp3');

var messages = document.getElementById('messages');
var form = document.getElementById('form');
var input = document.getElementById('input');

let gameMap = [
    [1,0,0,0],
    [0,0,0,0],
    [0,0,0,0],
    [0,0,0,0]
];

let playerId = 1;
let player = {
    x: 0,
    y: 0,
    color: 'blue',
    animationKey: 'idle_6',
};

form.addEventListener('submit', function(e) {
    e.preventDefault();
    if (input.value) {
        socket.emit('chat message', {
            from: playerId,
            msg: input.value
        });
        input.value = '';
    }
});

socket.on('set id', function(id) {
    playerId = id;
});

socket.on('chat message', function(data) {
    var item = document.createElement('li');
    item.innerHTML = `<b>${data.from}</b>: ${data.msg}`;
    messages.prepend(item);
});

var canvas = document.getElementById('canvas');
var ctx = canvas.getContext('2d');

class GameMap {
    mapData;
    blockSize = 60;

    constructor(mapData) {
        this.mapData = mapData;
    }

    draw() {
        for (let y = 0; y < this.mapData.length; y++) {
            for (let x = 0; x < this.mapData.length; x++) {
                let image = new Image(32, 32);

                switch (this.mapData[y][x]) {
                    case 0:
                        image.src = '/img/grass.jpg';
                        break;
                    case 1:
                        image.src = '/img/dirt.jpg';
                        break;
                }
                ctx.drawImage(image, this.blockSize * x, this.blockSize * y, this.blockSize, this.blockSize);
            }
        }
    }
}

class EntitiesManager {
    entities = {};

    update(entities) {
        this.entities = entities;
    }

    draw() {
        for (let key in this.entities) {
            drawEntity(this.entities[key]);
        }
    }
}

class ObjectsManager {
    objects = {};

    update(objects) {
        this.objects = objects;
    }

    draw() {
        for (let key in this.objects) {
            drawObject(this.objects[key]);
        }
    }
}

class PlayersManager {
    players;

    update(players) {
        this.players = players;
        player = players[playerId];
    }

    draw() {
        for (let key in this.players) {
            drawPlayer(this.players[key]);
        }
    }
}

function drawEntity(entity) {
    if (entity.side == 'blue') {
        ctx.fillStyle = 'blue';
    } else {
        ctx.fillStyle = 'red';
    }

    ctx.fillRect(entity.x, entity.y, 20, 20);
}

function drawObject(object) {
    let image = new Image();

    switch (object.type) {
        case 'tree':
            image.src = '/img/tree.png';
            break;
        case 'tree_2':
            image.src = '/img/tree_2.png';
            break;
        case 'tree_3':
            image.src = '/img/tree_3.png';
            break;
    }
    ctx.drawImage(image, object.x, object.y);
}

function drawPlayer(player) {
    let image = new Image(32, 32);
    image.src = `/img/players/knight/${player.animationKey}.png`;
    ctx.drawImage(image, player.x, player.y);
}

let currentMap = new GameMap(gameMap);
let playersManager = new PlayersManager();
let objectsManager = new ObjectsManager();
let entitiesManager = new EntitiesManager();

socket.on('map', function(newMap) {
    currentMap.mapData = newMap;
});

socket.on('players', function(newPlayers) {
    playersManager.players = newPlayers;
});

socket.on('objects', function(objects) {
    objectsManager.objects = objects;
});

socket.on('entities', function(entities) {
    entitiesManager.update(entities);
});

function animationLoop() {
    ctx.clearRect(0, 0, 800, 600);
    //currentMap.draw();
    //objectsManager.draw();
    //playersManager.draw();
    entitiesManager.draw();
    window.requestAnimationFrame(animationLoop);
}

animationLoop();

function buildSoldier() {
    socket.emit('new entity', {
        from: playerId,
        entity: 'soldier'
    });
}

