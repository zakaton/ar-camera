// HTTPS Server:
const express = require("express");
const https = require("https");
const http = require("http");
const fs = require("fs");

const app = express();

// This line is from the Node.js HTTPS documentation.
const options = {
  key: fs.readFileSync("sec/server.key"),
  cert: fs.readFileSync("sec/server.crt"),
};

// This will serve the static files in the /public folder on our server
app.use(express.static("public"));

// Create an HTTP service.
http.createServer(app).listen(80, () => {
  console.log("http server listening on 80");
});
// Create an HTTPS service identical to the HTTP service.
const server = https.createServer(options, app).listen(443, () => {
  console.log("https server listening on 443");
});

// Websocket Server:
// We are using the external library 'ws' to set up the websockets on the server
// https://www.npmjs.com/package/ws
// In our code this is stored in the variable WebSocket.
var WebSocket = require("ws");

// Connect our Websocket server to our server variable to serve requests on the same port:
var wsServer = new WebSocket.Server({ server });

// This function will send a message to all clients connected to the websocket:
function broadcast(data, ws) {
  wsServer.clients.forEach((client) => {
    if (client !== ws && client.readyState === WebSocket.OPEN) {
      client.send(data);
    }
  });
}

wsServer.on("connection", (ws) => {
  ws.on("message", (data) => {
    console.log("Message Received:");
    broadcast(data, ws);
  });
  ws.on("close", () => {
    console.log("Disconnected:");
  });
});
