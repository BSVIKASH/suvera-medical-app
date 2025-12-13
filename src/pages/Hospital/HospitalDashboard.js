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
  };

  const menuItems = [
    { key: 'dashboard', icon: '📊', label: 'Dashboard', description: 'Hospital overview' },
    { key: 'emergency', icon: '🚨', label: 'Emergency Requests', description: 'Live Alerts & Triage' }, // ✅ NEW
    { key: 'doctors', icon: '👨‍⚕️', label: 'Doctors', description: 'Staff management' },
    { key: 'facilities', icon: '🏗️', label: 'Facilities', description: 'Resources & Status' },
    { key: 'beds', icon: '🛏️', label: 'Beds', description: 'Capacity Planning' },
  ];

  // Render the active module based on selection
  const renderModule = () => {
    switch(activeModule) {
      case 'doctors':
        return <DoctorManagement />;
      case 'facilities':
        return <FacilityManagement />;
      case 'beds':
        return <BedManagement currentStats={bedStats} onUpdate={handleBedUpdate} />;
      case 'emergency':
        return <EmergencyRequests />; // ✅ THE NEW FEATURE
      default:
        return <HospitalDashboardHome stats={bedStats} onNavigate={setActiveModule} />;
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
   1. DASHBOARD HOME (Stats & Summary)
   ========================================= */
const HospitalDashboardHome = ({ stats, onNavigate }) => {
  // Calculate availability dynamically
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

        {/* Available Beds */}
        <div className="stat-card">
          <div className="stat-value" style={{ color: available < 10 ? '#ef4444' : '#22c55e' }}>
            {available}
          </div>
          <div className="stat-label">Available Beds</div>
          <div style={{ fontSize: '0.8rem', color: '#64748b', marginTop: '5px' }}>
            Live Updates
          </div>
        </div>

        {/* Quick Actions / Emergency Link */}
        <div 
            className="stat-card" 
            onClick={() => onNavigate('emergency')}
            style={{ cursor: 'pointer', border: '2px solid #ef4444', background: '#fff5f5' }}
        >
          <div className="stat-value" style={{ color: '#ef4444' }}>🚨</div>
          <div className="stat-label">Emergency Requests</div>
          <div style={{ fontSize: '0.8rem', color: '#ef4444', marginTop: '5px' }}>
            Click to View Alerts
          </div>
        </div>
      </div>

      {/* Static Table for recent activity (Visual Only) */}
      <div className="card standard-card">
        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '15px' }}>
          <h3>📋 Recent Activity</h3>
          <button style={{ background: 'none', border: 'none', color: '#4f46e5', cursor: 'pointer', fontWeight: 'bold' }}>View All</button>
        </div>
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead>
            <tr style={{ textAlign: 'left', color: '#64748b', borderBottom: '1px solid #e2e8f0' }}>
              <th style={{ padding: '10px' }}>Type</th>
              <th style={{ padding: '10px' }}>Details</th>
              <th style={{ padding: '10px' }}>Time</th>
              <th style={{ padding: '10px' }}>Status</th>
            </tr>
          </thead>
          <tbody>
            <tr style={{ borderBottom: '1px solid #f1f5f9' }}>
              <td style={{ padding: '10px' }}>Check-in</td>
              <td style={{ padding: '10px' }}>New Patient Admitted (Cardiology)</td>
              <td style={{ padding: '10px' }}>10:30 AM</td>
              <td style={{ padding: '10px' }}><span style={{ color: 'green' }}>Completed</span></td>
            </tr>
            <tr style={{ borderBottom: '1px solid #f1f5f9' }}>
              <td style={{ padding: '10px' }}>System</td>
              <td style={{ padding: '10px' }}>Facility Updated: MRI Scan</td>
              <td style={{ padding: '10px' }}>09:15 AM</td>
              <td style={{ padding: '10px' }}><span style={{ color: 'blue' }}>Logged</span></td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  );
};

/* =========================================
   2. DOCTOR MANAGEMENT (Full CRUD)
   ========================================= */
