import React from 'react';
import { NavLink, useNavigate, useLocation } from 'react-router-dom';
import { useStore } from '../context/useStore';
import { LogOut, LayoutDashboard, Edit, FileText, Bell, ChevronDown } from 'lucide-react';
import prepRouteLogo from '../assets/PrepRoute.png';
import profilePic from '../assets/profile_pic.png';

interface LayoutProps {
  children: React.ReactNode;
}

export const Layout: React.FC<LayoutProps> = ({ children }) => {
  const { user, logout, alert } = useStore();
  const navigate = useNavigate();
  const location = useLocation();

  const isQuestionsPage = location.pathname.includes('/questions');

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <div className="app-container">
      {/* Sidebar Navigation */}
      <aside className={`sidebar ${isQuestionsPage ? 'collapsed' : ''}`}>
        {/* Logo Section */}
        <div className="sidebar-logo-container">
          <img src={prepRouteLogo} alt="preproute" style={{ height: '36px', width: '90%' }} />
        </div>

        {/* Sidebar Nav Links */}
        <nav className="sidebar-nav">
          <NavLink
            to="/dashboard"
            className={({ isActive }) => `sidebar-link ${isActive ? 'active' : ''}`}
          >
            <LayoutDashboard size={18} />
            <span>Dashboard</span>
          </NavLink>

          <NavLink
            to="/test/new"
            className={({ isActive }) => `sidebar-link ${isActive ? 'active' : ''}`}
          >
            <Edit size={18} />
            <span>Test Creation</span>
          </NavLink>

          <a
            href="#tracking"
            className="sidebar-link"
            onClick={(e) => e.preventDefault()}
          >
            <FileText size={18} />
            <span>Test Tracking</span>
          </a>
        </nav>

        {/* Logout at bottom of sidebar (compact and styled nicely) */}
        <div style={{ padding: '0 24px' }}>
          <button
            onClick={handleLogout}
            className="sidebar-link"
            style={{
              width: '100%',
              border: 'none',
              background: 'transparent',
              cursor: 'pointer',
              color: '#ef4444',
              paddingLeft: '0',
              borderLeft: 'none'
            }}
          >
            <LogOut size={18} />
            <span>Logout</span>
          </button>
        </div>
      </aside>

      {/* Main Panel Content Area */}
      <div style={{ display: 'flex', flexDirection: 'column', flex: 1, minHeight: '100vh' }}>
        {/* Topbar Header */}
        <header className="topbar">
          <div className="topbar-right">
            {/* Notification Bell */}
            <button className="topbar-bell-btn">
              <Bell size={20} />
              <div className="topbar-bell-dot"></div>
            </button>

            {/* Profile Dropdown Widget */}
            <div className="profile-widget">
              {/* Cartoon Face SVG Avatar */}
              <img src={profilePic} alt="avatar" style={{ width: '36px', height: '36px', borderRadius: '50%', objectFit: 'cover' }} />

              <div className="profile-info">
                <span className="profile-name">{user?.userId || 'Alex Wando'}</span>
                <span className="profile-role">Admin</span>
              </div>

              <ChevronDown size={16} color="#64748b" style={{ marginLeft: '4px' }} />
            </div>
          </div>
        </header>

        {/* Page Content Body */}
        <main className="main-content">
          {children}
        </main>
      </div>

      {/* Global Toast Alert */}
      {alert.message && (
        <div className="glass-panel" style={{
          position: 'fixed',
          top: '24px',
          right: '24px',
          zIndex: 9999,
          padding: '16px 24px',
          borderRadius: 'var(--radius-sm)',
          borderLeft: `4px solid ${alert.type === 'success' ? 'var(--success-color)' :
            alert.type === 'error' ? 'var(--error-color)' : 'var(--warning-color)'
            }`,
          boxShadow: 'var(--shadow-lg)',
          animation: 'fadeIn 0.25s ease-out forwards',
          display: 'flex',
          alignItems: 'center',
          gap: '12px'
        }}>
          <span style={{ fontSize: '14px', fontWeight: 500, color: 'var(--text-main)' }}>{alert.message}</span>
        </div>
      )}
    </div>
  );
};

export default Layout;
