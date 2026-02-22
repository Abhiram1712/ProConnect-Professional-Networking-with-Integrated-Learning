import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
    UserPlus, UserCheck, X, Users, Search, UserMinus, MoreHorizontal,
    MessageSquare, Eye, Clock, ChevronRight, ChevronDown, Inbox,
    Send, User, ArrowRight, Heart, Check, Handshake
} from 'lucide-react';
import { toast } from 'react-toastify';
import './Network.css';

const API = 'http://localhost:5000/api';

const Network = () => {
    const navigate = useNavigate();
    const [activeTab, setActiveTab] = useState('suggestions');
    const [suggestions, setSuggestions] = useState([]);
    const [receivedRequests, setReceivedRequests] = useState([]);
    const [sentRequests, setSentRequests] = useState([]);
    const [connections, setConnections] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [sortBy, setSortBy] = useState('recent');
    const [user] = useState(JSON.parse(localStorage.getItem('user')));

    // Connect modal
    const [connectModal, setConnectModal] = useState(null);
    const [connectNote, setConnectNote] = useState('');
    const [connectionType, setConnectionType] = useState('');

    const token = localStorage.getItem('token');

    // Auth guard: redirect to login if not authenticated
    useEffect(() => {
        if (!token) {
            navigate('/login');
            return;
        }
    }, [token, navigate]);

    useEffect(() => {
        if (token) fetchAllData();
    }, [token]);

    const fetchAllData = async () => {
        setLoading(true);
        await Promise.all([
            fetchSuggestions(),
            fetchReceivedRequests(),
            fetchSentRequests(),
            fetchConnections()
        ]);
        setLoading(false);
    };

    const fetchSuggestions = async () => {
        try {
            const res = await fetch(`${API}/connections/suggestions`, {
                headers: { 'x-auth-token': token }
            });
            const data = await res.json();
            if (Array.isArray(data)) setSuggestions(data);
        } catch (err) {
            console.error('Error fetching suggestions:', err);
        }
    };

    const fetchReceivedRequests = async () => {
        try {
            const res = await fetch(`${API}/connections/requests/received`, {
                headers: { 'x-auth-token': token }
            });
            const data = await res.json();
            if (Array.isArray(data)) setReceivedRequests(data);
        } catch (err) {
            console.error('Error fetching received requests:', err);
        }
    };

    const fetchSentRequests = async () => {
        try {
            const res = await fetch(`${API}/connections/requests/sent`, {
                headers: { 'x-auth-token': token }
            });
            const data = await res.json();
            if (Array.isArray(data)) setSentRequests(data);
        } catch (err) {
            console.error('Error fetching sent requests:', err);
        }
    };

    const fetchConnections = async () => {
        try {
            const params = new URLSearchParams();
            if (searchTerm) params.set('search', searchTerm);
            if (sortBy) params.set('sort', sortBy);

            const res = await fetch(`${API}/connections?${params}`, {
                headers: { 'x-auth-token': token }
            });
            const data = await res.json();
            if (Array.isArray(data)) setConnections(data);
        } catch (err) {
            console.error('Error fetching connections:', err);
        }
    };

    // ============ ACTIONS ============
    const sendRequest = async (userId) => {
        try {
            const res = await fetch(`${API}/connections/request/${userId}`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json', 'x-auth-token': token },
                body: JSON.stringify({
                    note: connectNote,
                    connectionType
                })
            });
            if (res.ok) {
                toast.success('Connection request sent!');
                setSuggestions(suggestions.filter(u => u._id !== userId));
                fetchSentRequests();
                setConnectModal(null);
                setConnectNote('');
                setConnectionType('');
            } else {
                const data = await res.json();
                toast.error(data.msg || 'Failed to send request');
            }
        } catch (err) {
            console.error(err);
            toast.error('Failed to send request');
        }
    };

    const acceptRequest = async (connectionId) => {
        try {
            const res = await fetch(`${API}/connections/accept/${connectionId}`, {
                method: 'PUT',
                headers: { 'x-auth-token': token }
            });
            if (res.ok) {
                toast.success('Connection accepted!');
                setReceivedRequests(receivedRequests.filter(r => r._id !== connectionId));
                fetchConnections();
            }
        } catch (err) {
            console.error(err);
            toast.error('Failed to accept');
        }
    };

    const rejectRequest = async (connectionId) => {
        try {
            const res = await fetch(`${API}/connections/reject/${connectionId}`, {
                method: 'PUT',
                headers: { 'x-auth-token': token }
            });
            if (res.ok) {
                toast.info('Request ignored');
                setReceivedRequests(receivedRequests.filter(r => r._id !== connectionId));
            }
        } catch (err) {
            console.error(err);
        }
    };

    const withdrawRequest = async (connectionId) => {
        try {
            const res = await fetch(`${API}/connections/withdraw/${connectionId}`, {
                method: 'PUT',
                headers: { 'x-auth-token': token }
            });
            if (res.ok) {
                toast.info('Request withdrawn');
                setSentRequests(sentRequests.filter(r => r._id !== connectionId));
            }
        } catch (err) {
            console.error(err);
        }
    };

    const removeConnection = async (userId) => {
        if (!window.confirm('Are you sure you want to remove this connection?')) return;
        try {
            const res = await fetch(`${API}/connections/remove/${userId}`, {
                method: 'DELETE',
                headers: { 'x-auth-token': token }
            });
            if (res.ok) {
                toast.info('Connection removed');
                setConnections(connections.filter(c => c._id !== userId));
            }
        } catch (err) {
            console.error(err);
            toast.error('Failed to remove connection');
        }
    };

    const toggleFollow = async (userId) => {
        try {
            const res = await fetch(`${API}/connections/follow/${userId}`, {
                method: 'POST',
                headers: { 'x-auth-token': token }
            });
            if (res.ok) {
                const data = await res.json();
                toast.success(data.following ? 'Following!' : 'Unfollowed');
            }
        } catch (err) {
            console.error(err);
        }
    };

    useEffect(() => {
        if (activeTab === 'connections') {
            fetchConnections();
        }
    }, [searchTerm, sortBy]);

    const timeAgo = (date) => {
        const now = new Date();
        const diff = now - new Date(date);
        const days = Math.floor(diff / 86400000);
        if (days < 1) return 'Today';
        if (days === 1) return 'Yesterday';
        if (days < 7) return `${days} days ago`;
        if (days < 30) return `${Math.floor(days / 7)} weeks ago`;
        return new Date(date).toLocaleDateString();
    };

    return (
        <div className="network-page container">
            <div className="network-layout">
                {/* ====== LEFT SIDEBAR ====== */}
                <div className="network-sidebar">
                    <div className="network-sidebar-card">
                        <h3>Manage my network</h3>
                        <ul className="sidebar-nav">
                            <li className={`sidebar-nav-item ${activeTab === 'suggestions' ? 'active' : ''}`}
                                onClick={() => setActiveTab('suggestions')}>
                                <span className="nav-label"><UserPlus size={18} /> People you may know</span>
                                {suggestions.length > 0 && <span className="nav-count">{suggestions.length}</span>}
                            </li>
                            <li className={`sidebar-nav-item ${activeTab === 'invitations' ? 'active' : ''}`}
                                onClick={() => setActiveTab('invitations')}>
                                <span className="nav-label"><Inbox size={18} /> Invitations</span>
                                {receivedRequests.length > 0 && <span className="nav-count">{receivedRequests.length}</span>}
                            </li>
                            <li className={`sidebar-nav-item ${activeTab === 'sent' ? 'active' : ''}`}
                                onClick={() => setActiveTab('sent')}>
                                <span className="nav-label"><Send size={18} /> Sent requests</span>
                                {sentRequests.length > 0 && <span className="nav-count">{sentRequests.length}</span>}
                            </li>
                            <li className={`sidebar-nav-item ${activeTab === 'connections' ? 'active' : ''}`}
                                onClick={() => setActiveTab('connections')}>
                                <span className="nav-label"><Users size={18} /> Connections</span>
                                {connections.length > 0 && <span className="nav-count">{connections.length}</span>}
                            </li>
                        </ul>
                    </div>
                </div>

                {/* ====== MAIN CONTENT ====== */}
                <div className="network-main">
                    {/* Mobile Tabs */}
                    <div className="network-tabs" style={{ display: 'none' }}>
                        {/* These appear only on mobile via CSS */}
                    </div>

                    {/* Invitations Section (Always show at top if there are requests) */}
                    {receivedRequests.length > 0 && activeTab !== 'connections' && activeTab !== 'sent' && (
                        <div className="invitations-card">
                            <div className="invitations-header">
                                <h2>Invitations ({receivedRequests.length})</h2>
                                <button className="manage-link" onClick={() => setActiveTab('invitations')}>
                                    Manage all
                                </button>
                            </div>
                            {(activeTab === 'invitations' ? receivedRequests : receivedRequests.slice(0, 3)).map(request => (
                                <div key={request._id} className="invitation-item">
                                    <div className="invitation-avatar"><User size={24} /></div>
                                    <div className="invitation-info">
                                        <h4>{request.requester?.username || 'Unknown'}</h4>
                                        <p className="headline">{request.requester?.headline || 'Professional'}</p>
                                        {request.mutualConnections > 0 && (
                                            <p className="mutual-info">
                                                <Users size={12} /> {request.mutualConnections} mutual connection{request.mutualConnections !== 1 ? 's' : ''}
                                            </p>
                                        )}
                                        {request.note && (
                                            <div className="request-note">"{request.note}"</div>
                                        )}
                                        <span className="request-time">{timeAgo(request.createdAt)}</span>
                                    </div>
                                    <div className="invitation-actions">
                                        <button className="ignore-btn" onClick={() => rejectRequest(request._id)}>
                                            Ignore
                                        </button>
                                        <button className="accept-btn" onClick={() => acceptRequest(request._id)}>
                                            Accept
                                        </button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}

                    {/* Sent Requests */}
                    {activeTab === 'sent' && (
                        <div className="sent-requests-card">
                            <div className="invitations-header">
                                <h2>Sent Requests ({sentRequests.length})</h2>
                            </div>
                            {sentRequests.length === 0 ? (
                                <div className="network-empty" style={{ margin: '1.5rem' }}>
                                    <div className="empty-icon">📤</div>
                                    <h3>No pending sent requests</h3>
                                    <p>Requests you send will appear here until they are accepted</p>
                                </div>
                            ) : (
                                sentRequests.map(request => (
                                    <div key={request._id} className="sent-item">
                                        <div className="invitation-avatar"><User size={24} /></div>
                                        <div className="invitation-info">
                                            <h4>{request.recipient?.username || 'Unknown'}</h4>
                                            <p className="headline">{request.recipient?.headline || 'Professional'}</p>
                                            <span className="request-time">Sent {timeAgo(request.createdAt)}</span>
                                        </div>
                                        <button className="withdraw-btn" onClick={() => withdrawRequest(request._id)}>
                                            Withdraw
                                        </button>
                                    </div>
                                ))
                            )}
                        </div>
                    )}

                    {/* My Connections */}
                    {activeTab === 'connections' && (
                        <div className="connections-card">
                            <div className="connections-header">
                                <h2>{connections.length} Connection{connections.length !== 1 ? 's' : ''}</h2>
                                <div className="connections-search">
                                    <div style={{ position: 'relative' }}>
                                        <Search size={16} style={{ position: 'absolute', left: '0.6rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
                                        <input
                                            type="text"
                                            placeholder="Search connections..."
                                            value={searchTerm}
                                            onChange={(e) => setSearchTerm(e.target.value)}
                                            style={{ paddingLeft: '2rem' }}
                                        />
                                    </div>
                                    <div className="connections-sort">
                                        <select value={sortBy} onChange={(e) => setSortBy(e.target.value)}>
                                            <option value="recent">Recently added</option>
                                            <option value="name">Last name</option>
                                        </select>
                                    </div>
                                </div>
                            </div>

                            {loading ? (
                                <>
                                    {[1, 2, 3].map(i => (
                                        <div key={i} className="network-skeleton">
                                            <div className="skeleton-circle-sm" />
                                            <div className="skeleton-lines" style={{ flex: 1 }}>
                                                <div className="skeleton-line-sm" style={{ width: '40%' }} />
                                                <div className="skeleton-line-sm" style={{ width: '60%' }} />
                                            </div>
                                        </div>
                                    ))}
                                </>
                            ) : connections.length === 0 ? (
                                <div className="network-empty" style={{ margin: '1.5rem' }}>
                                    <div className="empty-icon">🤝</div>
                                    <h3>No connections yet</h3>
                                    <p>Connect with people you know to build your professional network</p>
                                    <button className="btn btn-primary" style={{ marginTop: '0.75rem', borderRadius: '20px' }}
                                        onClick={() => setActiveTab('suggestions')}>
                                        Find people
                                    </button>
                                </div>
                            ) : (
                                connections.map(conn => (
                                    <div key={conn._id} className="connection-item">
                                        <div className="connection-avatar"><User size={24} /></div>
                                        <div className="connection-info">
                                            <h4>{conn.username}</h4>
                                            <p className="conn-headline">{conn.headline || 'Professional'}</p>
                                            {conn.skills?.length > 0 && (
                                                <div className="conn-skills">
                                                    {conn.skills.slice(0, 3).map((skill, i) => (
                                                        <span key={i} className="skill-tag">{skill}</span>
                                                    ))}
                                                    {conn.skills.length > 3 && (
                                                        <span className="skill-tag" style={{ background: '#f3f6f8', color: 'var(--text-muted)' }}>
                                                            +{conn.skills.length - 3}
                                                        </span>
                                                    )}
                                                </div>
                                            )}
                                        </div>
                                        <div className="connection-actions">
                                            <button className="message-btn">
                                                <MessageSquare size={14} /> Message
                                            </button>
                                            <button className="remove-conn-btn" onClick={() => removeConnection(conn._id)} title="Remove connection">
                                                <X size={16} />
                                            </button>
                                        </div>
                                    </div>
                                ))
                            )}
                        </div>
                    )}

                    {/* People You May Know */}
                    {activeTab === 'suggestions' && (
                        <div className="suggestions-section">
                            <h2>People you may know based on your profile</h2>

                            {loading ? (
                                <div className="grid-users">
                                    {[1, 2, 3, 4, 5, 6].map(i => (
                                        <div key={i} className="user-card" style={{ padding: '0' }}>
                                            <div className="user-cover" style={{ background: 'linear-gradient(90deg, #f0f0f0 25%, #e0e0e0 50%, #f0f0f0 75%)', backgroundSize: '200% 100%', animation: 'shimmer 1.5s infinite' }} />
                                            <div style={{ padding: '1rem', textAlign: 'center' }}>
                                                <div className="skeleton-line-sm" style={{ width: '60%', margin: '0 auto 0.5rem' }} />
                                                <div className="skeleton-line-sm" style={{ width: '80%', margin: '0 auto 0.5rem' }} />
                                                <div className="skeleton-line-sm" style={{ width: '70%', margin: '0 auto' }} />
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            ) : suggestions.length === 0 ? (
                                <div className="network-empty">
                                    <div className="empty-icon">🔍</div>
                                    <h3>No suggestions right now</h3>
                                    <p>Complete your profile with skills and education to get better suggestions</p>
                                </div>
                            ) : (
                                <div className="grid-users">
                                    {suggestions.map(suggestion => (
                                        <div key={suggestion._id} className="user-card">
                                            <div className="user-cover">
                                                <div className="user-card-avatar"><User size={28} /></div>
                                            </div>
                                            <div className="user-info">
                                                <h3>{suggestion.username}</h3>
                                                <p className="user-headline">{suggestion.headline || 'Student / Professional'}</p>
                                                {suggestion.mutualConnectionsCount > 0 && (
                                                    <div className="mutual-badge">
                                                        <Users size={12} />
                                                        {suggestion.mutualConnectionsCount} mutual
                                                    </div>
                                                )}
                                                {suggestion.sharedSkills?.length > 0 && (
                                                    <div className="shared-skills">
                                                        {suggestion.sharedSkills.slice(0, 2).map((s, i) => (
                                                            <span key={i} className="skill-tag">{s}</span>
                                                        ))}
                                                    </div>
                                                )}
                                                <button className="connect-btn"
                                                    onClick={() => setConnectModal(suggestion)}>
                                                    <UserPlus size={15} /> Connect
                                                </button>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    )}

                    {/* Invitations Full View */}
                    {activeTab === 'invitations' && receivedRequests.length === 0 && (
                        <div className="network-empty">
                            <div className="empty-icon">📬</div>
                            <h3>No pending invitations</h3>
                            <p>Connection invitations you receive will appear here</p>
                        </div>
                    )}
                </div>
            </div>

            {/* ====== CONNECT WITH NOTE MODAL ====== */}
            {connectModal && (
                <div className="connect-modal-overlay" onClick={() => setConnectModal(null)}>
                    <div className="connect-modal" onClick={e => e.stopPropagation()}>
                        <div className="modal-header">
                            <h3>Connect with {connectModal.username}</h3>
                            <button className="modal-close-btn" onClick={() => setConnectModal(null)} style={{ background: 'none', border: 'none', cursor: 'pointer', display: 'flex' }}>
                                <X size={20} />
                            </button>
                        </div>
                        <div className="modal-body">
                            <p>You can add a note to personalize your invitation (optional)</p>

                            <div className="connect-type-select">
                                {['colleague', 'classmate', 'friend', 'other'].map(type => (
                                    <button key={type}
                                        className={`connect-type-option ${connectionType === type ? 'active' : ''}`}
                                        onClick={() => setConnectionType(connectionType === type ? '' : type)}>
                                        {type.charAt(0).toUpperCase() + type.slice(1)}
                                    </button>
                                ))}
                            </div>

                            <textarea
                                placeholder="Ex: Hi! I'd like to connect with you because..."
                                value={connectNote}
                                onChange={e => setConnectNote(e.target.value.slice(0, 300))}
                                rows={4}
                            />
                            <div className="char-count">{connectNote.length}/300</div>
                        </div>
                        <div className="modal-footer">
                            <button className="btn btn-outline" onClick={() => {
                                sendRequest(connectModal._id);
                            }} style={{ borderRadius: '20px' }}>
                                Send without note
                            </button>
                            <button className="btn btn-primary" onClick={() => {
                                sendRequest(connectModal._id);
                            }} style={{ borderRadius: '20px' }}
                                disabled={connectNote.length === 0}>
                                Send with note
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Network;
