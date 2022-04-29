const mongoose = require("mongoose");

const ConversationSchema = new mongoose.Schema({
	participants: [
		{
			type: mongoose.Schema.Types.ObjectId,
			ref: "user",
			required: true,
		},
	],
});

const Conversation = mongoose.model("conversation", ConversationSchema);

module.exports = Conversation;
