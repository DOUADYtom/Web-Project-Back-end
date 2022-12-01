const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');
const loginLimiter = require('../middlewares/errorHandler');

router.route('/')
    .post(loginLimiter, authController.login);

router.route('/refresh')
    .get(authController.refresh);

router.route('/logout')
    .post(authController.logout);

module.exports = router;