const jwt = require("jsonwebtoken");
const dotenv = require("dotenv");

dotenv.config({ path: "../config/.env" });

const auth = (req, res, next) => {
	// get token from header
	const token = req.header("x-auth-token");

	// check if token exists
	if (!token) {
		return res.status(401).json({ msg: "Pogreška kod autorizacije." });
	}

	// verify token
	try {
		const decodedToken = jwt.verify(token, process.env.JWT_SECRET);
		req.user = decodedToken;
		next();
	} catch (error) {
		res.status(401).json({ msg: "Nevažeći token." });
	}
};

module.exports = auth;
