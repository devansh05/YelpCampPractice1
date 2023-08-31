const LocalStrategy = require('passport-local').Strategy;
const User = require('../models/user');

module.exports = function(passport) {
    passport.use(new LocalStrategy(
        { usernameField: 'username', email: 'email' },
        async ( username, password, done) => {
            try {
                const user = await User.findOne({ username: username });
                if (!user) return done(null, false, { message: 'No user found.' });
                // const emailTemp = await User.findOne({ email: email });
                // if (!emailTemp) return done(null, false, { message: 'No email found.' });

                return done(null, user);
                // if (await user.comparePassword(password)) {
                // } else {
                //     return done(null, false, { message: 'Incorrect password.' });
                // }
            } catch (err) {
                return done(err);
            }
        }
    ));

    passport.serializeUser((user, done) => {
        done(null, user.id);
    });

    passport.deserializeUser(async (id, done) => {
        try {
            const user = await User.findById(id);
            done(null, user);
        } catch (err) {
            done(err, null);
        }
    });
};