const mongoose = require('mongoose');

const OpportunitySchema = new mongoose.Schema({
    title: {
        type: String,
        required: true,
    },
    company: {
        type: String,
        required: true,
    },
    type: {
        type: String,
        enum: ['Hackathon', 'Job', 'Internship', 'Competition'],
        required: true,
    },
    description: {
        type: String,
        required: true,
    },
    deadline: {
        type: Date,
        required: true,
    },
    reward: {
        type: String,
        required: false,
    },
    logo: {
        type: String,
        required: false,
    },
    postedAt: {
        type: Date,
        default: Date.now,
    },
});

module.exports = mongoose.model('Opportunity', OpportunitySchema);
