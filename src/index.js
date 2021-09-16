const path = require('path');
const http = require('http');
const Filter = require('bad-words');
const express = require('express');
const app = express();
const socketio = require('socket.io');
const server = http.createServer(app);
const io = socketio(server);
const {generateMassage,generateLocationMassage} = require('./utils/messages');
const { addUsers, removeUser, getUser, getUsersInRoom } = require('./utils/users');
const port = process.env.PORT||5000;
app.use(express.json())
app.use(express.static(path.join(__dirname, '../public')));

app.get('/', (req, res) =>{
    res.render('index.html')
})

io.on('connection', (socket) => {
    console.log('connection established');

    socket.on('sendMessage', (message, callback) => {
        const user = getUser(socket.id);
        const filter = new Filter();
        if (filter.isProfane(message)) {
            return callback('profaniity is not allowed');
        }
        io.to(user.Room).emit('message', generateMassage(user.Username,message));
        callback();
    })

    socket.on('join', ({Username, Room}, callback)=>{
        console.log(Username, Room)
        const {error, user} = addUsers({id: socket.id, Username, Room})

        if (error) {
            return callback(error);
        }

        socket.join(user.Room);
        socket.emit('message', generateMassage('Admin','Welcome!'));
        socket.broadcast.to(user.Room).emit('message', generateMassage(user.Username,`${user.Username} has joined!`));
        io.to(user.Room).emit('roomData', {
            room: user.Room,
            users: getUsersInRoom(user.Room)
        })
    })
    socket.on('sendLocation', (message, callback) => {
        const user = getUser(socket.id);
        callback();
        io.to(user.Room).emit('sendlocation', generateLocationMassage(user.Username,`http://google.com/maps?q=${message.latitude},${message.longitude}`))
    })
    socket.on('disconnect', () => {
        const user = removeUser(socket.id)

        if (user) {
        io.to(user.Room).emit('message', generateMassage('Admin',`${user.Username} left the group`))
        io.to(user.Room).emit('roomData', {
            room: user.Room,
            users: getUsersInRoom(user.Room)
        })
        }
    })
})



server.listen(port, () => {
    console.log('server listening on port ' + port);
});