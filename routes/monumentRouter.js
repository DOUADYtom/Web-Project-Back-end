const express = require('express');
const router = express.Router();
const monumentController = require('../controllers/monumentsContoller');

router.route('/')
    .get(monumentController.getAllMonuments)
    .post(monumentController.createNewMonument);

router.route('/:id')
    .get(monumentController.getMonumentById)
    .patch(monumentController.updateMonumentById)
    .delete(monumentController.deleteMonumentById);

module.exports = router;