const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const auth = require('../middleware/auth');
const sgMail = require('@sendgrid/mail');

if (process.env.SENDGRID_API_KEY) {
    sgMail.setApiKey(process.env.SENDGRID_API_KEY);
}

// Register with role support
router.post('/register', async (req, res) => {
    const { username, email, password, role } = req.body;

    try {
        let user = await User.findOne({ email });
        if (user) return res.status(400).json({ msg: 'User already exists' });

        // Validate role
        const allowedRoles = ['candidate', 'recruiter', 'mentor'];
        const userRole = allowedRoles.includes(role) ? role : 'candidate';

        user = new User({ username, email, password, role: userRole });

        const salt = await bcrypt.genSalt(10);
        user.password = await bcrypt.hash(password, salt);

        await user.save();

        const payload = { user: { id: user.id } };
        jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: '7d' }, (err, token) => {
            if (err) throw err;
            res.json({
                token,
                user: {
                    _id: user.id,
                    id: user.id,
                    username: user.username,
                    email: user.email,
                    role: user.role,
                    headline: user.headline
                }
            });
        });
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server error');
    }
});

// Login - returns role so frontend can redirect to correct dashboard
router.post('/login', async (req, res) => {
    const { email, password } = req.body;

    try {
        let user = await User.findOne({ email });
        if (!user) return res.status(400).json({ msg: 'Invalid Credentials' });

        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) return res.status(400).json({ msg: 'Invalid Credentials' });

        if (process.env.SENDGRID_API_KEY && process.env.SENDGRID_FROM_EMAIL) {
            try {
                // Generate a 6-digit OTP
                const otp = Math.floor(100000 + Math.random() * 900000).toString();
                
                // Store in user model
                user.loginOtp = otp;
                user.loginOtpExpire = Date.now() + 10 * 60 * 1000; // 10 minutes
                await user.save();

                const msg = {
                    to: user.email,
                    from: process.env.SENDGRID_FROM_EMAIL,
                    subject: 'Your Login Verification Code',
                    text: `Your verification code is: ${otp}. It will expire in 10 minutes.`,
                    html: `<strong>Your verification code is: ${otp}</strong><br>It will expire in 10 minutes.`
                };
                
                await sgMail.send(msg);
                return res.json({ requireVerification: true, email: user.email, msg: 'Verification code sent to email.' });
            } catch (error) {
                console.error('SendGrid Error:', error.message);
                return res.status(500).json({ msg: 'Failed to send verification email' });
            }
        }

        const payload = { user: { id: user.id } };
        jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: '7d' }, (err, token) => {
            if (err) throw err;
            res.json({
                token,
                user: {
                    _id: user.id,
                    id: user.id,
                    username: user.username,
                    email: user.email,
                    role: user.role,
                    headline: user.headline,
                    skills: user.skills
                }
            });
        });
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server error');
    }
});

// Verify Login OTP
router.post('/verify-login', async (req, res) => {
    const { email, code } = req.body;

    try {
        let user = await User.findOne({ email });
        if (!user) return res.status(400).json({ msg: 'User not found' });

        if (!user.loginOtp || !user.loginOtpExpire) {
            return res.status(400).json({ msg: 'No OTP code found, please login again' });
        }

        if (user.loginOtpExpire < Date.now()) {
            user.loginOtp = undefined;
            user.loginOtpExpire = undefined;
            await user.save();
            return res.status(400).json({ msg: 'Verification code has expired' });
        }

        if (user.loginOtp !== code) {
            return res.status(400).json({ msg: 'Invalid verification code' });
        }

        // OTP is valid
        user.loginOtp = undefined;
        user.loginOtpExpire = undefined;
        await user.save();

        const payload = { user: { id: user.id } };
        jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: '7d' }, (err, token) => {
            if (err) throw err;
            res.json({
                token,
                user: {
                    _id: user.id,
                    id: user.id,
                    username: user.username,
                    email: user.email,
                    role: user.role,
                    headline: user.headline,
                    skills: user.skills
                }
            });
        });
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server error');
    }
});

// Get Profile
router.get('/profile', auth, async (req, res) => {
    try {
        const user = await User.findById(req.user.id).select('-password');
        res.json(user);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
});

module.exports = router;
