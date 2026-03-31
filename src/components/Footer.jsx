import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Twitter, Linkedin, Instagram, Github, Rocket } from 'lucide-react';
import { toast } from 'react-toastify';
import './Footer.css';

const Footer = () => {
    const [email, setEmail] = useState('');

    const handleSubscribe = (e) => {
        e.preventDefault();
        if (!email.trim()) { toast.warning('Please enter your email address'); return; }
        if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) { toast.error('Please enter a valid email address'); return; }
        toast.success(`Subscribed! 🎉 You'll receive the latest updates.`);
        setEmail('');
    };

    return (
        <footer className="footer">
            <div className="container footer-container">
                <div className="footer-col">
                    <Link to="/" className="footer-logo">
                        <div className="footer-logo-icon"><Rocket size={18} /></div>
                        ProConnect
                    </Link>
                    <p>The all-in-one professional growth platform — learn, practice, compete, and grow your network.</p>
                    <div className="social-links">
                        <a href="https://twitter.com" target="_blank" rel="noopener noreferrer" className="social-icon"><Twitter size={16} /></a>
                        <a href="https://linkedin.com" target="_blank" rel="noopener noreferrer" className="social-icon"><Linkedin size={16} /></a>
                        <a href="https://instagram.com" target="_blank" rel="noopener noreferrer" className="social-icon"><Instagram size={16} /></a>
                        <a href="https://github.com" target="_blank" rel="noopener noreferrer" className="social-icon"><Github size={16} /></a>
                    </div>
                </div>

                <div className="footer-col">
                    <h4>Platform</h4>
                    <ul>
                        <li><Link to="/learn">Learn</Link></li>
                        <li><Link to="/practice">Practice</Link></li>
                        <li><Link to="/compete">Compete</Link></li>
                        <li><Link to="/jobs">Jobs</Link></li>
                        <li><Link to="/mentorship">Mentorship</Link></li>
                        <li><Link to="/blogs">Blogs</Link></li>
                    </ul>
                </div>

                <div className="footer-col">
                    <h4>Company</h4>
                    <ul>
                        <li><Link to="/">About Us</Link></li>
                        <li><Link to="/jobs">Careers</Link></li>
                        <li><Link to="/feed">Community</Link></li>
                        <li><Link to="/host">Host Event</Link></li>
                        <li><Link to="/">Privacy Policy</Link></li>
                        <li><Link to="/">Terms of Service</Link></li>
                    </ul>
                </div>

                <div className="footer-col">
                    <h4>Stay Updated</h4>
                    <p>Get the latest opportunities, tutorials, and career tips delivered to your inbox.</p>
                    <form className="newsletter" onSubmit={handleSubscribe}>
                        <input
                            type="email"
                            placeholder="Enter your email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                        />
                        <button type="submit" className="btn btn-primary">Subscribe →</button>
                    </form>
                </div>
            </div>

            <div className="footer-bottom">
                <div className="container">
                    <p>© {new Date().getFullYear()} ProConnect. All rights reserved. Built with ❤️</p>
                    <div className="footer-bottom-links">
                        <Link to="/">Privacy</Link>
                        <Link to="/">Terms</Link>
                        <Link to="/">Cookies</Link>
                    </div>
                </div>
            </div>
        </footer>
    );
};

export default Footer;
