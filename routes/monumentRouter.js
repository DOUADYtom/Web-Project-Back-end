const express = require('express');
const router = express.Router();
const monumentsController = require('../controllers/monumentsController');
const verifyJWT = require('../middlewares/verifyJWT');

router.use(verifyJWT);


router.route('/')
    .get(monumentsController.getAllMonuments)
    .post(monumentsController.createNewMonument);

router.route('/:id')
    .get(monumentsController.getMonumentById)
    .patch(monumentsController.updateMonumentById)
    .delete(monumentsController.deleteMonumentById);

module.exports = router;