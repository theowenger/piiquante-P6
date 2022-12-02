const express = require('express');
const router = express.Router();

const userCtrl = require('../controllers/user.js');
const auth = require('../middleware/auth.js');
const password = require('../middleware/password.js');


router.post('/signup',password, userCtrl.signup);
router.post('/login', userCtrl.login);


module.exports = router;