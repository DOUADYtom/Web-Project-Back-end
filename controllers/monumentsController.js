const Monument = require('../models/Monument');
const asyncHandler = require('express-async-handler');
const Fuse = require('fuse.js');
const { search } = require('../routes/monumentRouter');

// @desc Create a new monument
// @route POST /monument
// @access Public

const getAllMonuments = asyncHandler(async (req, res) => {
    // mode : 0 = all, 1 = monument(name, images, country, countryCode, city, avgRating)
    const mode = req.query.mode ? parseInt(req.query.mode) : 0;
    const limit = req.query.limit ? parseInt(req.query.limit) : undefined;
    const search = req.query.search ? req.query.search : undefined;

    let sortType = req.query.sortType ? parseInt(req.query.sortType) : -1;

    if (!(sortType === 1)) {
        sortType = -1;
    }

    let sort = req.query.sort ? req.query.sort : "date";
    // mostViewed, mostLiked, mostRecent, mustVisited, mustToBeVisited
    const sortModes = ['date', 'mostViewed', 'mostReviewed', 'mostLiked', 'mustVisited', 'mustToBeVisited'];

    if (!sortModes.includes(sort)){
        sort = "date";
    }

    let sortBy;
    switch(sort) {
        case "date":
            sortBy = { "createdAt": sortType };
            break;
        case "name":
            sortBy = { "name": sortType };
            break;
        case "mostViewed":
            sortBy = { "stats.nbViews": sortType };
            break;
        case "mostLiked":
            sortBy = { "stats.avgRating": sortType };
            break;
        case "mostReviewed":
            sortBy = { "stats.nbReviews": sortType };
            break;
        case "mustVisited":
            sortBy = { "stats.visited": sortType };
            break;
        case "mustToBeVisited":
            sortBy = { "stats.toBeVisited": sortType };
            break;
        default:
            sortBy = { "createdAt": sortType };
    } 

    try {
        let monuments;
        if (mode == 1){ // select only name, images, country, countryCode, city, avgRating
            monuments = await Monument.find().sort(sortBy).select('name images country countryCode city stats.avgRating').lean().limit(limit);
        }else if (mode == 0){ // select all
            monuments = await Monument.find().sort(sortBy).limit(limit);
        }

        if (!monuments) {
            return res.status(400).json({message: `The monuments could not be find`});
        }

        if (search){
            const options = {
                keys: [{
                    name : 'name',
                    weight: 0.3
                },
                {
                    name : 'country',
                    weight: 0.2
                },
                {
                    name : 'city',
                    weight: 0.1
                },
                {
                    name : 'tags',
                    weight: 0.25   
                },
                {
                    name : 'description',
                    weight: 0.15
                }],
                threshold: 0.3,
                includeScore: true,
                useExtendedSearch: true,
                isCaseSensitive: false,
                findAllMatches: true,
                distance: 200,
                location: 0
            };
            const fuse = new Fuse(monuments, options);
            monuments = fuse.search(search);
        }

        res.status(200).json(monuments);
    } catch {
        return res.status(500).json({message: "Internal database error"});
    }
});


// @desc Get monument by id
// @route GET /monument/:id
// @access Public

const getMonumentById = asyncHandler(async (req, res) => {
    if (!req.params.id) {
        return res.status(400).json({message: "No id find"});
    }
    const id = req.params.id;
    try {
        const monument = await Monument.findById(id).lean().exec();
        if (!monument) {
            return res.status(400).json({message: `The searched monument with the id ${id} does not exist`});
        }
        res.status(200).json(monument);
    } catch {
        return res.status(500).json({message: "Internal database error"});
    }
});


// @desc Create a new monument
// @route POST /monument
// @access Creator, Admin

const createNewMonument = asyncHandler(async (req, res) => {
    delete req.body.stats;
    if(!req.body.name){
        return res.status(400).json({message: "The monument must have a name"});
    }
    const matchType = (array, type) => array.reduce((a,b) => (typeof b === type) && a, true);
    const cond = (typeof req.body.name !== 'string') ||
        (req.body.description !== undefined && typeof req.body.description !== 'string') ||
        (req.body.images !== undefined && (!Array.isArray(req.body.images) || !matchType(req.body.images, 'string'))) ||
        (req.body.country !== undefined && typeof req.body.country !== 'string') ||
        (req.body.countryCode !== undefined && typeof req.body.countryCode !== 'string') ||
        (req.body.city !== undefined && typeof req.body.city !== 'string') ||
        (req.body.tags !== undefined && (!Array.isArray(req.body.tags) || !matchType(req.body.tags, 'string'))) ||
        (req.body.free !== undefined && typeof req.body.free !== 'boolean');
    if(cond){
        return res.status(400).json({message: "Type error in the body"});
    }
    try {
        const monument = await Monument.create(req.body);
        if (!monument) {
            return res.status(400).json({message: `The monument ${req.body.name} has not been created`});
        }
        res.status(201).json({message: `The monument ${req.body.name} has been created`});
    } catch {
        return res.status(500).json({message: "Internal database error"});
    }
});


// @desc Update a monument
// @route PUT /monument/:id
// @access Creator, Admin

const updateMonumentById = asyncHandler(async (req, res) => {
    if (!req.params.id) {
        return res.status(400).json({message: "No id find"});
    }
    const id = req.params.id;
    const matchType = (array, type) => array.reduce((a,b) => (typeof b === type) && a, true);
    const cond = (req.body.name !== undefined && typeof req.body.name !== 'string') ||
        (req.body.description !== undefined && typeof req.body.description !== 'string') ||
        (req.body.images !== undefined && (!Array.isArray(req.body.images) || !matchType(req.body.images, 'string'))) ||
        (req.body.country !== undefined && typeof req.body.country !== 'string') ||
        (req.body.countryCode !== undefined && typeof req.body.countryCode !== 'string') ||
        (req.body.city !== undefined && typeof req.body.city !== 'string') ||
        (req.body.tags !== undefined && (!Array.isArray(req.body.tags) || !matchType(req.body.tags, 'string'))) ||
        (req.body.free !== undefined && typeof req.body.free !== 'boolean');
    if(cond){
        return res.status(400).json({message: "Type error in the body"});
    }
    try {
        const monument = await Monument.findByIdAndUpdate(id, req.body);
        if (!monument) {
            return res.status(400).json({message: `The monument ${id} has not been updated`}).exec();
        }
        res.status(201).json({message: `The monument ${id} has been updated`});
    } catch {
        return res.status(500).json({message: "Internal database error"});
    }
});


// @desc Delete a monument
// @route DELETE /monument/:id
// @access Creator, Admin

const deleteMonumentById = asyncHandler(async (req, res) => {
    if (!req.params.id) {
        return res.status(400).json({message: "No id find"});
    }
    const id = req.params.id;
    try {
        const monument = await Monument.findByIdAndDelete(id).lean().exec();
        if (!monument) {
            return res.status(400).json({message: `The searched monument with the id ${id} does not exist`});
        }
        res.status(200).json({message: `The searched monument with the id ${id} has been deleted`});
    } catch {
        return res.status(500).json({message: "Internal database error"});
    }
});

module.exports = {
    getAllMonuments,
    getMonumentById,
    createNewMonument,
    updateMonumentById,
    deleteMonumentById
}