// src/pages/Auth/HospitalSignup.js
import React, { useState } from 'react';
import '../../styles/Auth.css';

const HospitalSignup = ({ onSignup, onSwitchToLogin, onBack }) => {
  const [formData, setFormData] = useState({
    hospitalName: '',
    address: '',
    email: '',
    contact: '',
    password: '',
    confirmPassword: '',
    licenseFile: null
  });

  const [doctors, setDoctors] = useState([
    { name: '', specialization: '', specializationId: '', contact: '', licenseFile: null }
  ]);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (formData.password !== formData.confirmPassword) {
      alert('Passwords do not match');
      return;
    }
    onSignup();
  };

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleFileChange = (e) => {
    setFormData({
      ...formData,
      licenseFile: e.target.files[0]
    });
  };

  const addDoctor = () => {
    setDoctors([...doctors, { name: '', specialization: '', specializationId: '', contact: '', licenseFile: null }]);
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
            <div className="auth-icon">🏥</div>
            <h2>Hospital Registration</h2>
            <p className="auth-subtitle">Join our healthcare network</p>
          </div>

          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <label htmlFor="hospitalName">🏥 Hospital Name</label>
              <input
                type="text"
                id="hospitalName"
                name="hospitalName"
                value={formData.hospitalName}
                onChange={handleChange}
                placeholder="Enter hospital name"
                className="form-input"
                required
              />
            </div>

            <div className="form-group">
              <label htmlFor="address">📍 Address</label>
              <input
                type="text"
                id="address"
                name="address"
                value={formData.address}
                onChange={handleChange}
                placeholder="Full hospital address"
                className="form-input"
                required
              />
            </div>

            <div className="form-row">
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
                <label htmlFor="contact">📞 Contact Number</label>
                <input
                  type="tel"
                  id="contact"
                  name="contact"
                  value={formData.contact}
                  onChange={handleChange}
                  placeholder="Hospital contact number"
                  className="form-input"
                  required
                />
              </div>
            </div>

            <div className="form-row">
              <div className="form-group">
                <label htmlFor="password">🔒 Password</label>
                <input
                  type="password"
                  id="password"
                  name="password"
                  value={formData.password}
                  onChange={handleChange}
                  placeholder="Create password"
                  className="form-input"
                  required
                />
              </div>

              <div className="form-group">
                <label htmlFor="confirmPassword">✅ Confirm Password</label>
                <input
                  type="password"
                  id="confirmPassword"
                  name="confirmPassword"
                  value={formData.confirmPassword}
                  onChange={handleChange}
                  placeholder="Confirm password"
                  className="form-input"
                  required
                />
              </div>
            </div>

            <div className="form-group">
              <label>📄 Hospital License</label>
              <div 
                className="upload-area"
                onClick={() => document.getElementById('license-upload').click()}
              >
                <div className="upload-icon">📄</div>
                <div className="upload-text">
                  {formData.licenseFile ? formData.licenseFile.name : 'Click to upload hospital license (PDF, JPG, PNG)'}
                </div>
                <input
                  type="file"
                  id="license-upload"
                  className="file-input"
                  onChange={handleFileChange}
                  accept=".pdf,.jpg,.jpeg,.png"
                />
              </div>
            </div>

            <div className="form-group">
              <label>👨‍⚕️ Doctor Information</label>
              {doctors.map((doctor, index) => (
                <div key={index} style={{ marginBottom: '1rem', padding: '1rem', border: '1px solid #e2e8f0', borderRadius: '8px', background: '#f8fafc' }}>
                  <h4 style={{ marginBottom: '0.5rem', color: '#374151', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    👨‍⚕️ Doctor {index + 1}
                  </h4>
                  <div className="form-row">
                    <input
                      type="text"
                      placeholder="Doctor Name"
                      className="form-input"
                      style={{ marginBottom: '0.5rem' }}
                    />
                    <input
                      type="text"
                      placeholder="Specialization"
                      className="form-input"
                      style={{ marginBottom: '0.5rem' }}
                    />
                  </div>
                  <div className="form-row">
                    <input
                      type="text"
                      placeholder="License ID"
                      className="form-input"
                      style={{ marginBottom: '0.5rem' }}
                    />
                    <input
                      type="tel"
                      placeholder="Contact"
                      className="form-input"
                      style={{ marginBottom: '0.5rem' }}
                    />
                  </div>
                  <div className="upload-area" style={{ marginBottom: '0.5rem' }}>
                    <div className="upload-icon">📄</div>
                    <div className="upload-text">Upload Doctor License</div>
                  </div>
                </div>
              ))}
              <button type="button" onClick={addDoctor} className="back-btn">
                ➕ Add Another Doctor
              </button>
            </div>

            <button type="submit" className="auth-btn">
              🏥 Register Hospital
            </button>
          </form>

          <div className="auth-footer">
            <p>
              Already registered?{' '}
              <span className="auth-link" onClick={onSwitchToLogin}>
                Hospital Login
              </span>
            </p>
          </div>

          <p className="terms-text">
            By registering, you agree to our <a href="#">Terms of Service</a> and <a href="#">Privacy Policy</a>
          </p>
        </div>
      </div>
    </div>
  );
};

export default HospitalSignup;