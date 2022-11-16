const express = require('express');
const router = express.Router();
const monumentController = require('../controllers/monumentsContoller');

router.route('/')
    .get()
    .post()
    .patch()
    .delete()

module.exports = router;