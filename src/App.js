import React, { useState } from 'react';
import HospitalLogin from './pages/Auth/HospitalLogin';
import HospitalSignup from './pages/Auth/HospitalSignup';
import UserLogin from './pages/Auth/UserLogin';
import UserSignup from './pages/Auth/UserSignup';
import HospitalDashboard from './pages/Hospital/HospitalDashboard';
import UserDashboard from './pages/User/UserDashboard';

import './App.css';

const MedicalApp = () => {
  const [currentView, setCurrentView] = useState('main');
  const [selectedLanguage, setSelectedLanguage] = useState('english');
  const [symptomDescription, setSymptomDescription] = useState('');
  const [hospitals, setHospitals] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [activeTab, setActiveTab] = useState('home');
  const [isListening, setIsListening] = useState(false);
  const [user, setUser] = useState(null);
  const [userType, setUserType] = useState(null);
  const [showHospitalLogin, setShowHospitalLogin] = useState(false);

  // Critical symptoms that bypass login
  const criticalSymptoms = [
    'heart attack', 'chest pain', 'stroke', 'bleeding', 'unconscious',
    'difficulty breathing', 'severe pain', 'accident', 'fracture',
    'burn', 'poisoning', 'seizure', 'allergic reaction', 'cardiac',
    'choking', 'head injury', 'paralysis'
  ];

  // Language options
  const languages = [
    { value: 'english', label: 'English' },
    { value: 'tamil', label: 'Tamil' },
    { value: 'hindi', label: 'Hindi' },
    { value: 'telugu', label: 'Telugu' }
  ];

  // Mock hospital database
  const hospitalDatabase = [
    { id: 1, name: 'City General Hospital', specialization: 'Multi-specialty, Emergency Care', address: '123 Main Street, Chennai', phone: '044-12345678', emergency: true },
    { id: 2, name: 'Community Health Center', specialization: 'General Medicine, Pediatrics', address: '456 Oak Avenue, Chennai', phone: '044-23456789', emergency: true },
    { id: 3, name: 'Apollo Speciality Hospital', specialization: 'Cardiology, Orthopedics', address: '789 Gandhi Road, Chennai', phone: '044-34567890', emergency: true },
    { id: 4, name: 'Madras Medical Mission', specialization: 'Heart Care, Neurology', address: '321 Mount Road, Chennai', phone: '044-45678901', emergency: true },
    { id: 5, name: 'Sri Ramachandra Hospital', specialization: 'Multi-specialty, Research', address: '987 Porur Road, Chennai', phone: '044-56789012', emergency: true },
    { id: 6, name: 'MIOT International', specialization: 'Orthopedics, Organ Transplant', address: '654 Ambattur Road, Chennai', phone: '044-67890123', emergency: true }
  ];

  // --- HELPER FUNCTIONS (Instead of Components) ---

  const renderHeader = () => (
    <header className="app-header">
      <div className="header-content">
        <div className="logo-section">
          <h1 className="logo">🩺 Suvera</h1>
          <span className="tagline">Your Health Companion</span>
        </div>
        
        <nav className="nav-menu">
          <button 
            className={`nav-btn ${activeTab === 'home' ? 'active' : ''}`}
            onClick={() => setActiveTab('home')}
          >
            Home
          </button>
          <button 
            className={`nav-btn ${activeTab === 'hospitals' ? 'active' : ''}`}
            onClick={() => setActiveTab('hospitals')}
          >
            Hospitals
          </button>
          <button 
            className={`nav-btn ${activeTab === 'emergency' ? 'active' : ''}`}
            onClick={() => setActiveTab('emergency')}
          >
            Emergency
          </button>
        </nav>

        <div className="auth-section">
          {user ? (
            <div className="user-info">
              <span>Welcome, {user.name}</span>
              <button className="logout-btn" onClick={handleLogout}>Logout</button>
            </div>
          ) : (
            <div className="auth-buttons">
              <button 
                className="login-btn" 
                onClick={() => setCurrentView('user-login')}
              >
                Patient Login
              </button>
              <button 
                className="register-btn" 
                onClick={() => setCurrentView('user-signup')}
              >
                Patient Signup
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );

  const renderFooter = () => (
    <footer className="app-footer">
      <div className="footer-content">
        <div className="footer-section">
          <h4>Suvera Health</h4>
          <p>Your trusted health companion for emergency medical assistance and hospital discovery.</p>
        </div>
        
        <div className="footer-section">
          <h4>Quick Links</h4>
          <a href="#privacy">Privacy Policy</a>
          <a href="#terms">Terms of Service</a>
          <a href="#contact">Contact Us</a>
        </div>
        
        <div className="footer-section">
          <h4>Emergency</h4>
          <p>📞 Emergency Hotline: 108</p>
          <p>🏥 Ambulance: 102</p>
          <button 
            className="hospital-login-btn"
            onClick={() => setShowHospitalLogin(true)}
          >
            🏥 Hospital Login
          </button>
        </div>

        <div className="footer-section">
          <h4>For Hospitals</h4>
          <p>Join our network to serve patients better</p>
          <button 
            className="hospital-register-btn"
            onClick={() => setCurrentView('hospital-signup')}
          >
            Register Your Hospital
          </button>
        </div>
      </div>
      
      <div className="footer-bottom">
        <p>&copy; 2024 Suvera Health. All rights reserved.</p>
      </div>

      {/* Hospital Login Modal */}
      {showHospitalLogin && (
        <div className="modal-overlay">
          <div className="modal">
            <div className="modal-header">
              <h3>🏥 Hospital Login</h3>
              <button className="close-btn" onClick={() => setShowHospitalLogin(false)}>×</button>
            </div>
            <div className="modal-body">
              <p>Access your hospital dashboard to manage emergency requests and patient care.</p>
              <div className="modal-actions">
                <button 
                  className="auth-btn"
                  onClick={() => {
                    setShowHospitalLogin(false);
                    setCurrentView('hospital-login');
                  }}
                >
                  Go to Hospital Login
                </button>
                <button 
                  className="back-btn"
                  onClick={() => setShowHospitalLogin(false)}
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </footer>
  );

  const renderSOSEmergency = () => (
    <div className="sos-section">
      <div className="sos-header">
        <h2>🚨 Emergency SOS</h2>
        <p>Immediate medical assistance - No login required for emergencies</p>
      </div>
      <div className="sos-buttons">
        <button className="sos-btn critical" onClick={() => handleCriticalEmergency()}>Call Ambulance (102)</button>
        <button className="sos-btn emergency" onClick={() => handleCriticalEmergency()}>Emergency Hotline (108)</button>
        <button className="sos-btn nearby" onClick={() => handleCriticalEmergency()}>Find Nearest Hospital</button>
      </div>
      <div className="emergency-contacts">
        <h4>Emergency Contacts:</h4>
        <div className="contacts-grid">
          <div className="contact-card">
            <span>🚑 Ambulance</span>
            <strong>102</strong>
          </div>
          <div className="contact-card">
            <span>🆘 Emergency</span>
            <strong>108</strong>
          </div>
          <div className="contact-card">
            <span>👮 Police</span>
            <strong>100</strong>
          </div>
          <div className="contact-card">
            <span>🚒 Fire</span>
            <strong>101</strong>
          </div>
        </div>
      </div>
    </div>
  );

  // Check if symptoms are critical
  const isCriticalSymptom = (symptoms) => {
    const symptomText = symptoms.toLowerCase();
    return criticalSymptoms.some(critical => symptomText.includes(critical));
  };

  // Handle critical emergency - direct to hospitals
  const handleCriticalEmergency = () => {
    setHospitals(hospitalDatabase.filter(h => h.emergency));
    setActiveTab('hospitals');
    window.scrollTo(0, 0);
  };

  // Voice Recognition Functionality
  const renderVoiceRecognition = () => {
    const startListening = () => {
      setIsListening(true);
      setTimeout(() => {
        setIsListening(false);
        const mockSymptoms = "I have severe chest pain and difficulty breathing";
        setSymptomDescription(mockSymptoms);
        alert("Voice input captured: 'I have severe chest pain and difficulty breathing'");
      }, 2000);
    };

    const stopListening = () => {
      setIsListening(false);
    };

    return (
      <div className="voice-section">
        <h4>🎤 Voice Input</h4>
        <div className="voice-controls">
          {!isListening ? (
            <button className="voice-btn start" onClick={startListening}>
              Start Speaking
            </button>
          ) : (
            <button className="voice-btn stop" onClick={stopListening}>
              Stop Listening
            </button>
          )}
        </div>
        {isListening && (
          <div className="listening-indicator">
            <div className="pulse"></div>
            <span>Listening... Speak now</span>
          </div>
        )}
      </div>
    );
  };

  // Main Home Content (Changed from Component to Function)
  const renderHomeContent = () => (
    <div className="home-tab">
      <div className="hero-section">
        <h2>Find the Right Medical Help</h2>
        <p>Describe your symptoms and we'll help you find the nearest appropriate hospital</p>
        <div className="emergency-notice">
          <span className="emergency-badge">🚨</span>
          <strong>Emergency cases bypass login and go directly to hospitals</strong>
        </div>
      </div>

      {/* Language Selector */}
      <div className="language-selector">
        <label>Select Language for Symptoms: </label>
        <select value={selectedLanguage} onChange={(e) => setSelectedLanguage(e.target.value)}>
          {languages.map(lang => (
            <option key={lang.value} value={lang.value}>{lang.label}</option>
          ))}
        </select>
      </div>

      {/* Symptom Input Section */}
      <div className="symptom-section">
        <div className="section-header">
          <h3>Describe Your Symptoms</h3>
          {renderVoiceRecognition()}
        </div>
        
        <textarea
          value={symptomDescription}
          onChange={(e) => setSymptomDescription(e.target.value)}
          placeholder={
            selectedLanguage === 'tamil' ? 'உங்கள் அறிகுறிகளை இங்கே விவரிக்கவும்...' :
            selectedLanguage === 'hindi' ? 'अपने लक्षणों का वर्णन यहाँ करें...' :
            selectedLanguage === 'telugu' ? 'మీ లక్షణాలను ఇక్కడ వివరించండి...' :
            'Describe your symptoms here... (e.g., headache, fever, chest pain)'
          }
          className="symptom-input"
          rows="5"
        />

        <div className="symptom-guidelines">
          <h4>🚨 Critical Symptoms (No Login Required):</h4>
          <div className="critical-list">
            {criticalSymptoms.slice(0, 8).map((symptom, index) => (
              <span key={index} className="critical-tag">{symptom}</span>
            ))}
          </div>
        </div>

        <div className="button-section">
          <button 
            onClick={searchHospitals} 
            disabled={isLoading}
            className="search-button"
          >
            {isLoading ? '🔍 Analyzing Symptoms...' : '🏥 Find Medical Help'}
          </button>
        </div>
      </div>

      {/* Hospital Results */}
      {hospitals.length > 0 && (
        <div className="hospital-results">
          <div className="results-header">
            <h3>
              {isCriticalSymptom(symptomDescription) ? '🚨 Emergency Hospitals Nearby' : 'Recommended Hospitals'}
            </h3>
            {isCriticalSymptom(symptomDescription) && (
              <div className="emergency-alert">
                ⚠️ Emergency Case Detected - Direct hospital access granted
              </div>
            )}
          </div>
          <div className="hospital-list">
            {hospitals.map(hospital => (
              <div key={hospital.id} className="hospital-card">
                <h4>{hospital.name}</h4>
                <p className="specialization">{hospital.specialization}</p>
                <p className="address">{hospital.address}</p>
                <p className="phone">📞 {hospital.phone}</p>
                <div className="card-actions">
                  <button className="contact-btn">Call Now</button>
                  <button className="direction-btn">Get Directions</button>
                  {isCriticalSymptom(symptomDescription) && (
                    <button className="emergency-btn">🚨 Emergency</button>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );

  // Hospitals Tab Content (Changed from Component to Function)
  const renderHospitalsTab = () => (
    <div className="hospitals-tab">
      <h2>🏥 All Hospitals</h2>
      <div className="hospital-grid">
        {hospitalDatabase.map(hospital => (
          <div key={hospital.id} className="hospital-card">
            <h4>{hospital.name}</h4>
            <p className="specialization">{hospital.specialization}</p>
            <p className="address">{hospital.address}</p>
            <p className="phone">📞 {hospital.phone}</p>
            <button className="contact-btn">Get Directions</button>
          </div>
        ))}
      </div>
    </div>
  );

  // Render main content based on active tab
  const renderMainContent = () => {
    switch (activeTab) {
      case 'hospitals':
        return renderHospitalsTab(); // Called as function
      case 'emergency':
        return renderSOSEmergency(); // Called as function
      default:
        return renderHomeContent(); // Called as function - THIS FIXES THE BUG
    }
  };

  // Handler functions
  const handleLogout = () => {
    setUser(null);
    setUserType(null);
    setCurrentView('main');
  };

  const handleUserLogin = () => {
    setUser({ name: 'Patient User', type: 'patient' });
    setUserType('patient');
    setCurrentView('user-dashboard');
  };

  const handleHospitalLogin = () => {
    setUser({ name: 'Hospital Admin', type: 'hospital' });
    setUserType('hospital');
    setCurrentView('hospital-dashboard');
  };

  const handleUserSignup = () => {
    setUser({ name: 'New Patient', type: 'patient' });
    setUserType('patient');
    setCurrentView('user-dashboard');
  };

  const handleHospitalSignup = () => {
    setUser({ name: 'New Hospital', type: 'hospital' });
    setUserType('hospital');
    setCurrentView('hospital-dashboard');
  };

  // Search hospitals with critical symptom detection
  const searchHospitals = async () => {
    if (!symptomDescription.trim()) {
      alert('Please describe your symptoms');
      return;
    }

    setIsLoading(true);

    try {
      if (isCriticalSymptom(symptomDescription)) {
        setHospitals(hospitalDatabase.filter(h => h.emergency));
        setTimeout(() => {
          alert('🚨 Emergency symptoms detected! Directing you to emergency hospitals immediately.');
        }, 500);
      } else {
        if (!user) {
          setTimeout(() => {
            alert('Please login to access hospital recommendations for non-emergency symptoms.');
            setCurrentView('user-login');
          }, 500);
          return;
        }
        
        let symptomsToSearch = symptomDescription;
        if (selectedLanguage !== 'english') {
          symptomsToSearch = await translateSymptoms(symptomDescription, selectedLanguage, 'english');
        }
        const relevantHospitals = await fetchHospitalsBySymptoms(symptomsToSearch);
        setHospitals(relevantHospitals);
      }
    } catch (error) {
      console.error('Error:', error);
      alert('Error processing your request');
    } finally {
      setIsLoading(false);
    }
  };

  // Mock translation function
  const translateSymptoms = async (text, fromLang, toLang) => {
    await new Promise(resolve => setTimeout(resolve, 500));
    const translations = {
      tamil: { 'தலைவலி': 'headache', 'காய்ச்சல்': 'fever', 'இருமல்': 'cough', 'சளி': 'cold', 'மூட்டு வலி': 'joint pain', 'நெஞ்சு வலி': 'chest pain' },
      hindi: { 'सिरदर्द': 'headache', 'बुखार': 'fever', 'खांसी': 'cough', 'जुकाम': 'cold', 'जोड़ों का दर्द': 'joint pain', 'सीने में दर्द': 'chest pain' },
      telugu: { 'తలనొప్పి': 'headache', 'జ్వరం': 'fever', 'దగ్గు': 'cough', 'జలుబు': 'cold', 'కీళ్ళ నొప్పి': 'joint pain', 'ఛాతీ నొప్పి': 'chest pain' }
    };
    return fromLang !== 'english' && translations[fromLang] ? translations[fromLang][text] || text : text.toLowerCase();
  };

  const fetchHospitalsBySymptoms = async (symptoms) => {
    await new Promise(resolve => setTimeout(resolve, 1000));
    const keywordMap = {
      'headache': [1, 3, 4], 'fever': [1, 2, 5], 'cough': [1, 2], 'cold': [1, 2],
      'chest pain': [3, 4], 'heart': [3, 4], 'bone': [3, 6], 'fracture': [3, 6]
    };
    const relevantIds = new Set();
    symptoms.toLowerCase().split(' ').forEach(word => {
      if (keywordMap[word]) keywordMap[word].forEach(id => relevantIds.add(id));
    });
    return relevantIds.size > 0 ? hospitalDatabase.filter(h => relevantIds.has(h.id)) : hospitalDatabase.slice(0, 3);
  };

  // Render different views based on currentView state
  const renderCurrentView = () => {
    switch (currentView) {
      case 'hospital-login':
        return <HospitalLogin onLogin={handleHospitalLogin} onSwitchToSignup={() => setCurrentView('hospital-signup')} onBack={() => setCurrentView('main')} />;
      
      case 'hospital-signup':
        return <HospitalSignup onSignup={handleHospitalSignup} onSwitchToLogin={() => setCurrentView('hospital-login')} onBack={() => setCurrentView('main')} />;
      
      case 'user-login':
        return <UserLogin onLogin={handleUserLogin} onSwitchToSignup={() => setCurrentView('user-signup')} onBack={() => setCurrentView('main')} />;
      
      case 'user-signup':
        return <UserSignup onSignup={handleUserSignup} onSwitchToLogin={() => setCurrentView('user-login')} onBack={() => setCurrentView('main')} />;
      
      case 'hospital-dashboard':
        return <HospitalDashboard onLogout={handleLogout} />;
      
      case 'user-dashboard':
        return <UserDashboard onLogout={handleLogout} />;
      
      default:
        return (
          <>
            {renderHeader()}
            <main className="main-content">
              {renderMainContent()}
            </main>
            {renderFooter()}
          </>
        );
    }
  };

  return (
    <div className="medical-app">
      {renderCurrentView()}
    </div>
  );
};

export default MedicalApp;