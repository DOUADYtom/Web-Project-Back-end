const express = require('express');
const router = express.Router();
const monumentsController = require('../controllers/monumentsController');

router.route('/')
    .get(monumentsController.getAllMonuments)
    .post(monumentsController.createNewMonument);

router.route('/:id')
    .get(monumentsController.getMonumentById)
    .patch(monumentsController.updateMonumentById)
    .delete(monumentsController.deleteMonumentById);

module.exports = router;