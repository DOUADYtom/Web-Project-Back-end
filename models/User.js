const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
    username: {type: String, required: true, unique: true},
    email: {type: String, required: true, unique: true},
    password: {type: String, required: true},
    roles: [{type: String, enum:['user','creator','admin'], default: 'user'}],
    toVisitMonuments: {type: [mongoose.Schema.Types.ObjectId], default: []},
    monumentsVisited: {type: [mongoose.Schema.Types.ObjectId], default: []}
}, {collection: "Users", timestamps: true});

module.exports = mongoose.model("User", userSchema);