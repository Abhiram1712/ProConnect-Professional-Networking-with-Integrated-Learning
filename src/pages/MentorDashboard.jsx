import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
    Users, Calendar, Clock, Star, TrendingUp, BookOpen,
    MessageSquare, Award, DollarSign, Eye, ChevronRight,
    Plus, CheckCircle, XCircle, Video, User
} from 'lucide-react';
import { toast } from 'react-toastify';
import './Dashboard.css';

const API = 'http://localhost:5000/api';

const MentorDashboard = () => {
    const navigate = useNavigate();
    const [user] = useState(JSON.parse(localStorage.getItem('user')));
    const token = localStorage.getItem('token');

    // Mock data for mentor-specific features
    const [stats] = useState({
        totalSessions: 48,
        activeMentees: 12,
        hoursThisMonth: 24,
        rating: 4.8,
        earnings: 2400,
        completedSessions: 156
    });

    const [upcomingSessions] = useState([
        { id: 1, mentee: 'Alice Johnson', topic: 'React Performance Optimization', date: '2026-02-19', time: '10:00 AM', duration: '1 hour', status: 'confirmed' },
        { id: 2, mentee: 'Bob Smith', topic: 'System Design Interview Prep', date: '2026-02-19', time: '2:00 PM', duration: '45 min', status: 'confirmed' },
        { id: 3, mentee: 'Carol Williams', topic: 'Career Guidance - Backend Dev', date: '2026-02-20', time: '11:00 AM', duration: '30 min', status: 'pending' },
        { id: 4, mentee: 'David Lee', topic: 'Code Review Best Practices', date: '2026-02-21', time: '3:00 PM', duration: '1 hour', status: 'confirmed' },
    ]);

    const [menteeRequests] = useState([
        { id: 1, name: 'Eva Martinez', headline: 'CS Student at MIT', topic: 'Full Stack Development', message: 'Would love guidance on building production apps!', skills: ['JavaScript', 'Python'] },
        { id: 2, name: 'Frank Chen', headline: 'Junior Developer at Startup', topic: 'Career Growth', message: 'Looking for advice on transitioning to senior role.', skills: ['React', 'Node.js'] },
    ]);

    const [recentReviews] = useState([
        { id: 1, mentee: 'Alice Johnson', rating: 5, text: 'Amazing session! Really helped me understand React patterns.', date: '2026-02-17' },
        { id: 2, mentee: 'George Kim', rating: 5, text: 'Very knowledgeable and patient mentor. Highly recommend!', date: '2026-02-15' },
        { id: 3, mentee: 'Hannah Patel', rating: 4, text: 'Great insights on system design. Very practical approach.', date: '2026-02-13' },
    ]);

    useEffect(() => {
        if (!token) {
            navigate('/login');
            return;
        }
        if (user?.role !== 'mentor') {
            toast.error('Access denied. Mentor account required.');
            navigate('/');
        }
    }, [token, user, navigate]);

    const getInitials = (name) => name.split(' ').map(n => n[0]).join('').toUpperCase();

    const renderStars = (count) => {
        return Array.from({ length: 5 }, (_, i) => (
            <Star key={i} size={14} fill={i < count ? '#f59e0b' : 'none'} color={i < count ? '#f59e0b' : '#d1d5db'} />
        ));
    };

    return (
        <div className="dashboard-page container">
            {/* Header */}
            <div className="dashboard-header">
                <div>
                    <h1>
                        Mentor Dashboard <span className="role-badge mentor">Mentor</span>
                    </h1>
                    <p className="dashboard-welcome">Welcome back, {user?.username}! You have {upcomingSessions.filter(s => s.status === 'pending').length} pending session requests.</p>
                </div>
                <div className="quick-actions">
                    <button className="quick-action-btn" onClick={() => toast.info('Availability settings coming soon!')}>
                        <Calendar size={16} /> Set Availability
                    </button>
                    <button className="quick-action-btn" onClick={() => toast.info('Resource sharing coming soon!')}>
                        <BookOpen size={16} /> Share Resource
                    </button>
                </div>
            </div>

            {/* Stats */}
            <div className="stats-grid">
                <div className="stat-card blue">
                    <div className="stat-icon"><Users size={20} /></div>
                    <div className="stat-value">{stats.activeMentees}</div>
                    <div className="stat-label">Active Mentees</div>
                    <div className="stat-change up">↑ 3 this month</div>
                </div>
                <div className="stat-card green">
                    <div className="stat-icon"><Calendar size={20} /></div>
                    <div className="stat-value">{stats.totalSessions}</div>
                    <div className="stat-label">Sessions This Month</div>
                    <div className="stat-change up">↑ 12% vs last month</div>
                </div>
                <div className="stat-card purple">
                    <div className="stat-icon"><Clock size={20} /></div>
                    <div className="stat-value">{stats.hoursThisMonth}h</div>
                    <div className="stat-label">Hours Mentored</div>
                </div>
                <div className="stat-card orange">
                    <div className="stat-icon"><Star size={20} /></div>
                    <div className="stat-value">{stats.rating}</div>
                    <div className="stat-label">Average Rating</div>
                    <div className="stat-change up">From {stats.completedSessions} reviews</div>
                </div>
            </div>

            {/* Main Grid */}
            <div className="dashboard-grid">
                {/* Upcoming Sessions */}
                <div className="dashboard-section">
                    <div className="section-header">
                        <h2><Calendar size={18} /> Upcoming Sessions</h2>
                        <button className="view-all-btn" onClick={() => toast.info('Full session calendar coming soon!')}>View all</button>
                    </div>
                    <div className="section-body no-pad">
                        {upcomingSessions.map(session => (
                            <div key={session.id} className="list-item">
                                <div className={`list-avatar ${session.status === 'pending' ? 'orange' : 'blue'}`}>
                                    {getInitials(session.mentee)}
                                </div>
                                <div className="list-info">
                                    <h4>{session.mentee}</h4>
                                    <p>{session.topic}</p>
                                    <p style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>
                                        📅 {session.date} at {session.time} • {session.duration}
                                    </p>
                                </div>
                                <div className="list-actions">
                                    <span className={`status-badge ${session.status === 'pending' ? 'pending' : 'active'}`}>
                                        {session.status}
                                    </span>
                                    {session.status === 'confirmed' && (
                                        <button className="action-btn-sm primary" onClick={() => toast.info('Video call starting...')}>
                                            <Video size={14} /> Join
                                        </button>
                                    )}
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Mentee Requests */}
                <div className="dashboard-section">
                    <div className="section-header">
                        <h2><Users size={18} /> Mentee Requests</h2>
                        <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>{menteeRequests.length} pending</span>
                    </div>
                    <div className="section-body no-pad">
                        {menteeRequests.length === 0 ? (
                            <div className="dashboard-empty">
                                <div className="empty-icon">📭</div>
                                <h3>No pending requests</h3>
                                <p>New mentee requests will appear here</p>
                            </div>
                        ) : (
                            menteeRequests.map(req => (
                                <div key={req.id} className="list-item" style={{ flexDirection: 'column', alignItems: 'flex-start', gap: '0.5rem' }}>
                                    <div style={{ display: 'flex', gap: '0.6rem', width: '100%', alignItems: 'center' }}>
                                        <div className="list-avatar green">
                                            {getInitials(req.name)}
                                        </div>
                                        <div className="list-info">
                                            <h4>{req.name}</h4>
                                            <p>{req.headline}</p>
                                        </div>
                                    </div>
                                    <div style={{ paddingLeft: '0.25rem', fontSize: '0.82rem', color: 'var(--text)' }}>
                                        <strong>Topic:</strong> {req.topic}
                                    </div>
                                    <div style={{ paddingLeft: '0.25rem', fontSize: '0.8rem', color: 'var(--text-muted)', fontStyle: 'italic' }}>
                                        "{req.message}"
                                    </div>
                                    <div style={{ display: 'flex', gap: '0.25rem', paddingLeft: '0.25rem' }}>
                                        {req.skills.map((s, i) => (
                                            <span key={i} style={{ fontSize: '0.7rem', padding: '0.1rem 0.45rem', borderRadius: '8px', background: '#e0f2fe', color: '#0369a1' }}>{s}</span>
                                        ))}
                                    </div>
                                    <div style={{ display: 'flex', gap: '0.35rem', marginTop: '0.25rem' }}>
                                        <button className="action-btn-sm success" onClick={() => toast.success('Mentee request accepted!')}>
                                            <CheckCircle size={14} /> Accept
                                        </button>
                                        <button className="action-btn-sm danger" onClick={() => toast.info('Request declined')}>
                                            <XCircle size={14} /> Decline
                                        </button>
                                        <button className="action-btn-sm primary" onClick={() => toast.info('Messaging coming soon!')}>
                                            <MessageSquare size={14} /> Message
                                        </button>
                                    </div>
                                </div>
                            ))
                        )}
                    </div>
                </div>

                {/* Recent Reviews */}
                <div className="dashboard-section full-width">
                    <div className="section-header">
                        <h2><Star size={18} /> Recent Reviews</h2>
                        <button className="view-all-btn" onClick={() => toast.info('All reviews page coming soon!')}>View all reviews</button>
                    </div>
                    <div className="section-body no-pad">
                        {recentReviews.map(review => (
                            <div key={review.id} className="list-item">
                                <div className="list-avatar purple">
                                    {getInitials(review.mentee)}
                                </div>
                                <div className="list-info" style={{ overflow: 'visible', whiteSpace: 'normal' }}>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.2rem' }}>
                                        <h4 style={{ margin: 0 }}>{review.mentee}</h4>
                                        <div style={{ display: 'flex', gap: '1px' }}>
                                            {renderStars(review.rating)}
                                        </div>
                                    </div>
                                    <p style={{ whiteSpace: 'normal', overflow: 'visible', textOverflow: 'unset', color: 'var(--text)', lineHeight: 1.4, fontSize: '0.84rem' }}>
                                        "{review.text}"
                                    </p>
                                    <p style={{ fontSize: '0.72rem' }}>{review.date}</p>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default MentorDashboard;