const DoctorManagement = () => {
  const [doctors, setDoctors] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [editingId, setEditingId] = useState(null);

  const [doctorForm, setDoctorForm] = useState({
    name: '', 
    specialization: '', 
    contactNumber: '', 
    licenceNumber: ''
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

  const handleInputChange = (e) => {
      setDoctorForm({ ...doctorForm, [e.target.name]: e.target.value });
  };

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
        // Edit existing
        await api.put(`/Doctors/${editingId}`, payload);
      } else {
        // Create new
        await api.post('/Doctors', payload);
      }
      // Reset Form
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
        fetchDoctors(); 
    } catch(e) {
        alert("Error deleting doctor.");
    }
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
        <form onSubmit={handleSubmit} style={{ background: '#f8fafc', padding: '20px', borderRadius: '10px', marginBottom: '20px', border: '1px solid #e2e8f0' }}>
            <h4 style={{marginTop:0, marginBottom:'15px'}}>{editingId ? 'Edit Doctor' : 'New Doctor Details'}</h4>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px' }}>
                <div>
                    <label style={{fontSize:'0.8rem', fontWeight:'bold'}}>Name</label>
                    <input name="name" value={doctorForm.name} onChange={handleInputChange} placeholder="Dr. Name" className="ai-input" required />
                </div>
                <div>
                    <label style={{fontSize:'0.8rem', fontWeight:'bold'}}>Specialization</label>
                    <input name="specialization" value={doctorForm.specialization} onChange={handleInputChange} placeholder="e.g. Cardiology" className="ai-input" required />
                </div>
                <div>
                    <label style={{fontSize:'0.8rem', fontWeight:'bold'}}>Licence No</label>
                    <input name="licenceNumber" value={doctorForm.licenceNumber} onChange={handleInputChange} placeholder="LIC-XXXX" className="ai-input" required />
                </div>
                <div>
                    <label style={{fontSize:'0.8rem', fontWeight:'bold'}}>Contact</label>
                    <input name="contactNumber" value={doctorForm.contactNumber} onChange={handleInputChange} placeholder="Phone Number" className="ai-input" required />
                </div>
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
                <th style={{ padding: '10px', textAlign: 'center' }}>Action</th>
            </tr>
        </thead>
        <tbody>
            {doctors.map(d => (
                <tr key={d.doctorId} style={{ borderBottom: '1px solid #f1f5f9' }}>
                    <td style={{ padding: '10px', fontWeight: '500' }}>{d.name}</td>
                    <td style={{ padding: '10px' }}>{d.specialization}</td>
                    <td style={{ padding: '10px' }}>{d.licenceNumber}</td>
                    <td style={{ padding: '10px', textAlign: 'center' }}>
                        <button onClick={() => handleEdit(d)} style={{ marginRight: '10px', border:'none', background:'#eff6ff', color:'#2563eb', padding:'5px 10px', borderRadius:'4px', cursor:'pointer' }}>✏️</button>
                        <button onClick={() => handleDelete(d.doctorId)} style={{ border:'none', background:'#fef2f2', color:'#dc2626', padding:'5px 10px', borderRadius:'4px', cursor:'pointer' }}>🗑️</button>
                    </td>
                </tr>
            ))}
            {doctors.length === 0 && (
                <tr><td colSpan="4" style={{textAlign:'center', padding:'20px', color:'#999'}}>No doctors added yet.</td></tr>
            )}
        </tbody>
      </table>
    </div>
  );
};

/* =========================================
   3. FACILITY MANAGEMENT (Status Toggle)
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
    // Optimistic Update: Update UI instantly
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
      setFacilities(originalState); // Revert on failure
      alert("Failed to update status. Server error.");
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
    } catch (error) { 
        alert("Error adding facility"); 
    } finally { 
        setIsLoading(false); 
    }
  };

  const handleDelete = async (id) => {
    if(!window.confirm("Remove this facility?")) return;
    try { 
        await api.delete(`/Facilities/${id}`); 
        fetchFacilities(); 
    } catch(e){
        alert("Could not delete.");
    }
  };

  return (
    <div className="card standard-card">
      <div style={{ marginBottom: '20px' }}>
        <h3>🏗️ Facility Status Control</h3>
        <p style={{ color: '#64748b', fontSize: '0.9rem' }}>
            Control which departments are "Active" for the AI matching algorithm.
            If a department is Full or Closed, toggle the switch OFF.
        </p>
      </div>

      <div style={{ display: 'flex', gap: '10px', marginBottom: '20px', padding:'15px', background:'#f8fafc', borderRadius:'10px' }}>
        <input 
            value={newFacilityName} 
            onChange={(e) => setNewFacilityName(e.target.value)} 
            placeholder="Add generic facility (e.g. ICU, Pharmacy)..." 
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
              padding: '15px', borderRadius: '10px', border: '1px solid',
              borderColor: f.availability ? '#bbf7d0' : '#fecaca',
              background: f.availability ? '#f0fdf4' : '#fef2f2',
              display: 'flex', justifyContent: 'space-between', alignItems: 'center',
              transition: 'all 0.3s ease'
            }}>
            <div>
              <div style={{ fontWeight: '600', fontSize:'1.1rem' }}>{f.facilityName}</div>
              <div style={{ fontSize: '0.8rem', fontWeight: 'bold', color: f.availability ? '#16a34a' : '#dc2626', marginTop:'5px' }}>
                {f.availability ? '● ACTIVE' : '○ CLOSED'}
              </div>
            </div>
            
            <div style={{ display:'flex', gap:'10px', alignItems:'center'}}>
                {/* Toggle Switch */}
                <label style={{ position: 'relative', display: 'inline-block', width: '44px', height: '24px' }}>
                    <input type="checkbox" checked={f.availability} onChange={() => toggleAvailability(f)} style={{ opacity: 0, width: 0, height: 0 }} />
                    <span style={{ position: 'absolute', cursor: 'pointer', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: f.availability ? '#22c55e' : '#cbd5e1', transition: '.4s', borderRadius: '34px' }}>
                        <span style={{ position: 'absolute', content: "", height: '18px', width: '18px', left: '3px', bottom: '3px', backgroundColor: 'white', transition: '.4s', borderRadius: '50%', transform: f.availability ? 'translateX(20px)' : 'translateX(0)' }}></span>
                    </span>
                </label>
                <button onClick={() => handleDelete(f.facilityId)} style={{ border:'none', background:'none', cursor:'pointer', fontSize:'1.2rem', opacity:0.5, color:'#dc2626' }}>×</button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

