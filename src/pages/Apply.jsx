import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Briefcase, MapPin, DollarSign, Clock, CheckCircle } from 'lucide-react';
import { toast } from 'react-toastify';
import './Apply.css';

const Apply = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const [opportunity, setOpportunity] = useState(null);
    const [loading, setLoading] = useState(true);
    const [submitting, setSubmitting] = useState(false);
    const [success, setSuccess] = useState(false);

    // Form fields
    const [resumeUrl, setResumeUrl] = useState('');
    const [coverLetter, setCoverLetter] = useState('');
    const [error, setError] = useState('');

    useEffect(() => {
        const fetchDetails = async () => {
            try {
                // Fetch opportunity
                const oppRes = await fetch(`http://localhost:5000/api/opportunities`);
                const opps = await oppRes.json();
                const opp = opps.find(o => o._id === id);

                if (!opp) throw new Error('Opportunity not found');
                setOpportunity(opp);
            } catch (err) {
                console.error(err);
                setError('Opportunity not found or server error.');
            } finally {
                setLoading(false);
            }
        };

        if (id) fetchDetails();
    }, [id]);

    const handleApply = async (e) => {
        e.preventDefault();
        setSubmitting(true);
        setError('');

        try {
            const token = localStorage.getItem('token');
            if (!token) {
                navigate('/login');
                return;
            }

            const res = await fetch(`http://localhost:5000/api/applications/apply/${id}`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'x-auth-token': token
                },
                body: JSON.stringify({
                    resumeUrl: resumeUrl,
                    coverLetter: coverLetter
                })
            });

            const data = await res.json();

            if (res.ok) {
                setSuccess(true);
                toast.success("Application Submitted Successfully!");
            } else {
                const msg = data.msg || 'Application failed.';
                setError(msg);
                toast.error(msg);
            }
        } catch (err) {
            console.error(err);
            const msg = 'Server error during application.';
            setError(msg);
            toast.error(msg);
        } finally {
            setSubmitting(false);
        }
    };

    if (loading) return <div className="container" style={{ padding: '2rem' }}>Loading details...</div>;

    if (success) {
        return (
            <div className="container apply-success-container">
                <div style={{ textAlign: 'center', padding: '3rem' }}>
                    <CheckCircle size={64} color="#48bb78" style={{ marginBottom: '1rem' }} />
                    <h2>Application Submitted!</h2>
                    <p>You have successfully applied for <strong>{opportunity?.title}</strong> at {opportunity?.company}.</p>
                    <div className="actions" style={{ marginTop: '2rem', display: 'flex', justifyContent: 'center', gap: '1rem' }}>
                        <button className="btn btn-primary" onClick={() => navigate('/jobs')}>Find More Jobs</button>
                        <button className="btn btn-outline" onClick={() => navigate('/profile')}>My Profile</button>
                    </div>
                </div>
            </div>
        );
    }

    if (!opportunity) return <div className="container" style={{ padding: '2rem' }}>Opportunity not found.</div>;

    return (
        <div className="container apply-page">
            <div className="apply-header" style={{ marginBottom: '2rem' }}>
                <h1>Apply for {opportunity.title}</h1>
                <p className="company-subtitle" style={{ color: 'var(--text-muted)' }}>{opportunity.company} • {opportunity.type}</p>
            </div>

            <div className="apply-layout">
                <div className="job-summary card" style={{ padding: '1.5rem', marginBottom: '2rem' }}>
                    <h3 style={{ marginBottom: '1rem' }}>Job Details</h3>
                    <div className="detail-row" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem' }}>
                        <DollarSign size={18} /> <span>{opportunity.reward}</span>
                    </div>
                    <div className="detail-row" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem' }}>
                        <Clock size={18} /> <span>Apply by {new Date(opportunity.deadline).toLocaleDateString()}</span>
                    </div>
                    <div className="description-box" style={{ marginTop: '1.5rem' }}>
                        <h4 style={{ marginBottom: '0.5rem' }}>Description</h4>
                        <p style={{ whiteSpace: 'pre-line', color: 'var(--text-muted)' }}>{opportunity.description}</p>
                    </div>
                </div>

                <div className="application-form card" style={{ padding: '1.5rem' }}>
                    <h3>Your Application</h3>
                    {error && <div className="alert error" style={{ margin: '1rem 0' }}>{error}</div>}
                    <form onSubmit={handleApply}>
                        <div className="form-group" style={{ marginBottom: '1.5rem' }}>
                            <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '500' }}>Resume / CV Link</label>
                            <input
                                type="url"
                                placeholder="https://drive.google.com/..."
                                value={resumeUrl}
                                onChange={(e) => setResumeUrl(e.target.value)}
                                required
                                style={{ width: '100%', padding: '0.75rem', border: '1px solid var(--border)', borderRadius: 'var(--radius)' }}
                            />
                            <small style={{ color: 'var(--text-muted)', display: 'block', marginTop: '0.25rem' }}>Please ensure the link is publicly accessible.</small>
                        </div>

                        <div className="form-group" style={{ marginBottom: '1.5rem' }}>
                            <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '500' }}>Cover Letter</label>
                            <textarea
                                rows="6"
                                placeholder="Why are you a great fit for this role?"
                                value={coverLetter}
                                onChange={(e) => setCoverLetter(e.target.value)}
                                required
                                style={{ width: '100%', padding: '0.75rem', border: '1px solid var(--border)', borderRadius: 'var(--radius)', fontFamily: 'inherit' }}
                            ></textarea>
                        </div>

                        <button type="submit" className="btn btn-primary submit-btn" disabled={submitting} style={{ width: '100%' }}>
                            {submitting ? 'Submitting...' : 'Submit Application'}
                        </button>
                    </form>
                </div>
            </div>
        </div>
    );
};

export default Apply;
