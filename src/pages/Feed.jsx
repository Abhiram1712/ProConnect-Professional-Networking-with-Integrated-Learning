import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import {
    ThumbsUp, MessageSquare, Share2, Send, User, Image as ImageIcon,
    MoreHorizontal, Bookmark, BookmarkCheck, Edit3, Trash2, Globe,
    Lock, Users, X, TrendingUp, Heart, Lightbulb, PartyPopper,
    HandHeart, Smile, FileText, BarChart3, Award, ChevronDown, ChevronUp,
    Clock, Eye
} from 'lucide-react';
import { toast } from 'react-toastify';
import './Feed.css';

const API = 'http://localhost:5000/api';

const REACTIONS = [
    { type: 'like', emoji: '👍', label: 'Like', color: '#378fe9' },
    { type: 'celebrate', emoji: '👏', label: 'Celebrate', color: '#44b37d' },
    { type: 'support', emoji: '🤝', label: 'Support', color: '#c077e6' },
    { type: 'love', emoji: '❤️', label: 'Love', color: '#df5553' },
    { type: 'insightful', emoji: '💡', label: 'Insightful', color: '#e7a33e' },
    { type: 'funny', emoji: '😄', label: 'Funny', color: '#8cc3f5' }
];

const VISIBILITY_OPTIONS = [
    { value: 'public', label: 'Anyone', icon: Globe },
    { value: 'connections', label: 'Connections only', icon: Users },
    { value: 'private', label: 'Only me', icon: Lock }
];

