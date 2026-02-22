import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
    Bell, AlertCircle, CheckCircle, UserPlus, Heart, MessageSquare,
    Share2, AtSign, Eye, Users, Award, CheckCheck, Filter
} from 'lucide-react';
import { toast } from 'react-toastify';

const API = 'http://localhost:5000/api';

const NOTIFICATION_ICONS = {
    connection_request: { icon: UserPlus, color: '#378fe9' },
    connection_accepted: { icon: Users, color: '#44b37d' },
    post_like: { icon: Heart, color: '#df5553' },
    post_comment: { icon: MessageSquare, color: '#378fe9' },
    post_share: { icon: Share2, color: '#c077e6' },
    post_mention: { icon: AtSign, color: '#e7a33e' },
    comment_like: { icon: Heart, color: '#df5553' },
    comment_reply: { icon: MessageSquare, color: '#44b37d' },
    follow: { icon: Eye, color: '#378fe9' },
    profile_view: { icon: Eye, color: '#c077e6' },
    poll_ended: { icon: Award, color: '#e7a33e' },
    post_milestone: { icon: Award, color: '#44b37d' },
    system: { icon: Bell, color: '#378fe9' }
};

const Notifications = () => {
    const navigate = useNavigate();
    const [notifications, setNotifications] = useState([]);
    const [loading, setLoading] = useState(true);
    const [unreadCount, setUnreadCount] = useState(0);
    const [filter, setFilter] = useState('all');
    const token = localStorage.getItem('token');

    // Auth guard: redirect to login if not authenticated
    useEffect(() => {
        if (!token) {
            navigate('/login');
            return;
        }
    }, [token, navigate]);

    useEffect(() => {
        if (token) fetchNotifications();
    }, [filter, token]);

    const fetchNotifications = async () => {
        try {
            const params = new URLSearchParams({ limit: 50 });
            if (filter === 'unread') params.set('unreadOnly', 'true');

            const res = await fetch(`${API}/notifications?${params}`, {
                headers: { 'x-auth-token': token }
            });
            const data = await res.json();
            if (data.notifications) {
                setNotifications(data.notifications);
                setUnreadCount(data.unreadCount);
            }
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    const markAsRead = async (id) => {
        try {
            await fetch(`${API}/notifications/read/${id}`, {
                method: 'PUT',
                headers: { 'x-auth-token': token }
            });
            setNotifications(notifications.map(n =>
                n._id === id ? { ...n, isRead: true } : n
            ));
            setUnreadCount(prev => Math.max(0, prev - 1));
        } catch (err) {
            console.error(err);
        }
    };

    const markAllRead = async () => {
        try {
            await fetch(`${API}/notifications/read-all`, {
                method: 'PUT',
                headers: { 'x-auth-token': token }
            });
            setNotifications(notifications.map(n => ({ ...n, isRead: true })));
            setUnreadCount(0);
            toast.success('All notifications marked as read');
        } catch (err) {
            console.error(err);
        }
    };

    const timeAgo = (date) => {
        const now = new Date();
        const diff = now - new Date(date);
        const minutes = Math.floor(diff / 60000);
        const hours = Math.floor(diff / 3600000);
        const days = Math.floor(diff / 86400000);

        if (minutes < 1) return 'Just now';
        if (minutes < 60) return `${minutes}m ago`;
        if (hours < 24) return `${hours}h ago`;
        if (days < 7) return `${days}d ago`;
        return new Date(date).toLocaleDateString();
    };

    return (
        <div className="container" style={{ padding: '2rem 1rem', maxWidth: '800px', margin: '0 auto' }}>
            <div style={{
                display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                marginBottom: '1.5rem', flexWrap: 'wrap', gap: '0.75rem'
            }}>
                <h1 style={{ fontSize: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem', margin: 0 }}>
                    <Bell size={24} /> Notifications
                    {unreadCount > 0 && (
                        <span style={{
                            background: '#dc2626', color: 'white', fontSize: '0.75rem',
                            padding: '0.15rem 0.5rem', borderRadius: '10px', fontWeight: 600
                        }}>{unreadCount}</span>
                    )}
                </h1>
                <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
                    <select
                        value={filter}
                        onChange={e => setFilter(e.target.value)}
                        style={{
                            border: '1px solid var(--border)', borderRadius: '8px',
                            padding: '0.4rem 0.75rem', fontSize: '0.85rem', fontFamily: 'inherit'
                        }}
                    >
                        <option value="all">All</option>
                        <option value="unread">Unread</option>
                    </select>
                    {unreadCount > 0 && (
                        <button onClick={markAllRead} style={{
                            display: 'flex', alignItems: 'center', gap: '0.35rem',
                            padding: '0.4rem 0.85rem', borderRadius: '8px', border: '1px solid var(--primary)',
                            color: 'var(--primary)', background: 'none', cursor: 'pointer',
                            fontWeight: 600, fontSize: '0.82rem', fontFamily: 'inherit'
                        }}>
                            <CheckCheck size={16} /> Mark all read
                        </button>
                    )}
                </div>
            </div>

            {loading ? (
                <div style={{ textAlign: 'center', padding: '3rem', color: 'var(--text-muted)' }}>
                    Loading notifications...
                </div>
            ) : notifications.length === 0 ? (
                <div style={{
                    textAlign: 'center', padding: '4rem 2rem', background: 'var(--surface)',
                    borderRadius: '12px', boxShadow: '0 1px 3px rgba(0,0,0,0.08)'
                }}>
                    <div style={{ fontSize: '3rem', marginBottom: '0.75rem' }}>🔔</div>
                    <h3 style={{ marginBottom: '0.35rem' }}>
                        {filter === 'unread' ? 'All caught up!' : 'No notifications yet'}
                    </h3>
                    <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>
                        {filter === 'unread'
                            ? 'You have no unread notifications'
                            : 'When someone interacts with your posts or profile, you\'ll see it here'}
                    </p>
                </div>
            ) : (
                <div style={{
                    background: 'var(--surface)', borderRadius: '12px',
                    boxShadow: '0 1px 3px rgba(0,0,0,0.08)', overflow: 'hidden'
                }}>
                    {notifications.map(notif => {
                        const iconConfig = NOTIFICATION_ICONS[notif.type] || NOTIFICATION_ICONS.system;
                        const IconComponent = iconConfig.icon;

                        return (
                            <div key={notif._id}
                                onClick={() => !notif.isRead && markAsRead(notif._id)}
                                style={{
                                    display: 'flex', gap: '0.85rem', padding: '0.85rem 1.25rem',
                                    alignItems: 'flex-start', borderBottom: '1px solid #f5f5f5',
                                    cursor: 'pointer', transition: 'background 0.15s',
                                    background: notif.isRead ? 'transparent' : '#f0f7ff',
                                    borderLeft: notif.isRead ? 'none' : `3px solid ${iconConfig.color}`
                                }}
                                onMouseOver={e => e.currentTarget.style.background = notif.isRead ? '#fafbfc' : '#e8f0fe'}
                                onMouseOut={e => e.currentTarget.style.background = notif.isRead ? 'transparent' : '#f0f7ff'}
                            >
                                <div style={{
                                    width: '40px', height: '40px', borderRadius: '50%',
                                    background: `${iconConfig.color}15`, color: iconConfig.color,
                                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                                    flexShrink: 0
                                }}>
                                    <IconComponent size={20} />
                                </div>
                                <div style={{ flex: 1, minWidth: 0 }}>
                                    <p style={{
                                        margin: '0 0 0.25rem', fontSize: '0.88rem',
                                        fontWeight: notif.isRead ? '400' : '600',
                                        lineHeight: 1.4
                                    }}>{notif.message}</p>
                                    <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>
                                        {timeAgo(notif.createdAt)}
                                    </span>
                                </div>
                                {!notif.isRead && (
                                    <div style={{
                                        width: '8px', height: '8px', borderRadius: '50%',
                                        background: iconConfig.color, flexShrink: 0, marginTop: '0.5rem'
                                    }} />
                                )}
                            </div>
                        );
                    })}
                </div>
            )}
        </div>
    );
};

export default Notifications;
