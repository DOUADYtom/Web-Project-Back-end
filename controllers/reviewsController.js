const Review = require('../models/Review');
const asyncHandler = require('express-async-handler');

const getReviewsByMonumentId = asyncHandler(async (req, res) => {
    // TODO limit the number of reviews returned
    // TODO sort the reviews by date
    if (!req.params.monumentId) {
        return res.status(400).json({message: "No monumentId find"});
    }
    const monumentId = req.params.monumentId;
    try {
        const reviews = await Review.find({monumentId: monumentId}).lean().exec();
        if (!reviews) {
            return res.status(400).json({message: `No reviews for the monument ${monumentId}`});
        }
        res.status(200).json(reviews);
    } catch {
        return res.status(500).json({message: "Internal database error"});
    }
});

const createNewReview = asyncHandler(async (req, res) => {
    if (!req.params.monumentId) {
        return res.status(400).json({message: "No monumentId find"});
    }
    if (!req.body.userId) {
        return res.status(400).json({message: "No userId find"});
    }
    if (!req.body.rating) {
        return res.status(400).json({message: "No rating find"});
    }
    if (!req.body.comment) {
        return res.status(400).json({message: "No comment find"});
    }
    const monumentId = req.params.monumentId;
    const userId = req.body.userId;
    const rating = req.body.rating;
    const comment = req.body.comment;
    const review = {
        monumentId: monumentId,
        userId: userId,
        rating: rating,
        comment: comment
    };
    try {
        const createdReview = await Review.create(review);
        if (!createdReview) {
            return res.status(400).json({message: `The review has not been created`});
        }
        res.status(201).json({message: `The review has been created`});
    } catch {
        return res.status(500).json({message: "Internal database error"});
    }
});

module.exports = {
    getReviewsByMonumentId,
    createNewReview
}

