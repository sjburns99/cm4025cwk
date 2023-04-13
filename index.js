const path = require('path');
const express = require('express');
const app = express();

const { MongoClient } = require("mongodb");
const dir = path.join(__dirname, "frontend");
const backendScripts = require(path.join(dir, "../backend/script.js"));
const bcrypt = require("bcrypt");
const saltRounds = 10;
const session = require("express-session");
const config=require(path.join(dir, "../backend/config.js"));
const PORT = config.port;
const uri = config.mongoUri;


const client = new MongoClient(uri);

app.use(express.static(dir));
app.use(session({
	secret: config.sessionSecretKey,
	resave: false,
	saveUninitialized: false,
}));

app.get("/", function(req, res) {
	if(req.session.user) {
		console.log("Current User: " + req.session.user);
	}
	else {
		console.log("Not Logged In");
	}
	res.render("/index.html", {user: req.session.user});
});

app.use(express.urlencoded({
	extended: true
}));

app.post("/api/submitRegistration", function(req, res) {
	var email = req.body.email;
	var forename = req.body.forename;
	var surname = req.body.surname;
	var job = req.body.job;
	var seniority = req.body.seniority;
	var pass1 = req.body.pass;
	var pass2 = req.body.conPass;
	
	if(pass1.length < 8) {
		//Password fields do have a min length but that apparently doesn't work on all browsers
		console.log("Length too short");
		res.redirect("/register.html");
	}
	
	//Hash and salt passwords	
	hash = bcrypt.hashSync(pass1, bcrypt.genSaltSync(saltRounds));
	
	if(backendScripts.checkPasswordMatch(pass1, pass2)) {
		async function run() {
			try {
				var dbo = client.db("db");
				var myobj = { email: email, forename: forename, surname: surname, job: job, seniority: seniority, password: hash };
				await dbo.collection("users").insertOne(myobj, function(err,res) {
					if (err) {
						console.log(err);
						throw err;
					}
			console.log("User inserted");
		});
		console.log("DB operations complete");
			} finally {
				await client.close();
			}
		}
		run().catch(console.error);
		res.redirect("/register.html");
	}
	else {
		//Send message about password mismatch via res.send
		console.log("Password Mismatch");
		res.redirect("/register.html");
	}
});

app.post("/api/submitLogin", function(req, res) {
	var email = req.body.email;
	var pass = req.body.pass;

	async function run() {
		try {
			const dbo = client.db("db");
			const result = await dbo.collection("users").findOne({email: email}, {projection: {_id: 0, email: 1, password: 1}});
			return result;
		} catch(err) {
			console.log(err)
		}
	}	
	
	run()
	.then((result) => {
		console.log(result)
		bcrypt.compare(pass, result.password, function(err, isMatch) {
			console.log("Pass Match: " + isMatch);
			if(isMatch) {
				//Setup session
				req.session.user = result.email;
				res.redirect("/login.html");
			}
			else {
				res.redirect("/login.html");
			}
		});
	});
});

app.use(function (req, res, next) {
	res.send("Error 404 - Page Not Found");
});

app.listen(PORT, function () {
	console.log("Listening on http://localhost:"+PORT+"/");
});