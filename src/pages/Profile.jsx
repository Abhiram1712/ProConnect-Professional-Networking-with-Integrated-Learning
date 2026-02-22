import React, { useState, useEffect } from 'react';
import { User, Mail, Book, Code, Save } from 'lucide-react';
import { toast } from 'react-toastify';
import './Profile.css';

const Profile = () => {
    const [formData, setFormData] = useState({
        username: '',
        email: '',
        headline: '',
        bio: '',
        skills: '',
        education: ''
    });
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchProfile = async () => {
            const token = localStorage.getItem('token');
            if (!token) {
                // Redirect if not logged in (handled by protected route logic ideally)
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
                    education: data.education || ''
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
                    education: formData.education
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
                    <div className="avatar-placeholder">
                        <User size={64} />
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

                        <button type="submit" className="btn btn-primary save-btn">
                            <Save size={18} /> Save Changes
                        </button>
                    </form>
                </div>
            </div>
        </div>
    );
};

export default Profile;
