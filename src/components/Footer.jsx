import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Facebook, Twitter, Linkedin, Instagram, Monitor } from 'lucide-react';
import { toast } from 'react-toastify';
import './Footer.css';

const Footer = () => {
    const [email, setEmail] = useState('');

    const handleSubscribe = (e) => {
        e.preventDefault();
        if (!email.trim()) {
            toast.warning('Please enter your email address');
            return;
        }
        if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
            toast.error('Please enter a valid email address');
            return;
        }
        toast.success(`Subscribed successfully with ${email}! You'll receive the latest opportunities.`);
        setEmail('');
    };

    return (
        <footer className="footer">
            <div className="container footer-container">
                <div className="footer-col">
                    <Link to="/" className="footer-logo">
                        <Monitor size={24} style={{ marginRight: '8px' }} /> JobsGO
                    </Link>
                    <p>Connecting students with opportunities to build their careers. Join millions of other learners and professionals.</p>
                    <div className="social-links">
                        <a href="https://facebook.com" target="_blank" rel="noopener noreferrer" className="social-icon"><Facebook size={20} /></a>
                        <a href="https://twitter.com" target="_blank" rel="noopener noreferrer" className="social-icon"><Twitter size={20} /></a>
                        <a href="https://linkedin.com" target="_blank" rel="noopener noreferrer" className="social-icon"><Linkedin size={20} /></a>
                        <a href="https://instagram.com" target="_blank" rel="noopener noreferrer" className="social-icon"><Instagram size={20} /></a>
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
                    </ul>
                </div>

                <div className="footer-col">
                    <h4>Company</h4>
                    <ul>
                        <li><Link to="/">About Us</Link></li>
                        <li><Link to="/jobs">Careers</Link></li>
                        <li><Link to="/feed">Community</Link></li>
                        <li><Link to="/blogs">Blog</Link></li>
                        <li><Link to="/">Privacy Policy</Link></li>
                    </ul>
                </div>

                <div className="footer-col">
                    <h4>Stay Updated</h4>
                    <p>Subscribe to our newsletter for the latest opportunities.</p>
                    <form className="newsletter" onSubmit={handleSubscribe}>
                        <input
                            type="email"
                            placeholder="Enter your email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                        />
                        <button type="submit" className="btn btn-primary">Subscribe</button>
                    </form>
                </div>
            </div>

            <div className="footer-bottom">
                <div className="container">
                    <p>&copy; {new Date().getFullYear()} JobsGO. All rights reserved. Built with ❤️.</p>
                </div>
            </div>
        </footer>
    );
};

export default Footer;
