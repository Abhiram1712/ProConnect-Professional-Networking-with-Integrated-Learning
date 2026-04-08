import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import { Rocket, ArrowRight, KeyRound } from 'lucide-react';
import './Auth.css';

const API = import.meta.env.VITE_API_URL || 'http://localhost:5000';

const Login = () => {
    const [formData, setFormData] = useState({ email: '', password: '' });
    const [showOTP, setShowOTP] = useState(false);
    const [otpCode, setOtpCode] = useState('');
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();

    const handleChange = (e) => setFormData({ ...formData, [e.target.name]: e.target.value });

    const handleLoginSuccess = (data) => {
        localStorage.setItem('token', data.token);
        localStorage.setItem('user', JSON.stringify(data.user));
        toast.success('Welcome back! 🎉');
        switch (data.user.role) {
            case 'recruiter': navigate('/recruiter/dashboard'); break;
            case 'mentor': navigate('/mentor/dashboard'); break;
            case 'admin': navigate('/admin/dashboard'); break;
            default: navigate('/');
        }
        window.location.reload();
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        try {
            const res = await fetch(`${API}/api/auth/login`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(formData)
            });
            const data = await res.json();
            if (!res.ok) throw new Error(data.msg || 'Login failed');
            if (data.requireVerification) {
                toast.success(data.msg || 'Verification code sent to your email.');
                setShowOTP(true);
                return;
            }
            handleLoginSuccess(data);
        } catch (err) {
            toast.error(err.message);
        } finally {
            setLoading(false);
        }
    };

    const handleVerifyOTP = async (e) => {
        e.preventDefault();
        setLoading(true);
        try {
            const res = await fetch(`${API}/api/auth/verify-login`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email: formData.email, code: otpCode })
            });
            const data = await res.json();
            if (!res.ok) throw new Error(data.msg || 'Verification failed');
            handleLoginSuccess(data);
        } catch (err) {
            toast.error(err.message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="auth-page">
            <div className="auth-card">
                <Link to="/" className="auth-logo">
                    <div className="auth-logo-icon"><Rocket size={22} /></div>
                    <span className="auth-logo-text">ProConnect</span>
                </Link>

                <div className="auth-header">
                    <h2>{showOTP ? 'Verify Your Identity' : 'Welcome Back'}</h2>
                    <p>{showOTP ? 'Enter the 6-digit code sent to your email' : 'Sign in to your ProConnect account'}</p>
                </div>

                {!showOTP ? (
                    <form onSubmit={handleSubmit}>
                        <div className="form-group">
                            <label>Email Address</label>
                            <input type="email" name="email" value={formData.email} onChange={handleChange} placeholder="you@example.com" required />
                        </div>
                        <div className="form-group">
                            <label>Password</label>
                            <input type="password" name="password" value={formData.password} onChange={handleChange} placeholder="Enter your password" required />
                        </div>
                        <button type="submit" className="btn btn-primary btn-block" disabled={loading} style={{ marginTop: '1rem' }}>
                            {loading ? 'Signing in...' : <><span>Sign In</span> <ArrowRight size={16} /></>}
                        </button>
                    </form>
                ) : (
                    <form onSubmit={handleVerifyOTP}>
                        <div className="form-group">
                            <label>Verification Code</label>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', background: 'var(--bg)', borderRadius: 'var(--radius)', border: '1.5px solid var(--border)', padding: '0.7rem 1rem' }}>
                                <KeyRound size={16} color="var(--text-muted)" />
                                <input
                                    type="text"
                                    value={otpCode}
                                    onChange={(e) => setOtpCode(e.target.value)}
                                    placeholder="Enter 6-digit code"
                                    style={{ border: 'none', background: 'none', boxShadow: 'none', padding: 0 }}
                                    required
                                />
                            </div>
                        </div>
                        <button type="submit" className="btn btn-primary btn-block" disabled={loading}>
                            {loading ? 'Verifying...' : 'Verify & Sign In'}
                        </button>
                        <button type="button" className="btn btn-outline btn-block" style={{ marginTop: '0.5rem' }} onClick={() => setShowOTP(false)}>
                            ← Go Back
                        </button>
                    </form>
                )}

                <p className="auth-footer">
                    Don't have an account? <Link to="/register">Create one</Link>
                </p>
            </div>
        </div>
    );
};

export default Login;
