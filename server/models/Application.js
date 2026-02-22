const mongoose = require('mongoose');

const ApplicationSchema = new mongoose.Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    opportunity: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Opportunity',
        required: true
    },
    status: {
        type: String,
        enum: ['Applied', 'Reviewing', 'Shortlisted', 'Rejected', 'Accepted'],
        default: 'Applied'
    },
    resumeUrl: {
        type: String, // Ideally, this would be a URL from an upload service
        default: ''
    },
    coverLetter: {
        type: String,
        default: ''
    },
    appliedAt: {
        type: Date,
        default: Date.now
    }
});

// Prevent multiple applications to the same opportunity by the same user
ApplicationSchema.index({ user: 1, opportunity: 1 }, { unique: true });

module.exports = mongoose.model('Application', ApplicationSchema);
