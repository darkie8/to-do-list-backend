const socketio = require('socket.io');
const mongoose = require('mongoose');
const shortid = require('shortid');
const logger = require('./loggerLib');
const events = require('events');
const eventEmitter = new events.EventEmitter();
const time = require('./../libs/timeLib');
const tokenLib = require("./tokenLib");
const check = require("./checkLib");
const response = require('./responseLib')
const redisLib = require("./redisLib");
const commentController = require('../controllers/commentController');
const issueController = require('../controllers/issueController')

let setServer = (server) => {
    let io = socketio.listen(server)
    let commentIo = io.of('/comment')


    commentIo.on('connection', (socket) => {

        // 1st 
        socket.emit('verify', "socket trying to verify user")


        // 2nd
        socket.on('token-verify', (authToken) => {
            tokenLib.verifyClaimWithoutSecret(authToken, (err, user) => {

                // if any groups inside this user exists or not
                if (err) {
                    console.log(`some error occurred`)
                    socket.emit('auth-error', {
                        status: 500,
                        error: 'Please provide correct auth token'
                    })
                } else {
                    let currentUser = user.data;
                    // setting socket user id 
                    socket.userId = currentUser.userId
                    socket.userName = `${currentUser.firstName} ${currentUser.lastName}`
                    socket.emit('verified', 'send issueInfo')


                }
            })
        });
        // 3rd create
        socket.on('issue', (issue) => {
            let currentIssue = issue;
            socket.issueId = issue.issueId;
            let key = socket.userName;
            let value = issue.title;
            redisLib.setThingsInHash('commenting-on-main-issue', key, value, (err, result) => {
                console.log('saving info');
                redisLib.getAllThingsInAHash('commenting-on-main-issue', (err, result1) => {
                    if (err) {
                        console.log(err)
                    } else {

                        console.log(`${key} is commenting on ${value}`);
                        socket.emit('ask for comment', 'send comment')
                        // setting room name
                        socket.roomNotify = 'notification-box'
                        // joining room.
                        socket.join(socket.roomNotify)
                        socket.to(socket.roomNotify).broadcast.emit('commenting-notification', result1);


                    }
                })
            })
        })
        // 4th create
        socket.on('comment', (comment) => {
            console.log('comment has been reached');

            comment['commentId'] = shortid.generate();
            comment['createdOn'] = time.now();
            comment['modifiedOn'] = time.now();
            console.log(comment);
            let commentPromise = Promise.resolve(comment);
            commentPromise.then(res => {
                let response = commentController.createComment(res);

                let response2 = issueController.addComment(socket.issueId, comment.commentId)
                socket.emit('response', {
                    response1: response,
                    response2: response2
                })
                socket.emit('comment-view', res);
            })


        })
        // 1 -> 2 
        // 3rd delete comment

        socket.on('issue-delete-hash', (total) => {
            let currentIssue = total.issue;
            socket.issueId = total.issue.issueId;
            let key = socket.userName;
            let value = total.issue.title;
            let bool = redisLib.deleteThingsFromHash('commenting-on-main-issue', key);
            let deleted = (bool) ? Promise.resolve(true) : Promise.reject(false);
            deleted.then(result => {
                console.log('deleting comment from main database');
                let response = commentController.deleteComment(total.comment.commentId)
                let response2 = issueController.deleteComment(socket.issueId, total.comment.commentId)
                socket.emit('response', {
                    response1: response,
                    response2: response2
                })
            })
        })
        socket.on('typing', data => {
            let room = 'typing-now';
            socket.join(room);
            socket.to(room).broadcast.emit('typing-sent', data);

        });
    });


}

module.exports = {
    setServerGroup: setServer
}