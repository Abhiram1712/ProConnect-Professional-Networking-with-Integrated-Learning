import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { BookOpen, Play, Layers, Clock, Star, Users, CheckCircle } from 'lucide-react';
import { toast } from 'react-toastify';
import './Learn.css';

const COURSE_DATA = [
    { id: 1, title: 'Introduction to React', type: 'Course', lessons: 12, hours: '4h', rating: 4.8, students: '1.2k', emoji: '⚛️', color: 'linear-gradient(135deg, #141E30 0%, #243B55 100%)', text: '#61DAFB', description: 'Build modern user interfaces with React.js from scratch. Learn components, hooks, state management, and routing.', link: '/practice' },
    { id: 2, title: 'Data Structures & Algo', type: 'Article', lessons: 1, hours: '1h', rating: 4.9, students: '850', emoji: '🧮', color: 'linear-gradient(135deg, #FF8008 0%, #FFA036 100%)', text: 'white', description: 'Core data structures every developer should know — arrays, trees, graphs, and sorting algorithms.', link: '/practice' },
    { id: 3, title: 'System Design 101', type: 'Course', lessons: 20, hours: '8h', rating: 4.7, students: '2.1k', emoji: '🏗️', color: 'linear-gradient(135deg, #1D976C 0%, #93F9B9 100%)', text: 'white', description: 'Learn to design scalable distributed systems. Covers load balancing, caching, and microservices.', link: '/practice' },
    { id: 4, title: 'Mastering CSS Grid', type: 'Workshop', lessons: 1, hours: '2h', rating: 4.9, students: '340', emoji: '🎨', color: 'linear-gradient(135deg, #E55D87 0%, #5FC3E4 100%)', text: 'white', description: 'Advanced layout techniques with CSS Grid and Flexbox for responsive, modern web layouts.', link: '/practice' },
    { id: 5, title: 'Node.js Backend Dev', type: 'Course', lessons: 15, hours: '6h', rating: 4.6, students: '1.5k', emoji: '🚀', color: 'linear-gradient(135deg, #4CB8C4 0%, #3CD3AD 100%)', text: 'white', description: 'Build REST APIs and real-time apps with Node.js, Express, and MongoDB.', link: '/practice' },
    { id: 6, title: 'Python for Data Science', type: 'Course', lessons: 18, hours: '10h', rating: 4.8, students: '4.2k', emoji: '🐍', color: 'linear-gradient(135deg, #b92b27 0%, #1565C0 100%)', text: 'white', description: 'Master Python, NumPy, Pandas and data visualization for data-driven insights.', link: '/practice' },
];

const CATEGORIES = ['All', 'Course', 'Workshop', 'Article'];

const Learn = () => {
    const navigate = useNavigate();
    const [enrolledCourses, setEnrolledCourses] = useState({});
    const [activeCategory, setActiveCategory] = useState('All');
    const token = localStorage.getItem('token');

    // Auth guard
    useEffect(() => {
        if (!token) {
            navigate('/login');
        }
    }, [token, navigate]);

    // Filter courses based on active category
    const filteredCourses = COURSE_DATA.filter(course => 
        activeCategory === 'All' || course.type === activeCategory
    );

    const handleStartLearning = (course) => {
        if (!token) {
            navigate('/login');
            return;
        }
        if (enrolledCourses[course.id]) {
            toast.info(`Resuming "${course.title}" — redirecting to Practice...`);
            navigate(course.link);
        } else {
            // Assign a random progress between 0 and 15% when enrolling
            const initialProgress = Math.floor(Math.random() * 15) + 1;
            setEnrolledCourses({ ...enrolledCourses, [course.id]: initialProgress });
            toast.success(`Enrolled in "${course.title}"! Click again to start.`);
        }
    };

    return (
        <div className="container learn-page">
            <div className="learn-header">
                <h1 className="page-title">Learn & Grow</h1>
                <p className="page-subtitle">Curated courses, articles, and workshops to elevate your tech career. Master new skills at your own pace.</p>
                
                <div className="learn-filters">
                    {CATEGORIES.map(category => (
                        <button 
                            key={category}
                            className={`filter-btn ${activeCategory === category ? 'active' : ''}`}
                            onClick={() => setActiveCategory(category)}
                        >
                            {category === 'All' ? 'All' : `${category}s`}
                        </button>
                    ))}
                </div>
            </div>

            <div className="courses-grid">
                {filteredCourses.map(course => {
                    const progress = enrolledCourses[course.id];
                    const isEnrolled = !!progress;

                    return (
                        <div key={course.id} className="course-card-modern">
                            <div className="course-image-wrapper" style={{ background: course.color, color: course.text }}>
                                {course.emoji}
                                <span className="course-type-badge">{course.type}</span>
                            </div>
                            
                            <div className="course-card-content">
                                <h3>{course.title}</h3>
                                <p>{course.description}</p>
                                
                                <div className="course-meta-modern">
                                    <span className="meta-item">
                                        <Layers size={14} className="text-primary" /> {course.lessons}
                                    </span>
                                    <span className="meta-item">
                                        <Clock size={14} className="text-primary" /> {course.hours}
                                    </span>
                                    <span className="meta-item">
                                        <Star size={14} style={{ color: '#fbbf24', fill: '#fbbf24' }} /> {course.rating}
                                    </span>
                                    <span className="meta-item">
                                        <Users size={14} className="text-primary" /> {course.students}
                                    </span>
                                </div>

                                {isEnrolled ? (
                                    <div className="enrolled-progress">
                                        <div className="progress-header">
                                            <span style={{ display: 'flex', alignItems: 'center', gap: '0.25rem', color: 'var(--primary)' }}>
                                                <CheckCircle size={14} /> Enrolled
                                            </span>
                                            <span>{progress}% Completed</span>
                                        </div>
                                        <div className="progress-bar-bg">
                                            <div className="progress-bar-fill" style={{ width: `${progress}%` }}></div>
                                        </div>
                                    </div>
                                ) : null}

                                <button
                                    className={`course-action-btn ${isEnrolled ? 'resume' : 'start'}`}
                                    onClick={() => handleStartLearning(course)}
                                >
                                    {isEnrolled ? (
                                        <><Play size={16} fill="white" /> Continue Learning</>
                                    ) : (
                                        <><BookOpen size={16} /> Start Learning</>
                                    )}
                                </button>
                            </div>
                        </div>
                    );
                })}
            </div>
        </div>
    );
};

export default Learn;
