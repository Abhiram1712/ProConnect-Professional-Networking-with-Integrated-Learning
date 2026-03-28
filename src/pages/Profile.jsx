import React, { useState, useEffect, useRef } from 'react';
import { User, Mail, Book, Code, Save, Camera, Award, Plus, Trash2 } from 'lucide-react';
import { toast } from 'react-toastify';
import './Profile.css';

const Profile = () => {
    const fileInputRef = useRef(null);
    const [formData, setFormData] = useState({
        username: '',
        email: '',
        headline: '',
        bio: '',
        skills: '',
        education: '',
        profilePicture: '',
        certifications: []
    });
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchProfile = async () => {
            const token = localStorage.getItem('token');
            if (!token) {
                return;
            }

            try {
                const res = await fetch('http://localhost:5000/api/profile/me', {
                    headers: {
                        'x-auth-token': token
                    }
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
                setLoading(false);
            } catch (err) {
                console.error(err);
                setLoading(false);
            }
        };

        fetchProfile();
    }, []);

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleImageUpload = (e) => {
        const file = e.target.files[0];
        if (file) {
            if (file.size > 2 * 1024 * 1024) { // Limit image to 2MB
                toast.error('Image size should be less than 2MB');
                return;
            }
            const reader = new FileReader();
            reader.onloadend = () => {
                setFormData({ ...formData, profilePicture: reader.result });
            };
            reader.readAsDataURL(file);
        }
    };

    const handleCertificationChange = (index, field, value) => {
        const updatedCertifications = [...formData.certifications];
        updatedCertifications[index][field] = value;
        setFormData({ ...formData, certifications: updatedCertifications });
    };

    const addCertification = () => {
        setFormData({
            ...formData,
            certifications: [...formData.certifications, { name: '', issuer: '', date: '', url: '' }]
        });
    };

    const removeCertification = (index) => {
        const updatedCertifications = formData.certifications.filter((_, i) => i !== index);
        setFormData({ ...formData, certifications: updatedCertifications });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        try {
            const token = localStorage.getItem('token');
            const res = await fetch('http://localhost:5000/api/profile/me', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'x-auth-token': token
                },
                body: JSON.stringify({
                    username: formData.username,
                    headline: formData.headline,
                    bio: formData.bio,
                    skills: formData.skills,
                    education: formData.education,
                    profilePicture: formData.profilePicture,
                    certifications: formData.certifications
                })
            });

            if (res.ok) {
                const updatedUser = await res.json();
                localStorage.setItem('user', JSON.stringify(updatedUser)); // Update local storage
                toast.success('Profile updated successfully!');
            } else {
                const errorData = await res.json().catch(() => ({}));
                console.error("Profile update failed:", errorData);
                toast.error(errorData.msg || 'Failed to update profile.');
            }
        } catch (err) {
            console.error(err);
            toast.error('Server Error: ' + err.message);
        }
    };

    if (loading) return <div className="container" style={{ padding: '4rem' }}>Loading...</div>;

    return (
        <div className="container profile-page">
            <h1 className="page-title">My Profile</h1>

            <div className="profile-grid">
                <div className="profile-card user-info-card">
                    <div 
                        className="profile-picture-upload" 
                        onClick={() => fileInputRef.current.click()}
                        title="Click to change profile picture"
                    >
                        <div 
                            className="avatar-placeholder"
                            style={formData.profilePicture ? { 
                                backgroundImage: `url(${formData.profilePicture})`, 
                                border: '3px solid var(--primary)',
                                backgroundColor: 'transparent'
                            } : {}}
                        >
                            {!formData.profilePicture && <User size={64} />}
                            <div className="upload-overlay">
                                <Camera size={24} />
                            </div>
                        </div>
                        <input
                            type="file"
                            accept="image/*"
                            ref={fileInputRef}
                            onChange={handleImageUpload}
                        />
                    </div>
                    <h2>{formData.username}</h2>
                    <p className="email-text">{formData.email}</p>
                </div>

                <div className="profile-card edit-form-card">
                    <form onSubmit={handleSubmit}>
                        <div className="form-group">
                            <label><User size={16} /> Username</label>
                            <input
                                type="text"
                                name="username"
                                value={formData.username}
                                onChange={handleChange}
                            />
                        </div>

                        <div className="form-group">
                            <label><Book size={16} /> Bio</label>
                            <textarea
                                name="bio"
                                value={formData.bio}
                                onChange={handleChange}
                                placeholder="Tell us about yourself..."
                                rows="3"
                            />
                        </div>

                        <div className="form-group">
                            <label><User size={16} /> Headline</label>
                            <input
                                type="text"
                                name="headline"
                                value={formData.headline}
                                onChange={handleChange}
                                placeholder="e.g. Full Stack Developer | Student at XYZ"
                            />
                        </div>

                        <div className="form-group">
                            <label><Code size={16} /> Skills (comma separated)</label>
                            <input
                                type="text"
                                name="skills"
                                value={formData.skills}
                                onChange={handleChange}
                                placeholder="React, Node.js, Python..."
                            />
                        </div>

                        <div className="form-group">
                            <label><Book size={16} /> Education</label>
                            <input
                                type="text"
                                name="education"
                                value={formData.education}
                                onChange={handleChange}
                                placeholder="University / College"
                            />
                        </div>

                        {/* Certifications Section */}
                        <div className="certifications-section">
                            <div className="certifications-header">
                                <h3><Award size={18} /> Certifications</h3>
                            </div>

                            {formData.certifications.map((cert, index) => (
                                <div key={index} className="certification-card">
                                    <button 
                                        type="button" 
                                        className="remove-btn" 
                                        onClick={() => removeCertification(index)}
                                        title="Remove Certification"
                                    >
                                        <Trash2 size={16} />
                                    </button>
                                    
                                    <div className="form-group">
                                        <label>Certification Name</label>
                                        <input
                                            type="text"
                                            value={cert.name}
                                            onChange={(e) => handleCertificationChange(index, 'name', e.target.value)}
                                            placeholder="e.g. AWS Certified Solutions Architect"
                                            required
                                        />
                                    </div>
                                    <div className="certification-row">
                                        <div className="form-group">
                                            <label>Issuer</label>
                                            <input
                                                type="text"
                                                value={cert.issuer}
                                                onChange={(e) => handleCertificationChange(index, 'issuer', e.target.value)}
                                                placeholder="e.g. Amazon Web Services"
                                                required
                                            />
                                        </div>
                                        <div className="form-group">
                                            <label>Date Earned</label>
                                            <input
                                                type="month"
                                                value={cert.date}
                                                onChange={(e) => handleCertificationChange(index, 'date', e.target.value)}
                                            />
                                        </div>
                                    </div>
                                    <div className="form-group" style={{ marginBottom: 0 }}>
                                        <label>Credential URL (Optional)</label>
                                        <input
                                            type="url"
                                            value={cert.url}
                                            onChange={(e) => handleCertificationChange(index, 'url', e.target.value)}
                                            placeholder="https://credential.net/..."
                                        />
                                    </div>
                                </div>
                            ))}

                            <button type="button" className="add-cert-btn" onClick={addCertification}>
                                <Plus size={16} /> Add Certification
                            </button>
                        </div>

                        <button type="submit" className="btn btn-primary save-btn" style={{ marginTop: '2rem' }}>
                            <Save size={18} /> Save Changes
                        </button>
                    </form>
                </div>
            </div>
        </div>
    );
};

export default Profile;