const Feed = () => {
    const navigate = useNavigate();
    const [posts, setPosts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [user] = useState(JSON.parse(localStorage.getItem('user')));
    const [showCreateModal, setShowCreateModal] = useState(false);
    const [sortBy, setSortBy] = useState('recent');
    const [trending, setTrending] = useState([]);
    const [page, setPage] = useState(1);
    const [hasMore, setHasMore] = useState(true);
    const [activeFilter, setActiveFilter] = useState('all');

    // Comment state
    const [activeCommentBox, setActiveCommentBox] = useState(null);
    const [commentText, setCommentText] = useState('');
    const [replyingTo, setReplyingTo] = useState(null);
    const [replyText, setReplyText] = useState('');

    // Post menu
    const [openMenu, setOpenMenu] = useState(null);

    // Reaction picker
    const [showReactionPicker, setShowReactionPicker] = useState(null);
    const reactionTimeout = useRef(null);

    // Share modal
    const [shareModal, setShareModal] = useState(null);
    const [shareComment, setShareComment] = useState('');

    // Profile stats
    const [connectionCount, setConnectionCount] = useState(0);
    const [profileViews] = useState(Math.floor(Math.random() * 50) + 5);

    const token = localStorage.getItem('token');

    // Auth guard: redirect to login if not authenticated
    useEffect(() => {
        if (!token) {
            navigate('/login');
            return;
        }
    }, [token, navigate]);

    useEffect(() => {
        if (!token) return;
        fetchPosts();
        fetchTrending();
        fetchConnectionCount();
    }, [sortBy, activeFilter, token]);

    const fetchPosts = async (pageNum = 1) => {
        try {
            setLoading(pageNum === 1);
            const params = new URLSearchParams({
                page: pageNum,
                limit: 15,
                sort: sortBy,
                type: activeFilter
            });
            const res = await fetch(`${API}/posts?${params}`, {
                headers: { 'x-auth-token': token }
            });
            const data = await res.json();

            if (data.posts) {
                if (pageNum === 1) {
                    setPosts(data.posts);
                } else {
                    setPosts(prev => [...prev, ...data.posts]);
                }
                setHasMore(pageNum < data.pagination.pages);
                setPage(pageNum);
            } else if (Array.isArray(data)) {
                // Backward compatibility
                setPosts(data);
                setHasMore(false);
            }
        } catch (err) {
            console.error("Error fetching posts:", err);
        } finally {
            setLoading(false);
        }
    };

    const fetchTrending = async () => {
        try {
            const res = await fetch(`${API}/posts/trending/hashtags`, {
                headers: { 'x-auth-token': token }
            });
            const data = await res.json();
            if (Array.isArray(data)) setTrending(data);
        } catch (err) {
            console.error("Error fetching trending:", err);
        }
    };

    const fetchConnectionCount = async () => {
        try {
            const res = await fetch(`${API}/connections`, {
                headers: { 'x-auth-token': token }
            });
            const data = await res.json();
            if (Array.isArray(data)) setConnectionCount(data.length);
        } catch (err) {
            console.error(err);
        }
    };

    // ============ REACTIONS ============
    const handleReaction = async (postId, reactionType) => {
        try {
            const res = await fetch(`${API}/posts/react/${postId}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json', 'x-auth-token': token },
                body: JSON.stringify({ reactionType })
            });
            if (res.ok) {
                const reactions = await res.json();
                setPosts(posts.map(p => p._id === postId ? { ...p, reactions } : p));
            }
        } catch (err) {
            console.error("Error reacting:", err);
        }
        setShowReactionPicker(null);
    };

    const handleQuickLike = async (postId) => {
        const post = posts.find(p => p._id === postId);
        const userReaction = getUserReaction(post);
        if (userReaction) {
            // Remove reaction
            await handleReaction(postId, userReaction);
        } else {
            await handleReaction(postId, 'like');
        }
    };

    const getUserReaction = (post) => {
        if (!post?.reactions) return null;
        for (const r of REACTIONS) {
            if (post.reactions[r.type]?.includes(user?._id)) return r.type;
        }
        return null;
    };

    const getTotalReactions = (post) => {
        if (!post?.reactions) return 0;
        return REACTIONS.reduce((sum, r) => sum + (post.reactions[r.type]?.length || 0), 0);
    };

    const getTopReactions = (post) => {
        if (!post?.reactions) return [];
        return REACTIONS
            .filter(r => (post.reactions[r.type]?.length || 0) > 0)
            .sort((a, b) => (post.reactions[b.type]?.length || 0) - (post.reactions[a.type]?.length || 0))
            .slice(0, 3);
    };

    // ============ COMMENTS ============
    const handleComment = async (postId) => {
        if (!commentText.trim()) return;
        try {
            const res = await fetch(`${API}/posts/comment/${postId}`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json', 'x-auth-token': token },
                body: JSON.stringify({ text: commentText })
            });
            if (res.ok) {
                const comments = await res.json();
                setPosts(posts.map(p => p._id === postId ? { ...p, comments } : p));
                setCommentText('');
            }
        } catch (err) {
            console.error("Error commenting:", err);
        }
    };

    const handleReply = async (postId, commentId) => {
        if (!replyText.trim()) return;
        try {
            const res = await fetch(`${API}/posts/comment/reply/${postId}/${commentId}`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json', 'x-auth-token': token },
                body: JSON.stringify({ text: replyText })
            });
            if (res.ok) {
                const comments = await res.json();
                setPosts(posts.map(p => p._id === postId ? { ...p, comments } : p));
                setReplyText('');
                setReplyingTo(null);
            }
        } catch (err) {
            console.error("Error replying:", err);
        }
    };

    const handleCommentLike = async (postId, commentId) => {
        try {
            const res = await fetch(`${API}/posts/comment/like/${postId}/${commentId}`, {
                method: 'PUT',
                headers: { 'x-auth-token': token }
            });
            if (res.ok) {
                fetchPosts(1);
            }
        } catch (err) {
            console.error(err);
        }
    };

    const handleDeleteComment = async (postId, commentId) => {
        try {
            const res = await fetch(`${API}/posts/comment/${postId}/${commentId}`, {
                method: 'DELETE',
                headers: { 'x-auth-token': token }
            });
            if (res.ok) {
                const comments = await res.json();
                setPosts(posts.map(p => p._id === postId ? { ...p, comments } : p));
                toast.success('Comment deleted');
            }
        } catch (err) {
            console.error(err);
        }
    };

    // ============ SHARE / REPOST ============
    const handleShare = async (postId) => {
        try {
            const res = await fetch(`${API}/posts/share/${postId}`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json', 'x-auth-token': token },
                body: JSON.stringify({ comment: shareComment })
            });
            if (res.ok) {
                const repost = await res.json();
                setPosts([repost, ...posts]);
                toast.success('Post shared to your feed!');
                setShareModal(null);
                setShareComment('');
            }
        } catch (err) {
            console.error(err);
            toast.error('Failed to share post');
        }
    };

    // ============ BOOKMARK ============
    const handleBookmark = async (postId) => {
        try {
            const res = await fetch(`${API}/posts/bookmark/${postId}`, {
                method: 'PUT',
                headers: { 'x-auth-token': token }
            });
            if (res.ok) {
                const data = await res.json();
                setPosts(posts.map(p => {
                    if (p._id === postId) {
                        const bookmarks = data.bookmarked
                            ? [...(p.bookmarks || []), user._id]
                            : (p.bookmarks || []).filter(id => id !== user._id);
                        return { ...p, bookmarks };
                    }
                    return p;
                }));
                toast.success(data.bookmarked ? 'Post saved!' : 'Post unsaved');
            }
        } catch (err) {
            console.error(err);
        }
    };

    // ============ EDIT / DELETE POST ============
    const handleDeletePost = async (postId) => {
        if (!window.confirm('Are you sure you want to delete this post?')) return;
        try {
            const res = await fetch(`${API}/posts/${postId}`, {
                method: 'DELETE',
                headers: { 'x-auth-token': token }
            });
            if (res.ok) {
                setPosts(posts.filter(p => p._id !== postId));
                toast.success('Post deleted');
            }
        } catch (err) {
            console.error(err);
            toast.error('Failed to delete post');
        }
        setOpenMenu(null);
    };

    // ============ POLL VOTING ============
    const handlePollVote = async (postId, optionIndex) => {
        try {
            const res = await fetch(`${API}/posts/poll/vote/${postId}/${optionIndex}`, {
                method: 'PUT',
                headers: { 'x-auth-token': token }
            });
            if (res.ok) {
                const poll = await res.json();
                setPosts(posts.map(p => p._id === postId ? { ...p, poll } : p));
            }
        } catch (err) {
            console.error(err);
        }
    };

    // ============ RENDERING HELPERS ============
    const renderContent = (content) => {
        if (!content) return null;
        // Highlight hashtags and mentions
        const parts = content.split(/(#\w+|@\w+)/g);
        return parts.map((part, i) => {
            if (part.startsWith('#')) {
                return <span key={i} className="hashtag" onClick={() => setActiveFilter(part.slice(1))}>{part}</span>;
            }
            if (part.startsWith('@')) {
                return <span key={i} className="mention">{part}</span>;
            }
            return part;
        });
    };

    const timeAgo = (date) => {
        const now = new Date();
        const diff = now - new Date(date);
        const minutes = Math.floor(diff / 60000);
        const hours = Math.floor(diff / 3600000);
        const days = Math.floor(diff / 86400000);
        const weeks = Math.floor(diff / 604800000);

        if (minutes < 1) return 'Just now';
        if (minutes < 60) return `${minutes}m`;
        if (hours < 24) return `${hours}h`;
        if (days < 7) return `${days}d`;
        if (weeks < 4) return `${weeks}w`;
        return new Date(date).toLocaleDateString();
    };

    const getVisibilityIcon = (visibility) => {
        switch (visibility) {
            case 'connections': return <Users size={12} />;
            case 'private': return <Lock size={12} />;
            default: return <Globe size={12} />;
        }
    };

    // ============ LOAD MORE ============
    const loadMore = () => {
        if (hasMore && !loading) {
            fetchPosts(page + 1);
        }
    };

    return (
        <div className="feed-container container">
            <div className="feed-layout">
                {/* ====== LEFT SIDEBAR ====== */}
                <div className="sidebar left-sidebar">
                    <div className="profile-mini">
                        <div className="profile-bg"></div>
                        <div className="profile-img-wrapper">
                            <div className="profile-img-placeholder"><User size={38} /></div>
                        </div>
                        <h3>{user?.username || 'Guest'}</h3>
                        <p className="headline-text">{user?.headline || 'Welcome to your professional feed'}</p>
                    </div>
                    <div className="profile-stats">
                        <div className="profile-stat-row">
                            <span>Profile viewers</span>
                            <span>{profileViews}</span>
                        </div>
                        <div className="profile-stat-row">
                            <span>Connections</span>
                            <span>{connectionCount}</span>
                        </div>
                    </div>
                    <div className="profile-mini-footer">
                        <a href="/profile"><Bookmark size={14} /> Saved items</a>
                    </div>
                </div>

                {/* ====== MAIN FEED ====== */}
                <div className="main-feed">
                    {/* Create Post */}
                    <div className="create-post card" style={{ boxShadow: 'none' }}>
                        <div className="input-row">
                            <div className="user-icon"><User size={22} /></div>
                            <input
                                type="text"
                                placeholder="Start a post, try writing with #hashtags"
                                onClick={() => setShowCreateModal(true)}
                                readOnly
                            />
                        </div>
                        <div className="action-row">
                            <div className="media-actions">
                                <button className="icon-btn media-btn" onClick={() => setShowCreateModal(true)}>
                                    <ImageIcon size={18} /> Media
                                </button>
                                <button className="icon-btn event-btn" onClick={() => setShowCreateModal(true)}>
                                    <Award size={18} /> Celebrate
                                </button>
                                <button className="icon-btn poll-btn" onClick={() => setShowCreateModal(true)}>
                                    <BarChart3 size={18} /> Poll
                                </button>
                                <button className="icon-btn article-btn" onClick={() => setShowCreateModal(true)}>
                                    <FileText size={18} /> Article
                                </button>
                            </div>
                        </div>
                    </div>

                    {/* Sort Bar */}
                    <div className="divider-row">
                        <div className="divider-line"></div>
                        <button className="sort-toggle" onClick={() => setSortBy(sortBy === 'recent' ? 'top' : 'recent')}>
                            Sort by: <span className="active-sort">{sortBy === 'recent' ? 'Recent' : 'Top'}</span>
                            <ChevronDown size={14} />
                        </button>
                    </div>

                    {/* Loading Skeleton */}
                    {loading && (
                        <>
                            {[1, 2, 3].map(i => (
                                <div key={i} className="skeleton-post">
                                    <div className="skeleton-row">
                                        <div className="skeleton-circle" />
                                        <div style={{ flex: 1 }}>
                                            <div className="skeleton-line w-40" style={{ marginBottom: '0.5rem' }} />
                                            <div className="skeleton-line w-60" />
                                        </div>
                                    </div>
                                    <div className="skeleton-line w-100" style={{ marginBottom: '0.5rem' }} />
                                    <div className="skeleton-line w-80" />
                                </div>
                            ))}
                        </>
                    )}

                    {/* Posts List */}
                    {!loading && posts.map(post => (
                        <PostCard
                            key={post._id}
                            post={post}
                            user={user}
                            onReaction={handleReaction}
                            onQuickLike={handleQuickLike}
                            getUserReaction={getUserReaction}
                            getTotalReactions={getTotalReactions}
                            getTopReactions={getTopReactions}
                            showReactionPicker={showReactionPicker}
                            setShowReactionPicker={setShowReactionPicker}
                            reactionTimeout={reactionTimeout}
                            activeCommentBox={activeCommentBox}
                            setActiveCommentBox={setActiveCommentBox}
                            commentText={commentText}
                            setCommentText={setCommentText}
                            onComment={handleComment}
                            onReply={handleReply}
                            replyingTo={replyingTo}
                            setReplyingTo={setReplyingTo}
                            replyText={replyText}
                            setReplyText={setReplyText}
                            onCommentLike={handleCommentLike}
                            onDeleteComment={handleDeleteComment}
                            onBookmark={handleBookmark}
                            onDelete={handleDeletePost}
                            onShare={() => setShareModal(post._id)}
                            openMenu={openMenu}
                            setOpenMenu={setOpenMenu}
                            renderContent={renderContent}
                            timeAgo={timeAgo}
                            getVisibilityIcon={getVisibilityIcon}
                            onPollVote={handlePollVote}
                        />
                    ))}

                    {/* Load More */}
                    {hasMore && !loading && posts.length > 0 && (
                        <div style={{ textAlign: 'center', padding: '1rem' }}>
                            <button className="btn btn-outline" onClick={loadMore} style={{ borderRadius: '20px' }}>
                                Load more posts
                            </button>
                        </div>
                    )}

                    {/* Empty State */}
                    {posts.length === 0 && !loading && (
                        <div className="empty-feed">
                            <div className="empty-feed-icon">📝</div>
                            <h3>No posts yet</h3>
                            <p>Be the first to share your thoughts, achievements, and professional insights!</p>
                            <button className="btn btn-primary" style={{ marginTop: '1rem', borderRadius: '20px' }}
                                onClick={() => setShowCreateModal(true)}>
                                Create your first post
                            </button>
                        </div>
                    )}
                </div>

                {/* ====== RIGHT SIDEBAR ====== */}
                <div className="sidebar right-sidebar">
                    {/* Trending */}
                    {trending.length > 0 && (
                        <div className="trending-section">
                            <h3><TrendingUp size={16} /> Trending</h3>
                            {trending.slice(0, 5).map((t, i) => (
                                <div key={i} className="trending-item" onClick={() => setActiveFilter(t._id)}>
                                    <div className="trending-tag">#{t._id}</div>
                                    <div className="trending-count">{t.count} posts</div>
                                </div>
                            ))}
                        </div>
                    )}

                    {/* Add to feed */}
                    <div className="recommendations-section">
                        <h3>Add to your feed</h3>
                        <ul className="recommendations-list">
                            <li>
                                <div className="rec-user-icon"><User size={18} /></div>
                                <div className="rec-info">
                                    <h4>Tech News</h4>
                                    <p>Company • Technology</p>
                                    <button className="follow-btn">+ Follow</button>
                                </div>
                            </li>
                            <li>
                                <div className="rec-user-icon"><User size={18} /></div>
                                <div className="rec-info">
                                    <h4>Industry Insights</h4>
                                    <p>Newsletter • 12K followers</p>
                                    <button className="follow-btn">+ Follow</button>
                                </div>
                            </li>
                            <li>
                                <div className="rec-user-icon"><User size={18} /></div>
                                <div className="rec-info">
                                    <h4>Career Tips</h4>
                                    <p>Group • 5K members</p>
                                    <button className="follow-btn">+ Follow</button>
                                </div>
                            </li>
                        </ul>
                    </div>
                </div>
            </div>

            {/* ====== CREATE POST MODAL ====== */}
            {showCreateModal && (
                <CreatePostModal
                    user={user}
                    token={token}
                    onClose={() => setShowCreateModal(false)}
                    onPostCreated={(post) => {
                        setPosts([post, ...posts]);
                        setShowCreateModal(false);
                        toast.success('Post published!');
                    }}
                />
            )}

            {/* ====== SHARE MODAL ====== */}
            {shareModal && (
                <div className="modal-overlay" onClick={() => setShareModal(null)}>
                    <div className="create-post-modal" onClick={e => e.stopPropagation()}>
                        <div className="modal-header">
                            <h3>Share post</h3>
                            <button className="modal-close-btn" onClick={() => setShareModal(null)}><X size={20} /></button>
                        </div>
                        <div className="modal-body">
                            <textarea
                                className="post-editor-textarea"
                                placeholder="Add your thoughts about this post..."
                                value={shareComment}
                                onChange={e => setShareComment(e.target.value)}
                                rows={3}
                            />
                        </div>
                        <div className="modal-footer">
                            <button className="btn btn-outline" onClick={() => setShareModal(null)} style={{ borderRadius: '20px' }}>Cancel</button>
                            <button className="btn btn-primary" onClick={() => handleShare(shareModal)} style={{ borderRadius: '20px' }}>Share</button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

// ============================================
// POST CARD COMPONENT
// ============================================
const PostCard = ({
    post, user, onReaction, onQuickLike, getUserReaction, getTotalReactions, getTopReactions,
    showReactionPicker, setShowReactionPicker, reactionTimeout,
    activeCommentBox, setActiveCommentBox, commentText, setCommentText, onComment,
    onReply, replyingTo, setReplyingTo, replyText, setReplyText,
    onCommentLike, onDeleteComment, onBookmark, onDelete, onShare,
    openMenu, setOpenMenu, renderContent, timeAgo, getVisibilityIcon, onPollVote
}) => {
    const userReaction = getUserReaction(post);
    const totalReactions = getTotalReactions(post);
    const topReactions = getTopReactions(post);
    const isOwner = post.user?._id === user?._id;
    const isBookmarked = post.bookmarks?.includes(user?._id);
    const [expandContent, setExpandContent] = useState(false);
    const [showAllComments, setShowAllComments] = useState(false);

    const contentTooLong = (post.content?.length || 0) > 300;
    const displayContent = contentTooLong && !expandContent
        ? post.content.substring(0, 300)
        : post.content;

    const visibleComments = showAllComments
        ? post.comments
        : (post.comments || []).slice(0, 2);

    const reactionObj = userReaction ? REACTIONS.find(r => r.type === userReaction) : null;

    return (
        <div className="post-card">
            {/* Repost badge */}
            {post.postType === 'repost' && (
                <div className="repost-badge">
                    <Share2 size={14} />
                    <span>{post.user?.username} reposted this</span>
                </div>
            )}

            <div className="post-card-inner">
                {/* Header */}
                <div className="post-header">
                    <div className="post-user-icon"><User size={22} /></div>
                    <div className="post-header-info">
                        <h4>
                            {post.user?.username || 'Unknown User'}
                            <span className="connection-degree">• 1st</span>
                        </h4>
                        <p className="post-meta">
                            {post.user?.headline || 'Professional'} • {timeAgo(post.createdAt)}{' '}
                            <span className="visibility-badge">
                                • {getVisibilityIcon(post.visibility)}
                            </span>
                            {post.isEdited && <span className="edited-badge">(edited)</span>}
                        </p>
                    </div>
                    <div style={{ position: 'relative' }}>
                        <button className="post-options-btn" onClick={() => setOpenMenu(openMenu === post._id ? null : post._id)}>
                            <MoreHorizontal size={20} />
                        </button>
                        {openMenu === post._id && (
                            <div className="post-menu">
                                <button className="post-menu-item" onClick={() => { onBookmark(post._id); setOpenMenu(null); }}>
                                    {isBookmarked ? <BookmarkCheck size={18} /> : <Bookmark size={18} />}
                                    {isBookmarked ? 'Unsave' : 'Save'}
                                </button>
                                {isOwner && (
                                    <>
                                        <button className="post-menu-item danger" onClick={() => onDelete(post._id)}>
                                            <Trash2 size={18} /> Delete post
                                        </button>
                                    </>
                                )}
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/* Content */}
            <div className="post-content">
                <p style={{ marginBottom: 0 }}>
                    {renderContent(displayContent)}
                    {contentTooLong && !expandContent && (
                        <span className="read-more" onClick={() => setExpandContent(true)}>... see more</span>
                    )}
                </p>
            </div>

            {/* Original Post Embed (for reposts) */}
            {post.postType === 'repost' && post.originalPost && (
                <div className="original-post-embed">
                    <div className="original-header">
                        <div className="original-avatar"><User size={14} /></div>
                        <div>
                            <strong style={{ fontSize: '0.85rem' }}>{post.originalPost.user?.username}</strong>
                            <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', margin: 0 }}>
                                {post.originalPost.user?.headline}
                            </p>
                        </div>
                    </div>
                    <div className="original-content">
                        {post.originalPost.content?.substring(0, 200)}
                        {(post.originalPost.content?.length || 0) > 200 && '...'}
                    </div>
                </div>
            )}

            {/* Poll */}
            {post.postType === 'poll' && post.poll?.options && (
                <PollSection post={post} user={user} onVote={onPollVote} />
            )}

            {/* Stats */}
            {(totalReactions > 0 || (post.comments?.length || 0) > 0 || (post.shares?.length || 0) > 0) && (
                <div className="post-stats">
                    {totalReactions > 0 && (
                        <div className="reactions-summary">
                            <div className="reaction-icons-stack">
                                {topReactions.map(r => (
                                    <div key={r.type} className={`reaction-icon-mini ${r.type}`}>
                                        {r.emoji}
                                    </div>
                                ))}
                            </div>
                            <span>{totalReactions}</span>
                        </div>
                    )}
                    <div className="engagement-stats">
                        {(post.comments?.length || 0) > 0 && (
                            <span onClick={() => setActiveCommentBox(activeCommentBox === post._id ? null : post._id)}>
                                {post.comments.length} comment{post.comments.length !== 1 ? 's' : ''}
                            </span>
                        )}
                        {(post.shares?.length || 0) > 0 && (
                            <span>{post.shares.length} repost{post.shares.length !== 1 ? 's' : ''}</span>
                        )}
                    </div>
                </div>
            )}

            {/* Action Buttons */}
            <div className="post-footer">
                <div className="reaction-picker-trigger"
                    onMouseEnter={() => {
                        clearTimeout(reactionTimeout.current);
                        reactionTimeout.current = setTimeout(() => setShowReactionPicker(post._id), 500);
                    }}
                    onMouseLeave={() => {
                        clearTimeout(reactionTimeout.current);
                        reactionTimeout.current = setTimeout(() => setShowReactionPicker(null), 300);
                    }}
                >
                    {showReactionPicker === post._id && (
                        <div className="reaction-picker"
                            onMouseEnter={() => clearTimeout(reactionTimeout.current)}
                            onMouseLeave={() => {
                                reactionTimeout.current = setTimeout(() => setShowReactionPicker(null), 300);
                            }}
                        >
                            {REACTIONS.map(r => (
                                <button key={r.type} className="reaction-btn" onClick={() => onReaction(post._id, r.type)}
                                    title={r.label}>
                                    {r.emoji}
                                    <span className="reaction-label">{r.label}</span>
                                </button>
                            ))}
                        </div>
                    )}
                    <button
                        className={`action-btn ${userReaction ? 'active' : ''}`}
                        onClick={() => onQuickLike(post._id)}
                        style={reactionObj ? { color: reactionObj.color } : {}}
                    >
                        {reactionObj ? <span style={{ fontSize: '1.1rem' }}>{reactionObj.emoji}</span> : <ThumbsUp size={18} />}
                        {reactionObj ? reactionObj.label : 'Like'}
                    </button>
                </div>

                <button className="action-btn" onClick={() => setActiveCommentBox(activeCommentBox === post._id ? null : post._id)}>
                    <MessageSquare size={18} /> Comment
                </button>
                <button className="action-btn" onClick={onShare}>
                    <Share2 size={18} /> Repost
                </button>
                <button className="action-btn" onClick={() => {
                    navigator.clipboard.writeText(`${window.location.origin}/feed?post=${post._id}`);
                    toast.success('Post link copied! You can now send it to anyone.');
                }}>
                    <Send size={18} /> Send
                </button>
            </div>

            {/* Comments Section */}
            {activeCommentBox === post._id && (
                <div className="comments-section">
                    {/* Comment Input */}
                    <div className="comment-input-row">
                        <div className="mini-avatar"><User size={14} /></div>
                        <div className="comment-input-wrap">
                            <input
                                type="text"
                                placeholder="Add a comment..."
                                value={commentText}
                                onChange={(e) => setCommentText(e.target.value)}
                                onKeyDown={(e) => e.key === 'Enter' && onComment(post._id)}
                            />
                            <button className="comment-submit-btn" onClick={() => onComment(post._id)} disabled={!commentText.trim()}>
                                <Send size={16} />
                            </button>
                        </div>
                    </div>

                    {/* Comments List */}
                    {visibleComments.map((comment, idx) => (
                        <div key={comment._id || idx} className="comment-thread">
                            <div className="comment-item">
                                <div className="comment-avatar"><User size={12} /></div>
                                <div className="comment-body">
                                    <div className="comment-bubble">
                                        <div className="comment-author">
                                            <span>{comment.user?.username || comment.name || 'User'}</span>
                                            <span className="comment-headline">{comment.user?.headline || ''}</span>
                                        </div>
                                        <div className="comment-text">{comment.text}</div>
                                    </div>
                                    <div className="comment-actions">
                                        <button
                                            className={`comment-action-btn ${comment.likes?.includes(user?._id) ? 'liked' : ''}`}
                                            onClick={() => onCommentLike(post._id, comment._id)}
                                        >
                                            Like {comment.likes?.length > 0 ? `(${comment.likes.length})` : ''}
                                        </button>
                                        <button className="comment-action-btn" onClick={() => setReplyingTo(replyingTo === comment._id ? null : comment._id)}>
                                            Reply
                                        </button>
                                        {(comment.user?._id === user?._id || comment.user === user?._id) && (
                                            <button className="comment-action-btn" onClick={() => onDeleteComment(post._id, comment._id)}>
                                                Delete
                                            </button>
                                        )}
                                        <span className="comment-time">{timeAgo(comment.createdAt)}</span>
                                    </div>

                                    {/* Replies */}
                                    {comment.replies?.length > 0 && (
                                        <div className="replies-container">
                                            {comment.replies.map((reply, rIdx) => (
                                                <div key={reply._id || rIdx} className="comment-item" style={{ marginBottom: '0.4rem' }}>
                                                    <div className="comment-avatar" style={{ width: 24, height: 24 }}><User size={10} /></div>
                                                    <div className="comment-body">
                                                        <div className="comment-bubble" style={{ background: '#eef3f8' }}>
                                                            <div className="comment-author">
                                                                <span>{reply.user?.username || 'User'}</span>
                                                            </div>
                                                            <div className="comment-text">{reply.text}</div>
                                                        </div>
                                                        <div className="comment-actions">
                                                            <span className="comment-time">{timeAgo(reply.createdAt)}</span>
                                                        </div>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    )}

                                    {/* Reply Input */}
                                    {replyingTo === comment._id && (
                                        <div className="reply-input-row">
                                            <input
                                                type="text"
                                                placeholder={`Reply to ${comment.user?.username || 'user'}...`}
                                                value={replyText}
                                                onChange={(e) => setReplyText(e.target.value)}
                                                onKeyDown={(e) => e.key === 'Enter' && onReply(post._id, comment._id)}
                                                autoFocus
                                            />
                                            <button className="btn btn-primary" style={{ padding: '0.3rem 0.75rem', borderRadius: '16px', fontSize: '0.8rem' }}
                                                onClick={() => onReply(post._id, comment._id)} disabled={!replyText.trim()}>
                                                Reply
                                            </button>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>
                    ))}

                    {/* Show more comments */}
                    {(post.comments?.length || 0) > 2 && !showAllComments && (
                        <button className="show-more-comments" onClick={() => setShowAllComments(true)}>
                            Show {post.comments.length - 2} more comment{post.comments.length - 2 !== 1 ? 's' : ''}
                        </button>
                    )}
                    {showAllComments && (post.comments?.length || 0) > 2 && (
                        <button className="show-more-comments" onClick={() => setShowAllComments(false)}>
                            Show less
                        </button>
                    )}
                </div>
            )}
        </div>
    );
};

// ============================================
// POLL SECTION COMPONENT
// ============================================
const PollSection = ({ post, user, onVote }) => {
    const totalVotes = post.poll.options.reduce((sum, opt) => sum + (opt.votes?.length || 0), 0);
    const hasVoted = post.poll.options.some(opt => opt.votes?.includes(user?._id));
    const pollEnded = post.poll.endsAt && new Date(post.poll.endsAt) < new Date();

    return (
        <div className="poll-container">
            {post.poll.question && <div className="poll-question">{post.poll.question}</div>}
            {post.poll.options.map((option, idx) => {
                const voteCount = option.votes?.length || 0;
                const percentage = totalVotes > 0 ? Math.round((voteCount / totalVotes) * 100) : 0;
                const isMyVote = option.votes?.includes(user?._id);

                return (
                    <div key={idx}
                        className={`poll-option ${isMyVote ? 'voted' : ''}`}
                        onClick={() => !pollEnded && onVote(post._id, idx)}
                    >
                        {(hasVoted || pollEnded) && (
                            <div className="poll-option-bar" style={{ width: `${percentage}%` }} />
                        )}
                        <div className="poll-option-content">
                            <span>{option.text} {isMyVote && '✓'}</span>
                            {(hasVoted || pollEnded) && <span className="percentage">{percentage}%</span>}
                        </div>
                    </div>
                );
            })}
            <div className="poll-meta">
                <span>{totalVotes} vote{totalVotes !== 1 ? 's' : ''}</span>
                {post.poll.endsAt && (
                    <span> • {pollEnded ? 'Poll ended' : `Ends ${new Date(post.poll.endsAt).toLocaleDateString()}`}</span>
                )}
            </div>
        </div>
    );
};

// ============================================
// CREATE POST MODAL COMPONENT
// ============================================
const CreatePostModal = ({ user, token, onClose, onPostCreated }) => {
    const [content, setContent] = useState('');
    const [postType, setPostType] = useState('text');
    const [visibility, setVisibility] = useState('public');
    const [submitting, setSubmitting] = useState(false);

    // Poll state
    const [pollQuestion, setPollQuestion] = useState('');
    const [pollOptions, setPollOptions] = useState(['', '']);
    const [pollDuration, setPollDuration] = useState(7);

    const handleSubmit = async () => {
        if (!content.trim() && postType !== 'poll') return;
        if (postType === 'poll' && pollOptions.filter(o => o.trim()).length < 2) {
            toast.error('Please add at least 2 poll options');
            return;
        }

        setSubmitting(true);
        try {
            const body = {
                content,
                postType,
                visibility
            };

            if (postType === 'poll') {
                body.poll = {
                    question: pollQuestion || content,
                    options: pollOptions.filter(o => o.trim()).map(text => ({ text, votes: [] })),
                    endsAt: new Date(Date.now() + pollDuration * 24 * 60 * 60 * 1000)
                };
            }

            const res = await fetch(`${API}/posts`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json', 'x-auth-token': token },
                body: JSON.stringify(body)
            });

            if (res.ok) {
                const post = await res.json();
                onPostCreated(post);
            } else {
                toast.error('Failed to create post');
            }
        } catch (err) {
            console.error(err);
            toast.error('Error creating post');
        } finally {
            setSubmitting(false);
        }
    };

    return (
        <div className="modal-overlay" onClick={onClose}>
            <div className="create-post-modal" onClick={e => e.stopPropagation()}>
                <div className="modal-header">
                    <h3>Create a post</h3>
                    <button className="modal-close-btn" onClick={onClose}><X size={20} /></button>
                </div>
                <div className="modal-body">
                    <div className="modal-user-row">
                        <div className="user-icon" style={{ width: 44, height: 44 }}><User size={20} /></div>
                        <div>
                            <strong>{user?.username}</strong>
                            <select className="visibility-select" value={visibility} onChange={e => setVisibility(e.target.value)}>
                                {VISIBILITY_OPTIONS.map(v => (
                                    <option key={v.value} value={v.value}>{v.label}</option>
                                ))}
                            </select>
                        </div>
                    </div>

                    {/* Post Type Tabs */}
                    <div className="post-type-tabs">
                        {[
                            { type: 'text', label: 'Text', icon: FileText },
                            { type: 'image', label: 'Photo', icon: ImageIcon },
                            { type: 'celebration', label: 'Celebrate', icon: Award },
                            { type: 'poll', label: 'Poll', icon: BarChart3 },
                            { type: 'article', label: 'Article', icon: FileText }
                        ].map(t => (
                            <button key={t.type}
                                className={`post-type-tab ${postType === t.type ? 'active' : ''}`}
                                onClick={() => setPostType(t.type)}
                            >
                                <t.icon size={14} /> {t.label}
                            </button>
                        ))}
                    </div>

                    <textarea
                        className="post-editor-textarea"
                        placeholder={postType === 'poll' ? "Ask a question..." : "What do you want to talk about? Use #hashtags and @mentions"}
                        value={content}
                        onChange={e => setContent(e.target.value)}
                        rows={6}
                        autoFocus
                    />

                    {/* Poll Options */}
                    {postType === 'poll' && (
                        <div className="poll-creation">
                            {pollOptions.map((opt, idx) => (
                                <input
                                    key={idx}
                                    type="text"
                                    placeholder={`Option ${idx + 1}`}
                                    value={opt}
                                    onChange={e => {
                                        const newOpts = [...pollOptions];
                                        newOpts[idx] = e.target.value;
                                        setPollOptions(newOpts);
                                    }}
                                />
                            ))}
                            {pollOptions.length < 4 && (
                                <button className="add-poll-option-btn" onClick={() => setPollOptions([...pollOptions, ''])}>
                                    + Add option
                                </button>
                            )}
                            <div className="poll-duration">
                                <Clock size={14} />
                                <span>Poll duration:</span>
                                <select value={pollDuration} onChange={e => setPollDuration(Number(e.target.value))}>
                                    <option value={1}>1 day</option>
                                    <option value={3}>3 days</option>
                                    <option value={7}>1 week</option>
                                    <option value={14}>2 weeks</option>
                                </select>
                            </div>
                        </div>
                    )}
                </div>
                <div className="modal-footer">
                    <button className="btn btn-outline" onClick={onClose} style={{ borderRadius: '20px' }}>Cancel</button>
                    <button
                        className="btn btn-primary post-btn"
                        onClick={handleSubmit}
                        disabled={submitting || (!content.trim() && postType !== 'poll')}
                    >
                        {submitting ? 'Posting...' : 'Post'}
                    </button>
                </div>
            </div>
        </div>
    );
};

export default Feed;
