// HTTP Server:
const express = require("express");
const app = express();

// This will serve the static files in the /public folder on our server
app.use(express.static("public"));

const server = app.listen(3000, function () {
  console.log("Your app is listening on port " + server.address().port);
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
