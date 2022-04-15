const express = require("express");
const cors = require("cors");
const http = require("http");
const dotenv = require("dotenv");

// Initizalization
const app = express();
const server = http.createServer(app);
const io = require("socket.io")(server, { cors: { origin: "*" } });

// config and middleware
dotenv.config({ path: "./config/.env" });
app.use(express.json({ extended: false }));
app.use(cors());

const PORT = process.env.PORT || 5000;

// express

app.get("/", (req, res) => {
	res.send("<h1>Hello world</h1>");
});

server.listen(PORT, () => {
	console.log(`[Server] listening for requests: http://localhost:${PORT}`);
});

// sockets

io.on("connection", (socket) => {
	console.log("a user connected");
});

io.on("disconnect", (socket) => {
	console.log("a user disconnected");
});
