import { motion } from 'framer-motion';
import { ArrowRight, Trophy, BookOpen, User } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import './Hero.css';

const Hero = () => {
    const navigate = useNavigate();

    return (
        <section className="hero">
            <div className="container hero-container">
                <motion.div
                    className="hero-content"
                    initial={{ opacity: 0, x: -50 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.8 }}
                >
                    <motion.h1
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: 0.2 }}
                    >
                        Unlock Your <span className="highlight">Potential</span>
                    </motion.h1>
                    <motion.p
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: 0.4 }}
                    >
                        The world's largest community of students and professionals. Learning, Practice, and Competitions to help you land your dream job.
                    </motion.p>

                    <div className="hero-buttons">
                        <motion.button
                            className="btn btn-primary"
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                            onClick={() => navigate('/compete')}
                        >
                            Explore Opportunities <ArrowRight size={18} />
                        </motion.button>
                        <motion.button
                            className="btn btn-outline"
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                            onClick={() => navigate('/host')}
                        >
                            Host a Challenge
                        </motion.button>
                    </div>

                    <div className="hero-stats">
                        <div className="stat">
                            <Trophy size={24} className="stat-icon" />
                            <div>
                                <h4>10M+</h4>
                                <p>Users</p>
                            </div>
                        </div>
                        <div className="stat">
                            <BookOpen size={24} className="stat-icon" />
                            <div>
                                <h4>50K+</h4>
                                <p>Opportunities</p>
                            </div>
                        </div>
                        <div className="stat">
                            <User size={24} className="stat-icon" />
                            <div>
                                <h4>500+</h4>
                                <p>Brands</p>
                            </div>
                        </div>
                    </div>
                </motion.div>

                <motion.div
                    className="hero-image"
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ duration: 0.8 }}
                >
                    <div className="image-placeholder">
                        <div className="floating-card c1">
                            <Trophy size={32} color="#ffd700" />
                            <span>Win Prizes</span>
                        </div>
                        <div className="floating-card c2">
                            <BookOpen size={32} color="#0073e6" />
                            <span>Learn Skills</span>
                        </div>
                        <div className="circle-bg"></div>
                    </div>
                </motion.div>
            </div>
        </section>
    );
};

export default Hero;
