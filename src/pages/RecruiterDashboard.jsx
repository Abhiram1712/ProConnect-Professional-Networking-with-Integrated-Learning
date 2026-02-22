import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
    Users, Briefcase, Search, Filter, Eye, MessageSquare,
    TrendingUp, FileText, Plus, ChevronDown, Star, MapPin,
    Clock, CheckCircle, XCircle, User, BarChart3, Mail
} from 'lucide-react';
import { toast } from 'react-toastify';
import './Dashboard.css';

const API = 'http://localhost:5000/api';

const RecruiterDashboard = () => {
    const navigate = useNavigate();
    const [user] = useState(JSON.parse(localStorage.getItem('user')));
    const token = localStorage.getItem('token');

    const [activeTab, setActiveTab] = useState('overview');
    const [search, setSearch] = useState('');
    const [candidates, setCandidates] = useState([]);
    const [loading, setLoading] = useState(false);
    const [skillFilter, setSkillFilter] = useState('');

    // Mock stats
    const [stats] = useState({
        activeJobs: 5,
        totalApplicants: 89,
        shortlisted: 23,
        interviewsScheduled: 8,
        hiredThisMonth: 3,
        avgTimeToHire: 14
    });

    // Mock job postings
    const [jobPostings] = useState([
        { id: 1, title: 'Senior React Developer', location: 'Remote', type: 'Full-time', applicants: 34, shortlisted: 8, status: 'active', posted: '5 days ago' },
        { id: 2, title: 'Backend Engineer (Node.js)', location: 'Bangalore', type: 'Full-time', applicants: 22, shortlisted: 5, status: 'active', posted: '1 week ago' },
        { id: 3, title: 'UI/UX Design Intern', location: 'Hybrid', type: 'Internship', applicants: 18, shortlisted: 6, status: 'active', posted: '2 weeks ago' },
        { id: 4, title: 'DevOps Engineer', location: 'Remote', type: 'Full-time', applicants: 15, shortlisted: 4, status: 'closed', posted: '3 weeks ago' },
    ]);

    // Mock pipeline
    const [pipeline] = useState([
        { stage: 'Applied', count: 89, color: '#3b82f6' },
        { stage: 'Screening', count: 45, color: '#8b5cf6' },
        { stage: 'Interview', count: 23, color: '#f59e0b' },
        { stage: 'Offer', count: 8, color: '#22c55e' },
        { stage: 'Hired', count: 3, color: '#14b8a6' }
    ]);

    // Mock recent applicants
    const [recentApplicants] = useState([
        { id: 1, name: 'Priya Sharma', headline: 'Full Stack Developer | 3yr exp', job: 'Senior React Developer', appliedDate: '2 hours ago', status: 'Applied', skills: ['React', 'Node.js', 'MongoDB'], match: 92 },
        { id: 2, name: 'Rahul Gupta', headline: 'Backend Engineer | 5yr exp', job: 'Backend Engineer (Node.js)', appliedDate: '5 hours ago', status: 'Screening', skills: ['Node.js', 'AWS', 'Docker'], match: 87 },
        { id: 3, name: 'Sneha Reddy', headline: 'UI/UX Designer | 2yr exp', job: 'UI/UX Design Intern', appliedDate: '1 day ago', status: 'Shortlisted', skills: ['Figma', 'Adobe XD', 'CSS'], match: 95 },
        { id: 4, name: 'Arjun Nair', headline: 'Software Engineer | 4yr exp', job: 'Senior React Developer', appliedDate: '1 day ago', status: 'Interview', skills: ['React', 'TypeScript', 'GraphQL'], match: 88 },
        { id: 5, name: 'Kavita Joshi', headline: 'DevOps Engineer | 3yr exp', job: 'DevOps Engineer', appliedDate: '2 days ago', status: 'Applied', skills: ['Kubernetes', 'CI/CD', 'Terraform'], match: 80 },
    ]);

    useEffect(() => {
        if (!token) {
            navigate('/login');
            return;
        }
        if (user?.role !== 'recruiter') {
            toast.error('Access denied. Recruiter account required.');
            navigate('/');
        }
    }, [token, user, navigate]);

    // Candidate search
    const searchCandidates = async () => {
        setLoading(true);
        try {
            const params = new URLSearchParams({ role: 'candidate' });
            if (search) params.set('search', search);
            if (skillFilter) params.set('skills', skillFilter);

            const res = await fetch(`${API}/users?${params}`, {
                headers: { 'x-auth-token': token }
            });
            const data = await res.json();
            if (Array.isArray(data)) setCandidates(data);
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (activeTab === 'candidates') searchCandidates();
    }, [activeTab]);

    const getInitials = (name) => name.split(' ').map(n => n[0]).join('').toUpperCase();
    const maxPipeline = Math.max(...pipeline.map(p => p.count));

    return (
        <div className="dashboard-page container">
            {/* Header */}
            <div className="dashboard-header">
                <div>
                    <h1>
                        Recruiter Dashboard <span className="role-badge recruiter">Recruiter</span>
                    </h1>
                    <p className="dashboard-welcome">Welcome back, {user?.username}! You have {stats.totalApplicants} applicants awaiting review.</p>
                </div>
                <div className="quick-actions">
                    <button className="quick-action-btn" onClick={() => toast.info('Job posting form coming soon!')}>
                        <Plus size={16} /> Post a Job
                    </button>
                    <button className="quick-action-btn" onClick={() => setActiveTab('candidates')}>
                        <Search size={16} /> Search Talent
                    </button>
                </div>
            </div>

            {/* Tabs */}
            <div style={{ display: 'flex', gap: '0.25rem', marginBottom: '1.25rem', background: 'var(--surface)', borderRadius: '10px', padding: '0.3rem', boxShadow: '0 1px 3px rgba(0,0,0,0.08)' }}>
                {[
                    { id: 'overview', label: 'Overview', icon: BarChart3 },
                    { id: 'jobs', label: 'Job Postings', icon: Briefcase },
                    { id: 'applicants', label: 'Applicants', icon: Users },
                    { id: 'candidates', label: 'Talent Search', icon: Search }
                ].map(tab => (
                    <button key={tab.id}
                        onClick={() => setActiveTab(tab.id)}
                        style={{
                            flex: 1, padding: '0.55rem 0.75rem', borderRadius: '8px', border: 'none',
                            background: activeTab === tab.id ? 'var(--primary)' : 'none',
                            color: activeTab === tab.id ? 'white' : 'var(--text-muted)',
                            fontWeight: activeTab === tab.id ? 600 : 500,
                            cursor: 'pointer', fontSize: '0.85rem', fontFamily: 'inherit',
                            display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.35rem',
                            transition: 'all 0.15s'
                        }}>
                        <tab.icon size={16} /> {tab.label}
                    </button>
                ))}
            </div>

            {/* ====== OVERVIEW TAB ====== */}
            {activeTab === 'overview' && (
                <>
                    {/* Stats */}
                    <div className="stats-grid">
                        <div className="stat-card blue">
                            <div className="stat-icon"><Briefcase size={20} /></div>
                            <div className="stat-value">{stats.activeJobs}</div>
                            <div className="stat-label">Active Jobs</div>
                        </div>
                        <div className="stat-card purple">
                            <div className="stat-icon"><Users size={20} /></div>
                            <div className="stat-value">{stats.totalApplicants}</div>
                            <div className="stat-label">Total Applicants</div>
                            <div className="stat-change up">↑ 15 this week</div>
                        </div>
                        <div className="stat-card orange">
                            <div className="stat-icon"><Star size={20} /></div>
                            <div className="stat-value">{stats.shortlisted}</div>
                            <div className="stat-label">Shortlisted</div>
                        </div>
                        <div className="stat-card green">
                            <div className="stat-icon"><CheckCircle size={20} /></div>
                            <div className="stat-value">{stats.hiredThisMonth}</div>
                            <div className="stat-label">Hired This Month</div>
                        </div>
                    </div>

                    {/* Hiring Pipeline */}
                    <div className="dashboard-section full-width" style={{ marginBottom: '1.5rem' }}>
                        <div className="section-header">
                            <h2><TrendingUp size={18} /> Hiring Pipeline</h2>
                        </div>
                        <div className="section-body">
                            <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'flex-end', height: '160px', padding: '0 0.5rem' }}>
                                {pipeline.map((stage, idx) => (
                                    <div key={idx} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.35rem' }}>
                                        <span style={{ fontSize: '1.1rem', fontWeight: 700 }}>{stage.count}</span>
                                        <div style={{
                                            width: '100%', borderRadius: '6px 6px 0 0',
                                            background: `${stage.color}20`,
                                            height: `${(stage.count / maxPipeline) * 120}px`,
                                            position: 'relative',
                                            transition: 'height 0.3s'
                                        }}>
                                            <div style={{
                                                position: 'absolute', bottom: 0, left: 0, right: 0,
                                                height: '100%', borderRadius: '6px 6px 0 0',
                                                background: stage.color, opacity: 0.85
                                            }} />
                                        </div>
                                        <span style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-muted)', textAlign: 'center' }}>{stage.stage}</span>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>

                    <div className="dashboard-grid">
                        {/* Recent Applicants */}
                        <div className="dashboard-section full-width">
                            <div className="section-header">
                                <h2><Users size={18} /> Recent Applicants</h2>
                                <button className="view-all-btn" onClick={() => setActiveTab('applicants')}>View all</button>
                            </div>
                            <div className="section-body no-pad" style={{ overflowX: 'auto' }}>
                                <table className="dashboard-table">
                                    <thead>
                                        <tr>
                                            <th>Candidate</th>
                                            <th>Applied For</th>
                                            <th>Match</th>
                                            <th>Status</th>
                                            <th>Actions</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {recentApplicants.slice(0, 5).map(app => (
                                            <tr key={app.id}>
                                                <td>
                                                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                                        <div className="list-avatar blue" style={{ width: 32, height: 32, fontSize: '0.7rem' }}>
                                                            {getInitials(app.name)}
                                                        </div>
                                                        <div>
                                                            <div style={{ fontWeight: 600, fontSize: '0.85rem' }}>{app.name}</div>
                                                            <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>{app.headline}</div>
                                                        </div>
                                                    </div>
                                                </td>
                                                <td style={{ fontSize: '0.82rem' }}>{app.job}</td>
                                                <td>
                                                    <span style={{
                                                        padding: '0.15rem 0.5rem', borderRadius: '10px', fontSize: '0.72rem', fontWeight: 700,
                                                        background: app.match >= 90 ? '#d1fae5' : app.match >= 80 ? '#fef3c7' : '#fee2e2',
                                                        color: app.match >= 90 ? '#065f46' : app.match >= 80 ? '#92400e' : '#991b1b'
                                                    }}>
                                                        {app.match}%
                                                    </span>
                                                </td>
                                                <td>
                                                    <span className={`status-badge ${app.status.toLowerCase()}`}>
                                                        {app.status}
                                                    </span>
                                                </td>
                                                <td>
                                                    <div className="action-btns">
                                                        <button className="action-btn-sm primary" onClick={() => toast.info('Profile view coming soon')}><Eye size={13} /></button>
                                                        <button className="action-btn-sm success" onClick={() => toast.success('Shortlisted!')}><CheckCircle size={13} /></button>
                                                        <button className="action-btn-sm danger" onClick={() => toast.info('Rejected')}><XCircle size={13} /></button>
                                                    </div>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    </div>
                </>
            )}

            {/* ====== JOBS TAB ====== */}
            {activeTab === 'jobs' && (
                <div className="dashboard-section full-width">
                    <div className="section-header">
                        <h2><Briefcase size={18} /> Your Job Postings</h2>
                        <button className="quick-action-btn" onClick={() => toast.info('Job posting form coming soon!')}>
                            <Plus size={14} /> New Job
                        </button>
                    </div>
                    <div className="section-body no-pad" style={{ overflowX: 'auto' }}>
                        <table className="dashboard-table">
                            <thead>
                                <tr>
                                    <th>Position</th>
                                    <th>Location</th>
                                    <th>Type</th>
                                    <th>Applicants</th>
                                    <th>Shortlisted</th>
                                    <th>Status</th>
                                    <th>Posted</th>
                                </tr>
                            </thead>
                            <tbody>
                                {jobPostings.map(job => (
                                    <tr key={job.id}>
                                        <td style={{ fontWeight: 600 }}>{job.title}</td>
                                        <td>
                                            <span style={{ display: 'flex', alignItems: 'center', gap: '0.2rem', fontSize: '0.82rem' }}>
                                                <MapPin size={12} /> {job.location}
                                            </span>
                                        </td>
                                        <td style={{ fontSize: '0.82rem' }}>{job.type}</td>
                                        <td style={{ fontWeight: 600 }}>{job.applicants}</td>
                                        <td style={{ fontWeight: 600, color: '#059669' }}>{job.shortlisted}</td>
                                        <td>
                                            <span className={`status-badge ${job.status}`}>{job.status}</span>
                                        </td>
                                        <td style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>{job.posted}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}

            {/* ====== APPLICANTS TAB ====== */}
            {activeTab === 'applicants' && (
                <div className="dashboard-section full-width">
                    <div className="section-header">
                        <h2><Users size={18} /> All Applicants</h2>
                    </div>
                    <div className="section-body no-pad">
                        {recentApplicants.map(app => (
                            <div key={app.id} className="list-item">
                                <div className="list-avatar blue">
                                    {getInitials(app.name)}
                                </div>
                                <div className="list-info" style={{ overflow: 'visible' }}>
                                    <h4>{app.name}</h4>
                                    <p>{app.headline}</p>
                                    <div style={{ display: 'flex', gap: '0.25rem', marginTop: '0.25rem', flexWrap: 'wrap' }}>
                                        {app.skills.map((s, i) => (
                                            <span key={i} style={{ fontSize: '0.7rem', padding: '0.1rem 0.4rem', borderRadius: '6px', background: '#e0f2fe', color: '#0369a1' }}>{s}</span>
                                        ))}
                                    </div>
                                </div>
                                <div style={{ textAlign: 'right' }}>
                                    <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>Applied for</div>
                                    <div style={{ fontSize: '0.82rem', fontWeight: 600 }}>{app.job}</div>
                                    <span className={`status-badge ${app.status.toLowerCase()}`} style={{ marginTop: '0.25rem' }}>{app.status}</span>
                                </div>
                                <div className="list-actions" style={{ flexDirection: 'column', gap: '0.25rem' }}>
                                    <button className="action-btn-sm primary" onClick={() => toast.info('Profile view coming soon')}>
                                        <Eye size={13} /> View
                                    </button>
                                    <button className="action-btn-sm success" onClick={() => toast.success('Shortlisted!')}>
                                        <CheckCircle size={13} /> Shortlist
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {/* ====== TALENT SEARCH TAB ====== */}
            {activeTab === 'candidates' && (
                <div className="dashboard-section full-width">
                    <div className="section-header">
                        <h2><Search size={18} /> Talent Search</h2>
                    </div>
                    <div className="section-body">
                        <div className="dashboard-toolbar">
                            <input
                                type="text"
                                placeholder="Search candidates by name, skill, or education..."
                                value={search}
                                onChange={e => setSearch(e.target.value)}
                                onKeyDown={e => e.key === 'Enter' && searchCandidates()}
                            />
                            <select value={skillFilter} onChange={e => setSkillFilter(e.target.value)}>
                                <option value="">All Skills</option>
                                <option value="React">React</option>
                                <option value="Node.js">Node.js</option>
                                <option value="Python">Python</option>
                                <option value="Java">Java</option>
                                <option value="AWS">AWS</option>
                            </select>
                            <button className="btn btn-primary" style={{ borderRadius: '8px', padding: '0.5rem 1rem' }} onClick={searchCandidates}>
                                <Search size={16} /> Search
                            </button>
                        </div>

                        {loading ? (
                            <div className="dashboard-empty">Loading candidates...</div>
                        ) : candidates.length === 0 ? (
                            <div className="dashboard-empty">
                                <div className="empty-icon">🔍</div>
                                <h3>Search for talent</h3>
                                <p>Use the search bar to find candidates matching your requirements</p>
                            </div>
                        ) : (
                            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '0.75rem', marginTop: '0.75rem' }}>
                                {candidates.map(c => (
                                    <div key={c._id} style={{
                                        background: 'var(--surface)', border: '1px solid var(--border)',
                                        borderRadius: '10px', padding: '1rem', transition: 'box-shadow 0.2s',
                                    }} onMouseOver={e => e.currentTarget.style.boxShadow = '0 4px 12px rgba(0,0,0,0.1)'}
                                        onMouseOut={e => e.currentTarget.style.boxShadow = 'none'}>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', marginBottom: '0.5rem' }}>
                                            <div className="list-avatar purple" style={{ width: 40, height: 40, fontSize: '0.8rem' }}>
                                                {c.username?.substring(0, 2).toUpperCase()}
                                            </div>
                                            <div>
                                                <h4 style={{ margin: 0, fontSize: '0.9rem' }}>{c.username}</h4>
                                                <p style={{ margin: 0, fontSize: '0.78rem', color: 'var(--text-muted)' }}>{c.headline || 'Candidate'}</p>
                                            </div>
                                        </div>
                                        {c.education && (
                                            <p style={{ fontSize: '0.78rem', color: 'var(--text-muted)', margin: '0 0 0.35rem' }}>🎓 {c.education}</p>
                                        )}
                                        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.25rem', marginBottom: '0.65rem' }}>
                                            {c.skills?.length > 0 ? c.skills.slice(0, 5).map((s, i) => (
                                                <span key={i} style={{ fontSize: '0.7rem', padding: '0.12rem 0.45rem', borderRadius: '8px', background: '#e0f2fe', color: '#0369a1' }}>{s}</span>
                                            )) : (
                                                <span style={{ fontSize: '0.75rem', color: '#999' }}>No skills listed</span>
                                            )}
                                        </div>
                                        <div style={{ display: 'flex', gap: '0.35rem' }}>
                                            <button className="action-btn-sm primary" style={{ flex: 1, justifyContent: 'center' }} onClick={() => toast.info('Profile view coming soon')}>
                                                <Eye size={13} /> Profile
                                            </button>
                                            <button className="action-btn-sm success" style={{ flex: 1, justifyContent: 'center' }} onClick={() => toast.info('Message sent!')}>
                                                <Mail size={13} /> Contact
                                            </button>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
};

export default RecruiterDashboard;
