import React, { useState } from 'react';
import { Calendar, Star, CheckCircle } from 'lucide-react';
import { toast } from 'react-toastify';
import './ContentPages.css';

const MENTORS = [
    { id: 1, name: 'Alice Chen', role: 'Staff Engineer', company: 'Google', initials: 'AC', skills: ['System Design', 'Go', 'Kubernetes'], rating: 4.9, sessions: 120, rate: '$50/hr' },
    { id: 2, name: 'Bob Smith', role: 'Product Manager', company: 'Uber', initials: 'BS', skills: ['Product Strategy', 'Analytics', 'Leadership'], rating: 4.7, sessions: 85, rate: '$45/hr' },
    { id: 3, name: 'Charlie Kim', role: 'Design Lead', company: 'Airbnb', initials: 'CK', skills: ['UI/UX', 'Figma', 'Design Systems'], rating: 4.8, sessions: 64, rate: '$40/hr' },
    { id: 4, name: 'Diana Ross', role: 'Data Scientist', company: 'Netflix', initials: 'DR', skills: ['Python', 'ML', 'Deep Learning'], rating: 4.9, sessions: 92, rate: '$55/hr' },
];

const Mentorship = () => {
    const [bookedMentors, setBookedMentors] = useState([]);
    const [selectedMentor, setSelectedMentor] = useState(null);

    const handleBookSession = (mentor) => {
        if (bookedMentors.includes(mentor.id)) {
            toast.info(`You already have a pending session with ${mentor.name}.`);
            return;
        }
        setSelectedMentor(mentor);
    };

    const confirmBooking = () => {
        if (!selectedMentor) return;
        setBookedMentors([...bookedMentors, selectedMentor.id]);
        toast.success(`Session booked with ${selectedMentor.name}! Confirmation email sent.`);
        setSelectedMentor(null);
    };

    const renderStars = (rating) => {
        const full = Math.floor(rating);
        return (
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.15rem' }}>
                {Array.from({ length: 5 }, (_, i) => (
                    <Star key={i} size={13} fill={i < full ? '#f59e0b' : 'none'} color={i < full ? '#f59e0b' : '#d1d5db'} />
                ))}
                <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)', marginLeft: '0.25rem' }}>{rating}</span>
            </div>
        );
    };

    return (
        <div className="container mentorship-page">
            <h1 className="page-title" style={{ textAlign: 'center' }}>Find Your Mentor</h1>
            <p className="page-subtitle" style={{ textAlign: 'center', color: 'var(--text-muted)', marginBottom: '2rem' }}>
                Book 1-on-1 sessions with industry experts to accelerate your career.
            </p>

            <div className="mentors-grid">
                {MENTORS.map(mentor => {
                    const isBooked = bookedMentors.includes(mentor.id);
                    return (
                        <div key={mentor.id} className="mentor-card">
                            <div className="mentor-avatar">{mentor.initials}</div>
                            <h3>{mentor.name}</h3>
                            <p className="mentor-specialty">{mentor.role} at {mentor.company}</p>
                            {renderStars(mentor.rating)}
                            <div className="mentor-skills">
                                {mentor.skills.map((s, i) => (
                                    <span key={i}>{s}</span>
                                ))}
                            </div>
                            <div className="mentor-stats">
                                <span><strong>{mentor.sessions}</strong> sessions</span>
                                <span className="mentor-rate">{mentor.rate}</span>
                            </div>
                            <button
                                className={`btn ${isBooked ? 'btn-outline' : 'btn-primary'}`}
                                style={{ width: '100%' }}
                                onClick={() => handleBookSession(mentor)}
                            >
                                {isBooked ? (
                                    <><CheckCircle size={15} /> Session Booked</>
                                ) : (
                                    <><Calendar size={15} /> Book Session</>
                                )}
                            </button>
                        </div>
                    );
                })}
            </div>

            {/* Booking Confirmation Modal */}
            {selectedMentor && (
                <div className="modal-overlay" onClick={() => setSelectedMentor(null)}>
                    <div className="modal-content" onClick={e => e.stopPropagation()}>
                        <h3>Book Session</h3>
                        <p style={{ color: 'var(--text-muted)' }}>
                            Confirm your 1-on-1 session with <strong>{selectedMentor.name}</strong> ({selectedMentor.role} at {selectedMentor.company})
                        </p>
                        <div style={{ background: 'var(--bg)', padding: '1rem', borderRadius: 'var(--radius)', marginBottom: '1rem', fontSize: '0.9rem' }}>
                            <p style={{ margin: '0 0 0.25rem' }}><strong>Rate:</strong> {selectedMentor.rate}</p>
                            <p style={{ margin: '0 0 0.25rem' }}><strong>Format:</strong> Video call (45 min)</p>
                            <p style={{ margin: 0 }}><strong>Availability:</strong> Within 3 business days</p>
                        </div>
                        <div className="modal-actions">
                            <button className="btn btn-outline" onClick={() => setSelectedMentor(null)}>Cancel</button>
                            <button className="btn btn-primary" onClick={confirmBooking}>Confirm Booking</button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Mentorship;
