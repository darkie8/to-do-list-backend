"use strict"
const express = require('express');
const path = require('path');
const cookieParser = require('cookie-parser');
const bodyParser = require('body-parser');
const fs = require('fs');
const app = express();
const http = require('http');
const https = require('https');
const appConfig = require('./config/appConfig');
const logger = require('./app/libs/loggerLib');
const routeLoggerMiddleware = require('./app/middlewares/routeLogger');
const globalErrorMiddleware = require('./app/middlewares/appErrorHandler');
const mongoose = require('mongoose');
// const commentSocket = require('./app/libs/commentSocketLib');
const morgan = require('morgan');


app.use(bodyParser.json());
app.use(bodyParser.urlencoded({
  extended: false
}));
app.use(cookieParser());
app.use(globalErrorMiddleware.globalErrorHandler);

const modelsPath = './app/models';
const routesPath = './app/routes';

// Access-Control 
app.use(routeLoggerMiddleware.logIp);
app.all('*', function (req, res, next) {
  res.header("Access-Control-Allow-Origin", "*");
  res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept, authToken, limit");
  res.header('Access-Control-Allow-Methods', 'GET,HEAD,PUT,POST,DELETE,OPTIONS')
  next();
});

// Bootstrap Models
fs.readdirSync(modelsPath).forEach(file => {
  if (~file.indexOf('.js')) require(modelsPath + '/' + file)
})

//Bootstrap routes
fs.readdirSync(routesPath).forEach(file => {
  if (~file.indexOf('.js')) {
    let route = require(routesPath + '/' + file);
    route.setRouter(app);
  }
})

//calling global 404 handler after route

app.use(globalErrorMiddleware.globalNotFoundHandler);

/**
 * Create HTTP server.
 */
const options = {
  hostname: "localhoststarboy",
  key: fs.readFileSync('./certificate/localhoststarboy.key'),
  cert: fs.readFileSync('./certificate/localhoststarboy.crt')
 };
// const server = https.createServer(options,app);
const server = http.createServer(app);
// start listening to http server
console.log(appConfig);
server.listen(appConfig.port);

/**
 * Event listener for HTTP server "error" event.
 */

let onError = (error) => {
  if (error.syscall !== 'listen') {
    logger.error(error.code + ' not equal listen', 'serverOnErrorHandler', 10)
    throw error;
  }

  // handle specific listen errors with friendly messages
  switch (error.code) {
    case 'EACCES':
      logger.error(error.code + ':elavated privileges required', 'serverOnErrorHandler', 10);
      process.exit(1);
      break;
    case 'EADDRINUSE':
      logger.error(error.code + ':port is already in use.', 'serverOnErrorHandler', 10);
      process.exit(1);
      break;
    default:
      logger.error(error.code + ':some unknown error occured', 'serverOnErrorHandler', 10);
      throw error;
  }
}

// error event listening
server.on('error', onError);

/**
 * Event listener for HTTPS server "listening" event.
 */

let onListening = () => {

  let address = server.address();
  let bind = (typeof address === 'string') ? 'pipe ' + address : 'port ' + address.port;
  console.log('Listening on ' + bind);
  logger.info('server listening on port' + address.port, 'serverOnListeningHandler', 10);
  let db = mongoose.connect(appConfig.db.uri, {
    useNewUrlParser: true
  });
}

// success event listening 
server.on('listening', onListening);




// socket io connection handler
// commentSocket.setServerGroup(server);
// end socketio connection handler


// application specific logging, throwing an error, or other logic here
process.on('unhandledRejection', (reason, promise) => {

  console.log('Unhandled Rejection at: Promise', promise, 'reason:', reason);
})


/**
 * database connection settings
 */
mongoose.connection.on('error', function (err) {
  console.log('database connection error');
  logger.error(err,
    'mongoose connection on error handler', 10)

}); // end mongoose connection error

mongoose.connection.on('open', function (err) {
  if (err) {
    console.log("database error");
    logger.error(err, 'mongoose connection open handler', 10)
  } else {
    console.log("database connection open success");
    logger.info("database connection open",
      'database connection open handler', 10)
  }

}); // end mongoose connection open handler


module.exports = app;