const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const User = require('../models/User');
const Post = require('../models/Post');
const Opportunity = require('../models/Opportunity');
const Application = require('../models/Application');
const Connection = require('../models/Connection');

// Middleware: check admin role
const adminOnly = async (req, res, next) => {
    try {
        const user = await User.findById(req.user.id);
        if (!user || user.role !== 'admin') {
            return res.status(403).json({ msg: 'Access denied. Admin only.' });
        }
        next();
    } catch (err) {
        res.status(500).json({ msg: 'Server error' });
    }
};

// GET /api/admin/stats - Platform overview statistics
router.get('/stats', auth, adminOnly, async (req, res) => {
    try {
        const [totalUsers, totalPosts, totalOpportunities, totalApplications] = await Promise.all([
            User.countDocuments(),
            Post.countDocuments(),
            Opportunity.countDocuments(),
            Application.countDocuments()
        ]);

        // Role breakdown
        const [candidates, recruiters, mentors, admins] = await Promise.all([
            User.countDocuments({ role: 'candidate' }),
            User.countDocuments({ role: 'recruiter' }),
            User.countDocuments({ role: 'mentor' }),
            User.countDocuments({ role: 'admin' })
        ]);

        // Recent signups (last 7 days)
        const weekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
        const recentSignups = await User.countDocuments({ createdAt: { $gte: weekAgo } });

        // Application status breakdown
        const applicationStats = await Application.aggregate([
            { $group: { _id: '$status', count: { $sum: 1 } } }
        ]);

        res.json({
            totalUsers,
            totalPosts,
            totalOpportunities,
            totalApplications,
            roles: { candidates, recruiters, mentors, admins },
            recentSignups,
            applicationStats
        });
    } catch (err) {
        console.error(err);
        res.status(500).json({ msg: 'Server error' });
    }
});

// GET /api/admin/users - List all users with filters
router.get('/users', auth, adminOnly, async (req, res) => {
    try {
        const { role, search, sort, page = 1, limit = 20 } = req.query;
        const query = {};

        if (role && role !== 'all') query.role = role;
        if (search) {
            query.$or = [
                { username: { $regex: search, $options: 'i' } },
                { email: { $regex: search, $options: 'i' } }
            ];
        }

        const sortOpt = sort === 'name' ? { username: 1 } : { createdAt: -1 };

        const users = await User.find(query)
            .select('-password')
            .sort(sortOpt)
            .skip((page - 1) * limit)
            .limit(parseInt(limit));

        const total = await User.countDocuments(query);

        res.json({ users, total, pages: Math.ceil(total / limit), page: parseInt(page) });
    } catch (err) {
        console.error(err);
        res.status(500).json({ msg: 'Server error' });
    }
});

// PUT /api/admin/users/:id/role - Change user role
router.put('/users/:id/role', auth, adminOnly, async (req, res) => {
    try {
        const { role } = req.body;
        if (!['candidate', 'recruiter', 'mentor', 'admin'].includes(role)) {
            return res.status(400).json({ msg: 'Invalid role' });
        }

        const user = await User.findByIdAndUpdate(
            req.params.id,
            { role },
            { new: true }
        ).select('-password');

        if (!user) return res.status(404).json({ msg: 'User not found' });

        res.json(user);
    } catch (err) {
        console.error(err);
        res.status(500).json({ msg: 'Server error' });
    }
});

// DELETE /api/admin/users/:id - Delete user
router.delete('/users/:id', auth, adminOnly, async (req, res) => {
    try {
        const user = await User.findById(req.params.id);
        if (!user) return res.status(404).json({ msg: 'User not found' });

        // Don't allow deleting yourself
        if (user.id === req.user.id) {
            return res.status(400).json({ msg: 'Cannot delete yourself' });
        }

        // Clean up user's data
        await Promise.all([
            Post.deleteMany({ user: req.params.id }),
            Application.deleteMany({ user: req.params.id }),
            Connection.deleteMany({ $or: [{ requester: req.params.id }, { recipient: req.params.id }] }),
            User.findByIdAndDelete(req.params.id)
        ]);

        res.json({ msg: 'User and associated data deleted' });
    } catch (err) {
        console.error(err);
        res.status(500).json({ msg: 'Server error' });
    }
});

// GET /api/admin/posts - List all posts for moderation
router.get('/posts', auth, adminOnly, async (req, res) => {
    try {
        const { page = 1, limit = 20 } = req.query;

        const posts = await Post.find()
            .populate('user', ['username', 'email', 'role'])
            .sort({ createdAt: -1 })
            .skip((page - 1) * limit)
            .limit(parseInt(limit));

        const total = await Post.countDocuments();

        res.json({ posts, total, pages: Math.ceil(total / limit) });
    } catch (err) {
        console.error(err);
        res.status(500).json({ msg: 'Server error' });
    }
});

// DELETE /api/admin/posts/:id - Delete a post (moderation)
router.delete('/posts/:id', auth, adminOnly, async (req, res) => {
    try {
        const post = await Post.findByIdAndDelete(req.params.id);
        if (!post) return res.status(404).json({ msg: 'Post not found' });
        res.json({ msg: 'Post deleted by admin' });
    } catch (err) {
        console.error(err);
        res.status(500).json({ msg: 'Server error' });
    }
});

module.exports = router;
