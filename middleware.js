module.exports.isLoggedIn = (req, res, next) => {
    if(!req.isAuthenticated()){
        req.session.cookie.path = req._parsedOriginalUrl.path;
        req.flash('failure', 'You must be signed in.');
        return res.redirect('/login');
    }
    next();
}