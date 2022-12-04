const User = require('../models/User');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const asyncHandler = require('express-async-handler');

// @desc Login user
// @route POST /auth
// @access Public
const login = asyncHandler(async (req, res) => {
    const { email, password } = req.body;
    const cond = (req.body.email !== undefined && typeof req.body.email !== 'string') ||
        (req.body.password !== undefined && typeof req.body.password !== 'string');
    if (cond) {
        return res.status(400).json({message: "Please fill all the fields"});
    }

    try {
        const user = await User.findOne({email}).lean().exec();

        if (!user || !user.roles) {
            return res.status(400).json({message: "User not found"});
        }

        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            return res.status(400).json({message: "Invalid credentials"});
        }
        const accessToken = jwt.sign(
            {
                "UserInfo": {
                    "id": user._id,
                    "email": user.email,
                    "name": user.username,
                    "roles": user.roles
                }
            },
            process.env.ACCESS_TOKEN_SECRET,
            {expiresIn: '15m'}
        );
        const refreshToken = jwt.sign(
            {
                "email": user.email
            },
            process.env.REFRESH_TOKEN_SECRET,
            {expiresIn: '1d'}
        );

        //create a secure cookie
        res.cookie('refreshToken', refreshToken, {
            httpOnly: true, // access by webserver
            secure: false, // only send cookie over https
            sameSite: 'None', // cross-site cookie
            maxAge: 1000 * 60 * 60 * 24 * 2 // 2 day
        });

        // send access token in response
        res.status(200).json({accessToken});

    } catch (err) {
        return res.status(500).json({message: "Internal database error"});
    }
});


// @desc Refresh
// @route POST /auth/refresh
// @access Public - access token has expired

const refresh = (req, res) => {
    const cookies = req.cookies;
    if (!cookies?.refreshToken) {
        return res.status(401).json({message: "Unauthorized"});
    }

    const refreshToken = cookies.refreshToken;
    jwt.verify(
        refreshToken,
        process.env.REFRESH_TOKEN_SECRET,
        asyncHandler(async (err, decoded) => {
            if (err) {
                return res.status(403).json({message: "Forbidden"});
            }

            const foundUser = await User.findOne({ email: decoded.email }).lean().exec();
            if (!foundUser) {
                return res.status(401).json({message: "Unauthorized"});
            }

            const accessToken = jwt.sign(
                {
                    id: foundUser._id
                },
                process.env.ACCESS_TOKEN_SECRET,
                {expiresIn: '15m'}
            );
            res.status(200).json({accessToken});
        })
    )

};

// @desc Logout
// @route POST /auth/logout
// @access Public - just to clear the cookie

const logout = (req, res) => {
    const cookies = req.cookies;
    if (!cookies?.refreshToken) {
        return res.status(204).json({message: 'No content'}); // No content
    }

    res.clearCookie('refreshToken', {httpOnly: true, secure: false, sameSite: 'None'});
    res.json({message: 'Cookie cleared'});
};


module.exports = {
    login,
    refresh,
    logout
};