// src/pages/Hospital/HospitalDashboard.js
import React, { useState, useEffect } from 'react';
import api from '../../api'; // ✅ Connects to your C# Backend
import '../../styles/Dashboard.css'; // ✅ Uses your custom CSS

const HospitalDashboard = ({ onLogout }) => {
  const [activeModule, setActiveModule] = useState('dashboard');

  const menuItems = [
    { key: 'dashboard', icon: '📊', label: 'Dashboard', description: 'Hospital overview' },
    { key: 'doctors', icon: '👨‍⚕️', label: 'Doctors', description: 'Staff management' },
    { key: 'facilities', icon: '🏗️', label: 'Facilities', description: 'Resources' },
    { key: 'beds', icon: '🛏️', label: 'Beds', description: 'Availability' },
    { key: 'emergency', icon: '🚨', label: 'Emergency', description: 'Requests' },
  ];

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
          <div className="logo-icon">🏥</div>
          <div className="app-name">Suvera</div>
        </div>
        
        <nav className="sidebar-nav">
          {menuItems.map((item) => (
            <button 
              key={item.key}
              className={`nav-item ${activeModule === item.key ? 'active' : ''}`}
              onClick={() => setActiveModule(item.key)}
            >
              <span className="nav-icon">{item.icon}</span>
              <div className="nav-text">
                <span className="nav-label">{item.label}</span>
                <span className="nav-desc">{item.description}</span>
              </div>
            </button>
          ))}
        </nav>

        <div className="sidebar-footer">
          <button className="nav-item logout-btn" onClick={onLogout}>
            <span className="nav-icon">🚪</span>
            <div className="nav-text">
              <span className="nav-label">Logout</span>
            </div>
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="main-content-area">
        <header className="top-header">
          <div className="header-greeting">
            <h1>
              {menuItems.find(item => item.key === activeModule)?.label || 'Hospital Dashboard'}
            </h1>
            <p>
              {menuItems.find(item => item.key === activeModule)?.description || 'Hospital management overview'}
            </p>
          </div>
          <div className="header-actions">
            <button className="notif-btn" title="Notifications">🔔</button>
            <div className="user-avatar">H</div>
          </div>
        </header>

        <div className="content-scrollable">
          {renderModule()}
        </div>
      </main>
    </div>
  );
};


/* =========================================
   COMPONENT: DOCTOR MANAGEMENT (CONNECTED TO DB)
   ========================================= */
