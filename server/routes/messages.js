const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const Message = require('../models/Message');
const User = require('../models/User');

// @route   POST api/messages
// @desc    Send a message
// @access  Private
router.post('/', auth, async (req, res) => {
    try {
        const { receiverId, text } = req.body;
        
        if (!receiverId || !text) {
            return res.status(400).json({ msg: 'Receiver and text are required' });
        }

        const newMessage = new Message({
            sender: req.user.id,
            receiver: receiverId,
            text
        });

        const message = await newMessage.save();
        
        // Populate sender info for immediate use
        const populated = await Message.findById(message._id)
            .populate('sender', 'username profilePicture')
            .populate('receiver', 'username profilePicture');

        res.json(populated);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
});

// @route   GET api/messages/conversations
// @desc    Get list of conversations for current user
// @access  Private
router.get('/conversations', auth, async (req, res) => {
    try {
        // Collect all unique users that have either sent or received a message from/to the current user
        const messages = await Message.find({
            $or: [{ sender: req.user.id }, { receiver: req.user.id }]
        }).sort({ createdAt: -1 });

        const conversationUsersMap = new Map();

        messages.forEach(msg => {
            const otherUserId = msg.sender.toString() === req.user.id ? msg.receiver.toString() : msg.sender.toString();
            if (!conversationUsersMap.has(otherUserId)) {
                conversationUsersMap.set(otherUserId, msg);
            }
        });

        const latestConversations = Array.from(conversationUsersMap.entries());
        
        // Fetch user objects for these IDs
        const conversations = await Promise.all(
            latestConversations.map(async ([userId, lastMsg]) => {
                const user = await User.findById(userId).select('username profilePicture headline');
                return {
                    user,
                    lastMessage: lastMsg.text,
                    lastMessageDate: lastMsg.createdAt,
                    unread: !lastMsg.read && lastMsg.receiver.toString() === req.user.id
                };
            })
        );

        res.json(conversations);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
});

// @route   GET api/messages/:userId
// @desc    Get all messages between current user and another user
// @access  Private
router.get('/:userId', auth, async (req, res) => {
    try {
        const messages = await Message.find({
            $or: [
                { sender: req.user.id, receiver: req.params.userId },
                { sender: req.params.userId, receiver: req.user.id }
            ]
        })
        .sort({ createdAt: 1 })
        .populate('sender', 'username profilePicture')
        .populate('receiver', 'username profilePicture');

        // Mark messages as read
        await Message.updateMany(
            { sender: req.params.userId, receiver: req.user.id, read: false },
            { $set: { read: true } }
        );

        res.json(messages);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
});

module.exports = router;
