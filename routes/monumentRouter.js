const express = require('express');
const router = express.Router();
const monumentsController = require('../controllers/monumentsController');
const verifyJWT = require('../middlewares/verifyJWT');

router.route('/')
    .get(monumentsController.getAllMonuments)
    .post(verifyJWT, monumentsController.createNewMonument);

router.route('/:id')
    .get(monumentsController.getMonumentById)
    .patch(verifyJWT, monumentsController.updateMonumentById)
    .delete(verifyJWT, monumentsController.deleteMonumentById);

module.exports = router;