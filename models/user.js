const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const passportLocalMongoose = require('passport-local-mongoose');
const bcrypt = require('bcryptjs');

const UserSchema = new Schema({
    email: {
        type: String,
        required: true,
        unique: true
    },
    username: {
        type: String,
        required: true,
    },
    password: {
        type: String,
        required: true,
    },
});

// Password hashing middleware
UserSchema.pre('save', async function(next) {
    if (this.isModified('password')) {
        console.log('LOG Password - ', this.password)
        // this.password = await bcrypt.hash(this.password, 10);
    }
    next();
});

// UserSchema.methods.comparePassword = function(candidatePassword) {
//     return bcrypt.compare(candidatePassword, this.password);
// };

UserSchema.plugin(passportLocalMongoose);

module.exports = mongoose.model('User', UserSchema);