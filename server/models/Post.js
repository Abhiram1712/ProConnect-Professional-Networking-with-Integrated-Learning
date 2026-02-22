const mongoose = require('mongoose');

const ReplySchema = new mongoose.Schema({
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    text: { type: String, required: true },
    likes: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
    createdAt: { type: Date, default: Date.now }
});

const CommentSchema = new mongoose.Schema({
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    text: { type: String, required: true },
    likes: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
    replies: [ReplySchema],
    createdAt: { type: Date, default: Date.now }
});

const PollOptionSchema = new mongoose.Schema({
    text: { type: String, required: true },
    votes: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }]
});

const PostSchema = new mongoose.Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    // Post type: text, image, video, article, poll, celebration, document, repost
    postType: {
        type: String,
        enum: ['text', 'image', 'video', 'article', 'poll', 'celebration', 'document', 'repost'],
        default: 'text'
    },
    content: {
        type: String,
        default: ''
    },
    // Media support
    media: {
        url: String,
        type: { type: String, enum: ['image', 'video', 'document', ''] },
        caption: String
    },
    // Article link
    article: {
        url: String,
        title: String,
        description: String,
        image: String
    },
    // Poll support
    poll: {
        question: String,
        options: [PollOptionSchema],
        endsAt: Date,
        allowMultiple: { type: Boolean, default: false }
    },
    // Visibility
    visibility: {
        type: String,
        enum: ['public', 'connections', 'private'],
        default: 'public'
    },
    // Reactions (LinkedIn-style multi-reaction)
    reactions: {
        like: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
        celebrate: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
        support: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
        love: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
        insightful: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
        funny: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }]
    },
    // Legacy likes for backward compatibility
    likes: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    }],
    comments: [CommentSchema],
    // Shares / Reposts
    shares: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
    // If this is a repost, reference the original
    originalPost: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Post'
    },
    repostComment: String,
    // Hashtags
    hashtags: [{ type: String }],
    // Mentions
    mentions: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
    // Bookmarks (users who saved this post)
    bookmarks: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
    // Edit tracking
    isEdited: { type: Boolean, default: false },
    editHistory: [{
        content: String,
        editedAt: { type: Date, default: Date.now }
    }],
    createdAt: {
        type: Date,
        default: Date.now
    }
});

// Virtual for total reaction count
PostSchema.virtual('totalReactions').get(function () {
    const r = this.reactions || {};
    return (r.like?.length || 0) + (r.celebrate?.length || 0) +
        (r.support?.length || 0) + (r.love?.length || 0) +
        (r.insightful?.length || 0) + (r.funny?.length || 0);
});

PostSchema.set('toJSON', { virtuals: true });
PostSchema.set('toObject', { virtuals: true });

// Index for hashtag search
PostSchema.index({ hashtags: 1 });
PostSchema.index({ createdAt: -1 });
PostSchema.index({ user: 1, createdAt: -1 });

module.exports = mongoose.model('Post', PostSchema);
