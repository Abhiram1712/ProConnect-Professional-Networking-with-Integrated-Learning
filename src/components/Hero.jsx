import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, Zap, Users, Code } from 'lucide-react';
import './Hero.css';

const Hero = () => {
  return (
    <section className="hero">
      <div className="hero-bg">
        <div className="hero-orb orb-1" />
        <div className="hero-orb orb-2" />
        <div className="hero-orb orb-3" />
        <div className="hero-grid" />
      </div>

      <div className="container hero-content">
        <div className="hero-badge">
          <Zap size={13} />
          <span>The Professional Growth Platform</span>
        </div>

        <h1 className="hero-title">
          Connect. Learn.{' '}
          <span className="gradient-text">Grow.</span>
        </h1>

        <p className="hero-subtitle">
          Join thousands of professionals accelerating their careers through mentorship,
          competitions, and real-world opportunities — all in one place.
        </p>

        <div className="hero-actions">
          <Link to="/register" className="btn btn-primary btn-lg">
            Get Started Free <ArrowRight size={18} />
          </Link>
          <Link to="/compete" className="btn btn-outline btn-lg">
            Explore Opportunities
          </Link>
        </div>

        <div className="hero-stats">
          <div className="hero-stat">
            <div className="hero-stat-num">50K+</div>
            <div className="hero-stat-label">Professionals</div>
          </div>
          <div className="hero-stat-divider" />
          <div className="hero-stat">
            <div className="hero-stat-num">1,200+</div>
            <div className="hero-stat-label">Opportunities</div>
          </div>
          <div className="hero-stat-divider" />
          <div className="hero-stat">
            <div className="hero-stat-num">200+</div>
            <div className="hero-stat-label">Expert Mentors</div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Hero;
