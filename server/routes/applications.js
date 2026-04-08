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

// Get Applications for Recruiter's opportunities
router.get('/recruiter-applications', auth, async (req, res) => {
    try {
        // First find all opportunities posted by this recruiter
        const myOpportunities = await Opportunity.find({ user: req.user.id }).select('_id');
        const opportunityIds = myOpportunities.map(o => o._id);

        const applications = await Application.find({ opportunity: { $in: opportunityIds } })
            .populate('opportunity', ['title', 'company', 'type'])
            .populate('user', ['username', 'profilePicture', 'headline', 'skills'])
            .sort({ appliedAt: -1 });
        
        res.json(applications);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
});

// Update Application Status (Shortlist/Reject)
router.put('/status/:id', auth, async (req, res) => {
    try {
        const { status } = req.body;
        const application = await Application.findById(req.params.id).populate('opportunity');
        if (!application) return res.status(404).json({ msg: 'Application not found' });

        // Verify the recruiter owns the opportunity
        if (application.opportunity.user.toString() !== req.user.id) {
            return res.status(401).json({ msg: 'Not authorized' });
        }

        application.status = status;
        await application.save();
        res.json(application);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
});

module.exports = router;
