const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const User = require('../models/User');

// Get current user profile
router.get('/me', auth, async (req, res) => {
    try {
        const user = await User.findById(req.user.id).select('-password');
        res.json(user);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
});

// Update user profile
router.post('/me', auth, async (req, res) => {
    const { username, headline, bio, skills, education } = req.body;

    // Build profile object
    const profileFields = {};
    if (username) profileFields.username = username;
    if (headline !== undefined) profileFields.headline = headline;
    if (bio !== undefined) profileFields.bio = bio;
    if (education !== undefined) profileFields.education = education;
    if (skills !== undefined) {
        if (Array.isArray(skills)) {
            profileFields.skills = skills;
        } else if (typeof skills === 'string') {
            profileFields.skills = skills.split(',').map(skill => skill.trim()).filter(s => s !== '');
        }
    }

    try {
        let user = await User.findById(req.user.id);

        if (!user) return res.status(404).json({ msg: 'User not found' });

        // Check if username is taken by another user
        if (username) {
            let userCheck = await User.findOne({ username });
            if (userCheck && userCheck.id !== req.user.id) {
                return res.status(400).json({ msg: 'Username is already taken' });
            }
        }

        user = await User.findByIdAndUpdate(
            req.user.id,
            { $set: profileFields },
            { new: true }
        ).select('-password');

        res.json(user);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
});

module.exports = router;
