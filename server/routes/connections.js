const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const Connection = require('../models/Connection');
const Follow = require('../models/Follow');
const User = require('../models/User');
const Notification = require('../models/Notification');

// ===================== SEND CONNECTION REQUEST =====================
router.post('/request/:id', auth, async (req, res) => {
    try {
        const recipient = await User.findById(req.params.id);
        if (!recipient) return res.status(404).json({ msg: 'User not found' });
        if (req.user.id === req.params.id) return res.status(400).json({ msg: 'Cannot connect to yourself' });

        // Check for existing connection
        const existing = await Connection.findOne({
            $or: [
                { requester: req.user.id, recipient: req.params.id },
                { requester: req.params.id, recipient: req.user.id }
            ],
            status: { $in: ['pending', 'accepted'] }
        });

        if (existing) {
            if (existing.status === 'accepted') return res.status(400).json({ msg: 'Already connected' });
            return res.status(400).json({ msg: 'Connection request already pending' });
        }

        const connection = new Connection({
            requester: req.user.id,
            recipient: req.params.id,
            note: req.body.note || '',
            connectionType: req.body.connectionType || ''
        });
        await connection.save();

        // Send notification
        const sender = await User.findById(req.user.id).select('username');
        await new Notification({
            recipient: req.params.id,
            sender: req.user.id,
            type: 'connection_request',
            message: `${sender.username} wants to connect with you${req.body.note ? ': "' + req.body.note + '"' : ''}`,
            relatedConnection: connection._id
        }).save();

        res.json(connection);
    } catch (err) {
        if (err.code === 11000) {
            return res.status(400).json({ msg: 'Connection request already exists' });
        }
        console.error(err.message);
        res.status(500).send('Server Error');
    }
});

