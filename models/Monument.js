const mongoose = require('mongoose');

const monumentSchema = new mongoose.Schema({
    name: {type: String, required: true},
    description: {type: String, default: ""},
    images: {type: [String], default: []},
    country: {type: String, default: ""},
    city: {type: String, default: ""},
    tags: {type: [String], default: []},
    free: {type: Boolean, default: false},
    stats: { type:
        {
            nbViews: {type: Number},
            nbReviews: {type: Number},
            avgRating: {type: Number}, 
            toBeVisited: {type: Number}, 
            visited: {type: Number}
        }, 
        default: 
        {
            nbViews: 0,
            nbReviews: 0,
            avgRating: 0, 
            toBeVisited: 0, 
            visited: 0
        }
    }
}, {collection: "Monuments", timestamps: true});

module.exports = mongoose.model("Monument", monumentSchema);