const express = require('express');
const router = express.Router();
const usersController = require('../controllers/usersController');
const verifyJWT = require('../middlewares/verifyJWT');


router.route('/')
    .get(verifyJWT, usersController.getAllUsers)
    .post(usersController.createNewUser);

router.route('/visited/:id', verifyJWT)
    .get(usersController.getVisitedMonumentsByUserId)
    .post(usersController.addVisitedMonument)
    .delete(usersController.deleteVisitedMonument);

router.route('/toVisit/:id', verifyJWT)
    .post(usersController.addToVisitMonument)
    .delete(usersController.deleteToVisitMonument);

router.route('/:id', verifyJWT)
    .get(usersController.getUserById)
    .patch(usersController.updateUserById)
    .delete(usersController.deleteUserById);

module.exports = router;