import React, { useState, useEffect, useRef } from 'react';
import { User, Mail, Book, Code, Save, Camera, Award, Plus, Trash2, Briefcase, GraduationCap, Link as LinkIcon, CheckCircle } from 'lucide-react';
import { toast } from 'react-toastify';
import './Profile.css';

const API = import.meta.env.VITE_API_URL;

const Profile = () => {
    const fileInputRef = useRef(null);
    const [formData, setFormData] = useState({
        username: '', email: '', headline: '', bio: '',
        skills: '', education: '', profilePicture: '', certifications: []
    });
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [activeTab, setActiveTab] = useState('about');

    useEffect(() => {
        const fetchProfile = async () => {
            const token = localStorage.getItem('token');
            if (!token) { setLoading(false); return; }
            try {
                const res = await fetch(`${API}/api/profile/me`, {
                    headers: { 'x-auth-token': token }
                });
                const data = await res.json();
                setFormData({
                    username: data.username || '',
                    email: data.email || '',
                    headline: data.headline || '',
                    bio: data.bio || '',
                    skills: data.skills ? data.skills.join(', ') : '',
                    education: data.education || '',
                    profilePicture: data.profilePicture || '',
                    certifications: data.certifications || []
                });
            } catch (err) {
                console.error(err);
            } finally {
                setLoading(false);
            }
        };
        fetchProfile();
    }, []);

    const handleChange = (e) => setFormData({ ...formData, [e.target.name]: e.target.value });

    const handleImageUpload = (e) => {
        const file = e.target.files[0];
        if (!file) return;
        if (file.size > 2 * 1024 * 1024) { toast.error('Image must be under 2MB'); return; }
        const reader = new FileReader();
        reader.onloadend = () => setFormData({ ...formData, profilePicture: reader.result });
        reader.readAsDataURL(file);
    };

    const handleCertificationChange = (index, field, value) => {
        const updated = [...formData.certifications];
        updated[index][field] = value;
        setFormData({ ...formData, certifications: updated });
    };

    const addCertification = () => setFormData({
        ...formData,
        certifications: [...formData.certifications, { name: '', issuer: '', date: '', url: '' }]
    });

    const removeCertification = (index) => setFormData({
        ...formData,
        certifications: formData.certifications.filter((_, i) => i !== index)
    });

    const handleSubmit = async (e) => {
        e.preventDefault();
        setSaving(true);
        try {
            const token = localStorage.getItem('token');
            const res = await fetch(`${API}/api/profile/me`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json', 'x-auth-token': token },
                body: JSON.stringify({
                    username: formData.username, headline: formData.headline,
                    bio: formData.bio, skills: formData.skills,
                    education: formData.education, profilePicture: formData.profilePicture,
                    certifications: formData.certifications
                })
            });
            if (res.ok) {
                const updatedUser = await res.json();
                localStorage.setItem('user', JSON.stringify(updatedUser));
                toast.success('Profile updated! ✅');
            } else {
                const err = await res.json().catch(() => ({}));
                toast.error(err.msg || 'Failed to update profile.');
            }
        } catch (err) {
            toast.error('Server error: ' + err.message);
        } finally {
            setSaving(false);
        }
    };

    const initials = formData.username ? formData.username.slice(0, 2).toUpperCase() : 'ME';
    const skillsList = formData.skills ? formData.skills.split(',').map(s => s.trim()).filter(Boolean) : [];

    if (loading) return (
        <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '60vh' }}>
            <div style={{ textAlign: 'center' }}>
                <div style={{ width: 40, height: 40, border: '3px solid var(--border)', borderTopColor: 'var(--primary)', borderRadius: '50%', animation: 'spin 0.8s linear infinite', margin: '0 auto 1rem' }} />
                <p style={{ color: 'var(--text-muted)' }}>Loading profile...</p>
            </div>
        </div>
    );

    return (
        <div className="profile-page-wrapper">
            <div className="container" style={{ padding: '2rem 1.5rem 4rem' }}>
                {/* Page Header */}
                <div style={{ marginBottom: '2rem' }}>
                    <h1 style={{ fontSize: 'clamp(1.5rem, 3vw, 2rem)', fontWeight: 800, letterSpacing: '-0.03em', marginBottom: '0.2rem' }}>
                        My Profile
                    </h1>
                    <p style={{ color: 'var(--text-muted)', margin: 0, fontSize: '0.9rem' }}>
                        Manage your public profile and personal information
                    </p>
                </div>

                <div className="profile-grid-layout">
                    {/* ===== LEFT COLUMN — Profile Card ===== */}
                    <div className="profile-sidebar-col">
                        <div className="profile-info-card">
                            {/* Banner */}
                            <div className="profile-card-banner" />

                            {/* Avatar */}
                            <div className="profile-card-body-top">
                                <div className="profile-avatar-container">
                                    <input
                                        type="file"
                                        accept="image/*"
                                        ref={fileInputRef}
                                        onChange={handleImageUpload}
                                        style={{ display: 'none' }}
                                    />
                                    <div
                                        className="profile-avatar-circle"
                                        onClick={() => fileInputRef.current.click()}
                                        title="Click to change photo"
                                    >
                                        {formData.profilePicture ? (
                                            <img src={formData.profilePicture} alt="Profile" style={{ width: '100%', height: '100%', objectFit: 'cover', borderRadius: '50%' }} />
                                        ) : (
                                            <span className="profile-avatar-initials">{initials}</span>
                                        )}
                                        <div className="profile-avatar-overlay">
                                            <Camera size={18} />
                                        </div>
                                    </div>
                                    <button
                                        type="button"
                                        className="change-photo-btn"
                                        onClick={() => fileInputRef.current.click()}
                                    >
                                        Change photo
                                    </button>
                                </div>

                                <div style={{ textAlign: 'center', padding: '0 1.25rem' }}>
                                    <h2 style={{ fontSize: '1.15rem', fontWeight: 800, marginBottom: '0.2rem', color: 'var(--text)' }}>
                                        {formData.username || 'Your Name'}
                                    </h2>
                                    {formData.headline && (
                                        <p style={{ fontSize: '0.82rem', color: 'var(--text-muted)', margin: '0 0 0.5rem', lineHeight: 1.5 }}>
                                            {formData.headline}
                                        </p>
                                    )}
                                    <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', margin: 0 }}>
                                        {formData.email}
                                    </p>
                                </div>
                            </div>

                            {/* Skills Preview */}
                            {skillsList.length > 0 && (
                                <div className="profile-card-section">
                                    <h4 className="profile-card-section-title">Skills</h4>
                                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.4rem' }}>
                                        {skillsList.slice(0, 8).map((sk, i) => (
                                            <span key={i} className="skill-pill">{sk}</span>
                                        ))}
                                        {skillsList.length > 8 && (
                                            <span className="skill-pill muted">+{skillsList.length - 8}</span>
                                        )}
                                    </div>
                                </div>
                            )}

                            {/* Education Preview */}
                            {formData.education && (
                                <div className="profile-card-section">
                                    <h4 className="profile-card-section-title">Education</h4>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
                                        <GraduationCap size={15} color="var(--primary)" />
                                        {formData.education}
                                    </div>
                                </div>
                            )}

                            {/* Certifications count */}
                            {formData.certifications.length > 0 && (
                                <div className="profile-card-section">
                                    <h4 className="profile-card-section-title">Certifications</h4>
                                    <div style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                                        <Award size={14} color="var(--primary)" />
                                        {formData.certifications.length} certification{formData.certifications.length !== 1 ? 's' : ''}
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* ===== RIGHT COLUMN — Edit Form ===== */}
                    <div className="profile-form-col">
                        {/* Tabs */}
                        <div className="profile-tabs">
                            {[
                                { id: 'about', label: 'About' },
                                { id: 'skills', label: 'Skills & Education' },
                                { id: 'certifications', label: 'Certifications' },
                            ].map(tab => (
                                <button
                                    key={tab.id}
                                    type="button"
                                    className={`profile-tab-btn ${activeTab === tab.id ? 'active' : ''}`}
                                    onClick={() => setActiveTab(tab.id)}
                                >
                                    {tab.label}
                                </button>
                            ))}
                        </div>

                        <form onSubmit={handleSubmit} className="profile-edit-form">
                            {/* ABOUT TAB */}
                            {activeTab === 'about' && (
                                <div className="form-section">
                                    <div className="form-section-header">
                                        <User size={18} />
                                        <div>
                                            <h3>Personal Info</h3>
                                            <p>Your name and professional headline</p>
                                        </div>
                                    </div>

                                    <div className="form-row">
                                        <div className="form-field">
                                            <label>Full Name</label>
                                            <input type="text" name="username" value={formData.username} onChange={handleChange} placeholder="Your full name" />
                                        </div>
                                        <div className="form-field">
                                            <label>Email Address</label>
                                            <input type="email" name="email" value={formData.email} disabled style={{ opacity: 0.6, cursor: 'not-allowed' }} />
                                            <small>Email cannot be changed</small>
                                        </div>
                                    </div>

                                    <div className="form-field">
                                        <label>Professional Headline</label>
                                        <input type="text" name="headline" value={formData.headline} onChange={handleChange} placeholder="e.g. Full Stack Developer | Building at Scale" />
                                    </div>

                                    <div className="form-field">
                                        <label>Bio</label>
                                        <textarea
                                            name="bio"
                                            value={formData.bio}
                                            onChange={handleChange}
                                            placeholder="Tell the world about yourself — your passions, experience, and goals..."
                                            rows={5}
                                            style={{ resize: 'vertical' }}
                                        />
                                        <small>{formData.bio.length}/500</small>
                                    </div>
                                </div>
                            )}

                            {/* SKILLS TAB */}
                            {activeTab === 'skills' && (
                                <div className="form-section">
                                    <div className="form-section-header">
                                        <Code size={18} />
                                        <div>
                                            <h3>Skills & Education</h3>
                                            <p>Technologies, tools, and your academic background</p>
                                        </div>
                                    </div>

                                    <div className="form-field">
                                        <label>Skills</label>
                                        <input
                                            type="text"
                                            name="skills"
                                            value={formData.skills}
                                            onChange={handleChange}
                                            placeholder="React, Node.js, Python, AWS... (comma-separated)"
                                        />
                                        <small>Separate each skill with a comma</small>
                                        {skillsList.length > 0 && (
                                            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.4rem', marginTop: '0.75rem' }}>
                                                {skillsList.map((sk, i) => (
                                                    <span key={i} className="skill-pill">{sk}</span>
                                                ))}
                                            </div>
                                        )}
                                    </div>

                                    <div className="form-field">
                                        <label>Education</label>
                                        <input
                                            type="text"
                                            name="education"
                                            value={formData.education}
                                            onChange={handleChange}
                                            placeholder="University / College name and degree"
                                        />
                                    </div>
                                </div>
                            )}

                            {/* CERTIFICATIONS TAB */}
                            {activeTab === 'certifications' && (
                                <div className="form-section">
                                    <div className="form-section-header">
                                        <Award size={18} />
                                        <div>
                                            <h3>Certifications</h3>
                                            <p>Professional certifications and achievements</p>
                                        </div>
                                    </div>

                                    {formData.certifications.length === 0 && (
                                        <div className="empty-certs">
                                            <Award size={36} color="var(--border)" />
                                            <p>No certifications added yet</p>
                                            <small>Add your professional certifications to stand out</small>
                                        </div>
                                    )}

                                    {formData.certifications.map((cert, index) => (
                                        <div key={index} className="cert-card">
                                            <div className="cert-card-header">
                                                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                                    <div className="cert-num">{index + 1}</div>
                                                    <span style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--text)' }}>
                                                        {cert.name || 'New Certification'}
                                                    </span>
                                                </div>
                                                <button type="button" className="cert-remove-btn" onClick={() => removeCertification(index)} title="Remove">
                                                    <Trash2 size={14} />
                                                </button>
                                            </div>

                                            <div className="form-row">
                                                <div className="form-field">
                                                    <label>Certification Name</label>
                                                    <input
                                                        type="text"
                                                        value={cert.name}
                                                        onChange={(e) => handleCertificationChange(index, 'name', e.target.value)}
                                                        placeholder="e.g. AWS Solutions Architect"
                                                    />
                                                </div>
                                                <div className="form-field">
                                                    <label>Issuing Organization</label>
                                                    <input
                                                        type="text"
                                                        value={cert.issuer}
                                                        onChange={(e) => handleCertificationChange(index, 'issuer', e.target.value)}
                                                        placeholder="e.g. Amazon Web Services"
                                                    />
                                                </div>
                                            </div>

                                            <div className="form-row">
                                                <div className="form-field">
                                                    <label>Date Earned</label>
                                                    <input
                                                        type="month"
                                                        value={cert.date}
                                                        onChange={(e) => handleCertificationChange(index, 'date', e.target.value)}
                                                    />
                                                </div>
                                                <div className="form-field">
                                                    <label>Credential URL <span style={{ color: 'var(--text-muted)', fontWeight: 400 }}>(optional)</span></label>
                                                    <input
                                                        type="url"
                                                        value={cert.url}
                                                        onChange={(e) => handleCertificationChange(index, 'url', e.target.value)}
                                                        placeholder="https://credential.net/..."
                                                    />
                                                </div>
                                            </div>
                                        </div>
                                    ))}

                                    <button type="button" className="add-cert-btn" onClick={addCertification}>
                                        <Plus size={16} /> Add Certification
                                    </button>
                                </div>
                            )}

                            {/* Save Button */}
                            <div className="profile-form-footer">
                                <button type="submit" className="btn btn-primary save-profile-btn" disabled={saving}>
                                    {saving ? (
                                        <>
                                            <div style={{ width: 16, height: 16, border: '2px solid rgba(255,255,255,0.4)', borderTopColor: 'white', borderRadius: '50%', animation: 'spin 0.8s linear infinite' }} />
                                            Saving...
                                        </>
                                    ) : (
                                        <><Save size={16} /> Save Changes</>
                                    )}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Profile;
