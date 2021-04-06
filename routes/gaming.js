const router = require('express').Router();
const jwt = require('./../middlewares/jwt-auth').check_jwt;
const User = require('./../models/user-model');

const reel1 = ['cherry', 'lemon', 'apple', 'lemon', 'banana', 'banana', 'lemon', 'lemon'];
const reel2 = ['lemon', 'apple', 'lemon', 'lemon', 'cherry', 'apple', 'banana', 'lemon'];
const reel3 = ['lemon', 'apple', 'lemon', 'apple', 'cherry', 'lemon', 'banana', 'lemon'];

const play = (coins) => {   
    coins -= 1;
    const r1 = Math.floor(Math.random() * 8);   // generating random number from 0 to 7
    const r2 = Math.floor(Math.random() * 8);
    const r3 = Math.floor(Math.random() * 8);
    const arr = [reel1[r1], reel2[r2], reel3[r3]];

    let result;
    if (arr.filter(x => x == 'cherry').length == 3) { result = 50; }
    else if (arr.filter(x => x == 'cherry').length == 2 && arr[1] == 'cherry') { result = 40; } // making sure the two elements are in order by checking the second element of the array
    else if (arr.filter(x => x == 'apple').length == 3) { result = 20; }
    else if (arr.filter(x => x == 'apple').length == 2 && arr[1] == 'apple') { result = 10; }
    else if (arr.filter(x => x == 'banana').length == 3) { result = 15; }
    else if (arr.filter(x => x == 'banana').length == 2 && arr[1] == 'banana') { result = 5; }
    else if (arr.filter(x => x == 'lemon').length == 3) { result = 3 }
    else { result = 0; }
    coins += result;
    return { arr, coins, result };
};



router.get('/play', jwt, (req, res) => {
    if (req.user_id) {
        User.findById(req.user_id).then(user => {
            if (user) {
                const { arr, coins, result } = play(user.coins);    // destructing the returned object from the play method and passing the coins of the user
                user.coins = coins;
                user.save().then(saved_user => {
                    return res.status(200).json({
                        success: true,
                        payload: { user: { name: saved_user.name, email: saved_user.email, coins: saved_user.coins }, arr, result }
                    });
                }).catch(err => { console.log(err); return res.status(500).json({ success: false, message: err }); });

            } else {
                return res.status(404).json({ success: false, message: 'user not found' });
            }
        }).catch(err => { console.log(err); return res.status(500).json({ success: false, message: err }); });
    }
});



module.exports = router;