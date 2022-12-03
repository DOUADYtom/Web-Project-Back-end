const User = require('../models/User');
const Review = require('../models/Review');
const bcrypt = require('bcrypt');
const asyncHandler = require('express-async-handler');

// @desc Get all users
// @route GET /users
// @access Private (admin only)

const getAllUsers = asyncHandler(async (req, res) => {
    try {
        const users = await User.find().select('-password').lean().exec();
        if (!users?.length) {
            return res.status(400).json({message: `No users found`});
        }
        res.status(200).json(users);
    } catch {
        return res.status(500).json({message: "Internal database error"});
    }
});

// @desc Get user by id
// @route GET /users/:id
// @access Private (admin and user concerned only)

const getUserById = asyncHandler(async (req, res) => {
    // mode : 0 = all, 1 = user(name)
    const mode = req.query.mode ? parseInt(req.query.mode) : 0;

    if (!req.params.id) {
        return res.status(400).json({message: "No id find"});
    }
    const id = req.params.id;
    try {
        let user;
        if (mode == 1){
            user = await User.findById(id).select('username').lean().exec();
        }else{
            user = await User.findById(id).select('-password').lean().exec();
        }
        
        if (!user) {
            return res.status(400).json({message: `No user with id ${id}`});
        }
        res.status(200).json(user);
    } catch {
        return res.status(500).json({message: "Internal database error"});
    }
});


// @desc Create a new user
// @route POST /users
// @access Public 

const createNewUser = asyncHandler(async (req, res) => {
    const { username, email, password } = req.body;
    const cond = (req.body.username !== undefined && typeof req.body.username !== 'string') ||
        (req.body.password !== undefined && typeof req.body.password !== 'string') ||
        (req.body.email !== undefined && typeof req.body.email !== 'string');
    
    if (cond) {
        return res.status(400).json({message: "Please fill all the fields"});
    }

    const usernameRegex = new RegExp("^(?=.{3,20}$)");
    if (!usernameRegex.test(username)) {
        return res.status(400).json({message: "Username must contain at least 3 characters and less than 20"});
    }

    const emailRegex = new RegExp("^[a-zA-Z0-9.!#$%&'+/=?^_`{|}~-]+@[a-zA-Z0-9-]+(?:.[a-zA-Z0-9-]+)$");
    if (!emailRegex.test(email)) {
        return res.status(400).json({message: "Please enter a valid email"});
    }

    const passwordRegex = new RegExp("^(?=.*[a-z])(?=.*[A-Z])(?=.*[0-9])(?=.{8,20}$)");
        
    if (!passwordRegex.test(password)) {
        return res.status(400).json({message: "Password must contain at least 8 characters, 1 uppercase, 1 lowercase and 1 number"});
    }
    
    try {
        // check for duplicate username
        const duplicateUsername = await User.findOne({username}).lean().exec();
        const duplicateEmail = await User.findOne({email}).lean().exec();

        if (duplicateUsername) {
            return res.status(409).json({message: `User ${username} already exists`});
        }
        if (duplicateEmail) {
            return res.status(409).json({message: `Email ${email} already used`});
        }

        // hash the password
        const salt = await bcrypt.genSalt(10); // salt rounds
        const hashedPassword = await bcrypt.hash(password, salt);

        const newUser = {
            username: username,
            email: email,
            password: hashedPassword
        };
        const createdUser = await User.create(newUser);
        if (!createdUser) {
            return res.status(400).json({message: `The user has not been created`});
        }
        res.status(201).json({message: `The user ${username} has been created`});
    } catch {
        return res.status(500).json({message: "Internal database error"});
    }
});


// @desc Update a user
// @route PUT /users/:id
// @access Private (user concerned only)

