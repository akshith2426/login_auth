module.exports = {
	ensureAuthenticated: function(req, resp, next) {
		if (req.isAuthenticated()) {
			return next();
		}
		req.flash('error_msg', 'Please log in to view this resource');
		resp.redirect('/users/login');
	}
};
