const express = require('express');
const router = express.Router();
const reviewsController = require('../controllers/reviewsController');

router.route('/')
    .get(reviewsController.getReviewsByMonumentId)
    .post(reviewsController.createNewReview);

module.exports = router;