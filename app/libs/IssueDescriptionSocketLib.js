const socketio = require('socket.io');
const mongoose = require('mongoose');
const shortid = require('shortid');
const logger = require('./loggerLib');
const events = require('events');
const eventEmitter = new events.EventEmitter();

const tokenLib = require("./tokenLib");
const check = require("./checkLib");
const response = require('./responseLib')
const redisLib = require("./redisLib");


let setServer =(server) => {
    let io =  socketio.listen(server)
    let groupIo = io.of('/groupChat')

    groupIo.on('connection', (socket) => {
 
        socket.emit('verify', "socket trying to verify user" )
    })
    groupIo.on('token-verify', (authToken) => {
        tokenLib.verifyClaimWithoutSecret(authToken,(err,user) =>{
            let currentUser = user.data;
                    // setting socket user id 
                    socket.userId = currentUser.userId
                    // if any groups inside this user exists or not
                    if (err) {
                        console.log(`some error occurred`)
                    } else {
                        // emitting  room names
                      socket.emit('verified-sending-roominfos',currentUser.rooms)

                    }
        })
    })
   
}
module.exports = {
    setServerGroup: setServer
}