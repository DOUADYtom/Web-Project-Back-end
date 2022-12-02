const mongoose = require('mongoose');
// TODO: update la moyenne de monument à chaque ajout de review : furmule : (monument.avgRating * monument.nbReviews + review.newRating) / (monument.nbReviews + 1) 
const reviewSchema = new mongoose.Schema({
    rating: {type: Number, required: true},
    name: {type: String, required: true},
    comment: {type: String, default: ""},
    idUser: {type: mongoose.Schema.Types.ObjectId, ref: "User", required: true},
    idMonument: {type: mongoose.Schema.Types.ObjectId, ref: "Monument", required: true}
}, {collection: "Reviews", timestamps: true});

module.exports = mongoose.model("Review", reviewSchema);