import React, { useState } from 'react';
import HospitalLogin from './pages/Auth/HospitalLogin';
import HospitalSignup from './pages/Auth/HospitalSignup';
import UserLogin from './pages/Auth/UserLogin';
import UserSignup from './pages/Auth/UserSignup';
import HospitalDashboard from './pages/Hospital/HospitalDashboard';
import UserDashboard from './pages/User/UserDashboard';
import BodySelector from './components/BodySelector'; // Ensure this file exists in components folder

import './App.css';

const MedicalApp = () => {
  // --- STATE MANAGEMENT ---
  const [currentView, setCurrentView] = useState('main'); 
  const [activeTab, setActiveTab] = useState('home');
  
  const [selectedLanguage, setSelectedLanguage] = useState('English');
  const [symptomDescription, setSymptomDescription] = useState('');
  
  const [isLoading, setIsLoading] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  
  // Stores the detailed AI result for the popup card
  const [analysisResult, setAnalysisResult] = useState(null); 
  
  // Context to pass to the Dashboard when navigating
  const [medicalContext, setMedicalContext] = useState(null); 
  
  const [user, setUser] = useState(null);
  const [showHospitalLogin, setShowHospitalLogin] = useState(false);

  // Static Data for UI
  const criticalTags = [
    'heart attack', 'chest pain', 'stroke', 'bleeding', 
    'unconscious', 'difficulty breathing', 'severe pain', 'accident'
  ];

  const languages = ['English', 'Tamil', 'Hindi', 'Telugu', 'Malayalam'];

  // Language Dictionary for Dynamic Placeholders
  const placeholderText = {
    'English': "Describe your symptoms here... (e.g., headache, fever, chest pain)",
    'Tamil': "உங்கள் அறிகுறிகளை இங்கே விவரிக்கவும்... (எ.கா. தலைவலி, காய்ச்சல், நெஞ்சு வலி)",
    'Hindi': "अपने लक्षणों का वर्णन यहाँ करें... (जैसे सिरदर्द, बुखार, सीने में दर्द)",
    'Telugu': "మీ లక్షణాలను ఇక్కడ వివరించండి... (ఉదా. తలనొప్పి, జ్వరం, ఛాతీ నొప్పి)",
    'Malayalam': "നിങ്ങളുടെ ലക്ഷണങ്ങൾ ഇവിടെ വിവരിക്കുക... (ഉദാ. തലവേദന, പനി, നെഞ്ചുവേദന)"
  };

  // ------------------------------------------------------------
  // 1. PYTHON AI INTEGRATION (Voice & Text)
  // ------------------------------------------------------------

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mediaRecorder = new MediaRecorder(stream);
      const audioChunks = [];

      mediaRecorder.ondataavailable = (event) => audioChunks.push(event.data);
      
      mediaRecorder.onstop = async () => {
        const audioBlob = new Blob(audioChunks, { type: 'audio/wav' });
        stream.getTracks().forEach(track => track.stop()); // Stop mic tracks
        handleVoiceAnalysis(audioBlob); 
      };

      mediaRecorder.start();
      setIsRecording(true);
      
      // Auto-stop after 5 seconds
      setTimeout(() => {
        if(mediaRecorder.state !== 'inactive') mediaRecorder.stop();
        setIsRecording(false);
      }, 5000);

    } catch (err) {
      console.error("Mic Error:", err);
      alert("Microphone access denied. Please type symptoms.");
    }
  };

  const handleVoiceAnalysis = async (audioBlob) => {
    setIsLoading(true);
    const formData = new FormData();
    formData.append("file", audioBlob, "voice.wav");

    try {
        const response = await fetch("http://127.0.0.1:8000/analyze-audio/", {
            method: "POST",
            body: formData
        });
        
        if (!response.ok) throw new Error("AI Offline");
        const data = await response.json();
        
        // Update text area
        setSymptomDescription(data.transcribed_text || "");
        
        // Show Result Modal instead of Alert
        processAiResult(data.analysis);

    } catch (error) {
        alert("Could not connect to AI Brain (Port 8000).");
    } finally {
        setIsLoading(false);
    }
  };

  const handleTextAnalysis = async () => {
    if(!symptomDescription) return alert("Please enter symptoms.");
    
    setIsLoading(true);
    const formData = new FormData();
    formData.append("text", symptomDescription); 

    try {
        const response = await fetch("http://127.0.0.1:8000/analyze-text/", {
            method: "POST",
            body: formData
        });

        if (!response.ok) throw new Error("AI Offline");
        const data = await response.json();
        
        // Show Result Modal
        processAiResult(data.analysis);

    } catch (error) {
        alert("Error connecting to AI.");
    } finally {
        setIsLoading(false);
    }
  };

  const processAiResult = (analysis) => {
      // Instead of navigating immediately, show the Card Modal
      setAnalysisResult(analysis);
  };

  const handleModalProceed = () => {
      if (!analysisResult) return;

      const isCritical = analysisResult.final_status === "Critical";
      const specialty = analysisResult.disease_info.top_department;
      
      setMedicalContext({ specialty, isCritical });
      setAnalysisResult(null); // Close modal

      if (isCritical) {
          // BYPASS LOGIN
          setCurrentView('user-dashboard-emergency');
      } else {
          // REDIRECT TO LOGIN
          setCurrentView('user-login');
      }
  };

  const handleLogout = () => {
    setUser(null);
    setCurrentView('main');
  };

  // ------------------------------------------------------------
  // 2. UI RENDER FUNCTIONS
  // ------------------------------------------------------------

  const renderHeader = () => (
    <header className="app-header">
      <div className="header-content">
        <div className="logo-section">
          <h1 className="logo">🩺 Suvera</h1>
          <span className="tagline">Your Health Companion</span>
        </div>
        
        <nav className="nav-menu">
          <button className={`nav-btn ${activeTab === 'home' ? 'active' : ''}`} onClick={() => setActiveTab('home')}>Home</button>
          
          <button className={`nav-btn ${activeTab === 'hospitals' ? 'active' : ''}`} onClick={() => {
              if(window.confirm("Access to Hospital Directory requires Login. Proceed?")) setCurrentView('user-login');
          }}>Hospitals</button>
          
          <button className={`nav-btn ${activeTab === 'emergency' ? 'active' : ''}`} 
            style={{
                color: activeTab === 'emergency' ? 'white' : '#dc3545', 
                borderColor: '#dc3545', border: '1px solid #dc3545',
                background: activeTab === 'emergency' ? '#dc3545' : 'transparent',
                fontWeight: 'bold', transition: 'all 0.3s ease'
            }}
            onClick={() => setActiveTab('emergency')}>
            🚨 Emergency
          </button>
        </nav>

        <div className="auth-buttons">
          <button className="login-btn pill-btn" onClick={() => setCurrentView('user-login')}>Patient Login</button>
          <button className="register-btn pill-btn filled" onClick={() => setCurrentView('user-signup')}>Patient Signup</button>
        </div>
      </div>
    </header>
  );

  const renderFooter = () => (
    <footer className="app-footer">
      <div className="footer-content">
        <div className="footer-section">
          <h4 style={{color: '#667eea'}}>Suvera Health</h4>
          <p style={{fontSize:'0.9rem', color:'#ccc'}}>Your trusted health companion for emergency medical assistance and hospital discovery.</p>
        </div>
        <div className="footer-section">
          <h4>Quick Links</h4>
          <a href="#">Privacy Policy</a>
          <a href="#">Terms of Service</a>
          <a href="#">Contact Us</a>
        </div>
        <div className="footer-section">
          <h4>Emergency</h4>
          <div style={{display:'flex', alignItems:'center', gap:'5px', color:'white', marginBottom:'5px'}}>
             📞 Emergency Hotline: 108
          </div>
          <div style={{display:'flex', alignItems:'center', gap:'5px', color:'white'}}>
             🚑 Ambulance: 102
          </div>
          <button 
            style={{background:'#28a745', color:'white', border:'none', width:'100%', padding:'8px', marginTop:'10px', borderRadius:'5px', cursor:'pointer', fontWeight:'bold'}}
            onClick={() => setShowHospitalLogin(true)}
          >
            🏥 Hospital Login
          </button>
        </div>
        <div className="footer-section">
          <h4>For Hospitals</h4>
          <p style={{fontSize:'0.9rem', color:'#ccc', marginBottom:'10px'}}>Join our network to serve patients better</p>
          <button 
            style={{background:'transparent', color:'#ccc', border:'1px solid #ccc', width:'100%', padding:'8px', borderRadius:'5px', cursor:'pointer'}}
            onClick={() => setCurrentView('hospital-signup')}
          >
            Register Your Hospital
          </button>
        </div>
      </div>
      <div className="footer-bottom">
        <p>© 2025 Suvera Health. All rights reserved.</p>
      </div>

      {/* Hospital Login Modal */}
      {showHospitalLogin && (
        <div className="modal-overlay">
          <div className="modal" style={{textAlign:'center', padding:'40px', borderRadius:'15px', maxWidth:'450px', position:'relative'}}>
            <button onClick={() => setShowHospitalLogin(false)} style={{position:'absolute', top:'15px', right:'15px', background:'none', border:'none', fontSize:'1.5rem', color:'#999', cursor:'pointer'}}>&times;</button>
            <div style={{fontSize:'4rem', marginBottom:'10px'}}>🏥</div>
            <h2 style={{color:'#333', marginBottom:'10px'}}>Hospital Staff Portal</h2>
            <p style={{color:'#666', marginBottom:'25px', lineHeight:'1.5'}}>Restricted to authorized medical personnel and hospital administrators only.</p>
            <div style={{display:'flex', gap:'15px', justifyContent:'center'}}>
                <button style={{background:'#6c757d', color:'white', padding:'12px 25px', border:'none', borderRadius:'8px', cursor:'pointer', fontWeight:'600'}} onClick={() => setShowHospitalLogin(false)}>Cancel</button>
                <button style={{background:'linear-gradient(135deg, #667eea 0%, #764ba2 100%)', color:'white', padding:'12px 25px', border:'none', borderRadius:'8px', cursor:'pointer', fontWeight:'600', boxShadow:'0 4px 10px rgba(102, 126, 234, 0.4)'}} onClick={() => { setShowHospitalLogin(false); setCurrentView('hospital-login'); }}>🔐 Proceed</button>
            </div>
          </div>
        </div>
      )}
    </footer>
  );

  const handleBodySelection = (part) => {
      let specialty = "General";
      let text = "Selected: " + part;

      switch(part) {
          case 'Head': specialty = 'Neurology'; break;
          case 'Chest': specialty = 'Cardiology'; break;
          case 'Abdomen': specialty = 'Gastroenterology'; break;
          case 'Arms': case 'Legs': specialty = 'Orthopedics'; break;
          default: specialty = 'General';
      }

      const mockAnalysis = {
          final_status: "Critical",
          disease_info: {
              top_department: specialty,
              disease_prediction: `Possible Trauma/Injury to ${part}`
          }
      };
      // Show the same modal for body clicks
      setAnalysisResult(mockAnalysis);
  };

  const renderSOSEmergency = () => (
    <div className="sos-container fade-in" style={{ paddingBottom: '50px' }}>
        <div style={{textAlign:'center', marginBottom:'40px'}}>
            <div style={{fontSize:'3rem', animation:'pulse 1.5s infinite'}}>🚨</div>
            <h1 style={{color:'#333', fontSize:'2.5rem', marginBottom:'10px'}}>Emergency Assistance</h1>
            <p style={{fontSize:'1.1rem', color:'#666'}}>Tap your body area or select a service below.</p>
        </div>

        <div style={{display:'flex', flexWrap:'wrap', justifyContent:'center', gap:'50px', maxWidth:'1200px', margin:'0 auto'}}>
            <div style={{background:'white', padding:'30px', borderRadius:'20px', boxShadow:'0 10px 30px rgba(0,0,0,0.08)', minWidth:'320px', flex:'1'}}>
                <BodySelector onSelect={handleBodySelection} />
            </div>

            <div style={{flex:'1', minWidth:'320px', display:'grid', gap:'20px'}}>
                <div onClick={() => { setMedicalContext({specialty:'Emergency', isCritical:true}); setCurrentView('user-dashboard-emergency'); }} className="sos-card critical-red" style={{display:'flex', alignItems:'center', padding:'25px', cursor:'pointer', background:'white', borderRadius:'15px', borderBottom:'5px solid #dc3545', boxShadow:'0 4px 15px rgba(0,0,0,0.05)'}}>
                    <div style={{fontSize:'3rem', marginRight:'20px'}}>🚑</div>
                    <div><h3 style={{margin:0, fontSize:'1.4rem'}}>Medical Emergency</h3><p style={{margin:0, color:'#666'}}>Accidents, Bleeding, Heart</p></div>
                </div>

                <div onClick={() => window.location.href = "tel:101"} className="sos-card fire-orange" style={{display:'flex', alignItems:'center', padding:'25px', cursor:'pointer', background:'white', borderRadius:'15px', borderBottom:'5px solid #fd7e14', boxShadow:'0 4px 15px rgba(0,0,0,0.05)'}}>
                    <div style={{fontSize:'3rem', marginRight:'20px'}}>🚒</div>
                    <div><h3 style={{margin:0, fontSize:'1.4rem'}}>Fire & Rescue</h3><p style={{margin:0, color:'#666'}}>Call 101 immediately</p></div>
                </div>

                <div onClick={() => window.location.href = "tel:100"} className="sos-card police-blue" style={{display:'flex', alignItems:'center', padding:'25px', cursor:'pointer', background:'white', borderRadius:'15px', borderBottom:'5px solid #0d6efd', boxShadow:'0 4px 15px rgba(0,0,0,0.05)'}}>
                    <div style={{fontSize:'3rem', marginRight:'20px'}}>🚓</div>
                    <div><h3 style={{margin:0, fontSize:'1.4rem'}}>Police Control</h3><p style={{margin:0, color:'#666'}}>Threats, Crime, Safety</p></div>
                </div>

                <button onClick={() => {
                        navigator.geolocation.getCurrentPosition(pos => {
                            const link = `https://maps.google.com/?q=${pos.coords.latitude},${pos.coords.longitude}`;
                            navigator.clipboard.writeText(link);
                            alert("📍 Location Copied! Send to responders.");
                        }, () => alert("Enable GPS first."));
                    }}
                    style={{background:'#333', color:'white', padding:'20px', border:'none', borderRadius:'15px', cursor:'pointer', fontSize:'1.1rem', fontWeight:'bold', display:'flex', alignItems:'center', justifyContent:'center', gap:'10px'}}
                >
                    📍 Share My Coordinates
                </button>
            </div>
        </div>
    </div>
  );

  const renderHomeContent = () => (
    <div className="home-tab">
      <div style={{textAlign:'center', marginTop:'20px', color:'white'}}>
        <h2 style={{fontSize:'2.5rem', fontWeight:'bold', marginBottom:'10px', textShadow:'0 2px 4px rgba(0,0,0,0.2)'}}>Find the Right Medical Help</h2>
        <p style={{fontSize:'1.1rem', opacity:0.9}}>Describe your symptoms and we'll help you find the nearest appropriate hospital</p>
      </div>

      <div style={{background:'#fff3cd', border:'1px solid #ffeeba', color:'#856404', padding:'15px', borderRadius:'8px', maxWidth:'600px', margin:'20px auto', display:'flex', alignItems:'center', justifyContent:'center', gap:'10px', fontWeight:'500'}}>
          🚨 <span><strong>Emergency cases</strong> bypass login and go directly to hospitals</span>
      </div>

      <div style={{maxWidth:'300px', margin:'0 auto 20px auto', background:'white', padding:'10px 20px', borderRadius:'8px', display:'flex', alignItems:'center', justifyContent:'space-between', boxShadow:'0 4px 6px rgba(0,0,0,0.1)'}}>
          <span style={{color:'#333', fontWeight:'500'}}>Select Language:</span>
          <select value={selectedLanguage} onChange={(e) => { setSelectedLanguage(e.target.value); setSymptomDescription(""); }} style={{border:'1px solid #ddd', padding:'5px', borderRadius:'4px'}}>
              {languages.map(lang => <option key={lang} value={lang}>{lang}</option>)}
          </select>
      </div>

      <div style={{background:'white', borderRadius:'15px', padding:'30px', maxWidth:'900px', margin:'0 auto', boxShadow:'0 10px 30px rgba(0,0,0,0.15)', position:'relative'}}>
          <div style={{display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:'15px'}}>
              <h3 style={{margin:0, color:'#333', fontSize:'1.4rem'}}>Describe Your Symptoms</h3>
              <button onClick={startRecording} style={{background: isRecording ? '#dc3545' : '#28a745', color:'white', border:'none', padding:'8px 20px', borderRadius:'20px', display:'flex', alignItems:'center', gap:'8px', cursor:'pointer', fontWeight:'bold', fontSize:'0.9rem'}}>
                 {isRecording ? <span className="pulse"></span> : '🎤'} {isRecording ? 'Listening...' : 'Voice Input'}
              </button>
          </div>

           <textarea 
            value={symptomDescription}
            onChange={(e) => setSymptomDescription(e.target.value)}
            placeholder={placeholderText[selectedLanguage] || placeholderText['English']} 
            style={{width:'100%', height:'150px', padding:'15px', borderRadius:'8px', border:'1px solid #ddd', fontSize:'1rem', resize:'vertical', fontFamily:'inherit', marginBottom:'20px', backgroundColor: '#f9f9f9'}}
          />

          <div style={{background:'#fff5f5', borderLeft:'4px solid #dc3545', padding:'15px', borderRadius:'4px', marginBottom:'25px'}}>
              <div style={{color:'#dc3545', fontWeight:'bold', marginBottom:'10px', fontSize:'0.9rem'}}>🚨 Critical Symptoms (No Login Required):</div>
              <div style={{display:'flex', flexWrap:'wrap', gap:'8px'}}>
                  {criticalTags.map(tag => (
                      <span key={tag} style={{background:'#dc3545', color:'white', padding:'4px 12px', borderRadius:'15px', fontSize:'0.8rem', fontWeight:'600'}}>
                          {tag}
                      </span>
                  ))}
              </div>
          </div>

          <div style={{textAlign:'center'}}>
              <button onClick={handleTextAnalysis} disabled={isLoading} style={{background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)', color:'white', border:'none', padding:'12px 40px', borderRadius:'8px', fontSize:'1.1rem', fontWeight:'bold', cursor:'pointer', boxShadow:'0 4px 15px rgba(102, 126, 234, 0.4)', opacity: isLoading ? 0.7 : 1}}>
                  {isLoading ? '🧠 Analyzing Symptoms...' : '🏥 Find Medical Help'}
              </button>
          </div>
      </div>
    </div>
  );

  const renderCurrentView = () => {
    switch (currentView) {
      case 'hospital-login': return <HospitalLogin onLogin={() => setCurrentView('hospital-dashboard')} onSwitchToSignup={() => setCurrentView('hospital-signup')} onBack={() => setCurrentView('main')} />;
      case 'hospital-signup': return <HospitalSignup onSwitchToLogin={() => setCurrentView('hospital-login')} onBack={() => setCurrentView('main')} />;
      case 'user-login': return <UserLogin onLogin={() => setCurrentView('user-dashboard')} onSwitchToSignup={() => setCurrentView('user-signup')} onBack={() => setCurrentView('main')} />;
      case 'user-signup': return <UserSignup onSignup={() => setCurrentView('user-dashboard')} onSwitchToLogin={() => setCurrentView('user-login')} onBack={() => setCurrentView('main')} />;
      case 'hospital-dashboard': return <HospitalDashboard onLogout={handleLogout} />;
      case 'user-dashboard': return <UserDashboard onLogout={handleLogout} initialMode="dashboard" />;
      case 'user-dashboard-emergency': return <UserDashboard onLogout={handleLogout} initialMode="emergency" emergencyContext={medicalContext} />;
      default:
        return (
          <div className="medical-app">
            {renderHeader()}
            <main className="main-content">
              {activeTab === 'emergency' ? renderSOSEmergency() : renderHomeContent()}
            </main>
            {renderFooter()}

            {/* 🔥 NEW ANALYSIS RESULT CARD MODAL 🔥 */}
            {analysisResult && (
                <div className="modal-overlay">
                    <div className="modal" style={{padding:'0', maxWidth:'500px', borderTop: `8px solid ${analysisResult.final_status === 'Critical' ? '#dc3545' : '#0d6efd'}`, overflow:'hidden', borderRadius:'12px'}}>
                        <div style={{padding:'20px', borderBottom:'1px solid #eee', background:'#f8f9fa', display:'flex', justifyContent:'space-between', alignItems:'center'}}>
                            <h2 style={{margin:0, fontSize:'1.3rem'}}>Medical Assessment</h2>
                            <span style={{
                                padding:'5px 12px', borderRadius:'15px', fontWeight:'bold', fontSize:'0.85rem',
                                background: analysisResult.final_status === 'Critical' ? '#ffebee' : '#e8f5e9',
                                color: analysisResult.final_status === 'Critical' ? '#c62828' : '#2e7d32'
                            }}>
                                {analysisResult.final_status.toUpperCase()}
                            </span>
                        </div>
                        <div style={{padding:'30px', textAlign:'left'}}>
                            <div style={{marginBottom:'20px'}}>
                                <div style={{fontSize:'0.9rem', color:'#666', textTransform:'uppercase', fontWeight:'bold'}}>Suspected Condition</div>
                                <div style={{fontSize:'1.5rem', fontWeight:'bold', color:'#333'}}>{analysisResult.disease_info.disease_prediction}</div>
                            </div>
                            <div style={{marginBottom:'20px'}}>
                                <div style={{fontSize:'0.9rem', color:'#666', textTransform:'uppercase', fontWeight:'bold'}}>Required Department</div>
                                <div style={{fontSize:'1.2rem', fontWeight:'600', color: analysisResult.final_status === 'Critical' ? '#d32f2f' : '#2563eb'}}>
                                    🩺 {analysisResult.disease_info.top_department}
                                </div>
                            </div>
                            <p style={{fontSize:'0.95rem', color:'#555', background:'#f9f9f9', padding:'15px', borderRadius:'8px', lineHeight:'1.5'}}>
                                {analysisResult.final_status === 'Critical' 
                                    ? "⚠️ This is classified as a CRITICAL case. Login bypass is enabled to access the nearest specialized hospital immediately."
                                    : "ℹ️ This appears to be a NON-EMERGENCY condition. We recommend booking an appointment with a specialist via patient login."}
                            </p>
                        </div>
                        <div style={{padding:'20px', background:'#f8f9fa', borderTop:'1px solid #eee', display:'flex', justifyContent:'flex-end', gap:'15px'}}>
                            <button onClick={() => setAnalysisResult(null)} style={{background:'white', border:'1px solid #ccc', padding:'12px 25px', borderRadius:'6px', fontWeight:'bold', cursor:'pointer', color:'#555'}}>Cancel</button>
                            <button 
                                onClick={handleModalProceed}
                                style={{
                                    background: analysisResult.final_status === 'Critical' ? '#dc3545' : '#2563eb',
                                    color:'white', padding:'12px 30px', borderRadius:'6px', fontWeight:'bold', cursor:'pointer', border:'none',
                                    boxShadow: `0 4px 12px ${analysisResult.final_status === 'Critical' ? 'rgba(220, 53, 69, 0.4)' : 'rgba(37, 99, 235, 0.4)'}`
                                }}
                            >
                                {analysisResult.final_status === 'Critical' ? '🚨 LOCATE EMERGENCY CENTER' : '📅 LOGIN TO BOOK APPOINTMENT'}
                            </button>
                        </div>
                    </div>
                </div>
            )}
          </div>
        );
    }
  };

  return <>{renderCurrentView()}</>;
};

export default MedicalApp;