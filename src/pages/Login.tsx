import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useStore } from '../context/useStore';
import heroImage from '../assets/TEST_TUBE_MAN.png';
import prepRouteLogo from '../assets/PrepRoute.png';

export const Login: React.FC = () => {
  const [userId, setUserId] = useState('');
  const [password, setPassword] = useState('');
  const [formError, setFormError] = useState('');
  const { login, token, isLoading, error: storeError } = useStore();
  const navigate = useNavigate();

  useEffect(() => {
    // If user is already authenticated, send them to dashboard
    if (token) {
      navigate('/dashboard');
    }
  }, [token, navigate]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError('');

    if (!userId.trim()) {
      setFormError('Admin username is required');
      return;
    }
    if (!password) {
      setFormError('Password is required');
      return;
    }

    const success = await login({ userId: userId.trim(), password });
    if (success) {
      navigate('/dashboard');
    }
  };

  return (
    <div className="login-container">
      {/* Left panel with light blue background and illustration */}
      <div className="login-left-panel">
        <div className="login-illustration-container">
          <img
            src={heroImage}
            alt="Hourglass character illustration working at desk"
            className="login-illustration"
          />
        </div>
      </div>

      {/* Right panel with login form */}
      <div className="login-right-panel">
        <div className="login-form-wrapper">
          {/* Logo Section */}
          <div style={{ display: 'flex', alignItems: 'center', marginBottom: '36px' }}>
            <img src={prepRouteLogo} alt="preproute" style={{ height: '36px' }} />
          </div>

          <h1 style={{ fontSize: '32px', fontWeight: 700, color: '#1e293b', marginBottom: '8px', fontFamily: 'Outfit, sans-serif', letterSpacing: '-0.02em' }}>
            Login
          </h1>
          <p style={{ color: '#64748b', fontSize: '14px', marginBottom: '32px' }}>
            Use your company provided Login credentials
          </p>

          <form onSubmit={handleSubmit}>
            {(formError || storeError) && (
              <div style={{
                background: '#fef2f2',
                border: '1px solid #fee2e2',
                color: '#ef4444',
                padding: '12px',
                borderRadius: '8px',
                fontSize: '13px',
                marginBottom: '20px',
                textAlign: 'left'
              }}>
                {formError || storeError}
              </div>
            )}

            <div style={{ marginBottom: '20px', display: 'flex', flexDirection: 'column' }}>
              <label className="login-label" htmlFor="userId">
                User ID
              </label>
              <input
                id="userId"
                type="text"
                className="login-input"
                placeholder="Enter User ID"
                value={userId}
                onChange={(e) => setUserId(e.target.value)}
                disabled={isLoading}
              />
            </div>

            <div style={{ marginBottom: '16px', display: 'flex', flexDirection: 'column' }}>
              <label className="login-label" htmlFor="password">
                Password
              </label>
              <input
                id="password"
                type="password"
                className="login-input"
                placeholder="Enter Password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                disabled={isLoading}
              />
            </div>

            <a href="#forgot" className="login-forgot-link" onClick={(e) => e.preventDefault()}>
              Forgot password?
            </a>

            <button
              type="submit"
              className="login-btn"
              disabled={isLoading}
            >
              {isLoading ? 'Authenticating...' : 'Login'}
            </button>
          </form>

          {/* Credentials Helper in light/gray styling to match the light page theme */}
          <div style={{
            marginTop: '32px',
            textAlign: 'center',
            fontSize: '13px',
            color: '#64748b',
            padding: '12px',
            backgroundColor: '#f8fafc',
            borderRadius: '8px',
            border: '1px dashed #e2e8f0'
          }}>
            Credentials: <span style={{ fontWeight: 600, color: '#3b82f6' }}>vedant-admin</span> / <span style={{ fontWeight: 600, color: '#3b82f6' }}>vedant123</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;
