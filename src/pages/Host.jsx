import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Briefcase, Trophy, Code, Plus, DollarSign, Calendar } from 'lucide-react';
import { toast } from 'react-toastify';
import './Host.css';

const Host = () => {
    const navigate = useNavigate();
    const [formData, setFormData] = useState({
        title: '',
        company: '',
        type: 'Hackathon',
        description: '',
        deadline: '',
        reward: ''
    });
    const [loading, setLoading] = useState(false);

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);

        try {
            const res = await fetch('http://localhost:5000/api/opportunities', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(formData)
            });

            if (res.ok) {
                toast.success('Opportunity published successfully!');
                navigate('/');
            } else {
                const data = await res.json();
                toast.error(data.message || 'Failed to create opportunity');
            }
        } catch (err) {
            toast.error("Server Error: " + err.message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="container host-page">
            <h1 className="page-title"><Plus size={24} style={{ verticalAlign: 'middle' }} /> Host an Opportunity</h1>

            <form onSubmit={handleSubmit} className="host-form card">
                <div className="form-group">
                    <label>Opportunity Title</label>
                    <input
                        type="text"
                        name="title"
                        value={formData.title}
                        onChange={handleChange}
                        placeholder="e.g. AI Innovation Hackathon"
                        required
                    />
                </div>

                <div className="form-group">
                    <label>Organization / Company Name</label>
                    <input
                        type="text"
                        name="company"
                        value={formData.company}
                        onChange={handleChange}
                        placeholder="e.g. Tech Corp"
                        required
                    />
                </div>

                <div className="form-group">
                    <label>Type</label>
                    <select name="type" value={formData.type} onChange={handleChange}>
                        <option value="Hackathon">Hackathon</option>
                        <option value="Job">Job</option>
                        <option value="Internship">Internship</option>
                        <option value="Competition">Competition</option>
                        <option value="Article">Article</option>
                        <option value="Workshop">Workshop</option>
                    </select>
                </div>

                <div className="form-row">
                    <div className="form-group">
                        <label><Calendar size={16} /> Application Deadline</label>
                        <input
                            type="date"
                            name="deadline"
                            value={formData.deadline}
                            onChange={handleChange}
                            required
                        />
                    </div>
                    <div className="form-group">
                        <label><DollarSign size={16} /> Reward / Salary</label>
                        <input
                            type="text"
                            name="reward"
                            value={formData.reward}
                            onChange={handleChange}
                            placeholder="e.g. $10,000 or Competitive Salary"
                            required
                        />
                    </div>
                </div>

                <div className="form-group">
                    <label>Description</label>
                    <textarea
                        name="description"
                        value={formData.description}
                        onChange={handleChange}
                        rows="5"
                        placeholder="Describe the opportunity details..."
                        required
                    />
                </div>

                <button type="submit" className="btn btn-primary" disabled={loading}>
                    {loading ? 'Publishing...' : 'Publish Opportunity'}
                </button>
            </form>
        </div>
    );
};

export default Host;
