const mongoose = require('mongoose');

const personSchema = new mongoose.Schema({
    first_name: String,
    last_name: String,
    age: Number,
    createdAt: {
        type: Date,
        immutable: true,
        default: () => Date.now()
    },
    updateAt: {
        type: Date,
        default: () => Date.now()
    }
}, {collection: "People"});

module.exports = mongoose.model("Person", personSchema);