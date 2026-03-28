import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import './Auth.css';

const Login = () => {
    const [formData, setFormData] = useState({
        email: '',
        password: ''
    });
    const [showOTP, setShowOTP] = useState(false);
    const [otpCode, setOtpCode] = useState('');
    const navigate = useNavigate();

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleLoginSuccess = (data) => {
        localStorage.setItem('token', data.token);
        localStorage.setItem('user', JSON.stringify(data.user));
        toast.success('Login successful!');

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
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            const res = await fetch('http://localhost:5000/api/auth/login', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(formData)
            });

            const data = await res.json();

            if (!res.ok) {
                throw new Error(data.msg || 'Login failed');
            }

            if (data.requireVerification) {
                toast.success(data.msg || 'Verification code sent to your email.');
                setShowOTP(true);
                return;
            }

            handleLoginSuccess(data);
        } catch (err) {
            toast.error(err.message);
        }
    };

    const handleVerifyOTP = async (e) => {
        e.preventDefault();
        try {
            const res = await fetch('http://localhost:5000/api/auth/verify-login', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email: formData.email, code: otpCode })
            });

            const data = await res.json();

            if (!res.ok) {
                throw new Error(data.msg || 'Verification failed');
            }

            handleLoginSuccess(data);
        } catch (err) {
            toast.error(err.message);
        }
    };

    return (
        <div className="auth-container">
            <div className="auth-card">
                <h2>Welcome Back</h2>
                <p>{showOTP ? 'Enter the verification code sent to your email' : 'Login to your account to continue'}</p>

                {!showOTP ? (
                    <form onSubmit={handleSubmit}>
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
                                placeholder="Enter your password"
                                required
                            />
                        </div>

                        <button type="submit" className="btn btn-primary btn-block">Login</button>
                    </form>
                ) : (
                    <form onSubmit={handleVerifyOTP}>
                        <div className="form-group">
                            <label>Verification Code</label>
                            <input
                                type="text"
                                name="otpCode"
                                value={otpCode}
                                onChange={(e) => setOtpCode(e.target.value)}
                                placeholder="Enter 6-digit code"
                                required
                            />
                        </div>

                        <button type="submit" className="btn btn-primary btn-block">Verify & Login</button>
                        <button type="button" className="btn btn-secondary btn-block" style={{ marginTop: '10px' }} onClick={() => setShowOTP(false)}>Cancel</button>
                    </form>
                )}

                <p className="auth-footer">
                    Don't have an account? <Link to="/register">Sign Up</Link>
                </p>
            </div>
        </div>
    );
};

export default Login;
