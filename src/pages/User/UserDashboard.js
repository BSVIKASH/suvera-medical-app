import React, { useState } from 'react';
import NearbyHospitals from "./NearbyHospitals";

 // Import the new file
import '../../styles/Dashboard.css';

const UserDashboard = ({ onLogout }) => {
  const [activeModule, setActiveModule] = useState('dashboard');

  // --- MENU CONFIGURATION ---
  const menuItems = [
    { key: 'dashboard', icon: '📊', label: 'Dashboard', description: 'Health overview' },
    { key: 'emergency', icon: '🚨', label: 'Emergency', description: 'Get help now' },
    { key: 'nearby', icon: '📍', label: 'Hospitals', description: 'Find nearby' }, // This triggers the new page
    { key: 'first-aid', icon: '🩹', label: 'First Aid', description: 'Medical guide' },
    { key: 'profile', icon: '👤', label: 'Profile', description: 'My account' },
  ];

  // --- CONDITIONAL RENDERING ---
  // If "nearby" is active, we return the Full Page Map component immediately
  // effectively "navigating" away from the standard dashboard layout
  if (activeModule === 'nearby') {
    return <NearbyHospitals onBack={() => setActiveModule('dashboard')} />;
  }

  // --- STANDARD DASHBOARD RENDER ---
  const renderModule = () => {
    switch(activeModule) {
      case 'emergency':
        return <EmergencyAssistance />;
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
      <aside className="sidebar compact-sidebar">
        <div className="sidebar-header">
          <div className="logo-icon">🏥</div>
          <div className="app-name">Suvera</div>
        </div>
        
        <nav className="sidebar-nav">
          {menuItems.map((item) => (
            <button 
              key={item.key}
              className={`nav-btn ${activeModule === item.key ? 'active' : ''}`}
              onClick={() => setActiveModule(item.key)}
            >
              <span className="nav-icon">{item.icon}</span>
              <div className="nav-content">
                <div className="nav-label">{item.label}</div>
                <div className="nav-description">{item.description}</div>
              </div>
            </button>
          ))}
        </nav>

        <div className="sidebar-footer">
          <button className="nav-btn logout-btn" onClick={onLogout}>
            <span className="nav-icon">🚪</span>
            <div className="nav-content">
              <div className="nav-label">Logout</div>
              <div className="nav-description">Sign out</div>
            </div>
          </button>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="main-content">
        <header className="dashboard-header">
          <div className="header-title">
            <h1>{menuItems.find(item => item.key === activeModule)?.label || 'Dashboard'}</h1>
            <p>{menuItems.find(item => item.key === activeModule)?.description}</p>
          </div>
        </header>

        {renderModule()}
      </main>
    </div>
  );
};

// ... (Rest of your existing components: DashboardHome, EmergencyAssistance, etc.) ...
// Ensure you copy your existing sub-components here

const DashboardHome = () => <div className="content-card"><h3>Welcome Home</h3></div>;
const EmergencyAssistance = () => <div className="content-card"><h3>Emergency Page</h3></div>;
const FirstAidChatbot = () => <div className="content-card"><h3>First Aid Bot</h3></div>;
const UserProfile = () => <div className="content-card"><h3>User Profile</h3></div>;

export default UserDashboard;