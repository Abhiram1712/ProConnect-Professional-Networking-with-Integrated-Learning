import React, { useState, useEffect, useRef } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { Search, Bell, Code, Menu, X, Rocket, Shield, Briefcase, BookOpen, Sun, Moon, ChevronDown, LogOut, User, MessageSquare } from 'lucide-react';
import { useTheme } from '../App';
import './Header.css';

const SEARCH_ROUTES = [
  { label: 'Feed', path: '/feed', icon: '📡', keywords: ['feed', 'posts', 'social', 'timeline'] },
  { label: 'Network', path: '/network', icon: '🤝', keywords: ['network', 'connections', 'connect', 'people'] },
  { label: 'Learn', path: '/learn', icon: '📚', keywords: ['learn', 'courses', 'education', 'study', 'tutorials'] },
  { label: 'Practice', path: '/practice', icon: '💻', keywords: ['practice', 'code', 'editor', 'coding', 'compile'] },
  { label: 'Mentorship', path: '/mentorship', icon: '🧑‍🏫', keywords: ['mentor', 'mentorship', 'guidance', 'coaching'] },
  { label: 'Compete', path: '/compete', icon: '🏆', keywords: ['compete', 'hackathon', 'challenge', 'competition'] },
  { label: 'Jobs', path: '/jobs', icon: '💼', keywords: ['jobs', 'internship', 'career', 'hiring', 'apply', 'work'] },
  { label: 'Blogs', path: '/blogs', icon: '✍️', keywords: ['blog', 'articles', 'read', 'news', 'stories'] },
  { label: 'Host', path: '/host', icon: '🚀', keywords: ['host', 'create', 'publish', 'opportunity', 'post job'] },
  { label: 'Profile', path: '/profile', icon: '👤', keywords: ['profile', 'settings', 'account', 'me', 'my'] },
  { label: 'Notifications', path: '/notifications', icon: '🔔', keywords: ['notifications', 'alerts', 'bell'] },
  { label: 'Messages', path: '/messages', icon: '💬', keywords: ['messages', 'chat', 'direct message', 'conversation', 'talk'] },
];

const NAV_LINKS = [
  { label: 'Feed', path: '/feed' },
  { label: 'Network', path: '/network' },
  { label: 'Learn', path: '/learn' },
  { label: 'Messages', path: '/messages' },
  { label: 'Mentorship', path: '/mentorship' },
  { label: 'Compete', path: '/compete' },
  { label: 'Jobs', path: '/jobs' },
  { label: 'Blogs', path: '/blogs' },
];

