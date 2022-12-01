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
    if (!req.params.id) {
        return res.status(400).json({message: "No id find"});
    }
    const id = req.params.id;
    try {
        const user = await User.findById(id).select('-password').lean().exec();
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

    const pwdRegex = new RegExp("^(?=.[a-z])(?=.[A-Z])(?=.*[0-9])(?=.{8,20}$)");
    if (!pwdRegex.test(password)) {
        return res.status(400).json({message: "Password must contain at least 8 characters, one uppercase, one lowercase and one number"});
    }

    const usernameRegex = new RegExp("^(?=.{3,20}$)");
    if (!usernameRegex.test(username)) {
        return res.status(400).json({message: "Username must contain at least 3 characters and less than 20"});
    }

    const emailRegex = new RegExp(`^*@*.*`, 'i');
    if (!emailRegex.test(email)) {
        return res.status(400).json({message: "Please enter a valid email"});
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

module.exports = {
    createNewUser,
    getUserById,
    getAllUsers,
    updateUserById,
    deleteUserById
}