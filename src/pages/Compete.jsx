import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Calendar, Briefcase, Award, Code, Monitor, Filter } from 'lucide-react';
import { motion } from 'framer-motion';

const Compete = () => {
    const [opportunities, setOpportunities] = useState([]);
    const [loading, setLoading] = useState(true);
    const [filter, setFilter] = useState('All');

    useEffect(() => {
        // Fetch all opportunities (in a real app, you might only fetch 'Competition' or 'Hackathon' types, 
        // or filter on the client side if the dataset is small).
        fetch('http://localhost:5000/api/opportunities')
            .then(res => res.json())
            .then(data => {
                if (Array.isArray(data)) {
                    setOpportunities(data);
                } else {
                    console.error("Compete API error: received non-array data", data);
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

    const filteredOpportunities = filter === 'All'
        ? opportunities
        : opportunities.filter(opp => opp.type === filter);

    return (
        <div className="compete-page container" style={{ padding: '2rem 1rem' }}>
            <header style={{ marginBottom: '2rem' }}>
                <h1 style={{ fontSize: '2rem', marginBottom: '1rem' }}>Compete & Jobs</h1>
                <p style={{ color: 'var(--text-muted)' }}>Discover the best hackathons, hiring challenges, and jobs.</p>
            </header>

            <div className="filters" style={{ display: 'flex', gap: '1rem', marginBottom: '2rem', flexWrap: 'wrap' }}>
                {['All', 'Hackathon', 'Job', 'Internship', 'Competition'].map(type => (
                    <button
                        key={type}
                        onClick={() => setFilter(type)}
                        className={`btn ${filter === type ? 'btn-primary' : 'btn-outline'}`}
                        style={{ borderRadius: '20px', padding: '0.5rem 1rem', fontSize: '0.9rem' }}
                    >
                        {type}
                    </button>
                ))}
            </div>

            {loading ? (
                <p>Loading...</p>
            ) : (
                <div className="grid-opportunities" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '2rem' }}>
                    {filteredOpportunities.length > 0 ? filteredOpportunities.map((opp) => (
                        <motion.div
                            key={opp._id}
                            className="card opportunity-card"
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            whileHover={{ y: -5 }}
                            style={{ padding: '1.5rem', border: '1px solid var(--border)', display: 'flex', flexDirection: 'column', gap: '1rem' }}
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

                            <Link to={`/apply/${opp._id}`} className="btn btn-outline" style={{ width: '100%', marginTop: '0.5rem', display: 'block', textAlign: 'center', textDecoration: 'none' }}>Apply Now</Link>
                        </motion.div>
                    )) : (
                        <p>No opportunities found for {filter}.</p>
                    )}
                </div>
            )}
        </div>
    );
};

export default Compete;
