const mongoose = require('mongoose');

const monumentSchema = new mongoose.Schema({
    name: {type: String, required: true},
    description: {type: String, default: ""},
    images: {type: [String], default: []},
    country: {type: String, default: ""},
    city: {type: String, default: ""},
    tags: {type: [String], default: []},
    free: {type: Boolean, default: false}
}, {collection: "Monuments", timestamps: true});

module.exports = mongoose.model("Monument", monumentSchema);