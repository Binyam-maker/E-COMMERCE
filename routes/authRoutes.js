const express = require('express');
const router = express.Router();

// controlers
const {login, logout, register} = require('../controller/authController');

router.route('/register').post(register);
router.route('/login').post(login);
router.route('/logout').get(logout);

module.exports = router;