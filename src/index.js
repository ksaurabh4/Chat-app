const path = require('path');
const http = require('http');
const express = require('express');
const socketio = require('socket.io');
const Filter = require('bad-words');
const app = express();
const server = http.createServer(app);
const io = socketio(server);
const { generateMessages, generateLocationURL } = require('./utils/messages');
const {
  addUser,
  removeUser,
  getUser,
  getUsersInRoom,
} = require('./utils/users');

const port = process.env.PORT || 3000;
const publicDirectoryPath = path.join(__dirname, '../public');
app.use(express.static(publicDirectoryPath));

io.on('connection', (socket) => {
  socket.on('join', ({ username, room }, callback) => {
    const { error, user } = addUser(socket.id, username, room);
    if (error) {
      return callback(error);
    }
    socket.join(user.room);
    socket.emit('message', generateMessages('Admin', 'Welcome!'));
    socket.broadcast
      .to(user.room)
      .emit(
        'message',
        generateMessages('Admin', `${user.username} has joined!`)
      );
    io.to(user.room).emit('roomData', {
      room: user.room,
      users: getUsersInRoom(user.room),
    });
    callback();
  });

  //Sending messages

  socket.on('newMessage', (message, callback) => {
    const filter = new Filter();
    if (filter.isProfane(message)) {
      return callback('Such words are not allowed!');
    }
    const user = getUser(socket.id);

    io.to(user.room).emit('message', generateMessages(user.username, message));

    callback();
  });

  socket.on('sendLocation', (coords, callback) => {
    const user = getUser(socket.id);
    io.to(user.room).emit(
      'location',
      generateLocationURL(
        user.username,
        `https://google.com/maps?q=${coords.latitude},${coords.longitude}`
      )
    );
    callback();
  });

  socket.on('disconnect', () => {
    const user = removeUser(socket.id);
    if (user) {
      io.to(user[0].room).emit(
        'message',
        generateMessages('Admin', `${user[0].username} has left the room!`)
      );

      io.to(user[0].room).emit('roomData', {
        room: user[0].room,
        users: getUsersInRoom(user[0].room),
      });
    }
  });
});

server.listen(port, () => {
  console.log('Server is up and running');
});
