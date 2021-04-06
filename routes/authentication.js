const router = require('express').Router();
const joi = require('@hapi/joi');
const bcrypt = require('bcryptjs');
const User = require('./../models/user-model');
const jwt = require('./../middlewares/jwt-auth').check_jwt;
router.post('/sign-up', (req, res) => {

    const schema = joi.object({ name: joi.string().trim().required(), email: joi.string().email().required(), password: joi.string().required() });

    const { error, value } = schema.validate({ name: req.body.name, email: req.body.email, password: req.body.password });
    if (error) {
        return res.status(400).json({ success: false, message: error.details[0].message });
    }
    User.find({ email: req.body.email }).then(users => {
        if (users.length) {
            return res.status(404).json({ success: false, message: 'email is already used' });
        } else {
            const pass = bcrypt.hashSync(req.body.password, 10);
            req.body.password = pass;
            const new_user = new User(req.body);
            new_user.save().then(saved_user => {
                return res.status(200).json({ success: true, token: saved_user.generate_jwt_token() });
            }).catch(err => { console.log(err); return res.status(500).json({ success: false, message: err }); });
        }
    }).catch(err => { console.log(err); return res.status(500).json({ success: false, message: err }); });
});


router.post('/sign-in', (req, res) => {

    const schema = joi.object({ email: joi.string().required(), password: joi.string().required() });

    const { error, value } = schema.validate({ email: req.body.email, password: req.body.password });
    if (error) {
        return res.status(400).json({ success: false, message: error.details[0].message });
    }
    User.findOne({ email: req.body.email }).then(user => {
        if (user) {
            const check_password = bcrypt.compareSync(req.body.password, user.password);
            if (check_password) {
                return res.status(200).json({ success: true, token: user.generate_jwt_token() });
            }
            else {
                return res.status(404).json({ success: false, message: 'wrong email or password' });
            }
        } else {
            return res.status(404).json({ success: false, message: 'wrong email or password' });
        }
    }).catch(err => { console.log(err); return res.status(500).json({ success: false, message: err }); });

});

router.get('/profile', jwt, (req, res) => {
    if (req.user_id) { 
        User.findById(req.user_id).then(user => {   // find the user by his id which is added by the middleware to the request object
            if (user) { // returning the user's data except the password
                return res.status(200).json({ success: true, user: { name: user.name, email: user.email, coins: user.coins } })
            } else {
                return res.status(404).json({ success: false, message: 'user not found' });
            }
        }).catch(err => { console.log(err); return res.status(500).json({ success: false, message: err }); });
    }
});




module.exports = router;