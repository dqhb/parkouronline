const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const path = require('path');

const app = express();
const server = http.createServer(app);
const io = new Server(server);

app.use(express.static(path.join(__dirname, 'public')));

let players = {};

io.on('connection', (socket) => {
    socket.on('join', (data) => {
        players[socket.id] = {
            x: 100, y: 100, angle: 0, 
            color: `hsl(${Math.random() * 360}, 70%, 50%)`,
            hp: 100, name: data.name, id: socket.id
        };
        io.emit('updatePlayers', players);
    });

    socket.on('move', (data) => {
        if (players[socket.id]) {
            players[socket.id].x = data.x;
            players[socket.id].y = data.y;
            players[socket.id].angle = data.angle;
            socket.broadcast.emit('updatePlayers', players);
        }
    });

    socket.on('shoot', (bullet) => {
        io.emit('newBullet', bullet);
    });

    socket.on('hit', (id) => {
        if (players[id]) {
            players[id].hp -= 10;
            if (players[id].hp <= 0) players[id].hp = 0;
            io.emit('updatePlayers', players);
        }
    });

    socket.on('revive', () => {
        if (players[socket.id]) {
            players[socket.id].hp = 100;
            players[socket.id].x = 100;
            players[socket.id].y = 100;
            io.emit('updatePlayers', players);
        }
    });

    socket.on('disconnect', () => {
        delete players[socket.id];
        io.emit('updatePlayers', players);
    });
});

const PORT = process.env.PORT || 3000;
server.listen(PORT, () => console.log(`Server running on port ${PORT}`));
