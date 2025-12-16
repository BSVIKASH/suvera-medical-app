import React, { useState } from 'react';
import api from '../../api'; // Import the API connection
import '../../styles/Auth.css'; // Uses your existing styling

const UserLogin = ({ onLogin, onSwitchToSignup, onBack }) => {
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  });

  const [isLoading, setIsLoading] = useState(false);

  // Handle Input Changes
  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  // Handle Login Logic
  const handleLogin = async (e) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      // 1. Send Login Request
      const response = await api.post('/Patients/login', {
          email: formData.email,
          password: formData.password
      });

      // 2. Success Handler
      // We extract details sent from the new C# Login Method
      const { message, user } = response.data;
      
      console.log(message, user);

      // 3. Save User Context to LocalStorage
      // Note: We save Phone because your Dashboard currently relies on it to fetch Profile
      if (user.phone) localStorage.setItem('userPhone', user.phone);
      if (user.email) localStorage.setItem('userEmail', user.email);
      
      alert(`✅ Welcome back, ${user.name}!`);
      
      // 4. Navigate to Dashboard
      onLogin();

    } catch (error) {
      console.error("Login Error:", error);
      
      // Handle Specific Backend Errors (e.g. "User not registered" or "Invalid password")
      const errMsg = error.response?.data?.message || "Login failed. Please check credentials.";
      alert(`❌ ${errMsg}`);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="auth-container">
      <nav className="auth-nav">
        <div className="auth-nav-content">
          <h1>🏥 Emergency Help System</h1>
          <button className="back-button" onClick={onBack}>
            ← Back to Home
          </button>
        </div>
      </nav>

      <div className="auth-content">
        <div className="auth-card">
          <div className="auth-header">
            <div className="auth-icon">🔐</div>
            <h2>Patient Login</h2>
            <p className="auth-subtitle">Sign in to access your medical profile</p>
          </div>
          
          <form onSubmit={handleLogin}>
            
            {/* EMAIL INPUT */}
            <div className="form-group">
              <label htmlFor="email">Email Address</label>
              <div className="input-with-icon">
                <span className="input-icon">📧</span>
                <input
                  type="email"
                  id="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  placeholder="Enter your registered email"
                  className="form-input"
                  required
                  autoFocus
                />
              </div>
            </div>

            {/* PASSWORD INPUT */}
            <div className="form-group">
              <label htmlFor="password">Password</label>
              <div className="input-with-icon">
                <span className="input-icon">🔑</span>
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
            </div>

            <button 
              type="submit" 
              className="auth-btn"
              disabled={isLoading}
            >
              {isLoading ? "Verifying..." : "🔓 Secure Login"}
            </button>
          </form>

          <div className="auth-footer">
            <p>
              New to Emergency Help System?{' '}
              <span className="auth-link" onClick={onSwitchToSignup}>
                Create Account
              </span>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default UserLogin;