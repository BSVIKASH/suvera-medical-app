// src/pages/User/UserDashboard.js
import React, { useState } from 'react';
import '../../styles/Dashboard.css';

const UserDashboard = () => {
  const [activeModule, setActiveModule] = useState('dashboard');

  const renderModule = () => {
    switch(activeModule) {
      case 'emergency':
        return <EmergencyAssistance />;
      case 'nearby':
        return <NearbyHospitals />;
      case 'first-aid':
        return <FirstAidChatbot />;
      case 'profile':
        return <UserProfile />;
      default:
        return <DashboardHome />;
    }
  };

  return (
    <div className="dashboard-container">
      {/* Sidebar */}
      <aside className="sidebar">
        <div className="sidebar-header">
          <h2>🏥 Suvera </h2>
        </div>
        
        <nav className="sidebar-nav">
          <div className="nav-section">
            <h3>Main</h3>
            <button 
              className={`nav-btn ${activeModule === 'dashboard' ? 'active' : ''}`}
              onClick={() => setActiveModule('dashboard')}
            >
              <span className="nav-icon">📊</span>
              Dashboard
            </button>
          </div>

          <div className="nav-section">
            <h3>Services</h3>
            <button 
              className={`nav-btn ${activeModule === 'emergency' ? 'active' : ''}`}
              onClick={() => setActiveModule('emergency')}
            >
              <span className="nav-icon">🚨</span>
              Emergency Assistance
            </button>
            <button 
              className={`nav-btn ${activeModule === 'nearby' ? 'active' : ''}`}
              onClick={() => setActiveModule('nearby')}
            >
              <span className="nav-icon">📍</span>
              Nearby Hospitals
            </button>
            <button 
              className={`nav-btn ${activeModule === 'first-aid' ? 'active' : ''}`}
              onClick={() => setActiveModule('first-aid')}
            >
              <span className="nav-icon">🩹</span>
              First Aid Guide
            </button>
          </div>

          <div className="nav-section">
            <h3>Account</h3>
            <button 
              className={`nav-btn ${activeModule === 'profile' ? 'active' : ''}`}
              onClick={() => setActiveModule('profile')}
            >
              <span className="nav-icon">👤</span>
              My Profile
            </button>
          </div>
        </nav>
      </aside>

      {/* Main Content */}
      <main className="main-content">
        <header className="dashboard-header">
          <div className="header-title">
            <h1>Patient Dashboard</h1>
            <p>Welcome back, John Doe. Here's your health overview.</p>
          </div>
          <div className="header-actions">
            <button className="btn btn-outline">
              🔔 Notifications
            </button>
            <button className="btn btn-outline">
              ⚙️ Settings
            </button>
          </div>
        </header>

        {renderModule()}

        {/* SOS Button */}
        <button className="sos-btn">
          🆘
        </button>
      </main>
    </div>
  );
};

