import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Briefcase, MapPin, DollarSign, Clock } from 'lucide-react';
import './Compete.css';

const Jobs = () => {
    const [jobs, setJobs] = useState([]);
    const [loading, setLoading] = useState(true);
    const [filter, setFilter] = useState('All');

    useEffect(() => {
        fetch('http://localhost:5000/api/opportunities')
            .then(res => res.json())
            .then(data => {
                if (Array.isArray(data)) {
                    const filtered = data.filter(op => op.type === 'Job' || op.type === 'Internship');
                    setJobs(filtered);
                } else {
                    console.error("Jobs API error: received non-array data", data);
                    setJobs([]);
                }
                setLoading(false);
            })
            .catch(err => {
                console.error("Error fetching jobs:", err);
                setLoading(false);
            });
    }, []);

    const filteredJobs = filter === 'All'
        ? jobs
        : jobs.filter(j => j.type === filter);

    if (loading) return <div className="container" style={{ padding: '2rem' }}>Loading jobs...</div>;

    return (
        <div className="container compete-page">
            <h1 className="page-title">Find Your Dream Job</h1>

            <div className="filters">
                {['All', 'Job', 'Internship'].map(type => (
                    <button
                        key={type}
                        className={`filter-btn ${filter === type ? 'active' : ''}`}
                        onClick={() => setFilter(type)}
                    >
                        {type === 'All' ? 'All Jobs' : type === 'Job' ? 'Full-time' : type}
                    </button>
                ))}
            </div>

            <div className="opportunities-grid">
                {filteredJobs.map(job => (
                    <div key={job._id} className="opportunity-card">
                        <div className="card-header">
                            <div className="icon-wrapper job-icon">
                                <Briefcase size={24} />
                            </div>
                            <span className="type-badge">{job.type}</span>
                        </div>
                        <h3>{job.title}</h3>
                        <p className="company-name">{job.company}</p>

                        <div className="card-details">
                            <div className="detail-item">
                                <DollarSign size={16} />
                                <span>{job.reward}</span>
                            </div>
                            <div className="detail-item">
                                <Clock size={16} />
                                <span>{new Date(job.deadline).toLocaleDateString()}</span>
                            </div>
                        </div>

                        <Link to={`/apply/${job._id}`} className="btn btn-primary apply-btn">Apply Now</Link>
                    </div>
                ))}
            </div>
            {filteredJobs.length === 0 && <p className="no-result">No {filter === 'All' ? '' : filter.toLowerCase()} jobs found.</p>}
        </div>
    );
};

export default Jobs;
