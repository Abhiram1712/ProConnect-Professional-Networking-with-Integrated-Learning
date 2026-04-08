import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Send, User, Search, MoreVertical, Phone, Video, Info, Paperclip, Smile, Image as ImageIcon, Plus, X } from 'lucide-react';
import { toast } from 'react-toastify';
import './Messages.css';

const API = import.meta.env.VITE_API_URL || 'http://localhost:5000';

const Messages = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const token = localStorage.getItem('token');
    const [user] = useState(JSON.parse(localStorage.getItem('user')));
    
    const [conversations, setConversations] = useState([]);
    const [activeConversation, setActiveConversation] = useState(null);
    const [messages, setMessages] = useState([]);
    const [newMessage, setNewMessage] = useState('');
    const [loading, setLoading] = useState(true);
    const [conversationsLoading, setConversationsLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    
    const [showNewChatModal, setShowNewChatModal] = useState(false);
    const [connections, setConnections] = useState([]);
    
    const messagesEndRef = useRef(null);

    useEffect(() => {
        if (!token) {
            navigate('/login');
            return;
        }
        fetchConversations();
        fetchConnections();
    }, [token]);

    const fetchConnections = async () => {
        try {
            const res = await fetch(`${API}/api/connections`, {
                headers: { 'x-auth-token': token }
            });
            const data = await res.json();
            if (Array.isArray(data)) setConnections(data);
        } catch (err) {
            console.error("Error fetching connections:", err);
        }
    };

    const fetchConversations = async () => {
        try {
            setConversationsLoading(true);
            const res = await fetch(`${API}/api/messages/conversations`, {
                headers: { 'x-auth-token': token }
            });
            const data = await res.json();
            if (Array.isArray(data)) {
                setConversations(data);
                
                // If there's a userId in the location state (from "Contact" button), open that conversation
                if (location.state?.userId) {
                    const existingConv = data.find(c => c.user._id === location.state.userId);
                    if (existingConv) {
                        selectConversation(existingConv.user);
                    } else {
                        // Start a new conversation with a user not in lists yet
                        startNewConversation(location.state.userId);
                    }
                } else if (data.length > 0 && !activeConversation) {
                    // Default to first conversation
                    // selectConversation(data[0].user);
                }
            }
        } catch (err) {
            console.error(err);
        } finally {
            setConversationsLoading(false);
            setLoading(false);
        }
    };

    const startNewConversation = async (userId) => {
        try {
            const res = await fetch(`${API}/api/users/${userId}`, {
                headers: { 'x-auth-token': token }
            });
            const userData = await res.json();
            if (userData && userData._id) {
                selectConversation(userData);
            }
        } catch (err) {
            console.error(err);
        }
    };

    const selectConversation = async (otherUser) => {
        setActiveConversation(otherUser);
        setMessages([]);
        try {
            const res = await fetch(`${API}/api/messages/${otherUser._id}`, {
                headers: { 'x-auth-token': token }
            });
            const data = await res.json();
            if (Array.isArray(data)) {
                setMessages(data);
                scrollToBottom();
            }
        } catch (err) {
            console.error(err);
        }
    };

    const handleSendMessage = async (e) => {
        e.preventDefault();
        if (!newMessage.trim() || !activeConversation) return;

        const text = newMessage;
        setNewMessage('');

        try {
            const res = await fetch(`${API}/api/messages`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'x-auth-token': token
                },
                body: JSON.stringify({
                    receiverId: activeConversation._id,
                    text: text
                })
            });
            const data = await res.json();
            if (data && data._id) {
                setMessages([...messages, data]);
                scrollToBottom();
                fetchConversations(); // Update side list
            }
        } catch (err) {
            console.error(err);
            toast.error('Failed to send message');
        }
    };

    const scrollToBottom = () => {
        setTimeout(() => {
            messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
        }, 100);
    };

    const formatTime = (dateString) => {
        const date = new Date(dateString);
        return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    };

    const filteredConversations = conversations.filter(c => 
        c.user.username.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <div className="messages-page container">
            <div className="messages-card">
                {/* Conversations Sidebar */}
                <div className="conversations-sidebar">
                    <div className="sidebar-header">
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
                            <h2>Messaging</h2>
                            <button className="new-chat-btn" title="New Chat" onClick={() => setShowNewChatModal(true)}>
                                <Plus size={20} />
                            </button>
                        </div>
                        <div className="search-box">
                            <Search size={16} />
                            <input 
                                type="text" 
                                placeholder="Search messages" 
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                            />
                        </div>
                    </div>
                    
                    <div className="conversations-list">
                        {conversationsLoading ? (
                            <div className="loading-state">Loading...</div>
                        ) : filteredConversations.length === 0 ? (
                            <div className="empty-state">No conversations found</div>
                        ) : (
                            filteredConversations.map((conv) => (
                                <div 
                                    key={conv.user._id} 
                                    className={`conversation-item ${activeConversation?._id === conv.user._id ? 'active' : ''}`}
                                    onClick={() => selectConversation(conv.user)}
                                >
                                    <div className="avatar-wrap">
                                        {conv.user.profilePicture ? (
                                            <img src={conv.user.profilePicture} alt={conv.user.username} />
                                        ) : (
                                            <div className="avatar-placeholder">{conv.user.username[0]}</div>
                                        )}
                                        {/* Optional online indicator could go here */}
                                    </div>
                                    <div className="conv-info">
                                        <div className="conv-top">
                                            <span className="conv-name">{conv.user.username}</span>
                                            <span className="conv-time">
                                                {new Date(conv.lastMessageDate).toLocaleDateString() === new Date().toLocaleDateString() 
                                                    ? formatTime(conv.lastMessageDate) 
                                                    : new Date(conv.lastMessageDate).toLocaleDateString([], {month:'short', day:'numeric'})}
                                            </span>
                                        </div>
                                        <div className="conv-preview">
                                            <p className={conv.unread ? 'unread' : ''}>{conv.lastMessage}</p>
                                            {conv.unread && <div className="unread-dot"></div>}
                                        </div>
                                    </div>
                                </div>
                            ))
                        )}
                    </div>
                </div>

                {/* Chat Area */}
                <div className="chat-area">
                    {activeConversation ? (
                        <>
                            <div className="chat-header">
                                <div className="chat-user-info" onClick={() => navigate(`/profile/${activeConversation._id}`)}>
                                    <div className="avatar-small">
                                        {activeConversation.profilePicture ? (
                                            <img src={activeConversation.profilePicture} alt={activeConversation.username} />
                                        ) : (
                                            <div className="avatar-placeholder">{activeConversation.username[0]}</div>
                                        )}
                                    </div>
                                    <div>
                                        <h3>{activeConversation.username}</h3>
                                        <p>{activeConversation.headline || 'Member'}</p>
                                    </div>
                                </div>
                                <div className="chat-actions">
                                    <button className="icon-btn"><Phone size={18} /></button>
                                    <button className="icon-btn"><Video size={18} /></button>
                                    <button className="icon-btn"><Info size={18} /></button>
                                    <button className="icon-btn"><MoreVertical size={18} /></button>
                                </div>
                            </div>

                            <div className="chat-messages">
                                {messages.map((msg, index) => {
                                    const isMe = msg.sender._id === user._id || msg.sender === user._id;
                                    const showAvatar = index === 0 || messages[index-1].sender._id !== msg.sender._id;
                                    
                                    return (
                                        <div key={msg._id} className={`message-row ${isMe ? 'me' : 'them'}`}>
                                            {!isMe && (
                                                <div className="message-avatar">
                                                    {showAvatar && (
                                                        activeConversation.profilePicture ? (
                                                            <img src={activeConversation.profilePicture} alt="" />
                                                        ) : (
                                                            <div className="avatar-placeholder-xs">{activeConversation.username[0]}</div>
                                                        )
                                                    )}
                                                </div>
                                            )}
                                            <div className="message-content">
                                                {showAvatar && !isMe && <span className="sender-name">{activeConversation.username}</span>}
                                                <div className={`message-bubble ${isMe ? 'primary' : 'secondary'}`}>
                                                    {msg.text}
                                                </div>
                                                <span className="message-time">{formatTime(msg.createdAt)}</span>
                                            </div>
                                        </div>
                                    );
                                })}
                                <div ref={messagesEndRef} />
                            </div>

                            <div className="chat-input-area">
                                <form onSubmit={handleSendMessage} className="chat-input-row">
                                    <button type="button" className="icon-btn"><Paperclip size={20} /></button>
                                    <button type="button" className="icon-btn"><ImageIcon size={20} /></button>
                                    <textarea 
                                        placeholder="Write a message..."
                                        value={newMessage}
                                        onChange={(e) => setNewMessage(e.target.value)}
                                        onKeyDown={(e) => {
                                            if (e.key === 'Enter' && !e.shiftKey) {
                                                e.preventDefault();
                                                handleSendMessage(e);
                                            }
                                        }}
                                        rows={1}
                                    />
                                    <button type="button" className="icon-btn"><Smile size={20} /></button>
                                    <button type="submit" className="send-btn" disabled={!newMessage.trim()}>
                                        <Send size={20} />
                                    </button>
                                </form>
                            </div>
                        </>
                    ) : (
                        <div className="no-chat-selected">
                            <div className="chat-intro">
                                <div className="intro-icon">💬</div>
                                <h2>Select a conversation</h2>
                                <p>Choose a colleague or recruiter from the list on the left to start chatting.</p>
                            </div>
                        </div>
                    )}
                </div>
            </div>

            {/* New Chat Modal */}
            {showNewChatModal && (
                <div className="modal-overlay" onClick={() => setShowNewChatModal(false)}>
                    <div className="new-chat-modal" onClick={e => e.stopPropagation()}>
                        <div className="modal-header">
                            <h3>New Conversation</h3>
                            <button className="close-btn" onClick={() => setShowNewChatModal(false)}>
                                <X size={20} />
                            </button>
                        </div>
                        <div className="modal-body">
                            <p className="modal-subtitle">Start a chat with your connections</p>
                            <div className="connections-list-modal">
                                {connections.length === 0 ? (
                                    <div className="empty-state">No connections found. Connect with people to chat!</div>
                                ) : (
                                    connections.map(conn => (
                                        <div 
                                            key={conn._id} 
                                            className="connection-list-item" 
                                            onClick={() => {
                                                selectConversation(conn);
                                                setShowNewChatModal(false);
                                            }}
                                        >
                                            <div className="avatar-small">
                                                {conn.profilePicture ? (
                                                    <img src={conn.profilePicture} alt={conn.username} />
                                                ) : (
                                                    <div className="avatar-placeholder">{conn.username[0]}</div>
                                                )}
                                            </div>
                                            <div className="conn-info">
                                                <div className="conn-name">{conn.username}</div>
                                                <div className="conn-headline">{conn.headline || 'Member'}</div>
                                            </div>
                                        </div>
                                    ))
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Messages;
