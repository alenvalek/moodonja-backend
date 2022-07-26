const express = require("express");
const cors = require("cors");
const http = require("http");
const dotenv = require("dotenv");
const connectToDb = require("./config/db");
const { Server } = require("socket.io");

// API routes
const userRouter = require("./routes/api/user.js");
const authRouter = require("./routes/api/auth.js");
const postsRouter = require("./routes/api/post.js");
const User = require("./models/User");

// Initizalization
const app = express();
const server = http.createServer(app);
const io = new Server(server, { cors: { origin: "*" } });

// config and middleware
dotenv.config({ path: "./config/.env" });
app.use(express.json({ extended: false }));
app.use(cors());
connectToDb();

const PORT = process.env.PORT || 5000;

// express
app.use("/users", userRouter);
app.use("/auth", authRouter);
app.use("/posts", postsRouter);

// sockets

let avaliableUsers = [];

io.on("connection", (socket) => {
	socket.on("disconnect", () => {
		console.log("user:", socket.id, "left");
		avaliableUsers = avaliableUsers.filter(
			(user) => user.socketID !== socket.id
		);
	});

	socket.on("send-msg", (data) => {
		socket.broadcast.emit("receive-msg", data);
	});

	socket.on("chat-search", (data) => {
		let randomUser = {};
		let currentUser = {
			userID: data,
			socketID: socket.id,
		};

		let userElem = avaliableUsers.push({ userID: data, socketID: socket.id });
		setTimeout(() => {
			const avaliableUsersSec = avaliableUsers.filter(
				(user) => user.userID !== data
			);
			randomUser =
				avaliableUsersSec[Math.floor(Math.random() * avaliableUsersSec.length)];
			if (!randomUser) {
				return socket.emit("notFound-chat", { msg: "No users avaliable" });
			}

			avaliableUsers.splice(avaliableUsers.indexOf(userElem, 1));
			socket.emit("found-chat", { recepient: randomUser });
			socket
				.to(randomUser.socketID)
				.emit("found-chat", { recepient: currentUser });
		}, 5000);
	});
	socket.on("private-chat-send", (data) => {
		socket
			.to(data.socketID)
			.emit("private-chat-receive", { body: data.body, user: data.userID });
	});

	socket.on("send-friend-request", (data) => {
		console.log(data);
		socket.to(data.socketID).emit("receive-friend-request");
	});

	socket.on("accept-friend-request", async (data) => {
		let userMe = await User.findOne({ _id: data.userID });
		let userYou = await User.findOne({ _id: data.recepientUserID });
		userMe.friends.push(data.recepientUserID);
		userYou.friends.push(data.userID);
		await userMe.save();
		await userYou.save();
		socket.to(data.socketID).emit("accepted-friend-request");
	});

	socket.on("private-chat-disconnect", (data) => {
		socket.to(data.socketID).emit("recepeint-remove");
	});
});

server.listen(PORT, () => {
	console.log(`[Server] listening for requests: http://localhost:${PORT}`);
});
