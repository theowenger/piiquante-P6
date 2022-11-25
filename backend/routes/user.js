const express = require('express');
const router = express.Router();

const userCtrl = require('../controllers/user.js');
const auth = require('../middleware/auth.js');


router.post('/signup', userCtrl.signup);
router.post('/login', userCtrl.login);


module.exports = router;