// HTTPS Server:
const express = require("express");
const https = require("https");
const http = require("http");
const fs = require("fs");
const multer = require("multer");
const upload = multer();

const app = express();

// This line is from the Node.js HTTPS documentation.
const options = {
  key: fs.readFileSync("sec/server.key"),
  cert: fs.readFileSync("sec/server.crt"),
};

// This will serve the static files in the /public folder on our server
app.use(express.static("public"));

//use bodyParser() to let us get the data from a POST
app.use(express.json());

const textEncoder = new TextEncoder();

app.post(
  "/api/image/add",
  upload.fields([{ name: "image", maxCount: 1 }]),
  (req, res) => {
    if (req.files.image.length) {
      const image = req.files.image[0];
      const name = image.originalname;
      fs.writeFile(`./images/${name}`, image.buffer, function (error) {
        res.send({ error: error?.message, name });
        broadcast(
          textEncoder.encode(JSON.stringify({ type: "took picture", name }))
        );
      });
    } else {
      res.status(400).send({ error: "no files sent" });
    }
  }
);
app.get("/api/image/get", (req, res) => {
  const { name } = req.query;
  if (name) {
    fs.readFile(`./images/${name}`, (error, data) => {
      if (error) {
        res.status(400).send({ error: error?.message });
      } else {
        res.send(data);
      }
    });
  } else {
    res.status(400).send({ error: "no name specified" });
  }
});
app.get("/api/image/list", (req, res) => {
  fs.readdir("./images", (error, files) => {
    if (error) {
      res.status(400).send({ error: error?.message });
    } else {
      files = files.filter((file) => file.endsWith(".jpeg"));
      res.send(files);
    }
  });
});
app.get("/api/image/rename", (req, res) => {
  const { oldName, newName } = req.query;
  if (oldName && newName) {
    fs.rename(`./images/${oldName}`, `./images/${newName}`, (error) => {
      if (error) {
        res.status(400).send({ error: error?.message });
      } else {
        res.send({ name: newName });
      }
    });
  } else {
    res.status(400).send({ error: "no names specified" });
  }
});

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
  console.log("new ws connection");
  ws.on("message", (data) => {
    console.log("ws message received");
    broadcast(data, ws);
  });
  ws.on("close", () => {
    console.log("ws disconnected");
  });
});