const Header = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { theme, toggleTheme } = useTheme();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [user, setUser] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [showDropdown, setShowDropdown] = useState(false);
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const searchRef = useRef(null);
  const userMenuRef = useRef(null);

  useEffect(() => {
    try {
      const storedUser = localStorage.getItem('user');
      if (storedUser) setUser(JSON.parse(storedUser));
    } catch (e) {
      localStorage.removeItem('user');
    }
  }, []);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 10);
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (searchRef.current && !searchRef.current.contains(e.target)) setShowDropdown(false);
      if (userMenuRef.current && !userMenuRef.current.contains(e.target)) setShowUserMenu(false);
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Close mobile menu on route change
  useEffect(() => setIsMenuOpen(false), [location.pathname]);

  const handleSearch = (e) => {
    const query = e.target.value;
    setSearchQuery(query);
    if (query.trim().length > 0) {
      const q = query.toLowerCase();
      const results = SEARCH_ROUTES.filter(r =>
        r.label.toLowerCase().includes(q) || r.keywords.some(k => k.includes(q))
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
    if (searchResults.length > 0) handleSearchNavigate(searchResults[0].path);
    else if (searchQuery.trim()) handleSearchNavigate('/jobs');
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setUser(null);
    setShowUserMenu(false);
    navigate('/');
  };

  const getDashboardLink = () => {
    if (!user) return null;
    switch (user.role) {
      case 'admin': return { path: '/admin/dashboard', label: 'Admin', icon: Shield, color: '#f87171' };
      case 'recruiter': return { path: '/recruiter/dashboard', label: 'Dashboard', icon: Briefcase, color: '#a78bfa' };
      case 'mentor': return { path: '/mentor/dashboard', label: 'Dashboard', icon: BookOpen, color: '#34d399' };
      default: return null;
    }
  };

  const dashLink = getDashboardLink();
  const isActive = (path) => location.pathname === path;

  const roleColors = {
    admin: { bg: 'rgba(248,113,113,0.12)', color: '#f87171' },
    recruiter: { bg: 'rgba(167,139,250,0.12)', color: '#a78bfa' },
    mentor: { bg: 'rgba(52,211,153,0.12)', color: '#34d399' },
  };
  const roleStyle = user?.role && roleColors[user.role] ? roleColors[user.role] : null;

  return (
    <>
      <header className={`header ${scrolled ? 'scrolled' : ''}`}>
        <div className="header-container">
          {/* Logo */}
          <Link to="/" className="logo">
            <div className="logo-icon-wrap">
              <Rocket size={20} className="logo-icon" />
            </div>
            <span className="logo-text">ProConnect</span>
          </Link>

          {/* Search */}
          <div className="search-bar" ref={searchRef}>
            <form onSubmit={handleSearchSubmit} style={{ display: 'flex', alignItems: 'center', width: '100%' }}>
              <Search size={16} className="search-icon" />
              <input
                type="text"
                placeholder="Search pages, jobs, topics..."
                value={searchQuery}
                onChange={handleSearch}
                onFocus={() => searchQuery.trim() && setShowDropdown(true)}
              />
            </form>
            {showDropdown && (
              <div className="search-dropdown">
                {searchResults.length > 0 ? searchResults.map(r => (
                  <div key={r.path} className="search-result-item" onClick={() => handleSearchNavigate(r.path)}>
                    <span className="search-result-icon">{r.icon}</span>
                    <span className="search-result-label">{r.label}</span>
                    <span className="search-result-path">{r.path}</span>
                  </div>
                )) : (
                  <div className="search-no-result">
                    No results for "<b>{searchQuery}</b>"
                    <span onClick={() => handleSearchNavigate('/jobs')}>Search Jobs →</span>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Nav Links (desktop) */}
          <nav className="nav-links desktop-nav">
            {NAV_LINKS.map(link => (
              <Link
                key={link.path}
                to={link.path}
                className={`nav-item ${isActive(link.path) ? 'active' : ''}`}
              >
                {link.label}
              </Link>
            ))}
          </nav>

          {/* Actions */}
          <div className="header-actions">
            {/* Dashboard link */}
            {dashLink && (
              <Link to={dashLink.path} className="icon-btn" title={dashLink.label} style={{ color: dashLink.color }}>
                <dashLink.icon size={19} />
              </Link>
            )}

            <Link to="/notifications" className="icon-btn highlight-icon" title="Notifications">
              <Bell size={20} />
            </Link>

            <Link to="/messages" className="icon-btn highlight-icon" title="Messages">
              <MessageSquare size={20} />
            </Link>

            <Link to="/practice" className="icon-btn highlight-icon" title="Practice">
              <Code size={20} />
            </Link>

            {/* Theme Toggle */}
            <button
              className={`theme-toggle ${theme === 'dark' ? 'dark' : ''}`}
              onClick={toggleTheme}
              title={`Switch to ${theme === 'light' ? 'dark' : 'light'} mode`}
            >
              <div className="theme-toggle-thumb">
                {theme === 'dark' ? <Moon size={11} /> : <Sun size={11} color="#f59e0b" />}
              </div>
            </button>

            {/* User Menu */}
            {user ? (
              <div className="user-menu-wrap" ref={userMenuRef}>
                <button className="user-btn" onClick={() => setShowUserMenu(!showUserMenu)}>
                  <div className="user-avatar">
                    {user.username?.[0]?.toUpperCase() || 'U'}
                  </div>
                  <span className="user-name">{user.username}</span>
                  {roleStyle && (
                    <span className="user-role-badge" style={{ background: roleStyle.bg, color: roleStyle.color }}>
                      {user.role}
                    </span>
                  )}
                  <ChevronDown size={14} className={`chevron ${showUserMenu ? 'rotated' : ''}`} />
                </button>
                {showUserMenu && (
                  <div className="user-dropdown">
                    <div className="user-dropdown-header">
                      <div className="user-dropdown-avatar">
                        {user.username?.[0]?.toUpperCase() || 'U'}
                      </div>
                      <div>
                        <div style={{ fontWeight: 600, fontSize: '0.9rem' }}>{user.username}</div>
                        <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{user.email}</div>
                      </div>
                    </div>
                    <Link to="/profile" className="user-dropdown-item" onClick={() => setShowUserMenu(false)}>
                      <User size={15} /> My Profile
                    </Link>
                    {dashLink && (
                      <Link to={dashLink.path} className="user-dropdown-item" onClick={() => setShowUserMenu(false)} style={{ color: dashLink.color }}>
                        <dashLink.icon size={15} /> {dashLink.label}
                      </Link>
                    )}
                    <div className="user-dropdown-divider" />
                    <button className="user-dropdown-item danger" onClick={handleLogout}>
                      <LogOut size={15} /> Logout
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <div className="auth-btns">
                <Link to="/login" className="btn btn-outline btn-sm">Login</Link>
                <Link to="/register" className="btn btn-primary btn-sm">Sign Up</Link>
              </div>
            )}

            <Link to="/host" className="btn btn-primary btn-sm hide-mobile">Host</Link>

            {/* Hamburger */}
            <button className="menu-btn" onClick={() => setIsMenuOpen(true)}>
              <Menu size={22} />
            </button>
          </div>
        </div>
      </header>

      {/* Mobile Menu Overlay */}
      {isMenuOpen && (
        <div className="mobile-overlay" onClick={() => setIsMenuOpen(false)}>
          <div className="mobile-menu" onClick={e => e.stopPropagation()}>
            <div className="mobile-menu-header">
              <Link to="/" className="logo" onClick={() => setIsMenuOpen(false)}>
                <div className="logo-icon-wrap"><Rocket size={18} /></div>
                <span className="logo-text">ProConnect</span>
              </Link>
              <button className="icon-btn" onClick={() => setIsMenuOpen(false)}>
                <X size={22} />
              </button>
            </div>

            <nav className="mobile-nav">
              {NAV_LINKS.map(link => (
                <Link
                  key={link.path}
                  to={link.path}
                  className={`mobile-nav-item ${isActive(link.path) ? 'active' : ''}`}
                  onClick={() => setIsMenuOpen(false)}
                >
                  {link.label}
                </Link>
              ))}
              {dashLink && (
                <Link to={dashLink.path} className="mobile-nav-item" style={{ color: dashLink.color }} onClick={() => setIsMenuOpen(false)}>
                  {dashLink.label}
                </Link>
              )}
            </nav>

            <div className="mobile-menu-footer">
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>
                  {theme === 'dark' ? '🌙 Dark' : '☀️ Light'} Mode
                </span>
                <button className={`theme-toggle ${theme === 'dark' ? 'dark' : ''}`} onClick={toggleTheme}>
                  <div className="theme-toggle-thumb">
                    {theme === 'dark' ? <Moon size={11} /> : <Sun size={11} color="#f59e0b" />}
                  </div>
                </button>
              </div>
              {user ? (
                <button className="btn btn-outline btn-sm" onClick={handleLogout}>Logout</button>
              ) : (
                <div style={{ display: 'flex', gap: '0.5rem' }}>
                  <Link to="/login" className="btn btn-outline btn-sm" onClick={() => setIsMenuOpen(false)}>Login</Link>
                  <Link to="/register" className="btn btn-primary btn-sm" onClick={() => setIsMenuOpen(false)}>Sign Up</Link>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default Header;
