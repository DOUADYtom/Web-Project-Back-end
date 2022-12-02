const express = require('express');
const router = express.Router();
const reviewsController = require('../controllers/reviewsController');
const verifyJWT = require('../middlewares/verifyJWT');

router.route('/')
    .post(verifyJWT, reviewsController.createNewReview);

router.route('/monument/')
    .get(reviewsController.getReviewsByMonumentId);

router.use(verifyJWT);

router.route('/user/')
    .get(reviewsController.getReviewsByUserId);

router.route('/:id')
    .put(reviewsController.updateReviewById)
    .delete(reviewsController.deleteReviewById);

module.exports = router;