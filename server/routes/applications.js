const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const Application = require('../models/Application');
const Opportunity = require('../models/Opportunity');
const User = require('../models/User');

// Apply to an Opportunity
router.post('/apply/:opportunityId', auth, async (req, res) => {
    try {
        const { coverLetter, resumeUrl } = req.body;
        const opportunityId = req.params.opportunityId;

        // Check availability
        const opportunity = await Opportunity.findById(opportunityId);
        if (!opportunity) {
            return res.status(404).json({ msg: 'Opportunity not found' });
        }

        // Check if already applied
        const existingApp = await Application.findOne({
            user: req.user.id,
            opportunity: opportunityId
        });
        if (existingApp) {
            return res.status(400).json({ msg: 'You have already applied to this opportunity' });
        }

        const newApplication = new Application({
            user: req.user.id,
            opportunity: opportunityId,
            coverLetter,
            resumeUrl
        });

        const application = await newApplication.save();
        res.json(application);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
});

// Get User's Applications (My Applications)
router.get('/my-applications', auth, async (req, res) => {
    try {
        const applications = await Application.find({ user: req.user.id })
            .populate('opportunity', ['title', 'company', 'type', 'deadline'])
            .sort({ appliedAt: -1 });
        res.json(applications);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
});

// Withdraw Application
router.delete('/:id', auth, async (req, res) => {
    try {
        const application = await Application.findById(req.params.id);
        if (!application) {
            return res.status(404).json({ msg: 'Application not found' });
        }

        // Verify user owns the application
        if (application.user.toString() !== req.user.id) {
            return res.status(401).json({ msg: 'Not authorized' });
        }

        await Application.findByIdAndDelete(req.params.id);
        res.json({ msg: 'Application withdrawn successfully' });
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
});

module.exports = router;
