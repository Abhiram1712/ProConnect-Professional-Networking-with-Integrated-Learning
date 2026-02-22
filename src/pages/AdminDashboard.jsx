import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
    Users, Briefcase, FileText, TrendingUp, Shield, Search,
    Trash2, Edit3, AlertTriangle, BarChart3, Eye, ChevronDown,
    UserCheck, Activity, Settings, RefreshCw, MessageSquare, Award
} from 'lucide-react';
import { toast } from 'react-toastify';
import './Dashboard.css';

const API = 'http://localhost:5000/api';

const AdminDashboard = () => {
    const navigate = useNavigate();
    const [user] = useState(JSON.parse(localStorage.getItem('user')));
    const token = localStorage.getItem('token');

    const [activeTab, setActiveTab] = useState('overview');
    const [stats, setStats] = useState(null);
    const [users, setUsers] = useState([]);
    const [totalUsers, setTotalUsers] = useState(0);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [roleFilter, setRoleFilter] = useState('all');
    const [currentPage, setCurrentPage] = useState(1);

    // Role change modal
    const [roleModal, setRoleModal] = useState(null);
    const [newRole, setNewRole] = useState('');

    useEffect(() => {
        if (!token) {
            navigate('/login');
            return;
        }
        if (user?.role !== 'admin') {
            toast.error('Access denied. Admin account required.');
            navigate('/');
        }
    }, [token, user, navigate]);

    useEffect(() => {
        if (token && user?.role === 'admin') {
            fetchStats();
            fetchUsers();
        }
    }, [token, roleFilter, currentPage]);

    const fetchStats = async () => {
        try {
            const res = await fetch(`${API}/admin/stats`, {
                headers: { 'x-auth-token': token }
            });
            if (res.ok) {
                const data = await res.json();
                setStats(data);
            }
        } catch (err) {
            console.error('Stats fetch error:', err);
        }
    };

    const fetchUsers = async () => {
        setLoading(true);
        try {
            const params = new URLSearchParams({
                page: currentPage,
                limit: 15,
                role: roleFilter
            });
            if (searchTerm) params.set('search', searchTerm);

            const res = await fetch(`${API}/admin/users?${params}`, {
                headers: { 'x-auth-token': token }
            });
            if (res.ok) {
                const data = await res.json();
                setUsers(data.users || []);
                setTotalUsers(data.total || 0);
            }
        } catch (err) {
            console.error('Users fetch error:', err);
        } finally {
            setLoading(false);
        }
    };

    const handleSearch = () => {
        setCurrentPage(1);
        fetchUsers();
    };

    const handleDeleteUser = async (userId, username) => {
        if (!window.confirm(`Are you sure you want to delete user "${username}"? This will also delete their posts, connections, and applications.`)) return;

        try {
            const res = await fetch(`${API}/admin/users/${userId}`, {
                method: 'DELETE',
                headers: { 'x-auth-token': token }
            });
            if (res.ok) {
                toast.success(`User "${username}" deleted successfully`);
                fetchUsers();
                fetchStats();
            } else {
                const data = await res.json();
                toast.error(data.msg || 'Delete failed');
            }
        } catch (err) {
            toast.error('Error deleting user');
        }
    };

    const handleRoleChange = async () => {
        if (!roleModal || !newRole) return;

        try {
            const res = await fetch(`${API}/admin/users/${roleModal._id}/role`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    'x-auth-token': token
                },
                body: JSON.stringify({ role: newRole })
            });

            if (res.ok) {
                toast.success(`Role updated to ${newRole}`);
                setRoleModal(null);
                setNewRole('');
                fetchUsers();
                fetchStats();
            } else {
                const data = await res.json();
                toast.error(data.msg || 'Update failed');
            }
        } catch (err) {
            toast.error('Error updating role');
        }
    };

    const getInitials = (name) => name?.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase() || '?';
    const formatDate = (d) => new Date(d).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' });

    return (
        <div className="dashboard-page container">
            {/* Header */}
            <div className="dashboard-header">
                <div>
                    <h1>
                        <Shield size={22} /> Admin Dashboard <span className="role-badge admin">Admin</span>
                    </h1>
                    <p className="dashboard-welcome">Platform management and analytics overview</p>
                </div>
                <div className="quick-actions">
                    <button className="quick-action-btn" onClick={() => { fetchStats(); fetchUsers(); toast.success('Refreshed!'); }}>
                        <RefreshCw size={16} /> Refresh
                    </button>
                    <button className="quick-action-btn" onClick={() => toast.info('Settings coming soon!')}>
                        <Settings size={16} /> Settings
                    </button>
                </div>
            </div>

            {/* Tabs */}
            <div style={{ display: 'flex', gap: '0.25rem', marginBottom: '1.25rem', background: 'var(--surface)', borderRadius: '10px', padding: '0.3rem', boxShadow: '0 1px 3px rgba(0,0,0,0.08)' }}>
                {[
                    { id: 'overview', label: 'Overview', icon: BarChart3 },
                    { id: 'users', label: 'Manage Users', icon: Users },
                    { id: 'content', label: 'Content', icon: FileText }
                ].map(tab => (
                    <button key={tab.id}
                        onClick={() => setActiveTab(tab.id)}
                        style={{
                            flex: 1, padding: '0.55rem 0.75rem', borderRadius: '8px', border: 'none',
                            background: activeTab === tab.id ? '#dc2626' : 'none',
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
                    <div className="stats-grid">
                        <div className="stat-card blue">
                            <div className="stat-icon"><Users size={20} /></div>
                            <div className="stat-value">{stats?.totalUsers ?? '—'}</div>
                            <div className="stat-label">Total Users</div>
                            {stats?.recentSignups > 0 && (
                                <div className="stat-change up">↑ {stats.recentSignups} this week</div>
                            )}
                        </div>
                        <div className="stat-card green">
                            <div className="stat-icon"><FileText size={20} /></div>
                            <div className="stat-value">{stats?.totalPosts ?? '—'}</div>
                            <div className="stat-label">Total Posts</div>
                        </div>
                        <div className="stat-card purple">
                            <div className="stat-icon"><Briefcase size={20} /></div>
                            <div className="stat-value">{stats?.totalOpportunities ?? '—'}</div>
                            <div className="stat-label">Opportunities</div>
                        </div>
                        <div className="stat-card orange">
                            <div className="stat-icon"><MessageSquare size={20} /></div>
                            <div className="stat-value">{stats?.totalApplications ?? '—'}</div>
                            <div className="stat-label">Applications</div>
                        </div>
                    </div>

                    <div className="dashboard-grid">
                        {/* Role Breakdown */}
                        <div className="dashboard-section">
                            <div className="section-header">
                                <h2><Users size={18} /> User Breakdown by Role</h2>
                            </div>
                            <div className="section-body">
                                {stats?.roles ? (
                                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                                        {[
                                            { label: 'Candidates', count: stats.roles.candidates, color: '#3b82f6', icon: '🎓' },
                                            { label: 'Recruiters', count: stats.roles.recruiters, color: '#7c3aed', icon: '💼' },
                                            { label: 'Mentors', count: stats.roles.mentors, color: '#059669', icon: '🧑‍🏫' },
                                            { label: 'Admins', count: stats.roles.admins, color: '#dc2626', icon: '🛡️' }
                                        ].map((r, i) => {
                                            const pct = stats.totalUsers > 0 ? (r.count / stats.totalUsers) * 100 : 0;
                                            return (
                                                <div key={i}>
                                                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.3rem', fontSize: '0.85rem' }}>
                                                        <span>{r.icon} {r.label}</span>
                                                        <span style={{ fontWeight: 600 }}>{r.count} ({pct.toFixed(0)}%)</span>
                                                    </div>
                                                    <div style={{ width: '100%', height: '8px', borderRadius: '4px', background: '#f3f4f6' }}>
                                                        <div style={{
                                                            width: `${pct}%`, height: '100%', borderRadius: '4px',
                                                            background: r.color, transition: 'width 0.5s ease-out'
                                                        }} />
                                                    </div>
                                                </div>
                                            );
                                        })}
                                    </div>
                                ) : (
                                    <div className="dashboard-empty">Loading...</div>
                                )}
                            </div>
                        </div>

                        {/* Application Status Breakdown */}
                        <div className="dashboard-section">
                            <div className="section-header">
                                <h2><Award size={18} /> Application Status</h2>
                            </div>
                            <div className="section-body">
                                {stats?.applicationStats?.length > 0 ? (
                                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.65rem' }}>
                                        {stats.applicationStats.map((s, i) => (
                                            <div key={i} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '0.5rem 0' }}>
                                                <span className={`status-badge ${s._id?.toLowerCase()}`}>{s._id}</span>
                                                <span style={{ fontWeight: 700, fontSize: '1.1rem' }}>{s.count}</span>
                                            </div>
                                        ))}
                                    </div>
                                ) : (
                                    <div className="dashboard-empty">
                                        <div className="empty-icon">📊</div>
                                        <p>No application data yet</p>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                </>
            )}

            {/* ====== MANAGE USERS TAB ====== */}
            {activeTab === 'users' && (
                <div className="dashboard-section full-width">
                    <div className="section-header">
                        <h2><Users size={18} /> All Users ({totalUsers})</h2>
                    </div>
                    <div className="section-body" style={{ paddingBottom: 0 }}>
                        <div className="dashboard-toolbar">
                            <input
                                type="text"
                                placeholder="Search by name or email..."
                                value={searchTerm}
                                onChange={e => setSearchTerm(e.target.value)}
                                onKeyDown={e => e.key === 'Enter' && handleSearch()}
                            />
                            <select value={roleFilter} onChange={e => { setRoleFilter(e.target.value); setCurrentPage(1); }}>
                                <option value="all">All Roles</option>
                                <option value="candidate">Candidate</option>
                                <option value="recruiter">Recruiter</option>
                                <option value="mentor">Mentor</option>
                                <option value="admin">Admin</option>
                            </select>
                            <button className="btn btn-primary" style={{ borderRadius: '8px', padding: '0.5rem 1rem' }} onClick={handleSearch}>
                                <Search size={16} /> Search
                            </button>
                        </div>
                    </div>
                    <div className="section-body no-pad" style={{ overflowX: 'auto' }}>
                        {loading ? (
                            <div className="dashboard-empty">Loading users...</div>
                        ) : users.length === 0 ? (
                            <div className="dashboard-empty">
                                <div className="empty-icon">👤</div>
                                <h3>No users found</h3>
                                <p>Try adjusting your search or filter</p>
                            </div>
                        ) : (
                            <>
                                <table className="dashboard-table">
                                    <thead>
                                        <tr>
                                            <th>User</th>
                                            <th>Email</th>
                                            <th>Role</th>
                                            <th>Joined</th>
                                            <th>Actions</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {users.map(u => (
                                            <tr key={u._id}>
                                                <td>
                                                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                                        <div className="list-avatar blue" style={{ width: 32, height: 32, fontSize: '0.7rem' }}>
                                                            {getInitials(u.username)}
                                                        </div>
                                                        <div>
                                                            <div style={{ fontWeight: 600, fontSize: '0.85rem' }}>{u.username}</div>
                                                            <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>{u.headline || '—'}</div>
                                                        </div>
                                                    </div>
                                                </td>
                                                <td style={{ fontSize: '0.82rem' }}>{u.email}</td>
                                                <td>
                                                    <span className={`role-tag ${u.role}`}>{u.role}</span>
                                                </td>
                                                <td style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>{formatDate(u.createdAt)}</td>
                                                <td>
                                                    <div className="action-btns">
                                                        <button className="action-btn-sm warning"
                                                            onClick={() => { setRoleModal(u); setNewRole(u.role); }}
                                                            title="Change role">
                                                            <Edit3 size={13} /> Role
                                                        </button>
                                                        {u._id !== user?.id && u._id !== user?._id && (
                                                            <button className="action-btn-sm danger"
                                                                onClick={() => handleDeleteUser(u._id, u.username)}
                                                                title="Delete user">
                                                                <Trash2 size={13} />
                                                            </button>
                                                        )}
                                                    </div>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>

                                {/* Pagination */}
                                <div style={{ display: 'flex', justifyContent: 'center', gap: '0.5rem', padding: '1rem' }}>
                                    <button
                                        className="action-btn-sm primary"
                                        disabled={currentPage <= 1}
                                        onClick={() => setCurrentPage(p => p - 1)}
                                        style={{ opacity: currentPage <= 1 ? 0.4 : 1 }}>
                                        ← Prev
                                    </button>
                                    <span style={{ padding: '0.3rem 0.75rem', fontSize: '0.82rem', fontWeight: 600 }}>
                                        Page {currentPage}
                                    </span>
                                    <button
                                        className="action-btn-sm primary"
                                        disabled={users.length < 15}
                                        onClick={() => setCurrentPage(p => p + 1)}
                                        style={{ opacity: users.length < 15 ? 0.4 : 1 }}>
                                        Next →
                                    </button>
                                </div>
                            </>
                        )}
                    </div>
                </div>
            )}

            {/* ====== CONTENT TAB ====== */}
            {activeTab === 'content' && (
                <div className="dashboard-grid">
                    <div className="dashboard-section full-width">
                        <div className="section-header">
                            <h2><Activity size={18} /> Platform Activity</h2>
                        </div>
                        <div className="section-body">
                            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem' }}>
                                <div style={{ textAlign: 'center', padding: '1.25rem', background: '#f8fafc', borderRadius: '10px' }}>
                                    <div style={{ fontSize: '2rem', fontWeight: 700, color: '#3b82f6' }}>{stats?.totalPosts ?? '—'}</div>
                                    <div style={{ fontSize: '0.82rem', color: 'var(--text-muted)', marginTop: '0.2rem' }}>Total Posts</div>
                                </div>
                                <div style={{ textAlign: 'center', padding: '1.25rem', background: '#f8fafc', borderRadius: '10px' }}>
                                    <div style={{ fontSize: '2rem', fontWeight: 700, color: '#8b5cf6' }}>{stats?.totalOpportunities ?? '—'}</div>
                                    <div style={{ fontSize: '0.82rem', color: 'var(--text-muted)', marginTop: '0.2rem' }}>Opportunities</div>
                                </div>
                                <div style={{ textAlign: 'center', padding: '1.25rem', background: '#f8fafc', borderRadius: '10px' }}>
                                    <div style={{ fontSize: '2rem', fontWeight: 700, color: '#f59e0b' }}>{stats?.totalApplications ?? '—'}</div>
                                    <div style={{ fontSize: '0.82rem', color: 'var(--text-muted)', marginTop: '0.2rem' }}>Applications</div>
                                </div>
                            </div>
                            <div className="dashboard-empty" style={{ marginTop: '1rem' }}>
                                <div className="empty-icon">🛡️</div>
                                <h3>Content Moderation</h3>
                                <p>Advanced content moderation tools are coming soon. Use the feed to review posts.</p>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* ====== ROLE CHANGE MODAL ====== */}
            {roleModal && (
                <div style={{
                    position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.4)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000
                }} onClick={() => setRoleModal(null)}>
                    <div style={{
                        background: 'white', borderRadius: '12px', padding: '1.5rem',
                        width: '100%', maxWidth: '380px', boxShadow: '0 20px 40px rgba(0,0,0,0.15)'
                    }} onClick={e => e.stopPropagation()}>
                        <h3 style={{ margin: '0 0 0.25rem', fontSize: '1.1rem' }}>Change Role</h3>
                        <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem', margin: '0 0 1rem' }}>
                            User: <strong>{roleModal.username}</strong> ({roleModal.email})
                        </p>

                        <div className="form-group" style={{ marginBottom: '1rem' }}>
                            <label style={{ display: 'block', marginBottom: '0.35rem', fontWeight: 500, fontSize: '0.88rem' }}>New Role</label>
                            <select value={newRole} onChange={e => setNewRole(e.target.value)}
                                style={{
                                    width: '100%', padding: '0.6rem', borderRadius: '8px',
                                    border: '1px solid var(--border)', fontSize: '0.88rem', fontFamily: 'inherit'
                                }}>
                                <option value="candidate">Candidate</option>
                                <option value="recruiter">Recruiter</option>
                                <option value="mentor">Mentor</option>
                                <option value="admin">Admin</option>
                            </select>
                        </div>

                        {newRole === 'admin' && (
                            <div style={{
                                padding: '0.65rem', background: '#fef2f2', borderRadius: '8px',
                                fontSize: '0.8rem', color: '#991b1b', marginBottom: '1rem',
                                display: 'flex', alignItems: 'center', gap: '0.35rem'
                            }}>
                                <AlertTriangle size={16} /> Admin role grants full platform access
                            </div>
                        )}

                        <div style={{ display: 'flex', gap: '0.5rem', justifyContent: 'flex-end' }}>
                            <button className="btn btn-outline" style={{ borderRadius: '8px', padding: '0.45rem 1rem' }}
                                onClick={() => setRoleModal(null)}>
                                Cancel
                            </button>
                            <button className="btn btn-primary" style={{ borderRadius: '8px', padding: '0.45rem 1rem' }}
                                onClick={handleRoleChange}
                                disabled={newRole === roleModal.role}>
                                Update Role
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default AdminDashboard;
