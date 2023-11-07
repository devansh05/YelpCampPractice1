const mongoose = require('mongoose');
const bcrypt = require("bcrypt");
const Schema = mongoose.Schema;

const UserSchema = new Schema({
    email: {
        type: String,
        required: true,
        unique: true
    },
    username: {
        type: String,
        required: [true, 'username cannot be blank.'],
        unique: true
    },
    passwordHash: {
        type: String,
        required: [true, 'Password cannot be blank.'],
    }
});

UserSchema.statics.findUserAndValidate = async function(username, password){
    const foundUser = await this.findOne({username});
    const isValid = await bcrypt.compare(password, foundUser.passwordHash);
    return isValid ? foundUser : false;
}

UserSchema.pre('save', async function(next){
    //this here refers to the function form where save was called
    if(!this.isModified('password')) return next();
    this.password = await bcrypt.hash(this.password, 12);
    next();
})

module.exports = mongoose.model('User', UserSchema);