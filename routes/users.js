const express = require('express');
const User = require('../models/user');
const router = express.Router();
const passport = require('passport');

router.get('/register', (req, res) => {
    res.render('users/register')
});

router.post('/register', async (req, res, next) => {
    try {
        const { email, username, password } = req.body;
        const user = new User({ email, username });
        //register method added from passport local mongoose schema
        const registeredUser = await User.register(user, password);
        //to log user in after the user has registered
        req.login(registeredUser, err => {
            if (err) return next(err);
            // req.flash('success', 'Welcome');
            res.redirect('/campgrounds');
        })
    } catch (e) {
        // req.flash('error', e.message);
        res.redirect('/register');
    }
});

router.get('/login', (req, res) => {
    res.render('users/login')
});

router.post('/login', passport.authenticate('local', { failureFlash: true, failureRedirect: '/login' }), (req, res) => {
    req.flash('success', 'welcome back');
    console.log('LOG  req.session ',req.session)
    const redirectUrl = req.session.returnTo || '/campgrounds';
    delete req.session.returnTo;
    res.redirect(redirectUrl);
});

router.get('/logout', (req, res) => {
    req.logout(function (err) {
        if (err) { return next(err); }
        res.redirect('/');
    });
})

module.exports = router;