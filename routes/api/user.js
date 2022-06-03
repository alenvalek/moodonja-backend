const express = require("express");
const { check, validationResult } = require("express-validator");
const User = require("../../models/User.js");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const dotenv = require("dotenv");

dotenv.config({ path: "../../config/.env" });

const userRouter = express.Router();

// @route GET api/users
// @description Dohvatiti sve usere [dev-debug-route]
// @access Public

userRouter.get("/", async (req, res) => {
	try {
		const userList = await User.find();
		return res.json(userList);
	} catch (error) {
		console.log(error.message);
		res.status(500).send("Server Error");
	}
});

// @route POST api/users
// @description Registracija novih korisnika
// @access Public
// @middleware - express-validator za validaciju maila, username-a i lozinke

userRouter.post(
	"/",
	[
		check("username", "Korisničko ime je nužno.").notEmpty(),
		check(
			"username",
			"Korisničko ime mora biti dugačko bar 5 znakova."
		).isLength({ min: 5 }),
		check("email", "Unesite valjanu e-mail adresu.").isEmail(),
		check("password", "Unesite lozinku koja sadrži bar 6 znakova.").isLength({
			min: 6,
		}),
	],
	async (req, res) => {
		console.log("getting request..");
		// pošalji povratnu informaciju ako su postojani errori u requestu
		const errorList = validationResult(req);
		if (!errorList.isEmpty()) {
			return res.status(400).json({ errors: errorList.array() });
		}

		const { username, email, password } = req.body;

		// registriraj korisnika

		try {
			// provjeri ako postoji korisnik s istom e-mail adresom
			let user = await User.findOne({ email });

			if (user) {
				return res
					.status(400)
					.json([{ msg: "Unesen je email koji se već koristi." }]);
			}

			// heširanje lozinke
			const salt = await bcrypt.genSalt(10);
			const hashedPassword = await bcrypt.hash(password, salt);

			user = new User({
				username,
				email,
				password: hashedPassword,
			});

			await user.save();

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

module.exports = userRouter;