// ===================== ACCEPT REQUEST =====================
router.put('/accept/:id', auth, async (req, res) => {
    try {
        const connection = await Connection.findById(req.params.id);
        if (!connection) return res.status(404).json({ msg: 'Connection not found' });
        if (connection.recipient.toString() !== req.user.id) return res.status(401).json({ msg: 'Not authorized' });
        if (connection.status !== 'pending') return res.status(400).json({ msg: 'Request is no longer pending' });

        connection.status = 'accepted';
        connection.acceptedAt = new Date();
        await connection.save();

        // Add to both users' connection arrays
        await User.findByIdAndUpdate(connection.requester, { $addToSet: { connections: connection.recipient } });
        await User.findByIdAndUpdate(connection.recipient, { $addToSet: { connections: connection.requester } });

        // Notification
        const accepter = await User.findById(req.user.id).select('username');
        await new Notification({
            recipient: connection.requester,
            sender: req.user.id,
            type: 'connection_accepted',
            message: `${accepter.username} accepted your connection request`,
            relatedConnection: connection._id
        }).save();

        const populated = await Connection.findById(connection._id)
            .populate('requester', ['username', 'headline', 'skills'])
            .populate('recipient', ['username', 'headline', 'skills']);

        res.json(populated);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
});

// ===================== REJECT REQUEST =====================
router.put('/reject/:id', auth, async (req, res) => {
    try {
        const connection = await Connection.findById(req.params.id);
        if (!connection) return res.status(404).json({ msg: 'Connection not found' });
        if (connection.recipient.toString() !== req.user.id) return res.status(401).json({ msg: 'Not authorized' });

        connection.status = 'rejected';
        await connection.save();
        res.json({ msg: 'Connection request rejected' });
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
});

// ===================== WITHDRAW SENT REQUEST =====================
router.put('/withdraw/:id', auth, async (req, res) => {
    try {
        const connection = await Connection.findById(req.params.id);
        if (!connection) return res.status(404).json({ msg: 'Connection not found' });
        if (connection.requester.toString() !== req.user.id) return res.status(401).json({ msg: 'Not authorized' });
        if (connection.status !== 'pending') return res.status(400).json({ msg: 'Can only withdraw pending requests' });

        connection.status = 'withdrawn';
        await connection.save();
        res.json({ msg: 'Connection request withdrawn' });
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
});

// ===================== REMOVE CONNECTION =====================
router.delete('/remove/:userId', auth, async (req, res) => {
    try {
        // Find and remove the connection
        const connection = await Connection.findOneAndDelete({
            $or: [
                { requester: req.user.id, recipient: req.params.userId },
                { requester: req.params.userId, recipient: req.user.id }
            ],
            status: 'accepted'
        });

        if (!connection) return res.status(404).json({ msg: 'Connection not found' });

        // Remove from both users' connection arrays
        await User.findByIdAndUpdate(req.user.id, { $pull: { connections: req.params.userId } });
        await User.findByIdAndUpdate(req.params.userId, { $pull: { connections: req.user.id } });

        res.json({ msg: 'Connection removed' });
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
});

// ===================== GET MY CONNECTIONS (Accepted) =====================
router.get('/', auth, async (req, res) => {
    try {
        const { search, sort } = req.query;

        const user = await User.findById(req.user.id)
            .populate('connections', ['username', 'headline', 'skills', 'education', 'bio']);

        let connections = user.connections || [];

        // Search filter
        if (search) {
            const regex = new RegExp(search, 'i');
            connections = connections.filter(c =>
                regex.test(c.username) || regex.test(c.headline) || regex.test(c.skills?.join(' '))
            );
        }

        // Sort
        if (sort === 'recent') {
            connections.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
        } else if (sort === 'name') {
            connections.sort((a, b) => a.username.localeCompare(b.username));
        }

        res.json(connections);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
});

// ===================== GET PENDING RECEIVED REQUESTS =====================
router.get('/requests/received', auth, async (req, res) => {
    try {
        const requests = await Connection.find({
            recipient: req.user.id,
            status: 'pending'
        })
            .populate('requester', ['username', 'headline', 'skills', 'bio', 'connections'])
            .sort({ createdAt: -1 });

        // Enrich with mutual connections count
        const currentUser = await User.findById(req.user.id);
        const enriched = requests.map(req => {
            const reqObj = req.toObject();
            const mutualCount = req.requester.connections
                ? req.requester.connections.filter(c =>
                    currentUser.connections.map(cc => cc.toString()).includes(c.toString())
                ).length
                : 0;
            return { ...reqObj, mutualConnections: mutualCount };
        });

        res.json(enriched);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
});

// ===================== GET PENDING SENT REQUESTS =====================
router.get('/requests/sent', auth, async (req, res) => {
    try {
        const requests = await Connection.find({
            requester: req.user.id,
            status: 'pending'
        })
            .populate('recipient', ['username', 'headline', 'skills'])
            .sort({ createdAt: -1 });

        res.json(requests);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
});

// ===================== PEOPLE YOU MAY KNOW =====================
router.get('/suggestions', auth, async (req, res) => {
    try {
        const currentUser = await User.findById(req.user.id);
        const myConnections = currentUser.connections || [];

        // Get all existing connection records (to exclude)
        const existingConnections = await Connection.find({
            $or: [
                { requester: req.user.id },
                { recipient: req.user.id }
            ],
            status: { $in: ['pending', 'accepted'] }
        });

        const excludeIds = new Set([
            req.user.id,
            ...myConnections.map(c => c.toString()),
            ...existingConnections.map(c => c.requester.toString()),
            ...existingConnections.map(c => c.recipient.toString())
        ]);

        // Find suggestions: same skills, education, or connections of connections
        const allUsers = await User.find({
            _id: { $nin: [...excludeIds] },
            role: 'candidate'
        }).select('-password').limit(50);

        // Score suggestions
        const scored = allUsers.map(user => {
            let score = 0;
            // Shared skills
            const sharedSkills = user.skills.filter(s =>
                currentUser.skills.some(cs => cs.toLowerCase() === s.toLowerCase())
            );
            score += sharedSkills.length * 3;

            // Same education
            if (user.education && currentUser.education &&
                user.education.toLowerCase().includes(currentUser.education.toLowerCase())) {
                score += 5;
            }

            // Mutual connections
            const mutualConnections = user.connections
                ? user.connections.filter(c => myConnections.map(mc => mc.toString()).includes(c.toString()))
                : [];
            score += mutualConnections.length * 4;

            return {
                ...user.toObject(),
                score,
                sharedSkills,
                mutualConnectionsCount: mutualConnections.length
            };
        });

        // Sort by score descending
        scored.sort((a, b) => b.score - a.score);

        res.json(scored.slice(0, 20));
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
});

// ===================== GET MUTUAL CONNECTIONS =====================
router.get('/mutual/:userId', auth, async (req, res) => {
    try {
        const currentUser = await User.findById(req.user.id);
        const otherUser = await User.findById(req.params.userId);

        if (!otherUser) return res.status(404).json({ msg: 'User not found' });

        const myConns = (currentUser.connections || []).map(c => c.toString());
        const theirConns = (otherUser.connections || []).map(c => c.toString());
        const mutualIds = myConns.filter(id => theirConns.includes(id));

        const mutuals = await User.find({ _id: { $in: mutualIds } })
            .select('username headline skills');

        res.json(mutuals);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
});

// ===================== FOLLOW / UNFOLLOW =====================
router.post('/follow/:id', auth, async (req, res) => {
    try {
        if (req.user.id === req.params.id) return res.status(400).json({ msg: 'Cannot follow yourself' });

        const existing = await Follow.findOne({ follower: req.user.id, following: req.params.id });

        if (existing) {
            await Follow.findByIdAndDelete(existing._id);
            res.json({ following: false });
        } else {
            await new Follow({ follower: req.user.id, following: req.params.id }).save();

            // Notification
            const sender = await User.findById(req.user.id).select('username');
            await new Notification({
                recipient: req.params.id,
                sender: req.user.id,
                type: 'follow',
                message: `${sender.username} started following you`
            }).save();

            res.json({ following: true });
        }
    } catch (err) {
        if (err.code === 11000) {
            return res.status(400).json({ msg: 'Already following' });
        }
        console.error(err.message);
        res.status(500).send('Server Error');
    }
});

// ===================== GET FOLLOWERS / FOLLOWING =====================
router.get('/followers/:userId', auth, async (req, res) => {
    try {
        const followers = await Follow.find({ following: req.params.userId })
            .populate('follower', ['username', 'headline']);
        res.json(followers.map(f => f.follower));
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
});

router.get('/following/:userId', auth, async (req, res) => {
    try {
        const following = await Follow.find({ follower: req.params.userId })
            .populate('following', ['username', 'headline']);
        res.json(following.map(f => f.following));
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
});

// ===================== CONNECTION STATUS CHECK =====================
router.get('/status/:userId', auth, async (req, res) => {
    try {
        const connection = await Connection.findOne({
            $or: [
                { requester: req.user.id, recipient: req.params.userId },
                { requester: req.params.userId, recipient: req.user.id }
            ],
            status: { $in: ['pending', 'accepted'] }
        });

        const isFollowing = await Follow.findOne({
            follower: req.user.id,
            following: req.params.userId
        });

        res.json({
            status: connection ? connection.status : 'none',
            connectionId: connection?._id || null,
            isRequester: connection ? connection.requester.toString() === req.user.id : false,
            isFollowing: !!isFollowing
        });
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
});

// ===================== UPDATE CONNECTION NOTE =====================
router.put('/note/:connectionId', auth, async (req, res) => {
    try {
        const connection = await Connection.findById(req.params.connectionId);
        if (!connection) return res.status(404).json({ msg: 'Connection not found' });

        if (connection.requester.toString() === req.user.id) {
            connection.requesterNote = req.body.note;
        } else if (connection.recipient.toString() === req.user.id) {
            connection.recipientNote = req.body.note;
        } else {
            return res.status(401).json({ msg: 'Not authorized' });
        }

        await connection.save();
        res.json(connection);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
});

module.exports = router;
