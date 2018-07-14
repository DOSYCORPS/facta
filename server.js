"use strict";
{
  const version = 'v1';
  const service = 'facta';
  const TIMEOUT = 15000;

  process.on('unhandledRejection', error => {
    const event = "Received unhandled promise rejection";
    error = {error,message:error+'',stack:error.stack.split('\n').map(l => l.trim())};
    console.log("\n");
    console.log(JSON.stringify({service,event,error}));
  });
  process.on('uncaughtException', error => {
    const event = "Received uncaught exception";
    error = {error,message:error+'',stack:error.stack.split('\n').map(l => l.trim())};
    console.log("\n");
    console.log(JSON.stringify({service,event,error}));
  });

  const exp = require('express');
  const path = require('path');
  const wrapAsync = require('./wrapAsync.js');
  const errors = require('./errors.js');

  const app = exp();
  const port = process.env.PORT || 8080;

  // STATIC 
    app.use("/", exp.static(path.join(__dirname, "public")));

  const server = app.listen(port, () => {
    const currentTime = new Date;
    const serverLive = `Server up at ${currentTime} on port ${port}. Timeout: ${TIMEOUT}`;
    console.log(JSON.stringify({serverLive,timeout:TIMEOUT,port,currentTime}));
    return true;
  });

  server.setTimeout(TIMEOUT);

  module.exports = server;
}
