// src/pages/Hospital/HospitalDashboard.js
import React, { useState } from 'react';
import '../../styles/Dashboard.css';

const HospitalDashboard = () => {
  const [activeModule, setActiveModule] = useState('dashboard');

  const renderModule = () => {
    switch(activeModule) {
      case 'doctors':
        return <DoctorManagement />;
      case 'facilities':
        return <FacilityManagement />;
      case 'beds':
        return <BedManagement />;
      case 'emergency':
        return <EmergencyRequests />;
      default:
        return <HospitalDashboardHome />;
    }
  };

  return (
    <div className="dashboard-container">
      {/* Sidebar */}
      <aside className="sidebar">
        <div className="sidebar-header">
          <h2>🏥 COCO HEALTH</h2>
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
            <h3>Management</h3>
            <button 
              className={`nav-btn ${activeModule === 'doctors' ? 'active' : ''}`}
              onClick={() => setActiveModule('doctors')}
            >
              <span className="nav-icon">👨‍⚕️</span>
              Doctor Management
            </button>
            <button 
              className={`nav-btn ${activeModule === 'facilities' ? 'active' : ''}`}
              onClick={() => setActiveModule('facilities')}
            >
              <span className="nav-icon">🏗️</span>
              Facility Management
            </button>
            <button 
              className={`nav-btn ${activeModule === 'beds' ? 'active' : ''}`}
              onClick={() => setActiveModule('beds')}
            >
              <span className="nav-icon">🛏️</span>
              Bed Management
            </button>
          </div>

          <div className="nav-section">
            <h3>Emergency</h3>
            <button 
              className={`nav-btn ${activeModule === 'emergency' ? 'active' : ''}`}
              onClick={() => setActiveModule('emergency')}
            >
              <span className="nav-icon">🚨</span>
              Emergency Requests
            </button>
          </div>
        </nav>
      </aside>

      {/* Main Content */}
      <main className="main-content">
        <header className="dashboard-header">
          <div className="header-title">
            <h1>Hospital Admin Dashboard</h1>
            <p>City General Hospital - Administrator Panel</p>
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
      </main>
    </div>
  );
};