/* =========================================
   4. BED MANAGEMENT (Capacity Logic)
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
        Update total capacity and current occupancy. This data is displayed to emergency responders.
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

      <button onClick={handleSave} className="ai-analyze-btn" style={{ marginTop: '25px', padding: '12px 30px' }}>Update Live Status</button>
    </div>
  );
};

/* =========================================
   5. NEW MODULE: EMERGENCY REQUESTS (THE FORUM)
   ========================================= */
const EmergencyRequests = () => {
    const [requests, setRequests] = useState([]);
    const [loading, setLoading] = useState(true);

    // --- POLLING: Fetch data every 5 seconds ---
    useEffect(() => {
        // IMPORTANT: In a real app, retrieve the hospital ID from Login Data
        // localStorage.getItem('hospitalId');
        // We are using '2' (Sri Vignesh) as the hardcoded example
        const HOSPITAL_ID = 2; 

        const fetchRequests = async () => {
            try {
                // Ensure your C# RequestController endpoint matches this path
                const res = await api.get(`/Requests/hospital/${HOSPITAL_ID}`);
                setRequests(res.data);
                setLoading(false);
            } catch (error) {
                console.error("Polling Error", error);
            }
        };

        // Fetch immediately, then interval
        fetchRequests(); 
        const interval = setInterval(fetchRequests, 5000); 

        return () => clearInterval(interval);
    }, []);

    // Handle Accept/Decline
    const handleAction = async (requestId, status) => {
        try {
            await api.post(`/Requests/update-status/${requestId}`, JSON.stringify(status), {
                headers: { 'Content-Type': 'application/json' }
            });
            // Optimistic Update: Remove from list immediately
            setRequests(prev => prev.filter(r => r.requestId !== requestId));
            alert(`Request ${status}`);
        } catch (error) {
            alert("Error updating request status.");
        }
    };

    return (
        <div className="card standard-card">
            <h3>🚨 Live Emergency Requests</h3>
            <p style={{marginBottom:'20px', color:'#666'}}>
                Incoming admission requests from patients in the Emergency Map. 
                Approve to notify the user immediately.
            </p>

            {loading ? <p>Scanning network...</p> : requests.length === 0 ? (
                <div style={{textAlign:'center', padding:'40px', background:'#f8f9fa', borderRadius:'8px', border:'1px dashed #cbd5e1'}}>
                    <h4>✅ No Pending Emergencies</h4>
                    <p style={{color:'#666', fontSize:'0.9rem'}}>System is online and monitoring.</p>
                </div>
            ) : (
                <div style={{display:'grid', gap:'15px'}}>
                    {requests.map(req => (
                        <div key={req.requestId} style={{
                            borderLeft:'5px solid #dc3545', background:'#fff5f5', padding:'20px', 
                            borderRadius:'8px', display:'flex', justifyContent:'space-between', alignItems:'center',
                            boxShadow:'0 2px 8px rgba(0,0,0,0.05)', transition:'transform 0.2s'
                        }}>
                            <div>
                                <h4 style={{margin:0, color:'#c0392b', fontSize:'1.1rem'}}>🚨 INCOMING: {req.patientName || "User"}</h4>
                                <p style={{margin:'8px 0', fontWeight:'bold', fontSize:'1rem'}}>Condition: {req.symptomDescription}</p>
                                <div style={{fontSize:'0.9rem', color:'#555', marginBottom:'5px'}}>📞 Contact: {req.contactNumber}</div>
                                <small style={{color:'#888'}}>Requested at: {new Date(req.requestTime).toLocaleTimeString()}</small>
                            </div>
                            
                            <div style={{display:'flex', gap:'10px', flexDirection:'column'}}>
                                <button 
                                    onClick={() => handleAction(req.requestId, 'Accepted')}
                                    style={{
                                        background:'#27ae60', color:'white', border:'none', 
                                        padding:'10px 25px', borderRadius:'5px', cursor:'pointer', fontWeight:'bold',
                                        boxShadow:'0 2px 5px rgba(39, 174, 96, 0.3)'
                                    }}
                                >
                                    ✅ ACCEPT ADMIT
                                </button>
                                <button 
                                    onClick={() => handleAction(req.requestId, 'Declined')}
                                    style={{
                                        background:'#e74c3c', color:'white', border:'none', 
                                        padding:'10px 25px', borderRadius:'5px', cursor:'pointer', fontWeight:'bold',
                                        boxShadow:'0 2px 5px rgba(231, 76, 60, 0.3)'
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