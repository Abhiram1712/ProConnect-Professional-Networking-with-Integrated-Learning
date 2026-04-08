import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
    Users, Briefcase, Search, Filter, Eye, MessageSquare,
    TrendingUp, FileText, Plus, ChevronDown, Star, MapPin,
    Clock, CheckCircle, XCircle, User, BarChart3, Mail, X
} from 'lucide-react';
import { toast } from 'react-toastify';
import './Dashboard.css';

const API = import.meta.env.VITE_API_URL || 'http://localhost:5000';

const RecruiterDashboard = () => {
    const navigate = useNavigate();
    const [user] = useState(JSON.parse(localStorage.getItem('user')));
    const token = localStorage.getItem('token');

    const [activeTab, setActiveTab] = useState('overview');
    const [search, setSearch] = useState('');
    const [candidates, setCandidates] = useState([]);
    const [loading, setLoading] = useState(false);
    const [skillFilter, setSkillFilter] = useState('');
    
    // Real dynamic states
    const [jobPostings, setJobPostings] = useState([]);
    const [applicants, setApplicants] = useState([]);
    const [showPostModal, setShowPostModal] = useState(false);
    
    // New Job Form State
    const [newJob, setNewJob] = useState({
        title: '',
        company: user?.company || '',
        type: 'Job',
        description: '',
        deadline: '',
        reward: '',
        logo: ''
    });

    const [stats, setStats] = useState({
        activeJobs: 0,
        totalApplicants: 0,
        shortlisted: 0,
        hiredThisMonth: 0
    });

    useEffect(() => {
        if (!token) {
            navigate('/login');
            return;
        }
        if (user?.role !== 'recruiter') {
            toast.error('Access denied. Recruiter account required.');
            navigate('/');
            return;
        }
        fetchData();
    }, [token, user, navigate]);

    const fetchData = async () => {
        setLoading(true);
        try {
            // Fetch Jobs
            const jobsRes = await fetch(`${API}/api/opportunities/my-opportunities`, {
                headers: { 'x-auth-token': token }
            });
            const jobsData = await jobsRes.json();
            if (Array.isArray(jobsData)) setJobPostings(jobsData);

            // Fetch Applicants
            const appRes = await fetch(`${API}/api/applications/recruiter-applications`, {
                headers: { 'x-auth-token': token }
            });
            const appData = await appRes.json();
            if (Array.isArray(appData)) {
                setApplicants(appData);
                
                // Calculate stats
                setStats({
                    activeJobs: jobsData.length,
                    totalApplicants: appData.length,
                    shortlisted: appData.filter(a => a.status === 'Shortlisted').length,
                    hiredThisMonth: appData.filter(a => a.status === 'Hired').length
                });
            }
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    const handlePostJob = async (e) => {
        e.preventDefault();
        try {
            const res = await fetch(`${API}/api/opportunities`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'x-auth-token': token
                },
                body: JSON.stringify(newJob)
            });
            if (res.ok) {
                toast.success('Job posted successfully!');
                setShowPostModal(false);
                fetchData();
            }
        } catch (err) {
            toast.error('Failed to post job');
        }
    };

    const updateAppStatus = async (appId, status) => {
        try {
            const res = await fetch(`${API}/api/applications/status/${appId}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    'x-auth-token': token
                },
                body: JSON.stringify({ status })
            });
            if (res.ok) {
                toast.success(`Applicant ${status}`);
                fetchData();
            }
        } catch (err) {
            toast.error('Failed to update status');
        }
    };

    const contactCandidate = (candidateId) => {
        navigate('/messages', { state: { userId: candidateId } });
    };

    const searchCandidates = async () => {
        setLoading(true);
        try {
            const params = new URLSearchParams({ role: 'candidate' });
            if (search) params.set('search', search);
            if (skillFilter) params.set('skills', skillFilter);

            const res = await fetch(`${API}/api/users?${params}`, {
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

    const getInitials = (name) => name ? name.split(' ').map(n => n[0]).join('').toUpperCase() : '??';

    return (
        <div className="dashboard-page container">
            {/* Header */}
            <div className="dashboard-header">
                <div>
                    <h1>
                        Recruiter Dashboard <span className="role-badge recruiter">Recruiter</span>
                    </h1>
                    <p className="dashboard-welcome">Welcome back, {user?.username}! Manage your job postings and find the best talent.</p>
                </div>
                <div className="quick-actions">
                    <button className="quick-action-btn" onClick={() => setShowPostModal(true)}>
                        <Plus size={16} /> Post a Job
                    </button>
                    <button className="quick-action-btn" onClick={() => setActiveTab('candidates')}>
                        <Search size={16} /> Search Talent
                    </button>
                </div>
            </div>

            {/* Tabs */}
            <div className="dashboard-tabs">
                {[
                    { id: 'overview', label: 'Overview', icon: BarChart3 },
                    { id: 'jobs', label: 'My Postings', icon: Briefcase },
                    { id: 'applicants', label: 'Applicants', icon: Users },
                    { id: 'candidates', label: 'Talent Search', icon: Search }
                ].map(tab => (
                    <button key={tab.id}
                        onClick={() => setActiveTab(tab.id)}
                        className={`dashboard-tab ${activeTab === tab.id ? 'active' : ''}`}
                    >
                        <tab.icon size={16} /> {tab.label}
                    </button>
                ))}
            </div>

            {/* Content Rendering */}
            {loading && activeTab !== 'candidates' ? (
                <div style={{ padding: '4rem', textAlign: 'center' }}>Loading dashboard data...</div>
            ) : (
                <>
                    {activeTab === 'overview' && (
                        <>
                            <div className="stats-grid">
                                <div className="stat-card blue">
                                    <div className="stat-icon"><Briefcase size={20} /></div>
                                    <div className="stat-value">{stats.activeJobs}</div>
                                    <div className="stat-label">Active Postings</div>
                                </div>
                                <div className="stat-card purple">
                                    <div className="stat-icon"><Users size={20} /></div>
                                    <div className="stat-value">{stats.totalApplicants}</div>
                                    <div className="stat-label">Total Applicants</div>
                                </div>
                                <div className="stat-card orange">
                                    <div className="stat-icon"><Star size={20} /></div>
                                    <div className="stat-value">{stats.shortlisted}</div>
                                    <div className="stat-label">Shortlisted</div>
                                </div>
                                <div className="stat-card green">
                                    <div className="stat-icon"><CheckCircle size={20} /></div>
                                    <div className="stat-value">{stats.hiredThisMonth}</div>
                                    <div className="stat-label">Total Hired</div>
                                </div>
                            </div>

                            <div className="dashboard-section full-width">
                                <div className="section-header">
                                    <h2><Users size={18} /> Recent Applicants</h2>
                                    <button className="view-all-btn" onClick={() => setActiveTab('applicants')}>View all</button>
                                </div>
                                <div className="section-body no-pad" style={{ overflowX: 'auto' }}>
                                    {applicants.length === 0 ? (
                                        <div style={{ padding: '2rem', textAlign: 'center', color: 'var(--text-muted)' }}>No applicants yet.</div>
                                    ) : (
                                        <table className="dashboard-table">
                                            <thead>
                                                <tr>
                                                    <th>Candidate</th>
                                                    <th>Opportunity</th>
                                                    <th>Status</th>
                                                    <th>Actions</th>
                                                </tr>
                                            </thead>
                                            <tbody>
                                                {applicants.slice(0, 5).map(app => (
                                                    <tr key={app._id}>
                                                        <td>
                                                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                                                <div className="list-avatar blue" style={{ width: 32, height: 32, fontSize: '0.7rem' }}>
                                                                    {getInitials(app.user?.username)}
                                                                </div>
                                                                <div>
                                                                    <div style={{ fontWeight: 600, fontSize: '0.85rem' }}>{app.user?.username}</div>
                                                                    <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>{app.user?.headline}</div>
                                                                </div>
                                                            </div>
                                                        </td>
                                                        <td style={{ fontSize: '0.82rem' }}>{app.opportunity?.title}</td>
                                                        <td>
                                                            <span className={`status-badge ${(app.status || 'Applied').toLowerCase()}`}>
                                                                {app.status || 'Applied'}
                                                            </span>
                                                        </td>
                                                        <td>
                                                            <div className="action-btns">
                                                                <button title="View Profile" className="action-btn-sm primary" onClick={() => navigate(`/profile/${app.user?._id}`)}><Eye size={13} /></button>
                                                                <button title="Shortlist" className="action-btn-sm success" onClick={() => updateAppStatus(app._id, 'Shortlisted')}><CheckCircle size={13} /></button>
                                                                <button title="Contact" className="action-btn-sm info" onClick={() => contactCandidate(app.user?._id)} style={{ background: '#3b82f6', color: 'white' }}><MessageSquare size={13} /></button>
                                                            </div>
                                                        </td>
                                                    </tr>
                                                ))}
                                            </tbody>
                                        </table>
                                    )}
                                </div>
                            </div>
                        </>
                    )}

                    {activeTab === 'jobs' && (
                        <div className="dashboard-section full-width">
                            <div className="section-header">
                                <h2><Briefcase size={18} /> My Job Postings</h2>
                            </div>
                            <div className="section-body no-pad">
                                {jobPostings.length === 0 ? (
                                    <div style={{ padding: '4rem', textAlign: 'center' }}>
                                        <h3>No postings yet</h3>
                                        <button className="btn btn-primary" onClick={() => setShowPostModal(true)} style={{ marginTop: '1rem' }}>Post Your First Job</button>
                                    </div>
                                ) : (
                                    <table className="dashboard-table">
                                        <thead>
                                            <tr>
                                                <th>Title</th>
                                                <th>Type</th>
                                                <th>Posted Date</th>
                                                <th>Actions</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {jobPostings.map(job => (
                                                <tr key={job._id}>
                                                    <td style={{ fontWeight: 600 }}>{job.title}</td>
                                                    <td>{job.type}</td>
                                                    <td>{new Date(job.postedAt).toLocaleDateString()}</td>
                                                    <td>
                                                        <button className="btn btn-outline btn-sm" onClick={() => navigate(`/compete`)}>View Publicly</button>
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                )}
                            </div>
                        </div>
                    )}

                    {activeTab === 'applicants' && (
                        <div className="dashboard-section full-width">
                            <div className="section-header">
                                <h2><Users size={18} /> All Applicants</h2>
                            </div>
                            <div className="section-body no-pad">
                                {applicants.length === 0 ? (
                                    <div style={{ padding: '4rem', textAlign: 'center' }}>No applicants yet.</div>
                                ) : (
                                    applicants.map(app => (
                                        <div key={app._id} className="list-item">
                                            <div className="list-avatar blue">
                                                {getInitials(app.user?.username)}
                                            </div>
                                            <div className="list-info">
                                                <h4>{app.user?.username}</h4>
                                                <p>{app.user?.headline}</p>
                                                <div style={{ display: 'flex', gap: '0.25rem', marginTop: '0.25rem' }}>
                                                    {app.user?.skills?.slice(0, 3).map((s, i) => (
                                                        <span key={i} className="skill-tag-xs">{s}</span>
                                                    ))}
                                                </div>
                                            </div>
                                            <div style={{ textAlign: 'right', flex: 1 }}>
                                                <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>Position</div>
                                                <div style={{ fontSize: '0.85rem', fontWeight: 600 }}>{app.opportunity?.title}</div>
                                                <span className={`status-badge ${(app.status || 'Applied').toLowerCase()}`} style={{ marginTop: '0.3rem' }}>{app.status || 'Applied'}</span>
                                            </div>
                                            <div className="list-actions">
                                                <button className="btn btn-sm btn-outline" onClick={() => navigate(`/profile/${app.user?._id}`)}>Profile</button>
                                                <button className="btn btn-sm btn-primary" onClick={() => contactCandidate(app.user?._id)}>Message</button>
                                                <button className="icon-btn" onClick={() => updateAppStatus(app._id, 'Shortlisted')} style={{ color: '#059669' }}><CheckCircle size={20} /></button>
                                            </div>
                                        </div>
                                    ))
                                )}
                            </div>
                        </div>
                    )}

                    {activeTab === 'candidates' && (
                        <div className="dashboard-section full-width">
                            <div className="section-header">
                                <h2><Search size={18} /> Talent Search</h2>
                            </div>
                            <div className="section-body">
                                <div className="dashboard-toolbar">
                                    <input
                                        type="text"
                                        placeholder="Search candidates..."
                                        value={search}
                                        onChange={e => setSearch(e.target.value)}
                                        onKeyDown={e => e.key === 'Enter' && searchCandidates()}
                                    />
                                    <button className="btn btn-primary" onClick={searchCandidates}>Search</button>
                                </div>
                                <div className="candidates-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '1rem', marginTop: '1rem' }}>
                                    {candidates.map(c => (
                                        <div key={c._id} className="candidate-card" style={{ border: '1px solid var(--border)', borderRadius: '12px', padding: '1rem', background: 'var(--surface)' }}>
                                            <div style={{ display: 'flex', gap: '1rem', marginBottom: '1rem' }}>
                                                <div className="avatar-med">{getInitials(c.username)}</div>
                                                <div>
                                                    <h4 style={{ margin: 0 }}>{c.username}</h4>
                                                    <p style={{ margin: 0, fontSize: '0.85rem', color: 'var(--text-muted)' }}>{c.headline}</p>
                                                </div>
                                            </div>
                                            <div className="skills-row" style={{ display: 'flex', gap: '0.5rem', marginBottom: '1rem', flexWrap: 'wrap' }}>
                                                {c.skills?.slice(0, 4).map((s, i) => <span key={i} className="skill-tag-xs">{s}</span>)}
                                            </div>
                                            <div style={{ display: 'flex', gap: '0.5rem' }}>
                                                <button className="btn btn-sm btn-outline" style={{ flex: 1 }} onClick={() => navigate(`/profile/${c._id}`)}>View Profile</button>
                                                <button className="btn btn-sm btn-primary" style={{ flex: 1 }} onClick={() => contactCandidate(c._id)}>Message</button>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>
                    )}
                </>
            )}

            {/* Post Job Modal */}
            {showPostModal && (
                <div className="modal-overlay" onClick={() => setShowPostModal(false)}>
                    <div className="modal-content" onClick={e => e.stopPropagation()} style={{ maxWidth: '600px' }}>
                        <div className="modal-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
                            <h2 style={{ margin: 0 }}>Post New Opportunity</h2>
                            <button onClick={() => setShowPostModal(false)} className="icon-btn"><X size={24} /></button>
                        </div>
                        <form onSubmit={handlePostJob} className="post-job-form">
                            <div className="form-group" style={{ marginBottom: '1rem' }}>
                                <label>Position Title</label>
                                <input type="text" required value={newJob.title} onChange={e => setNewJob({...newJob, title: e.target.value})} placeholder="e.g. Senior Frontend Developer" style={{ width: '100%', padding: '0.75rem', borderRadius: '8px', border: '1px solid var(--border)' }} />
                            </div>
                            <div style={{ display: 'flex', gap: '1rem', marginBottom: '1rem' }}>
                                <div className="form-group" style={{ flex: 1 }}>
                                    <label>Type</label>
                                    <select value={newJob.type} onChange={e => setNewJob({...newJob, type: e.target.value})} style={{ width: '100%', padding: '0.75rem', borderRadius: '8px', border: '1px solid var(--border)' }}>
                                        <option value="Job">Job</option>
                                        <option value="Internship">Internship</option>
                                        <option value="Hackathon">Hackathon</option>
                                        <option value="Competition">Competition</option>
                                    </select>
                                </div>
                                <div className="form-group" style={{ flex: 1 }}>
                                    <label>Deadline</label>
                                    <input type="date" required value={newJob.deadline} onChange={e => setNewJob({...newJob, deadline: e.target.value})} style={{ width: '100%', padding: '0.75rem', borderRadius: '8px', border: '1px solid var(--border)' }} />
                                </div>
                            </div>
                            <div className="form-group" style={{ marginBottom: '1rem' }}>
                                <label>Compensation / Reward</label>
                                <input type="text" value={newJob.reward} onChange={e => setNewJob({...newJob, reward: e.target.value})} placeholder="e.g. $100k - $120k or $500 Cash Prize" style={{ width: '100%', padding: '0.75rem', borderRadius: '8px', border: '1px solid var(--border)' }} />
                            </div>
                            <div className="form-group" style={{ marginBottom: '1.5rem' }}>
                                <label>Description</label>
                                <textarea required rows={4} value={newJob.description} onChange={e => setNewJob({...newJob, description: e.target.value})} placeholder="Describe the role, requirements and responsibilities..." style={{ width: '100%', padding: '0.75rem', borderRadius: '8px', border: '1px solid var(--border)' }}></textarea>
                            </div>
                            <button type="submit" className="btn btn-primary" style={{ width: '100%', padding: '1rem' }}>Post Opportunity</button>
                        </form>
                    </div>
                </div>
            )}
            
            <style>{`
                .skill-tag-xs {
                    background: var(--primary-bg);
                    color: var(--primary);
                    font-size: 0.75rem;
                    padding: 0.2rem 0.6rem;
                    border-radius: 6px;
                    font-weight: 600;
                }
                .avatar-med {
                    width: 48px;
                    height: 48px;
                    border-radius: 50%;
                    background: var(--primary);
                    color: white;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    font-weight: 700;
                    flex-shrink: 0;
                }
            `}</style>
        </div>
    );
};

export default RecruiterDashboard;
