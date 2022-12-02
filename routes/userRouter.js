const express = require('express');
const router = express.Router();
const usersController = require('../controllers/usersController');
const verifyJWT = require('../middlewares/verifyJWT');


router.route('/')
    .get(verifyJWT, usersController.getAllUsers)
    .post(usersController.createNewUser);

router.use(verifyJWT);

router.route('/visited/:id')
    .post(usersController.addVisitedMonument)
    .delete(usersController.deleteVisitedMonument);

router.route('/toVisit/:id')
    .post(usersController.addToVisitMonument)
    .delete(usersController.deleteToVisitMonument);

router.route('/:id')
    .get(usersController.getUserById)
    .patch(usersController.updateUserById)
    .delete(usersController.deleteUserById);

module.exports = router;