// Dashboard Home Component
const DashboardHome = () => {
  return (
    <div>
      {/* Stats Grid */}
      <div className="stats-grid">
        <div className="stat-card">
          <div className="stat-header">
            <div className="stat-title">Emergency Requests</div>
            <div className="stat-icon">🚨</div>
          </div>
          <div className="stat-value">12</div>
          <div className="stat-change">↑ 2 from yesterday</div>
        </div>

        <div className="stat-card warning">
          <div className="stat-header">
            <div className="stat-title">Pending Responses</div>
            <div className="stat-icon">⏳</div>
          </div>
          <div className="stat-value">3</div>
          <div className="stat-change">↓ 1 from yesterday</div>
        </div>

        <div className="stat-card success">
          <div className="stat-header">
            <div className="stat-title">Nearby Hospitals</div>
            <div className="stat-icon">🏥</div>
          </div>
          <div className="stat-value">8</div>
          <div className="stat-change">Within 5km radius</div>
        </div>

        <div className="stat-card danger">
          <div className="stat-header">
            <div className="stat-title">Critical Alerts</div>
            <div className="stat-icon">⚠️</div>
          </div>
          <div className="stat-value">1</div>
          <div className="stat-change">Requires attention</div>
        </div>
      </div>

      {/* Content Grid */}
      <div className="content-grid">
        {/* Left Column */}
        <div>
          {/* Recent Emergency Requests */}
          <div className="content-card">
            <div className="card-header">
              <h3>Recent Emergency Requests</h3>
              <div className="card-actions">
                <button className="btn btn-outline">View All</button>
              </div>
            </div>
            <div className="card-body">
              <table className="data-table">
                <thead>
                  <tr>
                    <th>Hospital</th>
                    <th>Status</th>
                    <th>Time</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td>City General Hospital</td>
                    <td><span className="status available">Accepted</span></td>
                    <td>10:30 AM</td>
                    <td>
                      <button className="btn btn-primary">View</button>
                    </td>
                  </tr>
                  <tr>
                    <td>Medicare Center</td>
                    <td><span className="status pending">Pending</span></td>
                    <td>09:15 AM</td>
                    <td>
                      <button className="btn btn-outline">Track</button>
                    </td>
                  </tr>
                  <tr>
                    <td>Emergency Care Unit</td>
                    <td><span className="status available">Accepted</span></td>
                    <td>Yesterday</td>
                    <td>
                      <button className="btn btn-primary">View</button>
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>

          {/* Quick Actions */}
          <div className="content-card">
            <div className="card-header">
              <h3>Quick Actions</h3>
            </div>
            <div className="card-body">
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))', gap: '1rem' }}>
                <button className="btn btn-primary" style={{ flexDirection: 'column', padding: '1rem' }}>
                  <span style={{ fontSize: '1.5rem' }}>🚨</span>
                  Emergency Help
                </button>
                <button className="btn btn-outline" style={{ flexDirection: 'column', padding: '1rem' }}>
                  <span style={{ fontSize: '1.5rem' }}>🏥</span>
                  Find Hospitals
                </button>
                <button className="btn btn-outline" style={{ flexDirection: 'column', padding: '1rem' }}>
                  <span style={{ fontSize: '1.5rem' }}>🩹</span>
                  First Aid
                </button>
                <button className="btn btn-outline" style={{ flexDirection: 'column', padding: '1rem' }}>
                  <span style={{ fontSize: '1.5rem' }}>📋</span>
                  My Records
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Right Column */}
        <div>
          {/* Hospital Categories */}
          <div className="content-card">
            <div className="card-header">
              <h3>Hospital Categories</h3>
            </div>
            <div className="card-body">
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                {['General', 'Cardiology', 'Emergency', 'Pediatrics', 'Surgery', 'Trauma', 'ICU', 'Diagnostics'].map(category => (
                  <div key={category} style={{
                    padding: '0.75rem',
                    background: '#f8f9fa',
                    borderRadius: '6px',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.5rem',
                    fontSize: '0.9rem'
                  }}>
                    <span>🏥</span>
                    {category}
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Emergency Contacts */}
          <div className="content-card">
            <div className="card-header">
              <h3>Emergency Contacts</h3>
            </div>
            <div className="card-body">
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                  <div style={{ width: '32px', height: '32px', background: '#3498db', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', fontSize: '0.8rem' }}>
                    DR
                  </div>
                  <div>
                    <div style={{ fontWeight: '600' }}>Dr. Smith</div>
                    <div style={{ fontSize: '0.8rem', color: '#7f8c8d' }}>Cardiologist</div>
                  </div>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                  <div style={{ width: '32px', height: '32px', background: '#e74c3c', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', fontSize: '0.8rem' }}>
                    ER
                  </div>
                  <div>
                    <div style={{ fontWeight: '600' }}>Emergency Room </div>
                    <div style={{ fontSize: '0.8rem', color: '#7f8c8d' }}>24/7 Available</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

// Other components remain similar but with updated styling
const EmergencyAssistance = () => {
  const [symptoms, setSymptoms] = useState('');
  const [hospitals, setHospitals] = useState([]);

  const handleSearch = () => {
    const mockHospitals = [
      { name: 'City General Hospital', distance: '2.3 km', beds: 15, rating: 4.5, status: 'available' },
      { name: 'Medicare Center', distance: '3.1 km', beds: 8, rating: 4.2, status: 'busy' },
      { name: 'Emergency Care Unit', distance: '1.7 km', beds: 5, rating: 4.7, status: 'available' }
    ];
    setHospitals(mockHospitals);
  };

  return (
    <div>
      <div className="content-card">
        <div className="card-header">
          <h3>🚨 Emergency Assistance</h3>
        </div>
        <div className="card-body">
          <div className="form-group">
            <label className="form-label">Describe Your Symptoms</label>
            <textarea 
              className="form-input"
              rows="4"
              value={symptoms}
              onChange={(e) => setSymptoms(e.target.value)}
              placeholder="Please describe your symptoms in detail..."
            />
          </div>
          <button onClick={handleSearch} className="btn btn-primary">
            Search Nearby Hospitals
          </button>

          {hospitals.length > 0 && (
            <div style={{ marginTop: '2rem' }}>
              <h4 style={{ marginBottom: '1rem' }}>Recommended Hospitals</h4>
              {hospitals.map((hospital, index) => (
                <div key={index} className="content-card" style={{ marginBottom: '1rem', padding: '1rem' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div>
                      <h4>{hospital.name}</h4>
                      <p>📍 {hospital.distance} | 🛏️ {hospital.beds} beds | ⭐ {hospital.rating}</p>
                    </div>
                    <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
                      <span className={`status ${hospital.status}`}>
                        {hospital.status === 'available' ? 'Available' : 'Busy'}
                      </span>
                      <button className="btn btn-primary">Get Directions</button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

const NearbyHospitals = () => {
  return (
    <div className="content-card">
      <div className="card-header">
        <h3>📍 Nearby Hospitals</h3>
      </div>
      <div className="card-body">
        <p>Hospital map and detailed list will appear here</p>
      </div>
    </div>
  );
};

const FirstAidChatbot = () => {
  const [message, setMessage] = useState('');
  const [chat, setChat] = useState([]);

  const handleSend = () => {
    if (message.trim()) {
      const newChat = [...chat, { type: 'user', text: message }];
      setTimeout(() => {
        setChat([...newChat, { 
          type: 'bot', 
          text: 'Based on WHO guidelines, here are the immediate steps...' 
        }]);
      }, 1000);
      setChat(newChat);
      setMessage('');
    }
  };

  return (
    <div className="content-card">
      <div className="card-header">
        <h3>🩹 First Aid Chatbot</h3>
      </div>
      <div className="card-body">
        <div style={{ height: '400px', border: '1px solid #bdc3c7', borderRadius: '8px', display: 'flex', flexDirection: 'column' }}>
          <div style={{ flex: 1, padding: '1rem', overflowY: 'auto' }}>
            {chat.map((msg, index) => (
              <div key={index} style={{ 
                marginBottom: '1rem', 
                padding: '1rem', 
                borderRadius: '8px',
                background: msg.type === 'user' ? '#3498db' : '#ecf0f1',
                color: msg.type === 'user' ? 'white' : '#2c3e50',
                marginLeft: msg.type === 'user' ? 'auto' : '0',
                maxWidth: '70%'
              }}>
                {msg.text}
              </div>
            ))}
          </div>
          <div style={{ display: 'flex', padding: '1rem', borderTop: '1px solid #bdc3c7' }}>
            <input
              type="text"
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder="Ask about first aid..."
              style={{ flex: 1, padding: '0.75rem', border: '1px solid #bdc3c7', borderRadius: '6px', marginRight: '1rem' }}
              onKeyPress={(e) => e.key === 'Enter' && handleSend()}
            />
            <button onClick={handleSend} className="btn btn-primary">
              Send
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

const UserProfile = () => {
  return (
    <div className="content-card">
      <div className="card-header">
        <h3>👤 User Profile</h3>
      </div>
      <div className="card-body">
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '2rem' }}>
          <div>
            <h4 style={{ marginBottom: '1rem' }}>Personal Information</h4>
            <div className="form-group">
              <label className="form-label">Full Name</label>
              <input type="text" className="form-input" value="John Doe" readOnly />
            </div>
            <div className="form-group">
              <label className="form-label">Age</label>
              <input type="number" className="form-input" value="30" readOnly />
            </div>
            <div className="form-group">
              <label className="form-label">Blood Group</label>
              <input type="text" className="form-input" value="O+" readOnly />
            </div>
          </div>
          <div>
            <h4 style={{ marginBottom: '1rem' }}>Contact Information</h4>
            <div className="form-group">
              <label className="form-label">Phone Number</label>
              <input type="tel" className="form-input" value="+1234567890" readOnly />
            </div>
            <div className="form-group">
              <label className="form-label">Emergency Contact</label>
              <input type="tel" className="form-input" value="+1987654321" readOnly />
            </div>
            <button className="btn btn-outline" style={{ marginTop: '1rem' }}>
              Edit Profile
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default UserDashboard;