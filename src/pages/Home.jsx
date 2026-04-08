import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Hero from '../components/Hero';
import { Calendar, Briefcase, Award, Code, Monitor, ArrowRight, Zap, Users, BookOpen, Trophy } from 'lucide-react';
import { motion } from 'framer-motion';

const API = import.meta.env.VITE_API_URL || 'http://localhost:5000';

const FEATURES = [
  { icon: BookOpen, emoji: '📚', title: 'Learn', desc: 'Expand your knowledge with structured courses and expert articles.', path: '/learn', color: '#6366f1' },
  { icon: Code, emoji: '💻', title: 'Practice', desc: 'Sharpen your coding skills with a built-in multi-language editor.', path: '/practice', color: '#8b5cf6' },
  { icon: Trophy, emoji: '🏆', title: 'Compete', desc: 'Participate in hackathons and win exciting prizes.', path: '/compete', color: '#06b6d4' },
  { icon: Users, emoji: '🤝', title: 'Connect', desc: 'Grow your professional network and find collaborators.', path: '/network', color: '#10b981' },
  { icon: Briefcase, emoji: '💼', title: 'Find Jobs', desc: 'Discover top internships and full-time opportunities.', path: '/jobs', color: '#f59e0b' },
  { icon: Zap, emoji: '⚡', title: 'Mentorship', desc: 'Book 1-on-1 sessions with industry experts.', path: '/mentorship', color: '#f43f5e' },
];

