module.exports.isLoggedIn = (req, res, next) => {
    console.log('LOG MIDDLEWARE req.isAuthenticated()  ',req.isAuthenticated())
    if(!req.isAuthenticated()){
        req.session.cookie.path = req._parsedOriginalUrl.path;
        req.flash('failure', 'You must be signed in.');
        return res.redirect('/login');
    }
    next();
}