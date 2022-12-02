const express = require('express');
const router = express.Router();
const usersController = require('../controllers/usersController');
const verifyJWT = require('../middlewares/verifyJWT');


router.route('/')
    .get(verifyJWT, usersController.getAllUsers)
    .post(usersController.createNewUser);

router.use(verifyJWT);

router.route('/visited/:id')
    .get(usersController.getVisitedMonuments)
    .post(usersController.addVisitedMonument)
    .delete(usersController.deleteVisitedMonument);

router.route('/toVisit/:id')
    .get(usersController.getToVisitMonuments)
    .post(usersController.addToVisitMonument)
    .delete(usersController.deleteToVisitMonument);

router.route('/:id')
    .get(usersController.getUserById)
    .patch(usersController.updateUserById)
    .delete(usersController.deleteUserById);

module.exports = router;