const updateUserById = asyncHandler(async (req, res) => {
    if (!req.params.id) {
        return res.status(400).json({message: "No user id find"});
    }
    
    const cond = (req.body.username !== undefined && typeof req.body.username !== 'string') ||
        (req.body.password !== undefined && typeof req.body.password !== 'string') ||
        (req.body.email !== undefined && typeof req.body.email !== 'string') ||
        ((!Array.isArray(req.body.roles) || !matchType('string')) && !req.body.roles.length);

    if(cond){
        return res.status(400).json({message: "Type error in the body"});
    }

    try {
        const duplicateUsername = await User.findOne({username}).lean().exec();
        const duplicateEmail = await User.findOne({email}).lean().exec();

        if (duplicateUsername && duplicateUsername?._id.toString() !== req.params.id) {
            return res.status(409).json({message: `User ${username} already exists`});
        }
        if (duplicateEmail && duplicateEmail?._id.toString() !== req.params.id) {
            return res.status(409).json({message: `Email ${email} already used`});
        }

        const user = await User.findById(req.params.id).lean().exec();
        
        if (!user) {
            return res.status(400).json({message: `No user found with id ${id}`});
        }

        user.username = req.body.username;
        user.email = req.body.email;
        user.roles = req.body.roles;

        if (req.body.password) {
            user.password = await bcrypt.hash(req.body.password, 10);
        }

        const updatedUser = await User.findByIdAndUpdate(id, req.body, {new: true});

        if (!updatedUser) {
            return res.status(400).json({message: `The user ${user.username} has not been updated`});
        }
        res.status(200).json({message: `The user ${user.username} has been updated`});
    } catch {
        return res.status(500).json({message: "Internal database error"});
    }
});


// @desc Delete a user
// @route DELETE /users/:id
// @access Private (user concerned only)

const deleteUserById = asyncHandler(async (req, res) => {
    try {
        let deleteReviews = req.params.delete_reviews | 0; // If 1 delete reviews, if 0 don't detatch id
        deleteReviews = Boolean(parseInt(deleteReviews));
    } catch (error) {
        return res.status(400).json({message: "delete_reviews query parameter must be an Integer"});
    }

    if (!req.params.id ||!req.params.delete_reviews || !req.params.password) {
        return res.status(400).json({message: "No id find"});
    }
    try {
        const id = req.params.id;
        const user = await User.findById(id).select('-password').lean().exec();
        
        if (!user) {
            return res.status(400).json({message: `No user found with id ${id}`});
        }

        if (req.body.password) {
            user.password = await bcrypt.hash(req.body.password, 10);
        }
        
        const reviews = await Review.findOne({idUser: id}).lean().exec();

        // delete idUser of all reviews returned 
        if (deleteReviews && reviews.length > 0) {
            //delete reviews
            deleteReviews = await Review.deleteMany({idUser: id}).lean().exec();
        } else if (reviews.length > 0) {
            // detatch idUser
            deleteReviews = await Review.updateMany({idUser: id}, {idUser: null}).lean().exec();
        }

        if(!deleteReviews) {
            return res.status(400).json({message: `The user ${user.username} has not been deleted cause of reviews`});
        }

        const deletedUser = await user.deleteOne();
        if (!deletedUser) {
            return res.status(400).json({message: `The user ${user.username} has not been deleted`});
        }
        res.status(200).json({message: `The user ${user.username} has been deleted`});
    } catch {
        return res.status(500).json({message: "Internal database error"});
    }
});


// @desc Get all ToVisit monuments in toVisitMonuments list
// @route GET /users/:id/toVisitMonuments
// @access Private (user concerned only)

const getToVisitMonuments = asyncHandler(async (req, res) => {
    if (!req.params.id) {
        return res.status(400).json({message: "No user id find"});
    }
    try {
        const id = req.params.id;
        const user = await User.findById(id).select('toVisitMonuments').lean().exec();
        if (!user) {
            return res.status(400).json({message: `No user found with id ${id}`});
        }
        const toVisitMonuments = await Monument.find({_id: {$in: user.toVisitMonuments}}).lean().exec();
        if (!toVisitMonuments) {
            return res.status(400).json({message: `No toVisitMonuments found for user ${user.username}`});
        }
        res.status(200).json(toVisitMonuments);
    } catch {
        return res.status(500).json({message: "Internal database error"});
    }
});

// @desc add a ToVisit monument in toVisitMonuments list
// @route POST /users/:userId/toVisitMonument
// @access Private

const addToVisitMonument = asyncHandler(async (req, res) => {
    if (!req.params.id) {
        return res.status(400).json({message: "No userId find"});
    }
    if (!req.body.monumentId) {
        return res.status(400).json({message: "No monumentId find"});
    }
    const userId = req.params.id;
    const monumentId = req.body.monumentId;
    try {
        const user = await User.findById(userId);
        if (!user) {
            return res.status(400).json({message: `No user with id ${userId}`});
        }
        if (user.toVisitMonuments.includes(monumentId)) {
            return res.status(400).json({message: `The monument ${monumentId} is already in the list of monuments to visit`});
        }
        user.toVisitMonuments.push(monumentId);
        listUpdated = await user.save();
        if (!listUpdated) {
            return res.status(400).json({message: `The monument ${monumentId} has not been added to the list of monuments to visit`});
        }
        res.status(200).json({message: `The monument ${monumentId} has been added to the list of monuments to visit`});
    } catch {
        return res.status(500).json({message: "Internal database error"});
    }
});

