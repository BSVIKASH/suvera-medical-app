import React, { useState } from 'react';
import api from '../../api'; 
import '../../styles/Auth.css';

const UserSignup = ({ onSwitchToLogin, onBack }) => {
  const [formData, setFormData] = useState({
    name: '',
    age: '',
    gender: '',
    contact: '',
    bloodGroup: '',
    email: '',    // ✅ Added
    password: ''  // ✅ Added
  });

  const [isLoading, setIsLoading] = useState(false);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);

    const payload = {
      name: formData.name,
      age: parseInt(formData.age),
      phoneNumber: formData.contact,
      gender: formData.gender,
      bloodGroup: formData.bloodGroup,
      email: formData.email,       // ✅ Sending to DB
      password: formData.password  // ✅ Sending to DB
    };

    try {
      // Calls the new Register endpoint in Backend
      await api.post('/Patients/register', payload);
      alert("Registration Successful! Please Login.");
      onSwitchToLogin(); 
    } catch (error) {
      console.error("Signup Error:", error);
      alert("Registration failed: " + (error.response?.data?.message || "Server Error"));
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="auth-container">
      <nav className="auth-nav">
        <div className="auth-nav-content">
          <h1>🏥 Emergency Help System</h1>
          <button className="back-button" onClick={onBack}>← Back to Home</button>
        </div>
      </nav>

      <div className="auth-content">
        <div className="auth-card">
          <div className="auth-header">
            <div className="auth-icon">👨‍⚕️</div>
            <h2>Patient Registration</h2>
            <p className="auth-subtitle">Create account with Email & Password</p>
          </div>

          <form onSubmit={handleSubmit}>
            
            {/* Full Name */}
            <div className="form-group">
              <label>Full Name</label>
              <div className="input-with-icon">
                <span className="input-icon">👤</span>
                <input type="text" name="name" value={formData.name} onChange={handleChange} placeholder="Enter full name" className="form-input" required />
              </div>
            </div>

            {/* Email (NEW) */}
            <div className="form-group">
              <label>Email Address</label>
              <div className="input-with-icon">
                <span className="input-icon">📧</span>
                <input type="email" name="email" value={formData.email} onChange={handleChange} placeholder="name@example.com" className="form-input" required />
              </div>
            </div>

            {/* Password (NEW) */}
            <div className="form-group">
              <label>Password</label>
              <div className="input-with-icon">
                <span className="input-icon">🔒</span>
                <input type="password" name="password" value={formData.password} onChange={handleChange} placeholder="Create a secure password" className="form-input" minLength="6" required />
              </div>
            </div>

            {/* Age & Gender */}
            <div className="form-row">
              <div className="form-group">
                <label>Age</label>
                <div className="input-with-icon">
                  <span className="input-icon">📅</span>
                  <input type="number" name="age" value={formData.age} onChange={handleChange} placeholder="Age" className="form-input" min="1" max="120" required />
                </div>
              </div>

              <div className="form-group">
                <label>Gender</label>
                <div className="input-with-icon">
                  <span className="input-icon">⚧</span>
                  <select name="gender" value={formData.gender} onChange={handleChange} className="form-input" style={{ paddingLeft: '40px' }} required>
                    <option value="">Select</option>
                    <option value="Male">Male</option>
                    <option value="Female">Female</option>
                    <option value="Other">Other</option>
                  </select>
                </div>
              </div>
            </div>

            {/* Contact */}
            <div className="form-group">
              <label>Mobile Number</label>
              <div className="input-with-icon">
                <span className="input-icon">📱</span>
                <input type="tel" name="contact" value={formData.contact} onChange={handleChange} placeholder="10-digit number" className="form-input" pattern="[0-9]{10}" required />
              </div>
            </div>

            {/* Blood Group */}
            <div className="form-group">
              <label>Blood Group</label>
              <div className="input-with-icon">
                <span className="input-icon">💉</span>
                <select name="bloodGroup" value={formData.bloodGroup} onChange={handleChange} className="form-input" style={{ paddingLeft: '40px' }} required>
                  <option value="">Select Group</option>
                  <option value="A+">A+</option><option value="A-">A-</option><option value="B+">B+</option><option value="B-">B-</option>
                  <option value="AB+">AB+</option><option value="AB-">AB-</option><option value="O+">O+</option><option value="O-">O-</option>
                </select>
              </div>
            </div>

            <button type="submit" className="auth-btn" disabled={isLoading}>
              {isLoading ? "Creating Profile..." : "🏥 Create Account"}
            </button>
          </form>

          <div className="auth-footer">
            <p>Already have an account? <span className="auth-link" onClick={onSwitchToLogin}>Sign In Here</span></p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default UserSignup;