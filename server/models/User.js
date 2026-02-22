const mongoose = require('mongoose');

const UserSchema = new mongoose.Schema({
    username: {
        type: String,
        required: true,
        unique: true
    },
    email: {
        type: String,
        required: true,
        unique: true
    },
    password: {
        type: String,
        required: true
    },
    role: {
        type: String,
        enum: ['candidate', 'recruiter', 'mentor', 'admin'],
        default: 'candidate'
    },
    headline: {
        type: String,
        default: ''
    },
    bio: {
        type: String,
        default: ''
    },
    skills: {
        type: [String],
        default: []
    },
    education: {
        type: String,
        default: ''
    },
    location: {
        type: String,
        default: ''
    },
    industry: {
        type: String,
        default: ''
    },
    website: {
        type: String,
        default: ''
    },
    connections: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    }],
    savedPosts: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Post'
    }],
    createdAt: {
        type: Date,
        default: Date.now
    }
});

module.exports = mongoose.model('User', UserSchema);