const DoctorManagement = () => {
  const [doctors, setDoctors] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  // Form State - Matches Swagger Requirements
  const [newDoctor, setNewDoctor] = useState({
    name: '',
    specialization: '',
    contactNumber: '',
    licenceNumber: '', // ✅ Required by Backend
    status: 'Available' // Kept for UI, though Backend might not store it yet
  });

  // 1. Fetch Doctors from Database
  useEffect(() => {
    fetchDoctors();
  }, []);

  const fetchDoctors = async () => {
    try {
      const response = await api.get('/Doctors');
      setDoctors(response.data);
    } catch (error) {
      console.error("Error fetching doctors:", error);
      if(error.response?.status === 401) alert("Session expired. Please logout and login again.");
    }
  };

  // 2. Handle Input Changes
  const handleInputChange = (e) => {
    setNewDoctor({ ...newDoctor, [e.target.name]: e.target.value });
  };

  // 3. Submit New Doctor to Backend
  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);

    // 👇 Prepare Payload: Map 'contactNumber' to 'phoneNumber'
    const payload = {
      name: newDoctor.name,
      specialization: newDoctor.specialization,
      licenceNumber: newDoctor.licenceNumber, // ✅ Sending License
      phoneNumber: newDoctor.contactNumber    // ✅ Mapping to match DB column 'PhoneNumber'
    };

    try {
      await api.post('/Doctors', payload);
      alert("Doctor Added Successfully!");
      
      // Reset Form & Refresh List
      setShowForm(false);
      setNewDoctor({ name: '', specialization: '', contactNumber: '', licenceNumber: '', status: 'Available' });
      fetchDoctors(); 
    } catch (error) {
      console.error("Error adding doctor:", error);
      alert("Failed to add doctor: " + (error.response?.data?.title || "Check console for details"));
    } finally {
      setIsLoading(false);
    }
  };

  // 4. Delete Doctor
  const handleDelete = async (id) => {
    if(!window.confirm("Are you sure you want to remove this doctor?")) return;
    try {
      await api.delete(`/Doctors/${id}`);
      fetchDoctors();
    } catch (error) {
      console.error("Error deleting doctor:", error);
      alert("Failed to delete doctor.");
    }
  };

  return (
    <div className="card standard-card" style={{ cursor: 'default' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
        <h3>👨‍⚕️ Doctor Management</h3>
        <button 
          className="ai-analyze-btn" 
          onClick={() => setShowForm(!showForm)}
          style={{ padding: '8px 20px', fontSize: '0.9rem' }}
        >
          {showForm ? 'Cancel' : '+ Add Doctor'}
        </button>
      </div>

      {/* --- ADD DOCTOR FORM --- */}
      {showForm && (
        <form onSubmit={handleSubmit} style={{ background: '#f8fafc', padding: '20px', borderRadius: '12px', marginBottom: '20px', border: '1px solid #e2e8f0' }}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px' }}>
            
            {/* Name */}
            <div>
              <label style={{ display: 'block', marginBottom: '5px', fontSize: '0.9rem', color: '#64748b' }}>Name</label>
              <input 
                name="name" 
                value={newDoctor.name} 
                onChange={handleInputChange} 
                className="ai-input" 
                style={{ width: '100%', border: '1px solid #cbd5e1', padding: '10px', borderRadius: '8px' }}
                placeholder="Dr. Name" 
                required 
              />
            </div>

            {/* Specialization */}
            <div>
              <label style={{ display: 'block', marginBottom: '5px', fontSize: '0.9rem', color: '#64748b' }}>Specialization</label>
              <input 
                name="specialization" 
                value={newDoctor.specialization} 
                onChange={handleInputChange} 
                className="ai-input" 
                style={{ width: '100%', border: '1px solid #cbd5e1', padding: '10px', borderRadius: '8px' }}
                placeholder="e.g. Cardiology" 
                required 
              />
            </div>

            {/* License Number */}
            <div>
              <label style={{ display: 'block', marginBottom: '5px', fontSize: '0.9rem', color: '#64748b' }}>License Number</label>
              <input 
                name="licenceNumber" 
                value={newDoctor.licenceNumber} 
                onChange={handleInputChange} 
                className="ai-input" 
                style={{ width: '100%', border: '1px solid #cbd5e1', padding: '10px', borderRadius: '8px' }}
                placeholder="LIC-12345" 
                required 
              />
            </div>

            {/* Contact */}
            <div>
              <label style={{ display: 'block', marginBottom: '5px', fontSize: '0.9rem', color: '#64748b' }}>Contact Number</label>
              <input 
                name="contactNumber" 
                value={newDoctor.contactNumber} 
                onChange={handleInputChange} 
                className="ai-input" 
                style={{ width: '100%', border: '1px solid #cbd5e1', padding: '10px', borderRadius: '8px' }}
                placeholder="Phone Number" 
                required 
              />
            </div>

          </div>
          <button type="submit" className="ai-analyze-btn" style={{ marginTop: '15px', width: '100%' }} disabled={isLoading}>
            {isLoading ? 'Saving...' : 'Save Doctor'}
          </button>
        </form>
      )}

      {/* --- DOCTOR LIST TABLE --- */}
      <div style={{ overflowX: 'auto' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', marginTop: '10px' }}>
          <thead>
            <tr style={{ textAlign: 'left', borderBottom: '2px solid #f1f5f9', color: '#64748b' }}>
              <th style={{ padding: '12px' }}>Name</th>
              <th style={{ padding: '12px' }}>Specialization</th>
              <th style={{ padding: '12px' }}>License</th>
              <th style={{ padding: '12px' }}>Contact</th>
              <th style={{ padding: '12px' }}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {doctors.length === 0 ? (
              <tr><td colSpan="5" style={{ padding: '20px', textAlign: 'center', color: '#94a3b8' }}>No doctors found. Add one above!</td></tr>
            ) : (
              doctors.map(doctor => (
                // Handle 'id' vs 'doctorId' depending on backend response
                <tr key={doctor.doctorId || doctor.id} style={{ borderBottom: '1px solid #f1f5f9' }}>
                  <td style={{ padding: '12px', fontWeight: '500' }}>{doctor.name}</td>
                  <td style={{ padding: '12px' }}>{doctor.specialization}</td>
                  <td style={{ padding: '12px' }}>{doctor.licenceNumber}</td>
                  <td style={{ padding: '12px' }}>{doctor.phoneNumber}</td>
                  <td style={{ padding: '12px' }}>
                    <button 
                      onClick={() => handleDelete(doctor.doctorId || doctor.id)}
                      style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#ef4444' }}
                      title="Remove Doctor"
                    >
                      🗑️
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

/* =========================================
   COMPONENT: DASHBOARD HOME
   ========================================= */
const HospitalDashboardHome = () => {
  return (
    <div className="dashboard-home">
      {/* Stats Grid */}
      <div className="stats-container">
        <div className="stat-card">
          <div className="stat-value" style={{ color: '#4f46e5' }}>150</div>
          <div className="stat-label">Total Beds</div>
          <div style={{ fontSize: '0.8rem', color: '#22c55e', marginTop: '5px' }}>85% Capacity</div>
        </div>

        <div className="stat-card">
          <div className="stat-value" style={{ color: '#22c55e' }}>45</div>
          <div className="stat-label">Available Beds</div>
          <div style={{ fontSize: '0.8rem', color: '#22c55e', marginTop: '5px' }}>Ready for patients</div>
        </div>

        <div className="stat-card">
          <div className="stat-value" style={{ color: '#ef4444' }}>12</div>
          <div className="stat-label">Emergency Req</div>
          <div style={{ fontSize: '0.8rem', color: '#ef4444', marginTop: '5px' }}>↑ 3 New requests</div>
        </div>
      </div>

      {/* Recent Emergency Requests */}
      <div className="card standard-card">
        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '15px' }}>
          <h3>🚨 Recent Emergency Requests</h3>
          <button style={{ background: 'none', border: 'none', color: '#4f46e5', cursor: 'pointer', fontWeight: 'bold' }}>View All</button>
        </div>
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead>
            <tr style={{ textAlign: 'left', color: '#64748b', borderBottom: '1px solid #e2e8f0' }}>
              <th style={{ padding: '10px' }}>Patient</th>
              <th style={{ padding: '10px' }}>Condition</th>
              <th style={{ padding: '10px' }}>Status</th>
              <th style={{ padding: '10px' }}>Action</th>
            </tr>
          </thead>
          <tbody>
            <tr style={{ borderBottom: '1px solid #f1f5f9' }}>
              <td style={{ padding: '10px' }}>John Doe</td>
              <td style={{ padding: '10px' }}>Chest Pain</td>
              <td style={{ padding: '10px' }}><span style={{ color: '#d97706', background: '#fef3c7', padding: '3px 8px', borderRadius: '10px', fontSize: '0.8rem' }}>Pending</span></td>
              <td style={{ padding: '10px' }}>
                <button style={{ marginRight: '5px', border: 'none', background: '#22c55e', color: 'white', padding: '5px 10px', borderRadius: '5px', cursor: 'pointer' }}>✓</button>
                <button style={{ border: 'none', background: '#ef4444', color: 'white', padding: '5px 10px', borderRadius: '5px', cursor: 'pointer' }}>✕</button>
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      {/* Facility Status */}
      <div className="card standard-card">
        <h3>🏥 Facility Status</h3>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr 1fr', gap: '15px', marginTop: '15px', textAlign: 'center' }}>
          <div>
            <div style={{ fontSize: '1.2rem', fontWeight: 'bold', color: '#3b82f6' }}>ICU</div>
            <div style={{ fontSize: '0.85rem', color: '#64748b' }}>12/15</div>
          </div>
          <div>
            <div style={{ fontSize: '1.2rem', fontWeight: 'bold', color: '#22c55e' }}>OT</div>
            <div style={{ fontSize: '0.85rem', color: '#64748b' }}>4/6</div>
          </div>
          <div>
            <div style={{ fontSize: '1.2rem', fontWeight: 'bold', color: '#ef4444' }}>ER</div>
            <div style={{ fontSize: '0.85rem', color: '#64748b' }}>8/10</div>
          </div>
          <div>
            <div style={{ fontSize: '1.2rem', fontWeight: 'bold', color: '#f59e0b' }}>WARD</div>
            <div style={{ fontSize: '0.85rem', color: '#64748b' }}>45/60</div>
          </div>
        </div>
      </div>
    </div>
  );
};

/* =========================================
   OTHER COMPONENTS (Static Placeholders)
   ========================================= */
const FacilityManagement = () => (
  <div className="card standard-card">
    <h3>🏗️ Facility Management</h3>
    <p style={{ color: '#64748b', marginTop: '10px' }}>Manage hospital infrastructure, OTs, and equipment here.</p>
  </div>
);

const BedManagement = () => (
  <div className="card standard-card">
    <h3>🛏️ Bed Management</h3>
    <div style={{ marginTop: '20px' }}>
       <div style={{ marginBottom: '15px' }}>
         <label style={{ display: 'block', marginBottom: '5px' }}>Total Beds</label>
         <input type="number" defaultValue={150} className="ai-input" style={{ border: '1px solid #cbd5e1', padding: '8px', borderRadius: '8px' }} />
       </div>
    </div>
  </div>
);

const EmergencyRequests = () => (
  <div className="card standard-card">
    <h3>🚨 Emergency Requests</h3>
    <p style={{ color: '#64748b', marginTop: '10px' }}>Live incoming emergency requests from patients.</p>
  </div>
);

export default HospitalDashboard;