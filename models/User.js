const mongoose = require("mongoose");

const UserSchema = new mongoose.Schema(
	{
		username: {
			type: String,
			minlength: 5,
			required: true,
			unique: true,
		},
		email: {
			type: String,
			required: true,
			unique: true,
		},
		password: {
			type: String,
			minlength: 6,
			required: true,
		},
		photoURL: {
			type: String,
			default: "",
		},
		bio: {
			type: String,
			default: "",
		},
		friends: [
			{
				type: mongoose.Schema.Types.ObjectId,
				ref: "user",
			},
		],
	},
	{
		timestamps: true,
	}
);

const User = mongoose.model("user", UserSchema);

module.exports = User;
