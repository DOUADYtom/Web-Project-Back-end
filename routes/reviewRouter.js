const express = require('express');
const router = express.Router();
const reviewsController = require('../controllers/reviewsController');
const verifyJWT = require('../middlewares/verifyJWT');

router.route('/')
    .get(reviewsController.getReviewsByMonumentId)
    .post(verifyJWT, reviewsController.createNewReview);

module.exports = router;