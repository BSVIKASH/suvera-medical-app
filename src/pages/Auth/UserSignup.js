import React, { useState } from 'react';
import api from '../../api'; // ✅ Import API connection
import '../../styles/Auth.css';

const UserSignup = ({ onSwitchToLogin, onBack }) => {
  const [formData, setFormData] = useState({
    name: '',
    age: '',
    gender: '',
    contact: '', // This maps to PhoneNumber in DB
    bloodGroup: ''
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

    // Prepare data to match SQL 'dbo.Patients' schema exactly
    const payload = {
      name: formData.name,
      age: parseInt(formData.age), // Database expects an Integer
      phoneNumber: formData.contact, // Database column is PhoneNumber
      gender: formData.gender,
      bloodGroup: formData.bloodGroup
    };

    try {
      // POST request to create new patient
      await api.post('/Patients', payload);
      
      alert("Registration Successful! Please Login.");
      onSwitchToLogin(); // Go to login page

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
          <button className="back-button" onClick={onBack}>
            ← Back to Home
          </button>
        </div>
      </nav>

      <div className="auth-content">
        <div className="auth-card">
          <div className="auth-header">
            <div className="auth-icon">👨‍⚕️</div>
            <h2>Patient Registration</h2>
            <p className="auth-subtitle">Create your medical profile for emergency services</p>
          </div>

          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <label htmlFor="name">Full Name</label>
              <div className="input-with-icon">
                <span className="input-icon">👤</span>
                <input
                  type="text"
                  id="name"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  placeholder="Enter your full name"
                  className="form-input"
                  required
                />
              </div>
            </div>

            <div className="form-row">
              <div className="form-group">
                <label htmlFor="age">Age</label>
                <div className="input-with-icon">
                  <span className="input-icon">📅</span>
                  <input
                    type="number"
                    id="age"
                    name="age"
                    value={formData.age}
                    onChange={handleChange}
                    placeholder="Age"
                    className="form-input"
                    min="1"
                    max="120"
                    required
                  />
                </div>
              </div>

              <div className="form-group">
                <label htmlFor="gender">Gender</label>
                <div className="input-with-icon">
                  <span className="input-icon">⚧</span>
                  <select
                    id="gender"
                    name="gender"
                    value={formData.gender}
                    onChange={handleChange}
                    className="select-input"
                    required
                  >
                    <option value="">Select Gender</option>
                    <option value="Male">Male</option>
                    <option value="Female">Female</option>
                    <option value="Other">Other</option>
                  </select>
                </div>
              </div>
            </div>

            <div className="form-group">
              <label htmlFor="contact">Contact Number</label>
              <div className="input-with-icon">
                <span className="input-icon">📱</span>
                <input
                  type="tel"
                  id="contact"
                  name="contact"
                  value={formData.contact}
                  onChange={handleChange}
                  placeholder="10-digit mobile number"
                  className="form-input"
                  pattern="[0-9]{10}"
                  required
                />
              </div>
            </div>

            <div className="form-group">
              <label htmlFor="bloodGroup">Blood Group</label>
              <div className="input-with-icon">
                <span className="input-icon">💉</span>
                <select
                  id="bloodGroup"
                  name="bloodGroup"
                  value={formData.bloodGroup}
                  onChange={handleChange}
                  className="select-input"
                  required
                >
                  <option value="">Select Blood Group</option>
                  <option value="A+">A+</option>
                  <option value="A-">A-</option>
                  <option value="B+">B+</option>
                  <option value="B-">B-</option>
                  <option value="AB+">AB+</option>
                  <option value="AB-">AB-</option>
                  <option value="O+">O+</option>
                  <option value="O-">O-</option>
                </select>
              </div>
            </div>

            <button type="submit" className="auth-btn" disabled={isLoading}>
              {isLoading ? "Creating Profile..." : "🏥 Create Medical Profile"}
            </button>
          </form>

          <div className="auth-footer">
            <p>
              Already have an account?{' '}
              <span className="auth-link" onClick={onSwitchToLogin}>
                Sign In Here
              </span>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default UserSignup;