import React, { useState, useEffect, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Search, Bell, Grid, Menu, X, Rocket, Shield, Briefcase, BookOpen } from 'lucide-react';
import './Header.css';

const SEARCH_ROUTES = [
  { label: 'Feed', path: '/feed', keywords: ['feed', 'posts', 'social', 'timeline'] },
  { label: 'Network', path: '/network', keywords: ['network', 'connections', 'connect', 'people'] },
  { label: 'Learn', path: '/learn', keywords: ['learn', 'courses', 'education', 'study', 'tutorials'] },
  { label: 'Practice', path: '/practice', keywords: ['practice', 'code', 'editor', 'coding', 'compile', 'run'] },
  { label: 'Mentorship', path: '/mentorship', keywords: ['mentor', 'mentorship', 'guidance', 'coaching', 'advice'] },
  { label: 'Compete', path: '/compete', keywords: ['compete', 'hackathon', 'challenge', 'competition'] },
  { label: 'Jobs', path: '/jobs', keywords: ['jobs', 'internship', 'career', 'hiring', 'apply', 'work', 'salary'] },
  { label: 'Blogs', path: '/blogs', keywords: ['blog', 'articles', 'read', 'news', 'stories'] },
  { label: 'Host', path: '/host', keywords: ['host', 'create', 'publish', 'opportunity', 'post job'] },
  { label: 'Profile', path: '/profile', keywords: ['profile', 'settings', 'account', 'me', 'my'] },
  { label: 'Notifications', path: '/notifications', keywords: ['notifications', 'alerts', 'bell'] },
];

