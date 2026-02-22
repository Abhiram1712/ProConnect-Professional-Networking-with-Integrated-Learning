import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import './Auth.css';

const ROLES = [
    { value: 'candidate', icon: '🎓', label: 'Candidate', desc: 'Find jobs & grow' },
    { value: 'mentor', icon: '🧑‍🏫', label: 'Mentor', desc: 'Guide & teach' },
    { value: 'recruiter', icon: '💼', label: 'Recruiter', desc: 'Hire talent' }
];

const Register = () => {
    const [formData, setFormData] = useState({
        username: '',
        email: '',
        password: '',
        role: 'candidate'
    });
    const navigate = useNavigate();

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            const res = await fetch('http://localhost:5000/api/auth/register', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(formData)
            });

            const data = await res.json();

            if (!res.ok) {
                throw new Error(data.msg || 'Registration failed');
            }

            localStorage.setItem('token', data.token);
            localStorage.setItem('user', JSON.stringify(data.user));
            toast.success('Registration successful!');

            // Redirect based on role
            switch (data.user.role) {
                case 'recruiter':
                    navigate('/recruiter/dashboard');
                    break;
                case 'mentor':
                    navigate('/mentor/dashboard');
                    break;
                case 'admin':
                    navigate('/admin/dashboard');
                    break;
                default:
                    navigate('/');
            }
            window.location.reload();
        } catch (err) {
            toast.error(err.message);
        }
    };

    return (
        <div className="auth-container">
            <div className="auth-card">
                <h2>Create Account</h2>
                <p>Join the community as a candidate, mentor, or recruiter</p>

                <form onSubmit={handleSubmit}>
                    {/* Role Selection */}
                    <div className="role-selector">
                        {ROLES.map(r => (
                            <label key={r.value} className="role-option">
                                <input
                                    type="radio"
                                    name="role"
                                    value={r.value}
                                    checked={formData.role === r.value}
                                    onChange={handleChange}
                                />
                                <div className="role-card">
                                    <span className="role-icon">{r.icon}</span>
                                    <span className="role-label">{r.label}</span>
                                    <span className="role-desc">{r.desc}</span>
                                </div>
                            </label>
                        ))}
                    </div>

                    <div className="form-group">
                        <label>Username</label>
                        <input
                            type="text"
                            name="username"
                            value={formData.username}
                            onChange={handleChange}
                            placeholder="Enter your full name"
                            required
                        />
                    </div>

                    <div className="form-group">
                        <label>Email Address</label>
                        <input
                            type="email"
                            name="email"
                            value={formData.email}
                            onChange={handleChange}
                            placeholder="you@example.com"
                            required
                        />
                    </div>

                    <div className="form-group">
                        <label>Password</label>
                        <input
                            type="password"
                            name="password"
                            value={formData.password}
                            onChange={handleChange}
                            placeholder="At least 6 characters"
                            required
                            minLength={6}
                        />
                    </div>

                    <button type="submit" className="btn btn-primary btn-block">
                        Create {formData.role.charAt(0).toUpperCase() + formData.role.slice(1)} Account
                    </button>
                </form>

                <p className="auth-footer">
                    Already have an account? <Link to="/login">Login</Link>
                </p>
            </div>
        </div>
    );
};

export default Register;
