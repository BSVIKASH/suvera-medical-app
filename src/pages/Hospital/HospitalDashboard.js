import React, { useState, useEffect } from 'react';
import api from '../../api'; // Ensure this points to your Axios instance
import '../../styles/Dashboard.css';

/* =========================================================================================
   MAIN PARENT COMPONENT: Holds Global State, Sidebar, Header, and Activity Logging Logic
   ========================================================================================= */
const HospitalDashboard = ({ onLogout }) => {
  const [activeModule, setActiveModule] = useState('dashboard');
  const [showProfile, setShowProfile] = useState(false); // Controls Header Dropdown

  // --- GLOBAL STATE: ACTIVITY LOGS ---
  // This state is shared. Children (Doctors, Facilities) push logs here.
  // Home (Dashboard) reads from here to display the table.
  const [activityLogs, setActivityLogs] = useState([]);

  // --- LIFTED STATE: BED STATS ---
  const [bedStats, setBedStats] = useState({
    totalBeds: 150,
    occupiedBeds: 105
  });

  // --- FUNCTION: ADD ACTIVITY LOG ---
  const logActivity = (type, details, status) => {
    const newLog = {
        id: Date.now(),
        type: type,
        details: details,
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        status: status // e.g., "Completed", "Active", "Closed"
    };
    // Keep the most recent 15 logs
    setActivityLogs(prev => [newLog, ...prev].slice(0, 15));
  };

  // --- FUNCTION: UPDATE BEDS (Passed to BedManagement) ---
  const handleBedUpdate = (newTotal, newOccupied) => {
    setBedStats({
      totalBeds: parseInt(newTotal) || 0,
      occupiedBeds: parseInt(newOccupied) || 0
    });
    // Log this action
    logActivity('Capacity', `Bed Capacity Updated: ${newTotal - newOccupied} Available`, 'Updated');
  };

  // --- MENU ITEMS CONFIG ---
  const menuItems = [
    { key: 'dashboard', icon: '📊', label: 'Dashboard', description: 'Hospital overview & stats' },
    { key: 'emergency', icon: '🚨', label: 'Emergency Requests', description: 'Live Triage & Alerts' },
    { key: 'doctors', icon: '👨‍⚕️', label: 'Doctors', description: 'Staff management directory' },
    { key: 'facilities', icon: '🏗️', label: 'Facilities', description: 'Resource status & availability' },
    { key: 'beds', icon: '🛏️', label: 'Bed Capacity', description: 'Occupancy planning' },
  ];

  // --- RENDER ROUTER ---
  const renderModule = () => {
    switch(activeModule) {
      case 'doctors':
        // Pass logActivity to let Doctor module record changes
        return <DoctorManagement logActivity={logActivity} />;
      
      case 'facilities':
        // Pass logActivity to let Facility module record changes
        return <FacilityManagement logActivity={logActivity} />;
      
      case 'beds':
        return <BedManagement currentStats={bedStats} onUpdate={handleBedUpdate} />;
      
      case 'emergency':
        // Pass logActivity to record Accept/Decline actions
        return <EmergencyRequests logActivity={logActivity} />;
      
      default:
        // Pass the activityLogs to display them in the table
        return <HospitalDashboardHome stats={bedStats} logs={activityLogs} onNavigate={setActiveModule} />;
    }
  };

  return (
    // Clicking anywhere closes the profile dropdown
    <div className="dashboard-container" onClick={() => setShowProfile(false)}>
      
      {/* --- SIDEBAR START --- */}
      <aside className="sidebar">
        <div className="sidebar-header">
          <div className="logo-icon">🏥</div>
          <div className="app-name">Admin Portal</div>
        </div>
        
        <nav className="sidebar-nav">
          {menuItems.map((item) => (
            <button 
              key={item.key}
              className={`nav-item ${activeModule === item.key ? 'active' : ''}`}
              onClick={(e) => {
                  e.stopPropagation(); // Prevent closing profile if clicking sidebar
                  setActiveModule(item.key);
              }}
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
      {/* --- SIDEBAR END --- */}

      {/* --- MAIN CONTENT AREA --- */}
      <main className="main-content-area">
        <header className="top-header">
          <div className="header-greeting">
            <h1>{menuItems.find(item => item.key === activeModule)?.label || 'Dashboard'}</h1>
            <p>{menuItems.find(item => item.key === activeModule)?.description}</p>
          </div>
          
          <div className="header-actions">
            <button className="notif-btn">🔔</button>
            
            {/* ✅ MODIFIED: CLICKABLE PROFILE AVATAR */}
            <div 
                className="user-avatar" 
                style={{cursor: 'pointer', border: showProfile ? '2px solid #4f46e5' : 'none'}}
                onClick={(e) => {
                    e.stopPropagation(); // Prevent parent click
                    setShowProfile(!showProfile);
                }}
            >
                H
            </div>

            {/* ✅ NEW: PROFILE DETAILS DROPDOWN */}
            {showProfile && (
                <div className="profile-dropdown" onClick={(e) => e.stopPropagation()} style={{
                    position: 'absolute', top: '70px', right: '20px', 
                    background: 'white', padding: '20px', borderRadius: '12px', 
                    boxShadow: '0 5px 25px rgba(0,0,0,0.15)', width: '300px', 
                    zIndex: 1000, border: '1px solid #e5e7eb',
                    animation: 'fadeIn 0.2s ease-in-out'
                }}>
                    <div style={{textAlign: 'center', marginBottom:'15px'}}>
                        <div style={{fontSize:'3.5rem', marginBottom:'10px'}}>🏥</div>
                        <h3 style={{margin:'0 0 5px 0', color:'#1f2937'}}>Sri Vignesh Hospital</h3>
                        <span style={{background:'#dcfce7', color:'#166534', padding:'3px 10px', borderRadius:'15px', fontSize:'0.75rem', fontWeight:'bold'}}>● ONLINE & ACTIVE</span>
                    </div>
                    
                    <div style={{textAlign: 'left', fontSize:'0.9rem', color:'#4b5563', borderTop:'1px solid #f3f4f6', paddingTop:'15px'}}>
                        <p style={{marginBottom:'8px'}}><strong>Registration ID:</strong> <span>#HOS-2024-001</span></p>
                        <p style={{marginBottom:'8px'}}><strong>Licence No:</strong> <span>LIC-TN-45892</span></p>
                        <p style={{marginBottom:'8px'}}><strong>Admin Email:</strong> <span>admin@vignesh.com</span></p>
                        <p style={{marginBottom:'8px'}}><strong>Contact:</strong> <span>08667416059</span></p>
                        <p style={{marginBottom:'8px'}}><strong>Address:</strong> <span>Plot 29, Sri Vignesh Nagar</span></p>
                    </div>

                    <button 
                        onClick={onLogout}
                        style={{
                            width: '100%', marginTop:'15px', padding:'10px', 
                            background: '#ef4444', color:'white', border:'none', 
                            borderRadius:'6px', cursor:'pointer', fontWeight:'bold'
                        }}
                    >
                        Sign Out
                    </button>
                </div>
            )}
          </div>
        </header>

        <div className="content-scrollable">
          {renderModule()}
        </div>
      </main>
    </div>
  );
};

/* =========================================================================================
   MODULE 1: DASHBOARD HOME (With Dynamic Recent Activity Table)
   ========================================================================================= */
const HospitalDashboardHome = ({ stats, logs, onNavigate }) => {
  // Logic: Calculate bed percentages
  const available = stats.totalBeds - stats.occupiedBeds;
  const percentage = stats.totalBeds > 0 ? Math.round((stats.occupiedBeds / stats.totalBeds) * 100) : 0;

  return (
    <div className="dashboard-home">
      
      {/* 1. Statistics Cards */}
      <div className="stats-container">
        
        {/* Total Beds */}
        <div className="stat-card">
          <div className="stat-value" style={{ color: '#4f46e5' }}>{stats.totalBeds}</div>
          <div className="stat-label">Total Beds</div>
          <div style={{ fontSize: '0.8rem', color: '#64748b', marginTop: '5px' }}>
            {percentage}% Occupancy Rate
          </div>
        </div>

        {/* Available Beds */}
        <div className="stat-card">
          <div className="stat-value" style={{ color: available < 10 ? '#ef4444' : '#22c55e' }}>
            {available}
          </div>
          <div className="stat-label">Available Beds</div>
          <div style={{ fontSize: '0.8rem', color: '#64748b', marginTop: '5px' }}>
            Current Capacity Status
          </div>
        </div>

        {/* Live Requests Link */}
        <div 
            className="stat-card" 
            onClick={() => onNavigate('emergency')}
            style={{ cursor: 'pointer', border: '2px solid #ef4444', background: '#fff5f5' }}
        >
          <div className="stat-value" style={{ color: '#ef4444' }}>🚨</div>
          <div className="stat-label">Emergency Requests</div>
          <div style={{ fontSize: '0.8rem', color: '#ef4444', marginTop: '5px' }}>
            Click to View Pending Alerts
          </div>
        </div>
      </div>

      {/* 2. ✅ NEW: REAL-TIME RECENT ACTIVITY TABLE */}
      <div className="card standard-card">
        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '15px' }}>
          <h3>📋 Recent Activity Log</h3>
          <button style={{ background: 'none', border: 'none', color: '#4f46e5', cursor: 'pointer', fontWeight: 'bold' }}>Live Updates</button>
        </div>
        
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead>
            <tr style={{ textAlign: 'left', color: '#64748b', borderBottom: '2px solid #e2e8f0' }}>
              <th style={{ padding: '12px' }}>Type</th>
              <th style={{ padding: '12px' }}>Details</th>
              <th style={{ padding: '12px' }}>Time</th>
              <th style={{ padding: '12px' }}>Status</th>
            </tr>
          </thead>
          <tbody>
            {logs.length === 0 ? (
                <tr>
                    <td colSpan="4" style={{ textAlign: 'center', padding: '20px', color: '#9ca3af' }}>
                        No recent activity recorded in this session.
                    </td>
                </tr>
            ) : (
                logs.map((log) => (
                    <tr key={log.id} style={{ borderBottom: '1px solid #f1f5f9', animation: 'fadeIn 0.5s' }}>
                        <td style={{ padding: '12px', fontWeight: '600', color: '#374151' }}>
                            {log.type === 'Emergency' ? '🚨 Emergency' : log.type === 'Facility' ? '🏗️ Facility' : '👨‍⚕️ Staff'}
                        </td>
                        <td style={{ padding: '12px', color: '#4b5563' }}>{log.details}</td>
                        <td style={{ padding: '12px', color: '#6b7280', fontSize: '0.9rem' }}>{log.time}</td>
                        <td style={{ padding: '12px' }}>
                            <span style={{ 
                                background: 
                                    log.status === 'Accepted' || log.status === 'Active' || log.status === 'Completed' || log.status === 'Success' ? '#dcfce7' : 
                                    log.status === 'Declined' || log.status === 'Closed' || log.status === 'Deleted' ? '#fee2e2' : '#dbeafe',
                                color: 
                                    log.status === 'Accepted' || log.status === 'Active' || log.status === 'Completed' || log.status === 'Success' ? '#166534' : 
                                    log.status === 'Declined' || log.status === 'Closed' || log.status === 'Deleted' ? '#991b1b' : '#1e40af',
                                padding: '4px 10px', borderRadius: '15px', fontSize: '0.75rem', fontWeight: '700', textTransform: 'uppercase'
                            }}>
                                {log.status}
                            </span>
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

/* =========================================================================================
   MODULE 2: DOCTOR MANAGEMENT (FULL CRUD RESTORED)
   ========================================================================================= */
const DoctorManagement = ({ logActivity }) => {
  const [doctors, setDoctors] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [editingId, setEditingId] = useState(null);

  const [doctorForm, setDoctorForm] = useState({
    name: '', specialization: '', contactNumber: '', licenceNumber: ''
  });

  useEffect(() => { 
      fetchDoctors(); 
  }, []);

  const fetchDoctors = async () => {
    try {
      const response = await api.get('/Doctors');
      setDoctors(response.data);
    } catch (error) { 
      console.error(error); 
    }
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
        logActivity('Staff', `Updated details for Dr. ${doctorForm.name}`, 'Updated');
      } else {
        await api.post('/Doctors', payload);
        logActivity('Staff', `Added new doctor: Dr. ${doctorForm.name}`, 'Success');
      }
      setDoctorForm({ name: '', specialization: '', contactNumber: '', licenceNumber: '' });
      setEditingId(null);
      setShowForm(false);
      fetchDoctors();
    } catch (error) { 
        alert("Operation failed. Check inputs."); 
    } finally { 
        setIsLoading(false); 
    }
  };

  const handleDelete = async (id) => {
    if(!window.confirm("Are you sure you want to delete this doctor?")) return;
    try { 
        await api.delete(`/Doctors/${id}`); 
        logActivity('Staff', 'Doctor record removed from system', 'Deleted');
        fetchDoctors(); 
    } catch(e) {
        alert("Error deleting doctor.");
    }
  };

  return (
    <div className="card standard-card">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
        <h3>👨‍⚕️ Doctor Management Directory</h3>
        <button className="ai-analyze-btn" onClick={() => setShowForm(!showForm)}>
            {showForm ? 'Cancel' : '+ Add Doctor'}
        </button>
      </div>

      {showForm && (
        <form onSubmit={handleSubmit} style={{ background: '#f8fafc', padding: '20px', borderRadius: '10px', marginBottom: '20px', border:'1px solid #e2e8f0' }}>
            <h4 style={{marginTop:0, marginBottom:'15px'}}>{editingId ? 'Edit Doctor' : 'Register New Doctor'}</h4>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px' }}>
                <div>
                    <label style={{fontSize:'0.85rem', fontWeight:'500'}}>Full Name</label>
                    <input name="name" value={doctorForm.name} onChange={handleInputChange} placeholder="Dr. Name" className="ai-input" required />
                </div>
                <div>
                    <label style={{fontSize:'0.85rem', fontWeight:'500'}}>Specialization</label>
                    <input name="specialization" value={doctorForm.specialization} onChange={handleInputChange} placeholder="e.g. Cardiology" className="ai-input" required />
                </div>
                <div>
                    <label style={{fontSize:'0.85rem', fontWeight:'500'}}>Licence Number</label>
                    <input name="licenceNumber" value={doctorForm.licenceNumber} onChange={handleInputChange} placeholder="LIC-XXXXX" className="ai-input" required />
                </div>
                <div>
                    <label style={{fontSize:'0.85rem', fontWeight:'500'}}>Contact</label>
                    <input name="contactNumber" value={doctorForm.contactNumber} onChange={handleInputChange} placeholder="Phone" className="ai-input" required />
                </div>
            </div>
            <button type="submit" className="ai-analyze-btn" style={{ marginTop: '15px', width: '100%' }}>
                {isLoading ? 'Saving...' : 'Save Doctor Details'}
            </button>
        </form>
      )}

      <table style={{ width: '100%', borderCollapse: 'collapse' }}>
        <thead>
            <tr style={{ textAlign: 'left', color: '#64748b', borderBottom: '2px solid #e2e8f0' }}>
                <th style={{ padding: '12px' }}>Name</th>
                <th style={{ padding: '12px' }}>Specialization</th>
                <th style={{ padding: '12px' }}>Licence</th>
                <th style={{ padding: '12px' }}>Action</th>
            </tr>
        </thead>
        <tbody>
            {doctors.length === 0 ? <tr><td colSpan="4" style={{textAlign:'center', padding:'20px'}}>No records found.</td></tr> :
            doctors.map(d => (
                <tr key={d.doctorId} style={{ borderBottom: '1px solid #f1f5f9' }}>
                    <td style={{ padding: '12px', fontWeight: '500' }}>{d.name}</td>
                    <td style={{ padding: '12px' }}>{d.specialization}</td>
                    <td style={{ padding: '12px' }}>{d.licenceNumber}</td>
                    <td style={{ padding: '12px' }}>
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

/* =========================================================================================
   MODULE 3: FACILITY MANAGEMENT (Status Toggle & Logs)
   ========================================================================================= */
const FacilityManagement = ({ logActivity }) => {
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

  // ✅ LOGIC: Toggle Switch Changes Availability AND Logs it
  const toggleAvailability = async (f) => {
    const originalState = [...facilities];
    const newStatus = !f.availability;

    // 1. Optimistic Update UI
    const updatedFacilities = facilities.map(fac => 
      fac.facilityId === f.facilityId ? { ...fac, availability: newStatus } : fac
    );
    setFacilities(updatedFacilities);

    // 2. LOG IT! (This appears in Home Dashboard)
    logActivity("Facility", `${f.facilityName} status changed to ${newStatus ? 'OPEN' : 'CLOSED'}`, newStatus ? 'Active' : 'Closed');

    try {
      // 3. API Call
      await api.put(`/Facilities/${f.facilityId}`, {
        facilityName: f.facilityName,
        availability: newStatus // When false (0), route matching logic sees it as unavailable
      });
    } catch (error) {
      setFacilities(originalState); // Revert on fail
      alert("Failed to update status.");
    }
  };

  const handleAddFacility = async (e) => {
    e.preventDefault();
    if (!newFacilityName.trim()) return;
    setIsLoading(true);
    try {
      await api.post('/Facilities', { facilityName: newFacilityName, availability: true });
      logActivity("Facility", `New Facility: ${newFacilityName}`, "Created");
      setNewFacilityName('');
      fetchFacilities();
    } catch (error) { console.error(error); } 
    finally { setIsLoading(false); }
  };

  const handleDelete = async (id) => {
    if(!window.confirm("Permanently delete facility?")) return;
    try { 
        await api.delete(`/Facilities/${id}`); 
        logActivity("Facility", `Facility removed from directory`, "Deleted");
        fetchFacilities(); 
    } catch(e){}
  };

  return (
    <div className="card standard-card">
      <div style={{ marginBottom: '20px' }}>
        <h3>🏗️ Facility Status Control</h3>
        <p style={{ color: '#64748b', fontSize: '0.9rem' }}>
            Control which departments are "Active" for the AI matching algorithm.
            <br/>If you toggle a switch <b>OFF</b>, patients searching for this specialist <b>will not see</b> your hospital in the map results.
        </p>
      </div>

      <div style={{ display: 'flex', gap: '10px', marginBottom: '20px', padding:'15px', background:'#f8fafc', borderRadius:'10px', border:'1px solid #e2e8f0' }}>
        <input 
            value={newFacilityName} 
            onChange={(e) => setNewFacilityName(e.target.value)} 
            placeholder="Add generic facility (e.g. MRI Scan, Blood Bank)..." 
            className="ai-input" 
            style={{ flex: 1 }} 
        />
        <button onClick={handleAddFacility} disabled={isLoading} className="ai-analyze-btn">
            {isLoading ? '...' : '+ Add Facility'}
        </button>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '15px' }}>
        {facilities.map(f => (
          <div key={f.facilityId} style={{ 
              padding: '20px', borderRadius: '12px', border: '1px solid',
              borderColor: f.availability ? '#bbf7d0' : '#fecaca',
              background: f.availability ? '#f0fdf4' : '#fef2f2',
              display: 'flex', justifyContent: 'space-between', alignItems: 'center',
              boxShadow: '0 2px 5px rgba(0,0,0,0.05)', transition:'all 0.3s ease'
            }}>
            <div>
              <div style={{ fontWeight: '700', fontSize:'1.1rem', color:'#1f2937' }}>{f.facilityName}</div>
              <div style={{ fontSize: '0.8rem', fontWeight: 'bold', color: f.availability ? '#16a34a' : '#dc2626', marginTop:'5px' }}>
                {f.availability ? '● ACTIVE' : '○ CLOSED (0)'}
              </div>
            </div>
            
            <div style={{ display:'flex', gap:'15px', alignItems:'center'}}>
                {/* Custom Toggle Switch */}
                <label style={{ position: 'relative', display: 'inline-block', width: '48px', height: '26px' }}>
                    <input type="checkbox" checked={f.availability} onChange={() => toggleAvailability(f)} style={{ opacity: 0, width: 0, height: 0 }} />
                    <span style={{ 
                        position: 'absolute', cursor: 'pointer', top: 0, left: 0, right: 0, bottom: 0, 
                        backgroundColor: f.availability ? '#22c55e' : '#cbd5e1', 
                        transition: '.4s', borderRadius: '34px' 
                    }}>
                        <span style={{ 
                            position: 'absolute', content: "", height: '20px', width: '20px', left: '3px', bottom: '3px', 
                            backgroundColor: 'white', transition: '.4s', borderRadius: '50%', 
                            transform: f.availability ? 'translateX(22px)' : 'translateX(0)', boxShadow: '0 2px 4px rgba(0,0,0,0.2)' 
                        }}></span>
                    </span>
                </label>
                <button onClick={() => handleDelete(f.facilityId)} style={{ border:'none', background:'none', cursor:'pointer', fontSize:'1.4rem', opacity:0.6, color:'#dc2626' }}>×</button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

/* =========================================================================================
   MODULE 4: BED MANAGEMENT (Updated UI & Logging)
   ========================================================================================= */
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
        Update total capacity and current occupancy manually. In a real deployment, this would connect to the hospital's PMS.
      </p>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '25px', maxWidth: '700px' }}>
        <div>
          <label style={{ display: 'block', marginBottom: '8px', fontWeight: '500' }}>Total Bed Capacity</label>
          <input type="number" value={total} onChange={(e) => setTotal(e.target.value)} className="ai-input" style={{ width: '100%', border: '1px solid #cbd5e1' }} />
        </div>
        <div>
          <label style={{ display: 'block', marginBottom: '8px', fontWeight: '500' }}>Currently Occupied</label>
          <input type="number" value={occupied} onChange={(e) => setOccupied(e.target.value)} className="ai-input" style={{ width: '100%', border: '1px solid #cbd5e1' }} />
        </div>
      </div>

      <div style={{ marginTop: '30px', padding: '20px', background: '#f8fafc', borderRadius: '12px', border: '1px solid #e2e8f0', maxWidth: '700px', display:'flex', justifyContent:'space-between', alignItems:'center' }}>
        <div>
            <div style={{color:'#64748b', fontSize:'0.9rem'}}>Live Calculation</div>
            <div style={{fontSize:'1.2rem', fontWeight:'bold'}}>Remaining Availability</div>
        </div>
        
        <span style={{ 
            fontWeight: 'bold', fontSize: '2rem', 
            color: (total - occupied) > 10 ? '#22c55e' : (total - occupied) > 0 ? '#f59e0b' : '#ef4444' 
        }}>
            {total - occupied} BEDS
        </span>
      </div>

      <button onClick={handleSave} className="ai-analyze-btn" style={{ marginTop: '25px', padding: '12px 30px', width:'200px' }}>Update Live Status</button>
    </div>
  );
};

/* =========================================================================================
   MODULE 5: EMERGENCY REQUESTS (Forum Feature)
   ========================================================================================= */
const EmergencyRequests = ({ logActivity }) => {
    const [requests, setRequests] = useState([]);
    const [loading, setLoading] = useState(true);

    // POLLING MECHANISM
    useEffect(() => {
        // NOTE: Hardcoded ID 2 for demo purposes
        const HOSPITAL_ID = 2; 

        const fetchRequests = async () => {
            try {
                const res = await api.get(`/Requests/hospital/${HOSPITAL_ID}`);
                setRequests(res.data);
                setLoading(false);
            } catch (error) {
                console.error("Polling Error", error);
            }
        };

        fetchRequests(); // First load
        const interval = setInterval(fetchRequests, 5000); // Check every 5s

        return () => clearInterval(interval);
    }, []);

    const handleAction = async (requestId, status, reqDetails) => {
        try {
            await api.post(`/Requests/update-status/${requestId}`, JSON.stringify(status), {
                headers: { 'Content-Type': 'application/json' }
            });
            
            // Remove locally
            setRequests(prev => prev.filter(r => r.requestId !== requestId));
            
            // Log it
            logActivity("Emergency", `Patient ${reqDetails.patientName} was ${status}`, status);
            alert(`Request marked as ${status}`);
        } catch (error) {
            alert("Error updating request status.");
        }
    };

    return (
        <div className="card standard-card">
            <div style={{display:'flex', justifyContent:'space-between', alignItems:'center'}}>
                <div>
                    <h3>🚨 Incoming Emergency Requests</h3>
                    <p style={{marginBottom:'20px', color:'#666'}}>Requests from patients nearby bypassing login via Emergency AI.</p>
                </div>
                <div style={{background:'#eef2ff', color:'#4f46e5', padding:'5px 12px', borderRadius:'20px', fontSize:'0.85rem', fontWeight:'bold'}}>
                    Status: Monitoring (Polling Active)
                </div>
            </div>

            {loading ? <p>Scanning network...</p> : requests.length === 0 ? (
                <div style={{textAlign:'center', padding:'50px', background:'#f8f9fa', borderRadius:'8px', border:'2px dashed #cbd5e1', marginTop:'10px'}}>
                    <div style={{fontSize:'3rem', opacity:0.5}}>✅</div>
                    <h4>No Pending Emergencies</h4>
                    <p style={{color:'#666', fontSize:'0.9rem'}}>The emergency queue is currently empty.</p>
                </div>
            ) : (
                <div style={{display:'grid', gap:'15px', marginTop:'15px'}}>
                    {requests.map(req => (
                        <div key={req.requestId} style={{
                            borderLeft:'6px solid #dc3545', background:'#fff5f5', padding:'25px', 
                            borderRadius:'10px', display:'flex', justifyContent:'space-between', alignItems:'center',
                            boxShadow:'0 4px 10px rgba(0,0,0,0.05)', animation:'fadeIn 0.5s'
                        }}>
                            <div>
                                <div style={{display:'flex', alignItems:'center', gap:'10px'}}>
                                    <span style={{background:'#dc3545', color:'white', padding:'2px 8px', borderRadius:'4px', fontSize:'0.7rem', fontWeight:'bold'}}>CRITICAL</span>
                                    <h4 style={{margin:0, color:'#1f2937', fontSize:'1.2rem'}}>PATIENT: {req.patientName || "Emergency User"}</h4>
                                </div>
                                <p style={{margin:'10px 0', fontWeight:'bold', fontSize:'1.1rem', color:'#b91c1c'}}>Condition: {req.symptomDescription}</p>
                                <div style={{fontSize:'0.95rem', color:'#4b5563'}}>📞 Contact: <strong>{req.contactNumber}</strong></div>
                                <small style={{color:'#6b7280', display:'block', marginTop:'5px'}}>Time Requested: {new Date(req.requestTime).toLocaleTimeString()}</small>
                            </div>
                            
                            <div style={{display:'flex', gap:'15px', flexDirection:'column'}}>
                                <button 
                                    onClick={() => handleAction(req.requestId, 'Accepted', req)}
                                    style={{
                                        background:'#16a34a', color:'white', border:'none', width:'180px',
                                        padding:'12px 20px', borderRadius:'6px', cursor:'pointer', fontWeight:'bold',
                                        boxShadow:'0 4px 6px rgba(22, 163, 74, 0.2)', transition:'transform 0.2s'
                                    }}
                                >
                                    ✅ ACCEPT ADMIT
                                </button>
                                <button 
                                    onClick={() => handleAction(req.requestId, 'Declined', req)}
                                    style={{
                                        background:'#dc2626', color:'white', border:'none', width:'180px',
                                        padding:'12px 20px', borderRadius:'6px', cursor:'pointer', fontWeight:'bold',
                                        boxShadow:'0 4px 6px rgba(220, 38, 38, 0.2)', transition:'transform 0.2s'
                                    }}
                                >
                                    ❌ DECLINE (FULL)
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};

export default HospitalDashboard;