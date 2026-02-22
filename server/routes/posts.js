const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const Post = require('../models/Post');
const User = require('../models/User');
const Notification = require('../models/Notification');

// Helper: extract hashtags from content
function extractHashtags(content) {
    const regex = /#(\w+)/g;
    const tags = [];
    let match;
    while ((match = regex.exec(content)) !== null) {
        tags.push(match[1].toLowerCase());
    }
    return [...new Set(tags)];
}

// Helper: extract @mentions from content
function extractMentions(content) {
    const regex = /@(\w+)/g;
    const mentions = [];
    let match;
    while ((match = regex.exec(content)) !== null) {
        mentions.push(match[1]);
    }
    return mentions;
}

// ===================== CREATE POST =====================
router.post('/', auth, async (req, res) => {
    try {
        const user = await User.findById(req.user.id).select('-password');
        const { content, postType, media, article, poll, visibility } = req.body;

        const hashtags = extractHashtags(content || '');

        // Resolve @mentions to user IDs
        const mentionNames = extractMentions(content || '');
        let mentionIds = [];
        if (mentionNames.length > 0) {
            const mentionedUsers = await User.find({
                username: { $in: mentionNames.map(n => new RegExp(`^${n}$`, 'i')) }
            }).select('_id');
            mentionIds = mentionedUsers.map(u => u._id);
        }

        const newPost = new Post({
            content: content || '',
            user: req.user.id,
            postType: postType || 'text',
            media: media || {},
            article: article || {},
            poll: poll || {},
            visibility: visibility || 'public',
            hashtags,
            mentions: mentionIds,
            reactions: { like: [], celebrate: [], support: [], love: [], insightful: [], funny: [] }
        });

        const post = await newPost.save();
        const populatedPost = await Post.findById(post._id)
            .populate('user', ['username', 'headline', 'skills'])
            .populate('mentions', ['username']);

        // Send mention notifications
        for (const mentionId of mentionIds) {
            if (mentionId.toString() !== req.user.id) {
                await new Notification({
                    recipient: mentionId,
                    sender: req.user.id,
                    type: 'post_mention',
                    message: `${user.username} mentioned you in a post`,
                    relatedPost: post._id
                }).save();
            }
        }

        res.json(populatedPost);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
});

// ===================== GET FEED POSTS =====================
router.get('/', auth, async (req, res) => {
    try {
        const { sort, hashtag, type, page = 1, limit = 20 } = req.query;
        const skip = (parseInt(page) - 1) * parseInt(limit);

        let filter = {};

        // Filter by hashtag
        if (hashtag) {
            filter.hashtags = hashtag.toLowerCase();
        }

        // Filter by post type
        if (type && type !== 'all') {
            filter.postType = type;
        }

        // Visibility: show public + connections' posts
        const currentUser = await User.findById(req.user.id);
        filter.$or = [
            { visibility: 'public' },
            { visibility: 'connections', user: { $in: [...(currentUser.connections || []), req.user.id] } },
            { user: req.user.id }
        ];

        let sortOrder = { createdAt: -1 };
        if (sort === 'top') {
            // Sort by engagement (reactions + comments)
            sortOrder = { createdAt: -1 }; // Mongo can't sort by virtual; we'll sort client-side or use aggregation
        }

        const posts = await Post.find(filter)
            .populate('user', ['username', 'headline', 'skills'])
            .populate('comments.user', ['username', 'headline'])
            .populate('comments.replies.user', ['username'])
            .populate('mentions', ['username'])
            .populate({
                path: 'originalPost',
                populate: { path: 'user', select: 'username headline' }
            })
            .sort(sortOrder)
            .skip(skip)
            .limit(parseInt(limit));

        const total = await Post.countDocuments(filter);

        res.json({
            posts,
            pagination: {
                page: parseInt(page),
                limit: parseInt(limit),
                total,
                pages: Math.ceil(total / parseInt(limit))
            }
        });
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
});

// ===================== GET SINGLE POST =====================
router.get('/:id', auth, async (req, res) => {
    try {
        const post = await Post.findById(req.params.id)
            .populate('user', ['username', 'headline', 'skills'])
            .populate('comments.user', ['username', 'headline'])
            .populate('comments.replies.user', ['username'])
            .populate('mentions', ['username'])
            .populate({
                path: 'originalPost',
                populate: { path: 'user', select: 'username headline' }
            });

        if (!post) return res.status(404).json({ msg: 'Post not found' });
        res.json(post);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
});

// ===================== EDIT POST =====================
router.put('/:id', auth, async (req, res) => {
    try {
        const post = await Post.findById(req.params.id);
        if (!post) return res.status(404).json({ msg: 'Post not found' });
        if (post.user.toString() !== req.user.id) return res.status(401).json({ msg: 'Not authorized' });

        // Save old content to edit history
        post.editHistory.push({ content: post.content, editedAt: new Date() });
        post.content = req.body.content || post.content;
        post.visibility = req.body.visibility || post.visibility;
        post.hashtags = extractHashtags(post.content);
        post.isEdited = true;

        await post.save();
        const updated = await Post.findById(post._id)
            .populate('user', ['username', 'headline']);
        res.json(updated);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
});

// ===================== DELETE POST =====================
router.delete('/:id', auth, async (req, res) => {
    try {
        const post = await Post.findById(req.params.id);
        if (!post) return res.status(404).json({ msg: 'Post not found' });
        if (post.user.toString() !== req.user.id) return res.status(401).json({ msg: 'Not authorized' });

        await Post.findByIdAndDelete(req.params.id);
        res.json({ msg: 'Post removed' });
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
});

// ===================== REACT TO POST =====================
router.put('/react/:id', auth, async (req, res) => {
    try {
        const { reactionType } = req.body; // 'like', 'celebrate', 'support', 'love', 'insightful', 'funny'
        const validReactions = ['like', 'celebrate', 'support', 'love', 'insightful', 'funny'];
        if (!validReactions.includes(reactionType)) {
            return res.status(400).json({ msg: 'Invalid reaction type' });
        }

        const post = await Post.findById(req.params.id);
        if (!post) return res.status(404).json({ msg: 'Post not found' });

        // Initialize reactions if missing
        if (!post.reactions) {
            post.reactions = { like: [], celebrate: [], support: [], love: [], insightful: [], funny: [] };
        }

        // Remove from all reaction types first (user can only have one reaction)
        for (const type of validReactions) {
            if (!post.reactions[type]) post.reactions[type] = [];
            post.reactions[type] = post.reactions[type].filter(id => id.toString() !== req.user.id);
        }

        // Toggle: if they clicked the same reaction they already had, it's removed (above already did it)
        // If different, add to the new one
        const wasInType = post.reactions[reactionType].some(id => id.toString() === req.user.id);
        if (!wasInType) {
            post.reactions[reactionType].push(req.user.id);

            // Also update legacy likes array for backward compatibility
            if (reactionType === 'like' && !post.likes.includes(req.user.id)) {
                post.likes.push(req.user.id);
            }

            // Send notification
            if (post.user.toString() !== req.user.id) {
                const sender = await User.findById(req.user.id).select('username');
                await new Notification({
                    recipient: post.user,
                    sender: req.user.id,
                    type: 'post_like',
                    message: `${sender.username} reacted to your post with ${reactionType}`,
                    relatedPost: post._id
                }).save();
            }
        } else {
            // Remove from legacy likes too
            post.likes = post.likes.filter(id => id.toString() !== req.user.id);
        }

        await post.save();
        res.json(post.reactions);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
});

// ===================== LEGACY LIKE (backward compat) =====================
router.put('/like/:id', auth, async (req, res) => {
    try {
        const post = await Post.findById(req.params.id);
        if (!post) return res.status(404).json({ msg: 'Post not found' });

        if (post.likes.some(like => like.toString() === req.user.id)) {
            post.likes = post.likes.filter(like => like.toString() !== req.user.id);
            if (post.reactions?.like) {
                post.reactions.like = post.reactions.like.filter(id => id.toString() !== req.user.id);
            }
        } else {
            post.likes.unshift(req.user.id);
            if (!post.reactions) post.reactions = { like: [], celebrate: [], support: [], love: [], insightful: [], funny: [] };
            post.reactions.like.push(req.user.id);
        }

        await post.save();
        res.json(post.likes);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
});

// ===================== COMMENT ON POST =====================
router.post('/comment/:id', auth, async (req, res) => {
    try {
        const user = await User.findById(req.user.id).select('-password');
        const post = await Post.findById(req.params.id);
        if (!post) return res.status(404).json({ msg: 'Post not found' });

        const newComment = {
            text: req.body.text,
            user: req.user.id
        };

        post.comments.unshift(newComment);
        await post.save();

        // Re-populate
        const updated = await Post.findById(req.params.id)
            .populate('comments.user', ['username', 'headline'])
            .populate('comments.replies.user', ['username']);

        // Notification
        if (post.user.toString() !== req.user.id) {
            await new Notification({
                recipient: post.user,
                sender: req.user.id,
                type: 'post_comment',
                message: `${user.username} commented on your post`,
                relatedPost: post._id
            }).save();
        }

        res.json(updated.comments);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
});

// ===================== DELETE COMMENT =====================
router.delete('/comment/:postId/:commentId', auth, async (req, res) => {
    try {
        const post = await Post.findById(req.params.postId);
        if (!post) return res.status(404).json({ msg: 'Post not found' });

        const comment = post.comments.id(req.params.commentId);
        if (!comment) return res.status(404).json({ msg: 'Comment not found' });
        if (comment.user.toString() !== req.user.id && post.user.toString() !== req.user.id) {
            return res.status(401).json({ msg: 'Not authorized' });
        }

        post.comments.pull(req.params.commentId);
        await post.save();
        res.json(post.comments);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
});

// ===================== LIKE A COMMENT =====================
router.put('/comment/like/:postId/:commentId', auth, async (req, res) => {
    try {
        const post = await Post.findById(req.params.postId);
        if (!post) return res.status(404).json({ msg: 'Post not found' });

        const comment = post.comments.id(req.params.commentId);
        if (!comment) return res.status(404).json({ msg: 'Comment not found' });

        if (comment.likes.some(id => id.toString() === req.user.id)) {
            comment.likes = comment.likes.filter(id => id.toString() !== req.user.id);
        } else {
            comment.likes.push(req.user.id);
        }

        await post.save();
        res.json(comment);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
});

// ===================== REPLY TO COMMENT =====================
router.post('/comment/reply/:postId/:commentId', auth, async (req, res) => {
    try {
        const user = await User.findById(req.user.id).select('username');
        const post = await Post.findById(req.params.postId);
        if (!post) return res.status(404).json({ msg: 'Post not found' });

        const comment = post.comments.id(req.params.commentId);
        if (!comment) return res.status(404).json({ msg: 'Comment not found' });

        comment.replies.push({
            user: req.user.id,
            text: req.body.text
        });

        await post.save();

        const updated = await Post.findById(req.params.postId)
            .populate('comments.user', ['username', 'headline'])
            .populate('comments.replies.user', ['username']);

        // Notification to comment author
        if (comment.user.toString() !== req.user.id) {
            await new Notification({
                recipient: comment.user,
                sender: req.user.id,
                type: 'comment_reply',
                message: `${user.username} replied to your comment`,
                relatedPost: post._id
            }).save();
        }

        res.json(updated.comments);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
});

// ===================== SHARE / REPOST =====================
router.post('/share/:id', auth, async (req, res) => {
    try {
        const originalPost = await Post.findById(req.params.id);
        if (!originalPost) return res.status(404).json({ msg: 'Post not found' });

        const user = await User.findById(req.user.id).select('username');

        // Track the share on original post
        if (!originalPost.shares.includes(req.user.id)) {
            originalPost.shares.push(req.user.id);
            await originalPost.save();
        }

        // Create repost
        const repost = new Post({
            user: req.user.id,
            postType: 'repost',
            content: req.body.comment || '',
            repostComment: req.body.comment || '',
            originalPost: req.params.id,
            visibility: req.body.visibility || 'public',
            reactions: { like: [], celebrate: [], support: [], love: [], insightful: [], funny: [] }
        });

        await repost.save();
        const populated = await Post.findById(repost._id)
            .populate('user', ['username', 'headline'])
            .populate({
                path: 'originalPost',
                populate: { path: 'user', select: 'username headline' }
            });

        // Notification
        if (originalPost.user.toString() !== req.user.id) {
            await new Notification({
                recipient: originalPost.user,
                sender: req.user.id,
                type: 'post_share',
                message: `${user.username} shared your post`,
                relatedPost: originalPost._id
            }).save();
        }

        res.json(populated);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
});

// ===================== BOOKMARK / SAVE POST =====================
router.put('/bookmark/:id', auth, async (req, res) => {
    try {
        const post = await Post.findById(req.params.id);
        if (!post) return res.status(404).json({ msg: 'Post not found' });

        if (post.bookmarks.some(id => id.toString() === req.user.id)) {
            post.bookmarks = post.bookmarks.filter(id => id.toString() !== req.user.id);
        } else {
            post.bookmarks.push(req.user.id);
        }

        await post.save();
        res.json({ bookmarked: post.bookmarks.includes(req.user.id), count: post.bookmarks.length });
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
});

// ===================== GET BOOKMARKED POSTS =====================
router.get('/saved/bookmarks', auth, async (req, res) => {
    try {
        const posts = await Post.find({ bookmarks: req.user.id })
            .populate('user', ['username', 'headline'])
            .sort({ createdAt: -1 });
        res.json(posts);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
});

// ===================== VOTE ON POLL =====================
router.put('/poll/vote/:postId/:optionIndex', auth, async (req, res) => {
    try {
        const post = await Post.findById(req.params.postId);
        if (!post || post.postType !== 'poll') {
            return res.status(400).json({ msg: 'Not a poll post' });
        }

        if (post.poll.endsAt && new Date(post.poll.endsAt) < new Date()) {
            return res.status(400).json({ msg: 'Poll has ended' });
        }

        const optionIdx = parseInt(req.params.optionIndex);
        if (optionIdx < 0 || optionIdx >= post.poll.options.length) {
            return res.status(400).json({ msg: 'Invalid option' });
        }

        // Remove previous votes if not allowMultiple
        if (!post.poll.allowMultiple) {
            for (const option of post.poll.options) {
                option.votes = option.votes.filter(id => id.toString() !== req.user.id);
            }
        }

        const option = post.poll.options[optionIdx];
        if (option.votes.some(id => id.toString() === req.user.id)) {
            option.votes = option.votes.filter(id => id.toString() !== req.user.id);
        } else {
            option.votes.push(req.user.id);
        }

        await post.save();
        res.json(post.poll);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
});

// ===================== TRENDING HASHTAGS =====================
router.get('/trending/hashtags', auth, async (req, res) => {
    try {
        const trending = await Post.aggregate([
            { $match: { createdAt: { $gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) } } },
            { $unwind: '$hashtags' },
            { $group: { _id: '$hashtags', count: { $sum: 1 } } },
            { $sort: { count: -1 } },
            { $limit: 10 }
        ]);
        res.json(trending);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
});

// ===================== GET USER'S OWN POSTS =====================
router.get('/user/:userId', auth, async (req, res) => {
    try {
        const posts = await Post.find({ user: req.params.userId })
            .populate('user', ['username', 'headline'])
            .sort({ createdAt: -1 });
        res.json(posts);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
});

module.exports = router;
