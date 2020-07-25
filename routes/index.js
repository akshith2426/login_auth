const express = require('express');
const router = express.Router();
const { ensureAuthenticated } = require('../config/auth');
//welcome page
router.get('/', (req, resp) => {
	resp.render('welcome');
});
//dashboard
router.get('/search', ensureAuthenticated, (req, resp) => {
	resp.render('search'),
		{
			name: req.user.name
		};
});
module.exports = router;
