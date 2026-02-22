import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Hero from '../components/Hero';
import { Calendar, Briefcase, Award, Code, Monitor } from 'lucide-react';
import { motion } from 'framer-motion';

const Home = () => {
    const navigate = useNavigate();
    const [opportunities, setOpportunities] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetch('http://localhost:5000/api/opportunities')
            .then(res => res.json())
            .then(data => {
                if (Array.isArray(data)) {
                    setOpportunities(data);
                } else {
                    console.error("Home API error: received non-array data", data);
                    setOpportunities([]);
                }
                setLoading(false);
            })
            .catch(err => {
                console.error("Error fetching opportunities:", err);
                setLoading(false);
            });
    }, []);

    const getIcon = (type) => {
        switch (type) {
            case 'Hackathon': return <Code size={24} />;
            case 'Job': return <Briefcase size={24} />;
            case 'Internship': return <Monitor size={24} />;
            default: return <Award size={24} />;
        }
    };

    const getDaysLeft = (deadline) => {
        const diff = new Date(deadline) - new Date();
        const days = Math.ceil(diff / (1000 * 60 * 60 * 24));
        return days > 0 ? days : 0;
    };

    return (
        <div className="home-page">
            <Hero />

            <section className="section container" style={{ padding: '4rem 1rem' }}>
                <div className="section-header" style={{ marginBottom: '2rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <h2>Explore Opportunities</h2>
                    <a href="/compete" style={{ color: 'var(--primary)', fontWeight: '600' }}>View All &rarr;</a>
                </div>

                {loading ? (
                    <p className="text-center">Loading opportunities...</p>
                ) : (
                    <div className="grid-opportunities" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '2rem' }}>
                        {opportunities.map((opp) => (
                            <motion.div
                                key={opp._id}
                                className="card opportunity-card"
                                whileHover={{ y: -5 }}
                                style={{ padding: '1.5rem', border: '1px solid var(--border)', display: 'flex', flexDirection: 'column', gap: '1rem', cursor: 'pointer' }}
                                onClick={() => navigate(`/apply/${opp._id}`)}
                            >
                                <div className="card-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                                    <div className="icon-box" style={{ background: '#f0f4ff', padding: '0.75rem', borderRadius: '8px', color: 'var(--primary)' }}>
                                        {getIcon(opp.type)}
                                    </div>
                                    <span className="badge" style={{ fontSize: '0.75rem', fontWeight: 'bold', background: '#ffe0b2', color: '#e65100', padding: '0.25rem 0.5rem', borderRadius: '4px' }}>
                                        {opp.type}
                                    </span>
                                </div>

                                <div>
                                    <h3 style={{ fontSize: '1.25rem', marginBottom: '0.25rem' }}>{opp.title}</h3>
                                    <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>{opp.company}</p>
                                </div>

                                <div className="card-footer" style={{ marginTop: 'auto', paddingTop: '1rem', borderTop: '1px solid #f0f0f0', display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem', color: 'var(--text-muted)' }}>
                                    <span><Calendar size={14} style={{ marginRight: '4px', verticalAlign: 'middle' }} /> {getDaysLeft(opp.deadline)} days left</span>
                                    <span>{opp.reward}</span>
                                </div>
                            </motion.div>
                        ))}
                    </div>
                )}
            </section>

            <section className="section bg-light" style={{ background: '#f8f9fa', padding: '4rem 1rem' }}>
                <div className="container">
                    <h2 className="text-center" style={{ marginBottom: '3rem' }}>Why JobsGO?</h2>
                    <div className="features-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '2rem' }}>
                        <div className="feature-card text-center" style={{ padding: '2rem', cursor: 'pointer' }} onClick={() => navigate('/learn')}>
                            <img src="https://cdn-icons-png.flaticon.com/512/2997/2997235.png" alt="Learn" width="80" style={{ marginBottom: '1rem' }} />
                            <h3>Learn</h3>
                            <p>Expand your knowledge with courses and articles.</p>
                        </div>
                        <div className="feature-card text-center" style={{ padding: '2rem', cursor: 'pointer' }} onClick={() => navigate('/practice')}>
                            <img src="https://cdn-icons-png.flaticon.com/512/3135/3135715.png" alt="Practice" width="80" style={{ marginBottom: '1rem' }} />
                            <h3>Practice</h3>
                            <p>Solve coding problems and improve your skills.</p>
                        </div>
                        <div className="feature-card text-center" style={{ padding: '2rem', cursor: 'pointer' }} onClick={() => navigate('/compete')}>
                            <img src="https://cdn-icons-png.flaticon.com/512/2921/2921222.png" alt="Compete" width="80" style={{ marginBottom: '1rem' }} />
                            <h3>Compete</h3>
                            <p>Participate in hackathons and win prizes.</p>
                        </div>
                    </div>
                </div>
            </section>
        </div>
    );
};

export default Home;
