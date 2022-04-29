const express = require("express");
const cors = require("cors");
const http = require("http");
const dotenv = require("dotenv");
const connectToDb = require("./config/db");

// API routes
const userRouter = require("./routes/api/user.js");

// Initizalization
const app = express();
const server = http.createServer(app);
const io = require("socket.io")(server, { cors: { origin: "*" } });

// config and middleware
dotenv.config({ path: "./config/.env" });
app.use(express.json({ extended: false }));
app.use(cors());
connectToDb();

const PORT = process.env.PORT || 5000;

// express
app.use("/users", userRouter);

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
