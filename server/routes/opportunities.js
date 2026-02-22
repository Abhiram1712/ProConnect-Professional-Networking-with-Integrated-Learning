const express = require('express');
const router = express.Router();
const Opportunity = require('../models/Opportunity');

// Get all opportunities
router.get('/', async (req, res) => {
    try {
        const opportunities = await Opportunity.find().sort({ postedAt: -1 });
        res.json(opportunities);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

// Create a new opportunity
router.post('/', async (req, res) => {
    const opportunity = new Opportunity({
        title: req.body.title,
        company: req.body.company,
        type: req.body.type,
        description: req.body.description,
        deadline: req.body.deadline,
        reward: req.body.reward,
        logo: req.body.logo,
    });

    try {
        const newOpportunity = await opportunity.save();
        res.status(201).json(newOpportunity);
    } catch (err) {
        res.status(400).json({ message: err.message });
    }
});

module.exports = router;
