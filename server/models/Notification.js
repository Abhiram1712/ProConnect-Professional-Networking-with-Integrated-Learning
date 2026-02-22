const mongoose = require('mongoose');

const NotificationSchema = new mongoose.Schema({
    recipient: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    sender: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    },
    type: {
        type: String,
        enum: [
            'connection_request', 'connection_accepted',
            'post_like', 'post_comment', 'post_share', 'post_mention',
            'comment_like', 'comment_reply',
            'follow', 'profile_view',
            'poll_ended', 'post_milestone',
            'system'
        ],
        required: true
    },
    message: { type: String, required: true },
    // Reference to related entity
    relatedPost: { type: mongoose.Schema.Types.ObjectId, ref: 'Post' },
    relatedConnection: { type: mongoose.Schema.Types.ObjectId, ref: 'Connection' },
    isRead: { type: Boolean, default: false },
    createdAt: { type: Date, default: Date.now }
});

NotificationSchema.index({ recipient: 1, createdAt: -1 });
NotificationSchema.index({ recipient: 1, isRead: 1 });

module.exports = mongoose.model('Notification', NotificationSchema);
