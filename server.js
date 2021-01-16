const express = require('express');
const app = express();
const srv = require('https').Server(app);
const io = require('socket.io')(srv, {cors:{origin: '*'}});

app.use(express.static('scripts'));
app.use(express.urlencoded({extended: true}));

srv.listen(2000);

const users = {};

io.on('connection', socket => {
    socket.on('new_user', name => {
        users[socket.id] = name;
        socket.broadcast.emit('user_connected', name);
    });

    socket.on('send_message', message => {
        console.log(message);
        socket.broadcast.emit('text_message', {message: message, name: users[socket.id]});
    });

    socket.on('disconnect', () => {
        socket.broadcast.emit('user_disconnected', users[socket.id]);
        delete users[socket.id];
    });
});