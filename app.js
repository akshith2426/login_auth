var express = require('express');
var app = express();
var expressLayouts = require('express-ejs-layouts');
var mongoose = require('mongoose');
var bodyParser = require('body-parser');
var flash = require('connect-flash');
var session = require('express-session');
const passport = require('passport');
var request = require('request');
var LocalStrategy = require('passport-local');
const { ensureAuthenticated } = require('./config/auth');
//google
var Membership = require('./models/membership.js');
var GoogleStrategy = require('passport-google-oauth').OAuth2Strategy;
//passport config
require('./config/passport')(passport);

//gmail auth
passport.use(
	new GoogleStrategy(
		{
			clientID: '816784287996-63dkg4b0h6ju9pduksm11dr6libha8j1.apps.googleusercontent.com',
			clientSecret: 'PJ8809-e2P6daWfKQFgWLLbZ',
			callbackURL: 'http://localhost:3000/auth/google/callback'
		},
		function(accessToken, refreshToken, profile, done) {
			Membership.findOrCreate({ providerUserId: profile.id }, function(err, user) {
				return done(err, user);
			});
		}
	)
);
//EJS
app.use(expressLayouts);
app.set('view engine', 'ejs');

mongoose.connect('mongodb://localhost/covid_login', { useNewUrlParser: true, useUnifiedTopology: true });
app.use(bodyParser.urlencoded({ extended: true }));

//express session middleware
app.use(
	session({
		secret: 'keyboard myself',
		resave: true,
		saveUninitialized: true
	})
);

//passport session
app.use(passport.initialize());
app.use(passport.session());
//Connect flash
app.use(flash());

//global variables
app.use(function(req, resp, next) {
	resp.locals.success_msg = req.flash('success_msg');
	resp.locals.error_msg = req.flash('error_msg');
	resp.locals.error = req.flash('error');
	next();
});
//routes
app.use('/', require('./routes/index'));
app.use('/users', require('./routes/users'));

app.get('/results', ensureAuthenticated, function(req, resp) {
	var country = req.query.country;
	var province = req.query.province;
	var url = 'https://covid-api.com/api/reports?region_name=' + country + '&region_province=' + province;
	var world_url = 'https://api.thevirustracker.com/free-api?global=stats';
	request(url, function(error, response, body) {
		if (!error && response.statusCode == 200) {
			var parsedData = JSON.parse(body);
			request(world_url, function(err1, response1, body1) {
				if (!err1 && response1.statusCode == 200) {
					var parsedData1 = JSON.parse(body1);
					resp.render('first', { parsedData: parsedData, parsedData1: parsedData1 });
					console.log('retrieved both state and global API');
				}
			});
		}
	});
});
app.get('/symptoms', ensureAuthenticated, function(req, resp) {
	request('https://covid19-update-api.herokuapp.com/api/v1/articles/symptoms', function(error, response, body) {
		if (!error && response.statusCode == 200) {
			var parsedData = JSON.parse(body);
			resp.render('symptoms', { parsedData: parsedData });
		}
	});
});
app.get('/helpline-numbers', ensureAuthenticated, function(req, resp) {
	request('https://covid-19india-api.herokuapp.com/v2.0/helpline_numbers', function(error, response, body) {
		if (!error && response.statusCode == 200) {
			var parsedData3 = JSON.parse(body);
			resp.render('helpline', { parsedData3: parsedData3 });
		}
	});
});
//google authenticate
app.get('/auth/google', passport.authenticate('google', { scope: [ 'https://www.googleapis.com/auth/plus.login' ] }));

app.get(
	'/auth/google/callback',
	passport.authenticate('google', { successRedirect: '/search', failureRedirect: '/login', session: false }),
	function(req, res) {}
);
app.listen(3000, function() {
	console.log('server started');
});
