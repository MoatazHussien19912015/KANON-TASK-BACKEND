const mongoose = require('mongoose');
const jwt = require('jsonwebtoken');
const UserSchema = mongoose.Schema({
    name: {type: String, required: true},
    email: {type: String, required: true, unique: true},
    password: {type: String, required: true},
    coins: {type: Number, default: 20}
});


UserSchema.methods.generate_jwt_token = function(){     // generating the jwt token based on the id of the user
    return jwt.sign({id: this._id}, '123456', {expiresIn:'7d'});
    }

const model = mongoose.model('User', UserSchema);

module.exports = model;