// @desc remove a ToVisit monument from toVisitMonuments list
// @route DELETE /users/:userId/toVisitMonument
// @access Private

const deleteToVisitMonument = asyncHandler(async (req, res) => {
    if (!req.params.id) {
        return res.status(400).json({message: "No userId find"});
    }
    if (!req.body.monumentId) {
        return res.status(400).json({message: "No monumentId find"});
    }
    const userId = req.params.id;
    const monumentId = req.body.monumentId;
    try {
        const user = await User.findById(userId);
        if (!user) {
            return res.status(400).json({message: `No user with id ${userId}`});
        }

        const toVisitMonuments = user.toVisitMonuments;
        if (!toVisitMonuments.includes(monumentId)) {
            return res.status(400).json({message: `The monument ${monumentId} is not in the list of monuments to visit`});
        }

        //delete the monument from the list
        user.toVisitMonuments.pull(monumentId);
        await user.save();
        res.status(200).json({message: `The monument ${monumentId} has been deleted from the list of monuments to visit`});
    } catch {
        return res.status(500).json({message: "Internal database error"});
    }
});


// @desc Get all ToVisit monuments in monumentsVisited list
// @route GET /users/:id/monumentsVisited
// @access Private (user concerned only)

const getVisitedMonuments = asyncHandler(async (req, res) => {
    if (!req.params.id) {
        return res.status(400).json({message: "No user id find"});
    }
    try {
        const id = req.params.id;
        const user = await User.findById(id).select('monumentsVisited').lean().exec();
        if (!user) {
            return res.status(400).json({message: `No user found with id ${id}`});
        }
        const toMonumentsVisited = await Monument.find({_id: {$in: user.monumentsVisited}}).lean().exec();
        if (!toMonumentsVisited) {
            return res.status(400).json({message: `No monumentsVisited found for user ${user.username}`});
        }
        res.status(200).json(toMonumentsVisited);
    } catch {
        return res.status(500).json({message: "Internal database error"});
    }
});

// @desc add a visited monument in monumentsVisited list
// @route POST /users/:userId/toVisitMonument
// @access Private

const addVisitedMonument = asyncHandler(async (req, res) => {
    if (!req.params.id) {
        return res.status(400).json({message: "No userId find"});
    }
    if (!req.body.monumentId) {
        return res.status(400).json({message: "No monumentId find"});
    }
    const userId = req.params.id;
    const monumentId = req.body.monumentId;
    try {
        const user = await User.findById(userId);
        if (!user) {
            return res.status(400).json({message: `No user with the id ${userId}`});
        }
        if (user.monumentsVisited.includes(monumentId)) {
            return res.status(400).json({message: `The monument ${monumentId} is already in the list`});
        }
        user.monumentsVisited.push(monumentId);
        listUpdated = await user.save();
        if (!listUpdated) {
            return res.status(400).json({message: `The monument ${monumentId} has not been added to the monumentsVisited`});
        }
        res.status(200).json({message: `The monument ${monumentId} has been added to the list of monuments visited`});
    } catch {
        return res.status(500).json({message: "Internal database error"});
    }
});

// @desc delete a visited monument in monumentsVisited list
// @route DELETE /users/:userId/toVisitMonuments/:monumentId
// @access Private

const deleteVisitedMonument = asyncHandler(async (req, res) => {

    if (!req.params.id) {
        return res.status(400).json({message: "No userId find"});
    }
    if (!req.body.monumentId) {
        return res.status(400).json({message: "No monumentId find"});
    }
    const userId = req.params.id;
    const monumentId = req.body.monumentId;
    try {
        const user = await User.findById(userId);
        if (!user) {
            return res.status(400).json({message: `No user with the id ${userId}`});
        }
        user.monumentsVisited.pull(monumentId);
        listUpdated = await user.save();
        if (!listUpdated) {
            return res.status(400).json({message: `The monument ${monumentId} has not been deleted from the monumentsVisited`});
        }
        res.status(200).json({message: `The monument ${monumentId} has been deleted from the list of monuments visited`});
    } catch {
        return res.status(500).json({message: "Internal database error"});
    }
});

module.exports = {
    createNewUser,
    getUserById,
    getAllUsers,
    updateUserById,
    deleteUserById,
    getToVisitMonuments,
    addToVisitMonument,
    deleteToVisitMonument,
    getVisitedMonuments,
    addVisitedMonument,
    deleteVisitedMonument
}