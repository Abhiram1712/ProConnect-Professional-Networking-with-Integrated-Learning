import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { BookOpen, Video, Award, Play, Clock, Layers } from 'lucide-react';
import { toast } from 'react-toastify';
import './ContentPages.css';

const COURSE_DATA = [
    { id: 1, title: 'Introduction to React', type: 'Course', lessons: 12, emoji: '⚛️', description: 'Build modern user interfaces with React.js from scratch. Learn components, hooks, state management, and routing.', link: '/practice' },
    { id: 2, title: 'Data Structures & Algo', type: 'Article', lessons: 1, emoji: '🧮', description: 'Core data structures every developer should know — arrays, trees, graphs, and sorting algorithms.', link: '/practice' },
    { id: 3, title: 'System Design 101', type: 'Course', lessons: 20, emoji: '🏗️', description: 'Learn to design scalable distributed systems. Covers load balancing, caching, and microservices.', link: '/practice' },
    { id: 4, title: 'Mastering CSS Grid', type: 'Workshop', lessons: 1, emoji: '🎨', description: 'Advanced layout techniques with CSS Grid and Flexbox for responsive, modern web layouts.', link: '/practice' },
    { id: 5, title: 'Node.js Backend Dev', type: 'Course', lessons: 15, emoji: '🚀', description: 'Build REST APIs and real-time apps with Node.js, Express, and MongoDB.', link: '/practice' },
    { id: 6, title: 'Python for Data Science', type: 'Course', lessons: 18, emoji: '🐍', description: 'Master Python, NumPy, Pandas and data visualization for data-driven insights.', link: '/practice' },
];

const Learn = () => {
    const navigate = useNavigate();
    const [enrolledCourses, setEnrolledCourses] = useState([]);

    const handleStartLearning = (course) => {
        if (enrolledCourses.includes(course.id)) {
            toast.info(`Resuming "${course.title}" — redirecting to Practice...`);
            navigate(course.link);
        } else {
            setEnrolledCourses([...enrolledCourses, course.id]);
            toast.success(`Enrolled in "${course.title}"! Click again to start.`);
        }
    };

    return (
        <div className="container learn-page">
            <h1 className="page-title">Learn & Grow</h1>
            <p className="page-subtitle">Expand your skills with courses, articles, and workshops.</p>

            <div className="courses-grid">
                {COURSE_DATA.map(course => {
                    const isEnrolled = enrolledCourses.includes(course.id);
                    return (
                        <div key={course.id} className="course-card">
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                <span className="course-emoji">{course.emoji}</span>
                                <span className="type-badge">{course.type}</span>
                            </div>
                            <h3>{course.title}</h3>
                            <p className="course-desc">{course.description}</p>
                            <div className="course-meta">
                                <span style={{ display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
                                    <Layers size={14} /> {course.lessons} {course.lessons === 1 ? 'lesson' : 'lessons'}
                                </span>
                                {isEnrolled && <span className="enrolled-badge">✓ Enrolled</span>}
                            </div>
                            <button
                                className={`btn ${isEnrolled ? 'btn-primary' : 'btn-outline'}`}
                                style={{ width: '100%' }}
                                onClick={() => handleStartLearning(course)}
                            >
                                {isEnrolled ? (
                                    <><Play size={15} /> Continue Learning</>
                                ) : (
                                    <><BookOpen size={15} /> Start Learning</>
                                )}
                            </button>
                        </div>
                    );
                })}
            </div>
        </div>
    );
};

export default Learn;
