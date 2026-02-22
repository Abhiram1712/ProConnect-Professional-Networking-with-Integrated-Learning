const mongoose = require('mongoose');

const ConnectionSchema = new mongoose.Schema({
    requester: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    recipient: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    status: {
        type: String,
        enum: ['pending', 'accepted', 'rejected', 'withdrawn', 'blocked'],
        default: 'pending'
    },
    // Connection request note (like LinkedIn's "Add a note")
    note: {
        type: String,
        maxlength: 300,
        default: ''
    },
    // How they are connected (category)
    connectionType: {
        type: String,
        enum: ['colleague', 'classmate', 'friend', 'other', ''],
        default: ''
    },
    // Private user note about the connection
    requesterNote: { type: String, default: '' },
    recipientNote: { type: String, default: '' },
    createdAt: {
        type: Date,
        default: Date.now
    },
    acceptedAt: {
        type: Date
    }
});

// Prevent duplicate connections
ConnectionSchema.index({ requester: 1, recipient: 1 }, { unique: true });
ConnectionSchema.index({ status: 1 });

module.exports = mongoose.model('Connection', ConnectionSchema);
