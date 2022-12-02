const Review = require('../models/Review');
const asyncHandler = require('express-async-handler');

// Get all reviews
// @route GET /review/user/:userId
// @access Private user, admin

const getReviewsByUserId = asyncHandler(async (req, res) => {
    const limit = req.query.limit ? parseInt(req.query.limit) : undefined;
    const sort = req.query.sort ? req.query.sort : "date";
    const sortType = req.query.sortType ? parseInt(req.query.sortType) : -1;
    
    const sortBy = sortByType(sort, sortType); 

    if (!req.params.userId) {
        return res.status(400).json({message: "No userId find"});
    }
    const userId = req.params.userId;
    try {
        const reviews = await Review.find({userId: userId}).sort(sortBy).limit(limit).lean();
        if (!reviews) {
            return res.status(400).json({message: `No reviews for the user ${userId}`});
        }
        res.status(200).json(reviews);
    } catch {
        return res.status(500).json({message: "Internal database error"});
    }
});

// Get all reviews by monumentId
// @route GET /review/:monumentId
// @access Public

const getReviewsByMonumentId = asyncHandler(async (req, res) => {
    const limit = req.query.limit ? parseInt(req.query.limit) : undefined;
    const sort = req.query.sort ? req.query.sort : "date";
    const sortType = req.query.sortType ? parseInt(req.query.sortType) : -1;
    
    const sortBy = sortByType(sort, sortType); 

    if (!req.params.monumentId) {
        return res.status(400).json({message: "No monumentId find"});
    }   
    const monumentId = req.params.monumentId;
    try {
        const reviews = await Review.find({monumentId: monumentId}).sort(sortBy).limit(limit).lean();
        if (!reviews) {
            return res.status(400).json({message: `No reviews for the monument ${monumentId}`});
        }
        res.status(200).json(reviews);
    } catch {
        return res.status(500).json({message: "Internal database error"});
    }
});



// @desc Create a new review
// @route POST /review
// @access Private user, admin

const createNewReview = asyncHandler(async (req, res) => {
    if (!req.body.monumentId) {
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
    const rating = req.body.rating;

    if (rating < 1 || rating > 5) {
        return res.status(400).json({message: "Rating must be between 1 and 5"});
    }

    const name = req.body.name;
    const comment = req.body.comment;
    const userId = req.body.userId;
    const monumentId = req.body.monumentId;
    const review = {
        monumentId: monumentId,
        name: name,
        userId: userId,
        rating: rating,
        comment: comment
    };
    try {
        const createdReview = await Review.create(review);
        const monument = await Monument.findById(monumentId);
        // update the monument stats
        const newStats = {
            rating: (monument.stats.avgRating * monument.stats.nbReviews + rating) / (monument.stats.nbReviews + 1),
            reviews: monument.stats.nbReviews + 1
        };
        await Monument.findByIdAndUpdate(monumentId, {stats: newStats});

        if (!createdReview) {
            return res.status(400).json({message: `The review has not been created`});
        }
        res.status(201).json({message: `The review has been created`});
    } catch {
        return res.status(500).json({message: "Internal database error"});
    }
});


// @desc Update a review
// @route PUT /review/:id
// @access Private user, admin

const updateReviewById = asyncHandler(async (req, res) => {
    if (!req.params.id) {
        return res.status(400).json({message: "No id find"});
    }
    const id = req.params.id;

    try {
        const oldReview = await Review.findById(id);

        let newReview = {};
    
        if(req.body.rating) {
            if (req.body.rating < 1 || req.body.rating > 5) {
                return res.status(400).json({message: "Rating must be between 1 and 5"});
            }
            newReview.rating = req.body.rating;
        }else{
            newReview.rating = oldReview.rating;
        }
        newReview.name = req.body.name ? req.body.name : oldReview.name;
        newReview.comment = req.body.comment ? req.body.comment : oldReview.comment;
        newReview.userId = req.body.userId ? req.body.userId : oldReview.userId;
        newReview.monumentId = req.body.monumentId ? req.body.monumentId : oldReview.monumentId;


        if(newReview.rating !== oldReview.rating) {
            const monument = await Monument.findById(monumentId);

            // update the monument stats (((mean*nbReviews)-OldValue)+NewValue)/nbReviews
            const newStats = {
                rating: (((monument.stats.avgRating * monument.stats.nbReviews)-oldReview.rating)+newReview.rating)/monument.stats.nbReviews,
                reviews: monument.stats.nbReviews
            };
            const updatedMonument = await Monument.findByIdAndUpdate(oldReview.monumentId, { stats: newStats });
            if (!updatedMonument) {
                return res.status(400).json({message: `The monument stats has not been updated`});
            }
        }
        
        const updatedReview = await Review.findByIdAndUpdate(id, newReview);

        if (!updatedReview) {
            return res.status(400).json({message: `The review has not been updated`});
        }
        res.status(201).json({message: `The review has been updated`});
    } catch {
        return res.status(500).json({message: "Internal database error"});
    }
});


// @desc Delete a review
// @route DELETE /review/:id
// @access Private user, admin

const deleteReviewById = asyncHandler(async (req, res) => {
    if (!req.params.id) {
        return res.status(400).json({message: "No id find"});
    }
    const id = req.params.id;

    try {
        const review = await Review.findById(id);
        if (!review) {
            return res.status(400).json({message: `The review has not been found`});
        }

        const monument = await Monument.findById(review.monumentId);
        if (!monument) {
            return res.status(400).json({message: `The monument has not been found`});
        }   
        // update the monument stats
        const newStats = {
            rating: (monument.stats.avgRating * monument.stats.nbReviews - review.rating) / (monument.stats.nbReviews - 1),
            reviews: monument.stats.nbReviews - 1
        };
        const updatedMonument = await Monument.findByIdAndUpdate(review.monumentId, { stats: newStats });
        if (!updatedMonument) {
            return res.status(400).json({message: `The monument stats has not been updated`});
        }

        const deletedReview = await Review.findByIdAndDelete(id);
        if (!deletedReview) {
            return res.status(400).json({message: `The review has not been deleted`});
        }
        res.status(201).json({message: `The review has been deleted`});
    } catch {
        return res.status(500).json({message: "Internal database error"});
    }
});

const sortByType = (sort, sortType) => {
    if (!(sortType === 1)) {
        sortType = -1;
    }

    // Sort by date, rating, monument name
    const sortModes = ['date', 'rating', 'name', 'monument'];

    if (!sortModes.includes(sort)){
        sort = "date";
    }

    let sortBy;
    switch(sort) {
        case "date":
            sortBy = { "createdAt": sortType };
            break;
        case "rating":
            sortBy = { "rating": sortType };
            break;
        case "monument":
            sortBy = { "monumentName": sortType };
            break;
        case "name":
            sortBy = { "name": sortType };
            break;
        default:
            sortBy = { "createdAt": sortType };
    } 
    return sortBy;
}

module.exports = {
    getReviewsByMonumentId,
    getReviewsByUserId,
    createNewReview,
    updateReviewById,
    deleteReviewById
}