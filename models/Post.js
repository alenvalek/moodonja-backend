const mongoose = require("mongoose");

const postSchema = new mongoose.Schema(
	{
		author: {
			type: mongoose.Schema.Types.ObjectId,
			ref: "user",
			required: true,
		},
		body: {
			type: String,
			required: true,
		},
		postLocation: {
			type: String,
		},
		postLikes: [
			{
				user: {
					type: mongoose.Schema.Types.ObjectId,
					ref: "user",
					required: true,
				},
			},
		],
		postComments: [
			{
				user: {
					type: mongoose.Schema.Types.ObjectId,
					ref: "user",
					required: true,
				},

				createdAt: {
					type: Date,
					required: true,
					default: Date.now,
				},
				body: {
					type: String,
					required: true,
				},
			},
		],
	},
	{
		timestamps: true,
	}
);

const Post = mongoose.model("message", postSchema);

module.exports = Post;
