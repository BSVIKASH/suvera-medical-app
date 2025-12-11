// src/pages/Hospital/HospitalDashboard.js
import React, { useState, useEffect } from 'react';
import api from '../../api'; // Ensure this points to your Axios instance
import '../../styles/Dashboard.css';

/* =========================================
   MAIN PARENT COMPONENT
   ========================================= */
const HospitalDashboard = ({ onLogout }) => {
  const [activeModule, setActiveModule] = useState('dashboard');

  // --- 🛏️ LIFTED STATE FOR BED STATS ---
  // This state is shared between 'Dashboard Home' and 'Bed Management'
  const [bedStats, setBedStats] = useState({
    totalBeds: 150,
    occupiedBeds: 105
  });

  // Function to update beds (Passed down to BedManagement)
  const handleBedUpdate = (newTotal, newOccupied) => {
    setBedStats({
      totalBeds: parseInt(newTotal) || 0,
      occupiedBeds: parseInt(newOccupied) || 0
    });
    // Optional: Call API here to persist bed stats to DB
    // api.post('/Hospital/Beds', { total: newTotal, occupied: newOccupied });
  };

  const menuItems = [
    { key: 'dashboard', icon: '📊', label: 'Dashboard', description: 'Hospital overview' },
    { key: 'doctors', icon: '👨‍⚕️', label: 'Doctors', description: 'Staff management' },
    { key: 'facilities', icon: '🏗️', label: 'Facilities', description: 'Resources' },
    { key: 'beds', icon: '🛏️', label: 'Beds', description: 'Availability' },
    { key: 'emergency', icon: '🚨', label: 'Emergency', description: 'Requests' },
  ];

  // Render the active module based on selection
  const renderModule = () => {
    switch(activeModule) {
      case 'doctors':
        return <DoctorManagement />;
      case 'facilities':
        return <FacilityManagement />;
      case 'beds':
        // Pass state and update function down
        return <BedManagement currentStats={bedStats} onUpdate={handleBedUpdate} />;
      case 'emergency':
        return <EmergencyRequests />;
      default:
        // Pass state down for display
        return <HospitalDashboardHome stats={bedStats} />;
    }
  };

  return (
    <div className="dashboard-container">
      {/* --- SIDEBAR --- */}
      <aside className="sidebar">
        <div className="sidebar-header">
          <div className="logo-icon">🏥</div>
          <div className="app-name">Medipath</div>
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
            <span className="nav-label">Logout</span>
          </button>
        </div>
      </aside>

      {/* --- MAIN CONTENT --- */}
      <main className="main-content-area">
        <header className="top-header">
          <div className="header-greeting">
            <h1>{menuItems.find(item => item.key === activeModule)?.label || 'Dashboard'}</h1>
            <p>{menuItems.find(item => item.key === activeModule)?.description}</p>
          </div>
          <div className="header-actions">
            <button className="notif-btn">🔔</button>
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
   1. DASHBOARD HOME (DYNAMIC STATS)
   ========================================= */
const HospitalDashboardHome = ({ stats }) => {
  // Calculate availability dynamically based on props
  const available = stats.totalBeds - stats.occupiedBeds;
  const percentage = stats.totalBeds > 0 ? Math.round((stats.occupiedBeds / stats.totalBeds) * 100) : 0;

  return (
    <div className="dashboard-home">
      {/* Stats Grid */}
      <div className="stats-container">
        {/* Total Beds */}
        <div className="stat-card">
          <div className="stat-value" style={{ color: '#4f46e5' }}>{stats.totalBeds}</div>
          <div className="stat-label">Total Beds</div>
          <div style={{ fontSize: '0.8rem', color: '#64748b', marginTop: '5px' }}>
            {percentage}% Occupancy
          </div>
        </div>

        {/* Available Beds (Dynamic Color) */}
        <div className="stat-card">
          <div className="stat-value" style={{ color: available < 10 ? '#ef4444' : '#22c55e' }}>
            {available}
          </div>
          <div className="stat-label">Available Beds</div>
          <div style={{ fontSize: '0.8rem', color: '#64748b', marginTop: '5px' }}>
            Ready for patients
          </div>
        </div>

        {/* Emergency Requests */}
        <div className="stat-card">
          <div className="stat-value" style={{ color: '#ef4444' }}>12</div>
          <div className="stat-label">Emergency Req</div>
          <div style={{ fontSize: '0.8rem', color: '#ef4444', marginTop: '5px' }}>↑ 3 New requests</div>
        </div>
      </div>

      {/* Emergency Table */}
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
    </div>
  );
};

/* =========================================
   2. DOCTOR MANAGEMENT (CRUD)
   ========================================= */
const DoctorManagement = () => {
  const [doctors, setDoctors] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [editingId, setEditingId] = useState(null);

  const [doctorForm, setDoctorForm] = useState({
    name: '', specialization: '', contactNumber: '', licenceNumber: ''
  });

  useEffect(() => { fetchDoctors(); }, []);

  const fetchDoctors = async () => {
    try {
      const response = await api.get('/Doctors');
      setDoctors(response.data);
    } catch (error) { console.error(error); }
  };

  const handleInputChange = (e) => setDoctorForm({ ...doctorForm, [e.target.name]: e.target.value });

  const handleEdit = (doctor) => {
    setEditingId(doctor.doctorId);
    setDoctorForm({
      name: doctor.name,
      specialization: doctor.specialization,
      contactNumber: doctor.phoneNumber,
      licenceNumber: doctor.licenceNumber
    });
    setShowForm(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    const payload = {
      name: doctorForm.name,
      specialization: doctorForm.specialization,
      licenceNumber: doctorForm.licenceNumber,
      phoneNumber: doctorForm.contactNumber
    };

    try {
      if (editingId) {
        await api.put(`/Doctors/${editingId}`, payload);
      } else {
        await api.post('/Doctors', payload);
      }
      setDoctorForm({ name: '', specialization: '', contactNumber: '', licenceNumber: '' });
      setEditingId(null);
      setShowForm(false);
      fetchDoctors();
    } catch (error) { alert("Operation failed"); } 
    finally { setIsLoading(false); }
  };

  const handleDelete = async (id) => {
    if(!window.confirm("Delete doctor?")) return;
    try { await api.delete(`/Doctors/${id}`); fetchDoctors(); } catch(e) {}
  };

  return (
    <div className="card standard-card">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
        <h3>👨‍⚕️ Doctor Management</h3>
        <button className="ai-analyze-btn" onClick={() => setShowForm(!showForm)}>
            {showForm ? 'Cancel' : '+ Add Doctor'}
        </button>
      </div>

      {showForm && (
        <form onSubmit={handleSubmit} style={{ background: '#f8fafc', padding: '20px', borderRadius: '10px', marginBottom: '20px' }}>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px' }}>
                <input name="name" value={doctorForm.name} onChange={handleInputChange} placeholder="Name" className="ai-input" required />
                <input name="specialization" value={doctorForm.specialization} onChange={handleInputChange} placeholder="Specialization (e.g. Cardiology)" className="ai-input" required />
                <input name="licenceNumber" value={doctorForm.licenceNumber} onChange={handleInputChange} placeholder="Licence No" className="ai-input" required />
                <input name="contactNumber" value={doctorForm.contactNumber} onChange={handleInputChange} placeholder="Phone" className="ai-input" required />
            </div>
            <button type="submit" className="ai-analyze-btn" style={{ marginTop: '15px', width: '100%' }}>
                {isLoading ? 'Saving...' : 'Save Doctor'}
            </button>
        </form>
      )}

      <table style={{ width: '100%', borderCollapse: 'collapse' }}>
        <thead>
            <tr style={{ textAlign: 'left', color: '#64748b', borderBottom: '2px solid #e2e8f0' }}>
                <th style={{ padding: '10px' }}>Name</th>
                <th style={{ padding: '10px' }}>Specialization</th>
                <th style={{ padding: '10px' }}>Licence</th>
                <th style={{ padding: '10px' }}>Action</th>
            </tr>
        </thead>
        <tbody>
            {doctors.map(d => (
                <tr key={d.doctorId} style={{ borderBottom: '1px solid #f1f5f9' }}>
                    <td style={{ padding: '10px', fontWeight: '500' }}>{d.name}</td>
                    <td style={{ padding: '10px' }}>{d.specialization}</td>
                    <td style={{ padding: '10px' }}>{d.licenceNumber}</td>
                    <td style={{ padding: '10px' }}>
                        <button onClick={() => handleEdit(d)} style={{ marginRight: '10px', border:'none', background:'none', cursor:'pointer' }}>✏️</button>
                        <button onClick={() => handleDelete(d.doctorId)} style={{ border:'none', background:'none', cursor:'pointer', color:'red' }}>🗑️</button>
                    </td>
                </tr>
            ))}
        </tbody>
      </table>
    </div>
  );
};

/* =========================================
   3. FACILITY MANAGEMENT (REAL-TIME TOGGLE)
   ========================================= */
const FacilityManagement = () => {
  const [facilities, setFacilities] = useState([]);
  const [newFacilityName, setNewFacilityName] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => { fetchFacilities(); }, []);

  const fetchFacilities = async () => {
    try {
      const response = await api.get('/Facilities');
      setFacilities(response.data);
    } catch (error) { console.error(error); }
  };

  const toggleAvailability = async (facility) => {
    const originalState = [...facilities];
    const updatedFacilities = facilities.map(f => 
      f.facilityId === facility.facilityId ? { ...f, availability: !f.availability } : f
    );
    setFacilities(updatedFacilities);

    try {
      await api.put(`/Facilities/${facility.facilityId}`, {
        facilityName: facility.facilityName,
        availability: !facility.availability
      });
    } catch (error) {
      setFacilities(originalState);
      alert("Failed to update status.");
    }
  };

  const handleAddFacility = async (e) => {
    e.preventDefault();
    if (!newFacilityName.trim()) return;
    setIsLoading(true);
    try {
      await api.post('/Facilities', { facilityName: newFacilityName, availability: true });
      setNewFacilityName('');
      fetchFacilities();
    } catch (error) { console.error(error); } 
    finally { setIsLoading(false); }
  };

  const handleDelete = async (id) => {
    if(!window.confirm("Delete facility?")) return;
    try { await api.delete(`/Facilities/${id}`); fetchFacilities(); } catch(e){}
  };

  return (
    <div className="card standard-card">
      <div style={{ marginBottom: '20px' }}>
        <h3>🏗️ Facility Status Control</h3>
        <p style={{ color: '#64748b', fontSize: '0.9rem' }}>Toggle switch to <b>OFF</b> if a facility is full or unavailable.</p>
      </div>

      <div style={{ display: 'flex', gap: '10px', marginBottom: '20px', padding:'15px', background:'#f8fafc', borderRadius:'10px' }}>
        <input value={newFacilityName} onChange={(e) => setNewFacilityName(e.target.value)} placeholder="Add generic facility..." className="ai-input" style={{ flex: 1 }} />
        <button onClick={handleAddFacility} disabled={isLoading} className="ai-analyze-btn">{isLoading ? '...' : '+ Add'}</button>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '15px' }}>
        {facilities.map(f => (
          <div key={f.facilityId} style={{ 
              padding: '15px', borderRadius: '10px', border: '1px solid',
              borderColor: f.availability ? '#bbf7d0' : '#fecaca',
              background: f.availability ? '#f0fdf4' : '#fef2f2',
              display: 'flex', justifyContent: 'space-between', alignItems: 'center'
            }}>
            <div>
              <div style={{ fontWeight: '600' }}>{f.facilityName}</div>
              <div style={{ fontSize: '0.8rem', fontWeight: 'bold', color: f.availability ? '#16a34a' : '#dc2626' }}>
                {f.availability ? '● ACTIVE' : '○ CLOSED'}
              </div>
            </div>
            <div style={{ display:'flex', gap:'10px', alignItems:'center'}}>
                <label style={{ position: 'relative', display: 'inline-block', width: '40px', height: '22px' }}>
                    <input type="checkbox" checked={f.availability} onChange={() => toggleAvailability(f)} style={{ opacity: 0, width: 0, height: 0 }} />
                    <span style={{ position: 'absolute', cursor: 'pointer', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: f.availability ? '#22c55e' : '#cbd5e1', transition: '.4s', borderRadius: '34px' }}>
                        <span style={{ position: 'absolute', content: "", height: '16px', width: '16px', left: '3px', bottom: '3px', backgroundColor: 'white', transition: '.4s', borderRadius: '50%', transform: f.availability ? 'translateX(18px)' : 'translateX(0)' }}></span>
                    </span>
                </label>
                <button onClick={() => handleDelete(f.facilityId)} style={{ border:'none', background:'none', cursor:'pointer', fontSize:'1.1rem', opacity:0.5 }}>×</button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

/* =========================================
   4. BED MANAGEMENT (UPDATE PARENT STATE)
   ========================================= */
const BedManagement = ({ currentStats, onUpdate }) => {
  const [total, setTotal] = useState(currentStats.totalBeds);
  const [occupied, setOccupied] = useState(currentStats.occupiedBeds);

  const handleSave = () => {
    if (parseInt(occupied) > parseInt(total)) {
      alert("Occupied beds cannot be greater than Total beds!");
      return;
    }
    onUpdate(total, occupied);
    alert("Bed capacity updated successfully!");
  };

  return (
    <div className="card standard-card">
      <h3>🛏️ Bed Capacity Management</h3>
      <p style={{ color: '#64748b', fontSize: '0.9rem', marginBottom: '20px' }}>
        Update total capacity and current occupancy. This data is used by AI to route patients.
      </p>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px', maxWidth: '600px' }}>
        <div>
          <label style={{ display: 'block', marginBottom: '8px', fontWeight: '500' }}>Total Bed Capacity</label>
          <input type="number" value={total} onChange={(e) => setTotal(e.target.value)} className="ai-input" style={{ width: '100%', border: '1px solid #cbd5e1' }} />
        </div>
        <div>
          <label style={{ display: 'block', marginBottom: '8px', fontWeight: '500' }}>Currently Occupied</label>
          <input type="number" value={occupied} onChange={(e) => setOccupied(e.target.value)} className="ai-input" style={{ width: '100%', border: '1px solid #cbd5e1' }} />
        </div>
      </div>

      <div style={{ marginTop: '20px', padding: '15px', background: '#f8fafc', borderRadius: '8px', border: '1px solid #e2e8f0', maxWidth: '600px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between' }}>
          <span>Calculated Availability:</span>
          <span style={{ fontWeight: 'bold', fontSize: '1.2rem', color: (total - occupied) > 0 ? '#22c55e' : '#ef4444' }}>
            {total - occupied} Beds
          </span>
        </div>
      </div>

      <button onClick={handleSave} className="ai-analyze-btn" style={{ marginTop: '25px', padding: '12px 30px' }}>Update Status</button>
    </div>
  );
};

/* =========================================
   5. EMERGENCY REQUESTS (PLACEHOLDER)
   ========================================= */
const EmergencyRequests = () => (
  <div className="card standard-card">
    <h3>🚨 Emergency Requests</h3>
    <p style={{ color: '#64748b' }}>Live incoming requests will appear here.</p>
  </div>
);

export default HospitalDashboard;