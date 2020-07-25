const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
var passprot = require('passport');
//User model
const User = require('../models/User');
const passport = require('passport');
//Login Page
router.get('/login', (req, resp) => {
	resp.render('login');
});
//Register Page
router.get('/register', (req, resp) => {
	resp.render('register');
});

//Register Handle
router.post('/register', function(req, resp) {
	const { name, age, email, password, password2 } = req.body;
	let errors = [];
	//check requried feilds
	if (!name || !age || !email || !password || !password2) {
		errors.push({ msg: 'Please Fill In All Fields' });
	}
	//check user greater than 18 years
	if (age < 18) {
		errors.push({ msg: 'You are Under 18 years,Please enter a Valid Age' });
	}
	//check passwords match
	if (password !== password2) {
		errors.push({ msg: "Password Doesn't Match" });
	}

	//check password 6 characters long
	if (password.length < 6) {
		errors.push({ msg: 'Password should be atleast 6 characters long' });
	}
	if (errors.length > 0) {
		resp.render('register', {
			errors,
			name,
			age,
			email,
			password,
			password2
		});
	} else {
		//Validation is passed
		User.findOne({
			email: email
		}).then((user) => {
			if (user) {
				//user exists
				errors.push({ msg: 'Email is already registered' });
				resp.render('register', {
					errors,
					name,
					age,
					email,
					password,
					password2
				});
			} else {
				const newUser = new User({
					name,
					age,
					email,
					password
				});
				//Hash Password
				bcrypt.genSalt(10, (err, salt) => {
					bcrypt.hash(newUser.password, salt, (err, hash) => {
						if (err) {
							throw err;
						}
						//Set password to hashed
						newUser.password = hash;
						//Save User
						newUser
							.save()
							.then((user) => {
								req.flash('success_msg', 'You are now registered and you can login');
								resp.redirect('/users/login');
							})
							.catch((err) => {
								console.log(err);
							});
					});
				});
			}
		});
	}
});

//login routes
router.post('/login', (req, resp, next) => {
	passport.authenticate('local', {
		successRedirect: '/search',
		failureRedirect: '/users/login',
		failureFlash: true
	})(req, resp, next);
});

//logout handle
router.get('/logout', (req, resp) => {
	req.logout();
	req.flash('success_msg', 'You are logged Out');
	resp.redirect('/users/login');
});
module.exports = router;