const Home = () => {
  const navigate = useNavigate();
  const [opportunities, setOpportunities] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch(`${API}/api/opportunities`)
      .then(res => res.json())
      .then(data => {
        if (Array.isArray(data)) setOpportunities(data.slice(0, 6));
        else setOpportunities([]);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  const getIcon = (type) => {
    switch (type) {
      case 'Hackathon': return <Code size={22} />;
      case 'Job': return <Briefcase size={22} />;
      case 'Internship': return <Monitor size={22} />;
      default: return <Award size={22} />;
    }
  };

  const getDaysLeft = (deadline) => {
    if (!deadline) return 'No deadline';
    const diff = new Date(deadline) - new Date();
    const days = Math.ceil(diff / (1000 * 60 * 60 * 24));
    if (isNaN(days) || days < 0) return 'Ended';
    if (days === 0) return 'Ends today';
    return `${days}d left`;
  };

  const typeStyles = {
    Hackathon: { bg: 'rgba(6,182,212,0.1)', color: '#06b6d4' },
    Job: { bg: 'rgba(99,102,241,0.1)', color: '#6366f1' },
    Internship: { bg: 'rgba(16,185,129,0.1)', color: '#10b981' },
    Competition: { bg: 'rgba(245,158,11,0.1)', color: '#f59e0b' },
  };

  return (
    <div className="home-page">
      <Hero />

      {/* Features Section */}
      <section style={{ padding: '6rem 0', background: 'var(--bg-secondary)' }}>
        <div className="container">
          <div style={{ textAlign: 'center', marginBottom: '3.5rem' }}>
            <div style={{
              display: 'inline-flex', alignItems: 'center', gap: '0.5rem',
              background: 'var(--primary-bg)', border: '1px solid rgba(var(--primary-rgb),0.2)',
              borderRadius: 'var(--radius-full)', padding: '0.35rem 1rem',
              fontSize: '0.78rem', fontWeight: 700, color: 'var(--primary)', marginBottom: '1rem',
              textTransform: 'uppercase', letterSpacing: '0.08em'
            }}>
              Everything you need
            </div>
            <h2 style={{ fontSize: 'clamp(1.8rem, 4vw, 2.8rem)', fontWeight: 800, letterSpacing: '-0.03em', marginBottom: '0.75rem' }}>
              Why{' '}
              <span className="gradient-text">ProConnect?</span>
            </h2>
            <p style={{ color: 'var(--text-muted)', fontSize: '1.05rem', maxWidth: '520px', margin: '0 auto' }}>
              One platform to accelerate your career — from learning to landing your dream opportunity.
            </p>
          </div>

          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
            gap: '1.5rem'
          }}>
            {FEATURES.map((f, i) => (
              <motion.div
                key={f.title}
                className="card"
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.08 }}
                onClick={() => navigate(f.path)}
                style={{ cursor: 'pointer', padding: '2rem' }}
              >
                <div style={{
                  width: 52, height: 52,
                  background: `${f.color}18`,
                  borderRadius: 'var(--radius-md)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  marginBottom: '1.25rem', fontSize: '1.5rem',
                  color: f.color
                }}>
                  {f.emoji}
                </div>
                <h3 style={{ fontSize: '1.1rem', fontWeight: 700, marginBottom: '0.5rem', color: 'var(--text)' }}>{f.title}</h3>
                <p style={{ fontSize: '0.9rem', color: 'var(--text-muted)', marginBottom: '1.25rem', lineHeight: 1.6 }}>{f.desc}</p>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', color: f.color, fontSize: '0.85rem', fontWeight: 600 }}>
                  Explore <ArrowRight size={14} />
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Opportunities Section */}
      <section style={{ padding: '6rem 0' }}>
        <div className="container">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: '2.5rem', flexWrap: 'wrap', gap: '1rem' }}>
            <div>
              <h2 style={{ fontWeight: 800, letterSpacing: '-0.03em', marginBottom: '0.4rem' }}>
                Latest <span className="gradient-text">Opportunities</span>
              </h2>
              <p style={{ color: 'var(--text-muted)', margin: 0 }}>Discover hackathons, jobs & more</p>
            </div>
            <a href="/compete" className="btn btn-outline btn-sm" style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
              View All <ArrowRight size={14} />
            </a>
          </div>

          {loading ? (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '1.5rem' }}>
              {[...Array(6)].map((_, i) => (
                <div key={i} className="skeleton" style={{ height: 200 }} />
              ))}
            </div>
          ) : (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '1.5rem' }}>
              {opportunities.map((opp, i) => {
                const tStyle = typeStyles[opp.type] || { bg: 'var(--primary-bg)', color: 'var(--primary)' };
                const isExpired = opp.deadline && new Date(opp.deadline) < new Date();
                return (
                  <motion.div
                    key={opp._id}
                    className="card"
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: i * 0.06 }}
                    whileHover={{ y: -6 }}
                    onClick={() => !isExpired && navigate(`/apply/${opp._id}`)}
                    style={{ cursor: isExpired ? 'not-allowed' : 'pointer', opacity: isExpired ? 0.7 : 1, display: 'flex', flexDirection: 'column', gap: '1rem', padding: '1.5rem' }}
                  >
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                      <div style={{ width: 44, height: 44, background: `${tStyle.color}18`, borderRadius: 'var(--radius)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: tStyle.color }}>
                        {getIcon(opp.type)}
                      </div>
                      <span style={{ fontSize: '0.7rem', fontWeight: 700, background: tStyle.bg, color: tStyle.color, padding: '0.2rem 0.6rem', borderRadius: 'var(--radius-full)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                        {opp.type}
                      </span>
                    </div>
                    <div>
                      <h3 style={{ fontSize: '1rem', fontWeight: 700, marginBottom: '0.25rem', color: 'var(--text)' }}>{opp.title}</h3>
                      <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', margin: 0 }}>{opp.company}</p>
                    </div>
                    <div style={{ marginTop: 'auto', paddingTop: '0.75rem', borderTop: '1px solid var(--border-light)', display: 'flex', justifyContent: 'space-between', fontSize: '0.82rem' }}>
                      <span style={{ display: 'flex', alignItems: 'center', gap: '4px', color: isExpired ? 'var(--error)' : 'var(--text-muted)' }}>
                        <Calendar size={13} /> {getDaysLeft(opp.deadline)}
                      </span>
                      <span style={{ color: 'var(--text-secondary)', fontWeight: 600 }}>{opp.reward}</span>
                    </div>
                  </motion.div>
                );
              })}
            </div>
          )}
        </div>
      </section>

      {/* CTA Section */}
      <section style={{ padding: '5rem 0', background: 'var(--bg-secondary)' }}>
        <div className="container" style={{ textAlign: 'center', maxWidth: '640px' }}>
          <div style={{
            background: 'var(--gradient-primary)',
            borderRadius: 'var(--radius-xl)',
            padding: '4rem 2.5rem',
            position: 'relative',
            overflow: 'hidden'
          }}>
            <div style={{ position: 'absolute', inset: 0, background: 'radial-gradient(circle at 70% 20%, rgba(255,255,255,0.15) 0%, transparent 60%)', pointerEvents: 'none' }} />
            <h2 style={{ color: 'white', fontSize: 'clamp(1.6rem, 4vw, 2.5rem)', marginBottom: '1rem', fontWeight: 800, letterSpacing: '-0.03em' }}>
              Ready to level up?
            </h2>
            <p style={{ color: 'rgba(255,255,255,0.8)', fontSize: '1.05rem', marginBottom: '2rem' }}>
              Join ProConnect today and unlock opportunities that match your skills.
            </p>
            <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center', flexWrap: 'wrap' }}>
              <a href="/register" style={{
                display: 'inline-flex', alignItems: 'center', gap: '0.5rem',
                background: 'white', color: '#6366f1', padding: '0.8rem 2rem',
                borderRadius: 'var(--radius-full)', fontWeight: 700, fontSize: '0.95rem',
                boxShadow: '0 4px 20px rgba(0,0,0,0.15)', transition: 'transform 0.2s ease',
              }}
                onMouseOver={e => e.currentTarget.style.transform = 'translateY(-2px)'}
                onMouseOut={e => e.currentTarget.style.transform = 'translateY(0)'}
              >
                Get Started Free <ArrowRight size={16} />
              </a>
              <a href="/compete" style={{
                display: 'inline-flex', alignItems: 'center', gap: '0.5rem',
                background: 'rgba(255,255,255,0.15)', color: 'white', padding: '0.8rem 2rem',
                borderRadius: 'var(--radius-full)', fontWeight: 600, fontSize: '0.95rem',
                border: '1.5px solid rgba(255,255,255,0.3)', transition: 'all 0.2s ease',
              }}
                onMouseOver={e => { e.currentTarget.style.background = 'rgba(255,255,255,0.25)'; e.currentTarget.style.transform = 'translateY(-2px)'; }}
                onMouseOut={e => { e.currentTarget.style.background = 'rgba(255,255,255,0.15)'; e.currentTarget.style.transform = 'translateY(0)'; }}
              >
                Browse Opportunities
              </a>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Home;
