const Monument = require('./../models/Monument');
const asyncHandler = require('express-async-handler');

const getAllMonuments = asyncHandler(async (req, res) => {
    try {
        const monuments = await Monument.find().lean();
        res.status(200).json(monuments);
    } catch {
        return res.status(500).json({message: "Internal database error"});
    }
});

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

const createNewMonument = asyncHandler(async (req, res) => {
    if(!req.body.name){
        return res.status(400).json({message: "The monument must have a name"});
    }
    const matchType = (array, type) => array.reduce((a,b) => (typeof b === type) && a, true);
    const cond = (typeof req.body.name !== 'string') ||
        (req.body.description !== undefined && typeof req.body.description !== 'string') ||
        (req.body.images !== undefined && (!Array.isArray(req.body.images) || !matchType(req.body.images, 'string'))) ||
        (req.body.country !== undefined && typeof req.body.country !== 'string') ||
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