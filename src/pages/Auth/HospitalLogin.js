import React, { useState } from 'react';
import api from '../../api'; // ✅ Import the API connection we created earlier
import '../../styles/Auth.css';

const HospitalLogin = ({ onLogin, onSwitchToSignup, onBack }) => {
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  });

  // State to handle loading and errors
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
    // Clear error when user types
    if (errorMessage) setErrorMessage('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setErrorMessage('');

    try {
      // 1. Send Email & Password to C# Backend
      // This hits: POST https://localhost:7189/api/Auth/login
      const response = await api.post('/Auth/login', {
        email: formData.email,
        password: formData.password
      });

      // 2. If successful, C# returns a Token
      const { token } = response.data;

      // 3. Save Token to Browser Storage (so they stay logged in)
      localStorage.setItem('hospitalToken', token);
      
      console.log("Login Success! Token:", token);

      // 4. Trigger the parent function to show the Dashboard
      onLogin();

    } catch (error) {
      console.error("Login Error:", error);
      
      // 5. Handle "Invalid Password" or "User Not Found"
      if (error.response && error.response.status === 401) {
        setErrorMessage("❌ Invalid Email or Password. Please try again.");
      } else if (error.response && error.response.status === 400) {
        setErrorMessage("⚠️ " + error.response.data);
      } else {
        setErrorMessage("❌ Server error. Is the backend running?");
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="auth-container">
      <nav className="auth-nav">
        <div className="auth-nav-content">
          <h1>🏥 Medipath Health</h1>
          <button className="back-button" onClick={onBack}>
            ← Back to Home
          </button>
        </div>
      </nav>

      <div className="auth-content">
        <div className="auth-card">
          <div className="auth-header">
            <div className="auth-icon">🏥</div>
            <h2>Hospital Login</h2>
            <p className="auth-subtitle">Access your hospital dashboard</p>
          </div>

          <form onSubmit={handleSubmit}>
            {/* Show Error Message if Login Fails */}
            {errorMessage && (
              <div style={{ 
                color: '#dc2626', 
                backgroundColor: '#fee2e2', 
                padding: '10px', 
                borderRadius: '6px', 
                marginBottom: '15px', 
                fontSize: '0.9rem',
                textAlign: 'center'
              }}>
                {errorMessage}
              </div>
            )}

            <div className="form-group">
              <label htmlFor="email">📧 Email</label>
              <input
                type="email"
                id="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                placeholder="hospital@email.com"
                className="form-input"
                required
              />
            </div>

            <div className="form-group">
              <label htmlFor="password">🔒 Password</label>
              <input
                type="password"
                id="password"
                name="password"
                value={formData.password}
                onChange={handleChange}
                placeholder="Enter your password"
                className="form-input"
                required
              />
            </div>

            <button 
              type="submit" 
              className="auth-btn" 
              disabled={isLoading}
              style={{ opacity: isLoading ? 0.7 : 1 }}
            >
              {isLoading ? "Verifying..." : "🏥 Login to Dashboard"}
            </button>
          </form>

          <div className="auth-footer">
            <p>
              Don't have an account?{' '}
              <span className="auth-link" onClick={onSwitchToSignup}>
                Register Hospital
              </span>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default HospitalLogin;