const Header = () => {
  const navigate = useNavigate();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [user, setUser] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [showDropdown, setShowDropdown] = useState(false);
  const searchRef = useRef(null);

  useEffect(() => {
    try {
      const storedUser = localStorage.getItem('user');
      if (storedUser) {
        setUser(JSON.parse(storedUser));
      }
    } catch (error) {
      console.error('Error parsing user data:', error);
      localStorage.removeItem('user');
    }
  }, []);

  // Close search dropdown on outside click
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (searchRef.current && !searchRef.current.contains(e.target)) {
        setShowDropdown(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSearch = (e) => {
    const query = e.target.value;
    setSearchQuery(query);
    if (query.trim().length > 0) {
      const q = query.toLowerCase();
      const results = SEARCH_ROUTES.filter(route =>
        route.label.toLowerCase().includes(q) ||
        route.keywords.some(k => k.includes(q))
      );
      setSearchResults(results);
      setShowDropdown(true);
    } else {
      setSearchResults([]);
      setShowDropdown(false);
    }
  };

  const handleSearchNavigate = (path) => {
    setSearchQuery('');
    setShowDropdown(false);
    navigate(path);
  };

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    if (searchResults.length > 0) {
      handleSearchNavigate(searchResults[0].path);
    } else if (searchQuery.trim()) {
      handleSearchNavigate('/jobs');
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setUser(null);
    window.location.href = '/';
  };

  const getDashboardLink = () => {
    if (!user) return null;
    switch (user.role) {
      case 'admin':
        return { path: '/admin/dashboard', label: 'Admin', icon: Shield, color: '#dc2626' };
      case 'recruiter':
        return { path: '/recruiter/dashboard', label: 'Dashboard', icon: Briefcase, color: '#7c3aed' };
      case 'mentor':
        return { path: '/mentor/dashboard', label: 'Dashboard', icon: BookOpen, color: '#059669' };
      default:
        return null;
    }
  };

  const dashLink = getDashboardLink();

  return (
    <header className="header">
      <div className="container header-container">
        <Link to="/" className="logo">
          <Rocket className="logo-icon" size={28} />
          <span className="logo-text">JobsGO</span>
        </Link>

        <div className="search-bar" ref={searchRef}>
          <form onSubmit={handleSearchSubmit} style={{ display: 'flex', alignItems: 'center', width: '100%' }}>
            <Search size={20} className="search-icon" />
            <input
              type="text"
              placeholder="Search pages, jobs, topics..."
              value={searchQuery}
              onChange={handleSearch}
              onFocus={() => searchQuery.trim() && setShowDropdown(true)}
            />
          </form>
          {showDropdown && (
            <div className="search-dropdown" style={{
              position: 'absolute', top: '100%', left: 0, right: 0, zIndex: 100,
              background: 'white', border: '1px solid var(--border)', borderRadius: '0 0 8px 8px',
              boxShadow: '0 4px 15px rgba(0,0,0,0.1)', maxHeight: '300px', overflow: 'auto'
            }}>
              {searchResults.length > 0 ? (
                searchResults.map(result => (
                  <div key={result.path}
                    onClick={() => handleSearchNavigate(result.path)}
                    style={{
                      padding: '0.65rem 1rem', cursor: 'pointer', display: 'flex',
                      alignItems: 'center', gap: '0.5rem', fontSize: '0.9rem',
                      transition: 'background 0.15s', borderBottom: '1px solid #f5f5f5'
                    }}
                    onMouseOver={e => e.currentTarget.style.background = '#f0f4ff'}
                    onMouseOut={e => e.currentTarget.style.background = 'transparent'}
                  >
                    <Search size={14} style={{ color: 'var(--text-muted)' }} />
                    <span>{result.label}</span>
                    <span style={{ marginLeft: 'auto', fontSize: '0.75rem', color: 'var(--text-muted)' }}>{result.path}</span>
                  </div>
                ))
              ) : (
                <div style={{ padding: '0.85rem 1rem', color: 'var(--text-muted)', fontSize: '0.88rem' }}>
                  No results found. <span style={{ cursor: 'pointer', color: 'var(--primary)' }} onClick={() => handleSearchNavigate('/jobs')}>Search in Jobs →</span>
                </div>
              )}
            </div>
          )}
        </div>

        <nav className={`nav-links ${isMenuOpen ? 'active' : ''}`}>
          {/* Mobile Close Button */}
          <button className="mobile-close" onClick={() => setIsMenuOpen(false)}>
            <X size={24} />
          </button>

          <Link to="/feed" className="nav-item" onClick={() => setIsMenuOpen(false)}>Feed</Link>
          <Link to="/network" className="nav-item" onClick={() => setIsMenuOpen(false)}>Network</Link>
          <Link to="/learn" className="nav-item" onClick={() => setIsMenuOpen(false)}>Learn</Link>
          <Link to="/practice" className="nav-item" onClick={() => setIsMenuOpen(false)}>Practice</Link>
          <Link to="/mentorship" className="nav-item" onClick={() => setIsMenuOpen(false)}>Mentorship</Link>
          <Link to="/compete" className="nav-item" onClick={() => setIsMenuOpen(false)}>Compete</Link>
          <Link to="/jobs" className="nav-item" onClick={() => setIsMenuOpen(false)}>Jobs</Link>
          <Link to="/blogs" className="nav-item" onClick={() => setIsMenuOpen(false)}>Blogs</Link>

          {/* Dashboard link for mobile */}
          {dashLink && (
            <Link to={dashLink.path} className="nav-item" style={{ color: dashLink.color, fontWeight: 600 }} onClick={() => setIsMenuOpen(false)}>
              {dashLink.label}
            </Link>
          )}

          <div className="nav-actions mobile-only">
            {user ? (
              <button className="btn btn-outline" onClick={handleLogout}>Logout</button>
            ) : (
              <Link to="/login" className="btn btn-outline" onClick={() => setIsMenuOpen(false)}>Login</Link>
            )}
            <Link to="/host" className="btn btn-primary" onClick={() => setIsMenuOpen(false)}>Host</Link>
          </div>
        </nav>

        <div className="header-actions">
          {/* Dashboard link for desktop */}
          {dashLink && (
            <Link to={dashLink.path} className="icon-btn" title={dashLink.label}
              style={{ color: dashLink.color }}>
              <dashLink.icon size={20} />
            </Link>
          )}
          <Link to="/notifications" className="icon-btn"><Bell size={20} /></Link>
          <Link to="/practice" className="icon-btn"><Grid size={20} /></Link>
          {user ? (
            <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
              <Link to="/profile" style={{ fontWeight: '600', color: 'var(--primary)', display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                Hi, {user.username}
                {user.role && user.role !== 'candidate' && (
                  <span style={{
                    fontSize: '0.6rem', padding: '0.1rem 0.35rem', borderRadius: '6px',
                    fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.3px',
                    background: user.role === 'admin' ? '#fee2e2' : user.role === 'recruiter' ? '#f3e8ff' : '#d1fae5',
                    color: user.role === 'admin' ? '#dc2626' : user.role === 'recruiter' ? '#7c3aed' : '#059669'
                  }}>
                    {user.role}
                  </span>
                )}
              </Link>
              <button className="btn btn-outline desktop-only" onClick={handleLogout}>Logout</button>
            </div>
          ) : (
            <Link to="/login" className="btn btn-outline desktop-only">Login</Link>
          )}
          <Link to="/host" className="btn btn-primary desktop-only">Host</Link>
          <button className="menu-btn" onClick={() => setIsMenuOpen(true)}>
            <Menu size={24} />
          </button>
        </div>
      </div>
    </header>
  );
};

export default Header;