const HospitalDashboardHome = () => {
  return (
    <div>
      {/* Stats Grid */}
      <div className="stats-grid">
        <div className="stat-card">
          <div className="stat-header">
            <div className="stat-title">Total Beds</div>
            <div className="stat-icon">🛏️</div>
          </div>
          <div className="stat-value">150</div>
          <div className="stat-change">Capacity: 85%</div>
        </div>

        <div className="stat-card warning">
          <div className="stat-header">
            <div className="stat-title">Available Beds</div>
            <div className="stat-icon">✅</div>
          </div>
          <div className="stat-value">45</div>
          <div className="stat-change">30% available</div>
        </div>

        <div className="stat-card success">
          <div className="stat-header">
            <div className="stat-title">Emergency Requests</div>
            <div className="stat-icon">🚨</div>
          </div>
          <div className="stat-value">12</div>
          <div className="stat-change">↑ 3 today</div>
        </div>

        <div className="stat-card danger">
          <div className="stat-header">
            <div className="stat-title">Doctors On Duty</div>
            <div className="stat-icon">👨‍⚕️</div>
          </div>
          <div className="stat-value">28</div>
          <div className="stat-change">15 specialists</div>
        </div>
      </div>

      {/* Content Grid */}
      <div className="content-grid">
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
                    <th>Patient</th>
                    <th>Condition</th>
                    <th>Distance</th>
                    <th>Status</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td>John Doe</td>
                    <td>Heart Attack</td>
                    <td>2.3 km</td>
                    <td><span className="status pending">Pending</span></td>
                    <td>
                      <button className="btn btn-success" style={{ marginRight: '0.5rem' }}>Accept</button>
                      <button className="btn btn-danger">Reject</button>
                    </td>
                  </tr>
                  <tr>
                    <td>Jane Smith</td>
                    <td>Fracture</td>
                    <td>3.1 km</td>
                    <td><span className="status available">Accepted</span></td>
                    <td>
                      <button className="btn btn-primary">View</button>
                    </td>
                  </tr>
                  <tr>
                    <td>Mike Johnson</td>
                    <td>Respiratory</td>
                    <td>1.7 km</td>
                    <td><span className="status pending">Pending</span></td>
                    <td>
                      <button className="btn btn-success" style={{ marginRight: '0.5rem' }}>Accept</button>
                      <button className="btn btn-danger">Reject</button>
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </div>

        <div>
          {/* Doctor Availability */}
          <div className="content-card">
            <div className="card-header">
              <h3>Doctor Availability</h3>
            </div>
            <div className="card-body">
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span>Cardiology</span>
                  <span className="status available">3 Available</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span>Emergency</span>
                  <span className="status busy">2 Busy</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span>Surgery</span>
                  <span className="status available">4 Available</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span>Pediatrics</span>
                  <span className="status available">2 Available</span>
                </div>
              </div>
            </div>
          </div>

          {/* Quick Stats */}
          <div className="content-card">
            <div className="card-header">
              <h3>Facility Status</h3>
            </div>
            <div className="card-body">
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                <div style={{ textAlign: 'center' }}>
                  <div style={{ fontSize: '1.5rem', fontWeight: 'bold', color: '#3498db' }}>ICU</div>
                  <div style={{ fontSize: '0.8rem', color: '#7f8c8d' }}>12/15 Beds</div>
                </div>
                <div style={{ textAlign: 'center' }}>
                  <div style={{ fontSize: '1.5rem', fontWeight: 'bold', color: '#27ae60' }}>OT</div>
                  <div style={{ fontSize: '0.8rem', color: '#7f8c8d' }}>4/6 Rooms</div>
                </div>
                <div style={{ textAlign: 'center' }}>
                  <div style={{ fontSize: '1.5rem', fontWeight: 'bold', color: '#e74c3c' }}>ER</div>
                  <div style={{ fontSize: '0.8rem', color: '#7f8c8d' }}>8/10 Beds</div>
                </div>
                <div style={{ textAlign: 'center' }}>
                  <div style={{ fontSize: '1.5rem', fontWeight: 'bold', color: '#f39c12' }}>WARD</div>
                  <div style={{ fontSize: '0.8rem', color: '#7f8c8d' }}>45/60 Beds</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

// Other hospital components (DoctorManagement, FacilityManagement, etc.) would follow similar COCO theme structure

const DoctorManagement = () => {
  const [doctors, setDoctors] = useState([
    { id: 1, name: 'Dr. Smith', specialization: 'Cardiology', status: 'Available', contact: '+1234567890' },
    { id: 2, name: 'Dr. Johnson', specialization: 'Emergency', status: 'Busy', contact: '+1234567891' },
    { id: 3, name: 'Dr. Williams', specialization: 'Surgery', status: 'Available', contact: '+1234567892' }
  ]);

  return (
    <div className="content-card">
      <div className="card-header">
        <h3>👨‍⚕️ Doctor Management</h3>
        <div className="card-actions">
          <button className="btn btn-primary">+ Add Doctor</button>
        </div>
      </div>
      <div className="card-body">
        <table className="data-table">
          <thead>
            <tr>
              <th>Name</th>
              <th>Specialization</th>
              <th>Contact</th>
              <th>Status</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {doctors.map(doctor => (
              <tr key={doctor.id}>
                <td>{doctor.name}</td>
                <td>{doctor.specialization}</td>
                <td>{doctor.contact}</td>
                <td>
                  <span className={`status ${doctor.status.toLowerCase()}`}>
                    {doctor.status}
                  </span>
                </td>
                <td>
                  <button className="btn btn-outline" style={{ marginRight: '0.5rem' }}>Edit</button>
                  <button className="btn btn-danger">Remove</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

const FacilityManagement = () => {
  return (
    <div className="content-card">
      <div className="card-header">
        <h3>🏗️ Facility Management</h3>
      </div>
      <div className="card-body">
        <p>Facility management interface with COCO theme styling</p>
      </div>
    </div>
  );
};

const BedManagement = () => {
  const [availableBeds, setAvailableBeds] = useState(45);
  const [totalBeds, setTotalBeds] = useState(150);

  return (
    <div className="content-card">
      <div className="card-header">
        <h3>🛏️ Bed Management</h3>
      </div>
      <div className="card-body">
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '2rem' }}>
          <div className="form-group">
            <label className="form-label">Total Beds</label>
            <input 
              type="number" 
              className="form-input"
              value={totalBeds}
              onChange={(e) => setTotalBeds(e.target.value)}
            />
          </div>
          <div className="form-group">
            <label className="form-label">Available Beds</label>
            <input 
              type="number" 
              className="form-input"
              value={availableBeds}
              onChange={(e) => setAvailableBeds(e.target.value)}
            />
          </div>
        </div>
        <div style={{ marginTop: '2rem', padding: '1rem', background: '#f8f9fa', borderRadius: '8px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span>Bed Occupancy Rate</span>
            <span style={{ fontWeight: 'bold', color: availableBeds/totalBeds < 0.2 ? '#e74c3c' : '#27ae60' }}>
              {Math.round((1 - availableBeds/totalBeds) * 100)}%
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};

const EmergencyRequests = () => {
  const [requests, setRequests] = useState([
    { id: 1, patient: 'John Doe', condition: 'Heart Attack', distance: '2.3 km', status: 'Pending' },
    { id: 2, patient: 'Jane Smith', condition: 'Fracture', distance: '3.1 km', status: 'Pending' },
    { id: 3, patient: 'Mike Johnson', condition: 'Respiratory', distance: '1.7 km', status: 'Accepted' }
  ]);

  const handleAccept = (id) => {
    setRequests(requests.map(req => 
      req.id === id ? { ...req, status: 'Accepted' } : req
    ));
  };

  const handleReject = (id) => {
    setRequests(requests.map(req => 
      req.id === id ? { ...req, status: 'Rejected' } : req
    ));
  };

  return (
    <div className="content-card">
      <div className="card-header">
        <h3>🚨 Emergency Requests</h3>
      </div>
      <div className="card-body">
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          {requests.map(request => (
            <div key={request.id} style={{ 
              padding: '1.5rem', 
              border: '1px solid #bdc3c7', 
              borderRadius: '8px',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center'
            }}>
              <div>
                <h4 style={{ marginBottom: '0.5rem' }}>{request.patient}</h4>
                <p style={{ marginBottom: '0.25rem', color: '#7f8c8d' }}>Condition: {request.condition}</p>
                <p style={{ color: '#7f8c8d' }}>Distance: {request.distance}</p>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                <span className={`status ${request.status.toLowerCase()}`}>
                  {request.status}
                </span>
                {request.status === 'Pending' && (
                  <div style={{ display: 'flex', gap: '0.5rem' }}>
                    <button 
                      onClick={() => handleAccept(request.id)}
                      className="btn btn-success"
                    >
                      Accept
                    </button>
                    <button 
                      onClick={() => handleReject(request.id)}
                      className="btn btn-danger"
                    >
                      Reject
                    </button>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default HospitalDashboard;