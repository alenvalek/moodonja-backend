const mongoose = require("mongoose");
const dotenv = require("dotenv");

dotenv.config();

const connectToDb = async () => {
	try {
		await mongoose.connect(process.env.MONGO_URI, {
			useNewUrlParser: true,
			useUnifiedTopology: true,
		});
		console.log("[DB] MongoDB Connection Established");
	} catch (err) {
		console.log(err.message);
		process.exit(1);
	}
};

module.exports = connectToDb;
