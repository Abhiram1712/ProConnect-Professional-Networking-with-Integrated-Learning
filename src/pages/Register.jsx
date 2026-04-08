import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import { Rocket, User, Mail, Lock, ArrowRight, Eye, EyeOff, CheckCircle } from 'lucide-react';
import './Auth.css';

const API = import.meta.env.VITE_API_URL || 'http://localhost:5000';

const ROLES = [
    { value: 'candidate', icon: '🎓', label: 'Candidate', desc: 'Find jobs & grow your career', color: '#6366f1' },
    { value: 'mentor', icon: '🧑‍🏫', label: 'Mentor', desc: 'Guide & inspire others', color: '#10b981' },
    { value: 'recruiter', icon: '💼', label: 'Recruiter', desc: 'Discover top talent', color: '#f59e0b' },
];

const PERKS = [
    'Access to 1,200+ opportunities',
    'Connect with industry mentors',
    'Build & showcase your portfolio',
    'Practice with live code environments',
];

const Register = () => {
    const [formData, setFormData] = useState({ username: '', email: '', password: '', role: 'candidate' });
    const [showPassword, setShowPassword] = useState(false);
    const [loading, setLoading] = useState(false);
    const [step, setStep] = useState(1); // 1 = role, 2 = details
    const navigate = useNavigate();

    const handleChange = (e) => setFormData({ ...formData, [e.target.name]: e.target.value });

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        try {
            const res = await fetch(`${API}/api/auth/register`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(formData)
            });
            const data = await res.json();
            if (!res.ok) throw new Error(data.msg || 'Registration failed');

            localStorage.setItem('token', data.token);
            localStorage.setItem('user', JSON.stringify(data.user));
            toast.success('Welcome to ProConnect! 🎉');

            switch (data.user.role) {
                case 'recruiter': navigate('/recruiter/dashboard'); break;
                case 'mentor': navigate('/mentor/dashboard'); break;
                case 'admin': navigate('/admin/dashboard'); break;
                default: navigate('/');
            }
            window.location.reload();
        } catch (err) {
            toast.error(err.message);
        } finally {
            setLoading(false);
        }
    };

    const selectedRole = ROLES.find(r => r.value === formData.role);
    const passwordStrength = formData.password.length === 0 ? 0 : formData.password.length < 6 ? 1 : formData.password.length < 10 ? 2 : 3;
    const strengthLabel = ['', 'Weak', 'Good', 'Strong'];
    const strengthColor = ['', '#ef4444', '#f59e0b', '#10b981'];

    return (
        <div className="register-page">
            {/* Left Panel */}
            <div className="register-left">
                <div className="register-left-inner">
                    <Link to="/" className="auth-logo" style={{ justifyContent: 'flex-start', marginBottom: '3rem' }}>
                        <div className="auth-logo-icon"><Rocket size={20} /></div>
                        <span className="auth-logo-text">ProConnect</span>
                    </Link>

                    <div style={{ marginBottom: '2.5rem' }}>
                        <h2 style={{ fontSize: 'clamp(1.6rem, 3vw, 2.2rem)', fontWeight: 800, letterSpacing: '-0.03em', color: 'white', marginBottom: '0.65rem', lineHeight: 1.2 }}>
                            Start your journey<br />today. 🚀
                        </h2>
                        <p style={{ color: 'rgba(255,255,255,0.65)', fontSize: '0.95rem', lineHeight: 1.7, margin: 0 }}>
                            Join 50,000+ professionals accelerating their careers on ProConnect.
                        </p>
                    </div>

                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.9rem' }}>
                        {PERKS.map((perk, i) => (
                            <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                                <div style={{
                                    width: 24, height: 24,
                                    borderRadius: '50%',
                                    background: 'rgba(255,255,255,0.15)',
                                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                                    flexShrink: 0
                                }}>
                                    <CheckCircle size={14} color="white" />
                                </div>
                                <span style={{ color: 'rgba(255,255,255,0.8)', fontSize: '0.88rem', fontWeight: 500 }}>{perk}</span>
                            </div>
                        ))}
                    </div>

                    {/* Decorative avatars */}
                    <div style={{ marginTop: '3rem', display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                        <div style={{ display: 'flex' }}>
                            {['AC', 'BS', 'CR', 'DM'].map((initials, i) => (
                                <div key={i} style={{
                                    width: 34, height: 34, borderRadius: '50%',
                                    background: `hsl(${200 + i * 40}, 70%, 60%)`,
                                    border: '2px solid rgba(255,255,255,0.3)',
                                    marginLeft: i > 0 ? '-8px' : 0,
                                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                                    fontSize: '0.65rem', fontWeight: 700, color: 'white'
                                }}>{initials}</div>
                            ))}
                        </div>
                        <p style={{ color: 'rgba(255,255,255,0.65)', fontSize: '0.8rem', margin: 0 }}>
                            <strong style={{ color: 'white' }}>2,400+</strong> joined this month
                        </p>
                    </div>
                </div>
            </div>

            {/* Right Panel — Form */}
            <div className="register-right">
                <div className="register-form-wrap">
                    <div style={{ marginBottom: '2rem', textAlign: 'center' }}>
                        <h2 style={{ fontSize: '1.6rem', fontWeight: 800, letterSpacing: '-0.03em', marginBottom: '0.35rem', color: 'var(--text)' }}>
                            Create your account
                        </h2>
                        <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', margin: 0 }}>
                            Already have one? <Link to="/login" style={{ color: 'var(--primary)', fontWeight: 600 }}>Sign in</Link>
                        </p>
                    </div>

                    <form onSubmit={handleSubmit}>
                        {/* Role Selector */}
                        <div style={{ marginBottom: '1.5rem' }}>
                            <p style={{ fontSize: '0.82rem', fontWeight: 700, color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.07em', marginBottom: '0.75rem' }}>
                                I am joining as...
                            </p>
                            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '0.6rem' }}>
                                {ROLES.map(r => (
                                    <button
                                        key={r.value}
                                        type="button"
                                        onClick={() => setFormData({ ...formData, role: r.value })}
                                        style={{
                                            padding: '0.85rem 0.5rem',
                                            borderRadius: 'var(--radius)',
                                            border: formData.role === r.value
                                                ? `2px solid ${r.color}`
                                                : '2px solid var(--border)',
                                            background: formData.role === r.value
                                                ? `${r.color}12`
                                                : 'var(--surface)',
                                            cursor: 'pointer',
                                            transition: 'all 0.2s ease',
                                            display: 'flex',
                                            flexDirection: 'column',
                                            alignItems: 'center',
                                            gap: '0.3rem',
                                            boxShadow: formData.role === r.value
                                                ? `0 0 0 3px ${r.color}20`
                                                : 'none',
                                        }}
                                    >
                                        <span style={{ fontSize: '1.4rem', lineHeight: 1 }}>{r.icon}</span>
                                        <span style={{ fontSize: '0.8rem', fontWeight: 700, color: formData.role === r.value ? r.color : 'var(--text-secondary)', fontFamily: 'var(--font-family)' }}>
                                            {r.label}
                                        </span>
                                        <span style={{ fontSize: '0.68rem', color: 'var(--text-muted)', textAlign: 'center', lineHeight: 1.3, fontFamily: 'var(--font-family)' }}>
                                            {r.desc}
                                        </span>
                                    </button>
                                ))}
                            </div>
                        </div>

                        {/* Username */}
                        <div className="form-group">
                            <label>Full Name</label>
                            <div className="input-icon-wrap">
                                <User size={16} className="input-icon" />
                                <input
                                    type="text"
                                    name="username"
                                    value={formData.username}
                                    onChange={handleChange}
                                    placeholder="Your name"
                                    required
                                    className="input-with-icon"
                                />
                            </div>
                        </div>

                        {/* Email */}
                        <div className="form-group">
                            <label>Email Address</label>
                            <div className="input-icon-wrap">
                                <Mail size={16} className="input-icon" />
                                <input
                                    type="email"
                                    name="email"
                                    value={formData.email}
                                    onChange={handleChange}
                                    placeholder="you@example.com"
                                    required
                                    className="input-with-icon"
                                />
                            </div>
                        </div>

                        {/* Password */}
                        <div className="form-group">
                            <label>Password</label>
                            <div className="input-icon-wrap">
                                <Lock size={16} className="input-icon" />
                                <input
                                    type={showPassword ? 'text' : 'password'}
                                    name="password"
                                    value={formData.password}
                                    onChange={handleChange}
                                    placeholder="At least 6 characters"
                                    required
                                    minLength={6}
                                    className="input-with-icon"
                                    style={{ paddingRight: '2.75rem' }}
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowPassword(!showPassword)}
                                    style={{
                                        position: 'absolute', right: '0.85rem', top: '50%', transform: 'translateY(-50%)',
                                        background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)',
                                        display: 'flex', padding: 0
                                    }}
                                >
                                    {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                                </button>
                            </div>

                            {/* Password strength bar */}
                            {formData.password.length > 0 && (
                                <div style={{ marginTop: '0.5rem' }}>
                                    <div style={{ display: 'flex', gap: '4px', marginBottom: '0.25rem' }}>
                                        {[1, 2, 3].map(i => (
                                            <div key={i} style={{
                                                flex: 1, height: 4, borderRadius: 2,
                                                background: i <= passwordStrength ? strengthColor[passwordStrength] : 'var(--border)',
                                                transition: 'background 0.3s ease'
                                            }} />
                                        ))}
                                    </div>
                                    <p style={{ fontSize: '0.72rem', color: strengthColor[passwordStrength], margin: 0, fontWeight: 600 }}>
                                        {strengthLabel[passwordStrength]} password
                                    </p>
                                </div>
                            )}
                        </div>

                        {/* Terms */}
                        <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginBottom: '1.25rem', lineHeight: 1.6 }}>
                            By creating an account, you agree to our{' '}
                            <a href="/" style={{ color: 'var(--primary)', fontWeight: 600 }}>Terms of Service</a>{' '}
                            and{' '}
                            <a href="/" style={{ color: 'var(--primary)', fontWeight: 600 }}>Privacy Policy</a>.
                        </p>

                        <button type="submit" className="btn btn-primary btn-block" disabled={loading}>
                            {loading
                                ? <span style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>Creating account...</span>
                                : <span style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                    Create {selectedRole?.label} Account <ArrowRight size={16} />
                                </span>
                            }
                        </button>
                    </form>

                    {/* Divider */}
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', margin: '1.5rem 0 0' }}>
                        <div style={{ flex: 1, height: 1, background: 'var(--border)' }} />
                        <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)', whiteSpace: 'nowrap' }}>Already a member?</span>
                        <div style={{ flex: 1, height: 1, background: 'var(--border)' }} />
                    </div>
                    <Link to="/login" className="btn btn-outline btn-block" style={{ marginTop: '0.75rem', borderRadius: 'var(--radius-full)' }}>
                        Sign in to your account
                    </Link>
                </div>
            </div>
        </div>
    );
};

export default Register;
