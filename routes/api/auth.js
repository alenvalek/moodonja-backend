const express = require("express");
const { check, validationResult } = require("express-validator");
const User = require("../../models/User.js");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const dotenv = require("dotenv");
const auth = require("../../middleware/auth");
const mongoose = require("mongoose");

dotenv.config({ path: "../../config/.env" });

const authRouter = express.Router();

// @route GET api/auth
// @description Dohvati autentificiranog korisnika
// @access Protected

authRouter.get("/", auth, async (req, res) => {
	console.log("user token: ", req.user.uid);

	try {
		// fetch user data and exclude password
		const user = await User.findById(req.user.uid);
		res.json(user);
	} catch (error) {
		console.log(error.message);
		res.status(500).json({ msg: "Server Error" });
	}
});

// @route POST api/auth
// @description Ulogiraj korisnika i dohvati token
// @access Public

authRouter.post(
	"/",
	[
		check("email", "Molimo unesite validnu e-mail adresu.").isEmail(),
		check("password", "Lozinka je nužna").exists(),
	],
	async (req, res) => {
		const errors = validationResult(req);

		if (!errors.isEmpty()) {
			return res.status(400).json({ errors: errors.array() });
		}

		const { email, password } = req.body;

		try {
			let user = await User.findOne({ email });

			if (!user) {
				return res.status(400).json({ errors: [{ msg: "Pogrešni podaci." }] });
			}

			let isPasswordMatching = await bcrypt.compare(password, user.password);

			if (!isPasswordMatching) {
				return res.status(400).json({ errors: [{ msg: "Pogrešni podaci." }] });
			}

			const payload = {
				uid: user.id,
			};

			jwt.sign(
				payload,
				process.env.JWT_SECRET,
				{
					expiresIn: "1 week",
				},
				(err, token) => {
					if (err) throw err;
					res.json({ token });
				}
			);
		} catch (error) {
			console.log(error.message);
			res.status(500).send("Server Error");
		}
	}
);

module.exports = authRouter;
