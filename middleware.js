module.exports.isLoggedIn = (req, res, next) => {
    if(!req.session.user_id){
        req.session.destroy();
        console.log('LOG ERROR. YOU ARE NOT LOGGED IN. PLEASE LOGIN AGAIN.')
        return res.redirect('/login');
    }
    next();
}