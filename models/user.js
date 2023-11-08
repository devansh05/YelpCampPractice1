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
    password: {
        type: String,
        required: [true, 'Password cannot be blank.'],
    }
});

UserSchema.statics.findUserAndValidate = async function(username, password){
    const foundUser = await this.findOne({username});
    const isValid = await bcrypt.compare(password, foundUser.password);
    return isValid ? foundUser : false;
}


module.exports = mongoose.model('User', UserSchema);