const express = require("express");
const User = require("../../models/User");
const Post = require("../../models/Post");
const auth = require("../../middleware/auth");
const dotenv = require("dotenv");

dotenv.config({ path: "../../config/.env" });

const postsRouter = express.Router();

// @route POST api/posts
// @description Kreiranje novog posta
// @access Protected

postsRouter.post("/", [auth], async (req, res) => {
	const { body, postLocation } = req.body;
	try {
		let postObj = {
			author: req.user.uid,
			body,
		};

		if (postLocation) postObj.postLocation = postLocation;

		const newPost = new Post(postObj);

		const post = await newPost.save();

		res.json(post);
	} catch (error) {
		console.log(error);
		res.status(500).send("Server Error");
	}
});

// @route GET api/posts
// @description Hvatanje svih postova
// @access Protected
// TODO: samo postova prijatelja

postsRouter.get("/", [auth], async (req, res) => {
	const posts = await Post.find({}).populate("author").sort({ createdAt: -1 });
	res.json(posts);
});

// @route GET api/posts/:id
// @description Hvatanje jednog posta
// @access Protected
// TODO: samo postova prijatelja

postsRouter.get("/:id", [auth], async (req, res) => {
	const { id } = req.params;
	try {
		const post = await Post.findOne({ _id: id });
		if (!post) {
			return res.status(401).json({ msg: "Nepostojeći post." });
		}
		res.json(post);
	} catch (error) {
		console.log(error);
		res.status(500).send("Server Error");
	}
});

// @route DELETE api/posts/:id
// @description Brisanje posta
// @access Protected

postsRouter.delete("/:id", [auth], async (req, res) => {
	const { id } = req.params;
	try {
		const post = await Post.findOne({ _id: id });
		if (!post) {
			return res.status(401).json({ msg: "Nepostojeći post." });
		}

		if (post.author.toString() !== req.user.uid)
			return res
				.status(401)
				.json({ msg: "Nemate privilegije za izvršiti ovu akciju." });

		await post.remove();
		res.json({ msg: "Post deleted" });
	} catch (error) {
		console.log(error);
		res.status(500).send("Server Error");
	}
});

// @route PATCH api/like/:id
// @description Likeanje i unlikeanje posta
// @access Protected

postsRouter.patch("/like/:id", [auth], async (req, res) => {
	const { id } = req.params;

	try {
		const post = await Post.findOne({ _id: id });
		if (!post) {
			return res.status(401).json({ msg: "Nepostojeći post." });
		}
		if (post.postLikes.some((like) => like.user.toString() === req.user.uid)) {
			const position = post.postLikes.findIndex(
				(like) => like.user.toString() === req.user.uid
			);
			post.postLikes.splice(position, 1);
		} else {
			post.postLikes.unshift({ user: req.user.uid });
		}

		await post.save();
		res.json(post.postLikes);
	} catch (error) {
		console.log(error);
		res.status(500).send("Server Error");
	}
});

// @route PATCH api/comment/:id
// @description Komentiranje posta
// @access Protected

postsRouter.post("/comment/:id", [auth], async (req, res) => {
	const { id } = req.params;
	const { body } = req.body;
	try {
		const post = await Post.findOne({ _id: id });

		if (!post) {
			return res.status(401).json({ msg: "Nepostojeći post." });
		}

		const comment = {
			user: req.user.uid,
			body: body,
		};

		post.postComments.unshift(comment);

		post.save();

		res.json(post.postComments);
	} catch (error) {
		console.log(error);
		res.status(500).send("Server Error");
	}
});

// @route DELETE api/comment/:id/:comment_id
// @description Brisanje komentara posta
// @access Protected

postsRouter.delete("/comment/:id/:comment_id", [auth], async (req, res) => {
	const { id, comment_id } = req.params;

	try {
		const post = await Post.findOne({ _id: id });

		if (!post) {
			return res.status(401).json({ msg: "Nepostojeći post." });
		}

		const comment = post.postComments.find(
			(comment) => comment.id.toString() === comment_id
		);

		if (!comment) {
			return res.status(401).json({ msg: "Nepostojeći komentar." });
		}

		const location = post.postComments.indexOf(comment);
		post.postComments.splice(location, 1);
		await post.save();
		res.json(post);
	} catch (error) {
		console.log(error);
		res.status(500).send("Server Error");
	}
});

module.exports = postsRouter;
