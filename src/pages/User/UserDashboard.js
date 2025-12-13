import React, { useState, useRef, useEffect } from 'react';
import api from '../../api'; // ✅ Import API
import NearbyHospitals from "./NearbyHospitals";
import EmergencyMap from "./EmergencyMap"; // ✅ IMPORT NEW EMERGENCY MAP
import '../../styles/Dashboard.css';
import '../../styles/Chatbot.css'; 

// --- 1. CHATBOT COMPONENT (FULLY RESTORED) ---
const MedicalChatbot = () => {
    const GROQ_API_KEY = process.env.REACT_APP_GROQ_API_KEY; 
    const [messages, setMessages] = useState([
        { 
            id: 1, 
            text: "Hello! I am Suvera - your Personal Doc. <br> How can I help you today?", 
            sender: 'bot', 
            isHtml: true 
        }
    ]);
    const [input, setInput] = useState("");
    const [isLoading, setIsLoading] = useState(false);
    const chatBoxRef = useRef(null);

    useEffect(() => {
        if (chatBoxRef.current) {
            chatBoxRef.current.scrollTop = chatBoxRef.current.scrollHeight;
        }
    }, [messages, isLoading]);

    const handleSend = async (textOverride = null) => {
        const text = textOverride || input.trim();
        if (!text) return;

        const userMsg = { id: Date.now(), text: text, sender: 'user', isHtml: false };
        setMessages(prev => [...prev, userMsg]);
        setInput("");
        setIsLoading(true);

        const lowerInput = text.toLowerCase();
        if (lowerInput === "hi" || lowerInput === "hello") {
            setTimeout(() => {
                addBotMessage("Hello! Please describe your symptoms.");
                setIsLoading(false);
            }, 600);
            return;
        }

        try {
            const response = await fetch("https://api.groq.com/openai/v1/chat/completions", {
                method: "POST",
                headers: { 
                    "Content-Type": "application/json",
                    "Authorization": `Bearer ${GROQ_API_KEY}`
                },
                body: JSON.stringify({
                    model: "llama-3.1-8b-instant",
                    messages: [
                        { 
                            role: "system", 
                            content: `You are Suvera, an expert Medical AI Assistant. 
                            1. ANALYZE symptoms carefully.
                            2. IF CRITICAL (Heart attack, Stroke, TB, Severe Burns): Start with "⚠️ **CRITICAL WARNING**" and advise immediate doctor visit.
                            3. STRICT RESPONSE FORMAT:
                               - **Condition:** [Name of disease]
                               - **Home Remedy:** [Immediate relief steps only. If serious, say 'Medical attention required']
                               - **Dos:** [Actionable advice starting with verbs, e.g., 'Wear a mask', 'Isolate', 'Drink water']
                               - **Donts:** [What to avoid, e.g., 'Don't share food', 'Avoid cold water']
                            4. NEVER list time durations (like '6 months') under 'Dos'. Dos must be ACTIONS.
                            5. Keep it concise.`
                        },
                        { role: "user", content: text }
                    ]
                })
            });

            const data = await response.json();
            if (!response.ok) throw new Error(data.error?.message || "API Error");

            const aiText = data.choices[0].message.content;
            const formattedText = formatResponse(aiText);
            const isCritical = aiText.includes("CRITICAL") || aiText.includes("WARNING");
            addBotMessage(formattedText, isCritical);

        } catch (error) {
            console.error(error);
            addBotMessage(`❌ Connection Error: ${error.message}.`);
        } finally {
            setIsLoading(false);
        }
    };

    const addBotMessage = (text, isCritical = false) => {
        setMessages(prev => [...prev, { 
            id: Date.now() + 1, 
            text: text, 
            sender: 'bot', 
            isHtml: true,
            isCritical: isCritical
        }]);
    };

    const formatResponse = (text) => {
        let cleanText = text.replace(/\n/g, "<br>");
        cleanText = cleanText.replace(/\*\*(.*?)\*\*/g, "<strong>$1</strong>"); 
        cleanText = cleanText.replace(/Condition:/gi, "<strong>🏥 Condition:</strong>");
        cleanText = cleanText.replace(/Home Remed/gi, "<br><strong>💊 Home Remedy</strong>");
        cleanText = cleanText.replace(/Do:/g, "<br><strong>✅ Do:</strong>");
        cleanText = cleanText.replace(/Dos:/g, "<br><strong>✅ Do:</strong>");
        cleanText = cleanText.replace(/Avoid:/g, "<br><strong>❌ Avoid:</strong>");
        cleanText = cleanText.replace(/Donts:/g, "<br><strong>❌ Avoid:</strong>");
        
        if (text.includes("CRITICAL") || text.includes("WARNING")) {
            return `<div class="warning-box">${cleanText}</div>`;
        }
        return cleanText;
    };

    return (
        <div className="content-card" style={{ height: 'calc(100vh - 120px)', padding: '0', background: 'transparent', border: 'none', boxShadow: 'none' }}>
            <div className="chatbot-container">
                <div className="chat-header">
                    <div className="bot-avatar-circle">🩺</div>
                    <div className="header-info">
                        <h3>Suvera</h3>
                        <p><span className="online-dot"></span> Personal Doc</p>
                    </div>
                </div>
                <div className="chat-box" ref={chatBoxRef}>
                    {messages.map((msg) => (
                        <div key={msg.id} className={`message ${msg.sender}-message ${msg.isCritical ? 'critical-msg' : ''}`}>
                            {msg.isHtml ? <div dangerouslySetInnerHTML={{ __html: msg.text }} /> : msg.text}
                        </div>
                    ))}
                    {isLoading && (
                        <div className="message bot-message typing-indicator">
                            <div className="dot"></div><div className="dot"></div><div className="dot"></div>
                        </div>
                    )}
                </div>
                <div className="quick-actions">
                    <div className="chip" onClick={() => handleSend('I have a bad headache')}>🤕 Headache</div>
                    <div className="chip" onClick={() => handleSend('I burned my hand')}>🔥 Burn</div>
                    <div className="chip" onClick={() => handleSend('Stomach pain')}>🤢 Stomach</div>
                </div>
                <div className="chat-input-area">
                    <input 
                        type="text" 
                        placeholder="Type symptoms here..." 
                        value={input}
                        onChange={(e) => setInput(e.target.value)}
                        onKeyPress={(e) => e.key === 'Enter' && handleSend()}
                    />
                    <button className="send-btn" onClick={() => handleSend()}>➡️</button>
                </div>
            </div>
        </div>
    );
};

// --- 2. DASHBOARD HOME (✅ MODIFIED: CONNECTS TO PYTHON AI) ---
const DashboardHome = ({ onNavigate, onTriggerEmergency }) => {
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);

  const liveStats = [
    { label: 'Active Hospitals', value: '12', color: '#2ecc71' },
    { label: 'Avg Wait Time', value: '8 min', color: '#3498db' },
    { label: 'ICU Availability', value: 'High', color: '#e67e22' }
  ];

  // 🔴 NEW LOGIC: Call Python API when "Analyze" is clicked
  const handleAnalyze = async () => {
    if (!input.trim()) return alert("Please enter your symptoms.");
    setLoading(true);

    try {
        const formData = new FormData();
        formData.append("text", input); 

        const response = await fetch("http://127.0.0.1:8000/analyze-text/", {
            method: "POST",
            body: formData
        });

        if (!response.ok) throw new Error("AI Offline");
        const data = await response.json();
        
        // Pass the analysis result (which contains the Department) back to the parent
        onTriggerEmergency(data.analysis);

    } catch (error) {
        console.error(error);
        alert("Error connecting to AI. Please try again.");
    } finally {
        setLoading(false);
    }
  };

  return (
    <div className="dashboard-home fade-in">
      <section className="dashboard-hero">
        <div className="hero-content-left">
          <h2><span className="wave">👋</span> How can Suvera help you ?</h2>
          <p className="hero-subtitle">AI-powered symptom analysis & specialist matching.</p>
          
          {/* 🔴 NEW INPUT & BUTTON CONNECTED TO LOGIC */}
          <div className="ai-input-wrapper">
            <span className="ai-icon">🧠</span>
            <input 
                type="text" 
                placeholder="Describe symptoms..." 
                className="ai-input"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && handleAnalyze()}
            />
            <button 
                className="ai-analyze-btn" 
                onClick={handleAnalyze} 
                disabled={loading}
            >
                {loading ? 'Thinking...' : 'Analyze'}
            </button>
          </div>

          <div className="quick-tags">
            <span>Try:</span>
            <button className="tag" onClick={() => setInput("Stomach ache")}>Stomach ache</button>
            <button className="tag" onClick={() => setInput("Trauma from accident")}>Trauma</button>
          </div>
        </div>
        <div className="hero-visual">
          <div className="pulse-ring"></div>
          <div className="pulse-icon">🏥</div>
        </div>
      </section>

      <section className="action-grid">
        <div className="card emergency-card" onClick={() => onNavigate('emergency')}>
          <div className="card-icon-bg">🚨</div>
          <div className="card-text">
            <h3>Emergency SOS</h3>
            <p>Critical Case Bypass</p>
            <span className="link-arrow">Get Help Now &rarr;</span>
          </div>
        </div>

        <div className="card standard-card" onClick={() => onNavigate('nearby')}>
          <div className="card-icon-bg" style={{ color: '#3498db', background: '#eaf2f8' }}>📍</div>
          <div className="card-text">
            <h3>Nearby Hospitals</h3>
            <p>Live Map & Routing</p>
          </div>
        </div>

        <div className="card standard-card" onClick={() => onNavigate('chatbot')}>
          <div className="card-icon-bg" style={{ color: '#9b59b6', background: '#f5eef8' }}>💬</div>
          <div className="card-text">
            <h3>Medical Assistant</h3>
            <p>Chat with AI Doctor</p>
          </div>
        </div>
      </section>

      <section className="stats-section">
        <h3 className="section-title">📡 Live Area Status (Verified)</h3>
        <div className="stats-container">
          {liveStats.map((stat, index) => (
            <div key={index} className="stat-card" style={{ borderTop: `4px solid ${stat.color}` }}>
              <div className="stat-value" style={{ color: stat.color }}>{stat.value}</div>
              <div className="stat-label">{stat.label}</div>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
};

const EmergencyAssistance = () => <div className="content-card"><h3>🚨 Emergency Assistance Active</h3><p>Connecting to nearest ambulance...</p></div>;

// --- 3. USER PROFILE (FULLY RESTORED) ---
const UserProfile = () => {
    const [profile, setProfile] = useState(null);
    const [loading, setLoading] = useState(true);
    const [isEditing, setIsEditing] = useState(false);
    
    // State for the Edit Form
    const [editData, setEditData] = useState({});

    useEffect(() => {
        const phone = localStorage.getItem('userPhone');
        if (phone) {
            fetchProfile(phone);
        } else {
            setLoading(false);
        }
    }, []);

    const fetchProfile = async (phone) => {
        try {
            // Fetch all patients and find the specific user
            const response = await api.get(`/Patients`); 
            const myProfile = response.data.find(p => p.phoneNumber === phone);
            
            setProfile(myProfile);
            setEditData(myProfile); // Initialize edit form with current data
        } catch (error) {
            console.error("Error fetching profile:", error);
        } finally {
            setLoading(false);
        }
    };

    // Handle Input Changes in Edit Mode
    const handleInputChange = (e) => {
        setEditData({
            ...editData,
            [e.target.name]: e.target.value
        });
    };

    // Save Changes to Database
    const handleSave = async () => {
        try {
            await api.put(`/Patients/${profile.patientId}`, editData);
            
            // Update UI
            setProfile(editData);
            setIsEditing(false);
            alert("Profile updated successfully!");
        } catch (error) {
            console.error("Error updating profile:", error);
            alert("Failed to update profile. " + (error.response?.data?.message || "Check console."));
        }
    };

    const handleCancel = () => {
        setEditData(profile); // Reset changes
        setIsEditing(false);
    };

    if (loading) return <div className="content-card">Loading Profile...</div>;
    if (!profile) return <div className="content-card"><h3>Profile Not Found</h3><p>Could not load details.</p></div>;

    return (
        <div className="content-card">
            {/* Header Section */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
                    <div style={{ width: '80px', height: '80px', background: '#4f46e5', color: 'white', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '2rem', fontWeight: 'bold' }}>
                        {profile.name ? profile.name.charAt(0).toUpperCase() : 'U'}
                    </div>
                    <div>
                        {isEditing ? (
                             <input 
                             type="text" 
                             name="name"
                             value={editData.name}
                             onChange={handleInputChange}
                             className="ai-input"
                             style={{ fontSize: '1.5rem', fontWeight: 'bold', width: '200px', marginBottom: '5px' }}
                         />
                        ) : (
                            <h2 style={{ margin: 0 }}>{profile.name}</h2>
                        )}
                        <p style={{ color: '#64748b', margin: '5px 0' }}>Patient ID: #{profile.patientId}</p>
                    </div>
                </div>

                {/* Edit/Save Buttons */}
                <div>
                    {isEditing ? (
                        <div style={{ display: 'flex', gap: '10px' }}>
                            <button onClick={handleSave} className="ai-analyze-btn" style={{ background: '#22c55e', padding: '8px 16px' }}>Save</button>
                            <button onClick={handleCancel} className="ai-analyze-btn" style={{ background: '#ef4444', padding: '8px 16px' }}>Cancel</button>
                        </div>
                    ) : (
                        <button onClick={() => setIsEditing(true)} className="ai-analyze-btn">
                            ✏️ Edit Profile
                        </button>
                    )}
                </div>
            </div>

            {/* Details Card */}
            <div className="card standard-card">
                <h3>📋 Medical Details</h3>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px', marginTop: '15px' }}>
                    
                    {/* AGE */}
                    <div>
                        <label style={{ fontSize: '0.85rem', color: '#64748b', display: 'block', marginBottom: '5px' }}>Age</label>
                        {isEditing ? (
                            <input 
                                type="number" 
                                name="age"
                                value={editData.age}
                                onChange={handleInputChange}
                                className="ai-input"
                                style={{ width: '100%', padding: '8px', border: '1px solid #cbd5e1', borderRadius: '6px' }}
                            />
                        ) : (
                            <div style={{ fontSize: '1.1rem', fontWeight: '500' }}>{profile.age} Years</div>
                        )}
                    </div>

                    {/* GENDER */}
                    <div>
                        <label style={{ fontSize: '0.85rem', color: '#64748b', display: 'block', marginBottom: '5px' }}>Gender</label>
                        {isEditing ? (
                             <select 
                                name="gender"
                                value={editData.gender}
                                onChange={handleInputChange}
                                className="ai-input"
                                style={{ width: '100%', padding: '8px', border: '1px solid #cbd5e1', borderRadius: '6px' }}
                             >
                                <option value="Male">Male</option>
                                <option value="Female">Female</option>
                                <option value="Other">Other</option>
                             </select>
                        ) : (
                            <div style={{ fontSize: '1.1rem', fontWeight: '500' }}>{profile.gender}</div>
                        )}
                    </div>

                    {/* BLOOD GROUP */}
                    <div>
                        <label style={{ fontSize: '0.85rem', color: '#64748b', display: 'block', marginBottom: '5px' }}>Blood Group</label>
                        {isEditing ? (
                            <select 
                                name="bloodGroup"
                                value={editData.bloodGroup}
                                onChange={handleInputChange}
                                className="ai-input"
                                style={{ width: '100%', padding: '8px', border: '1px solid #cbd5e1', borderRadius: '6px' }}
                            >
                                <option value="A+">A+</option>
                                <option value="A-">A-</option>
                                <option value="B+">B+</option>
                                <option value="B-">B-</option>
                                <option value="AB+">AB+</option>
                                <option value="AB-">AB-</option>
                                <option value="O+">O+</option>
                                <option value="O-">O-</option>
                            </select>
                        ) : (
                            <div style={{ fontSize: '1.1rem', fontWeight: '500', color: '#ef4444' }}>{profile.bloodGroup}</div>
                        )}
                    </div>

                    {/* CONTACT (Read Only) */}
                    <div>
                        <label style={{ fontSize: '0.85rem', color: '#64748b', display: 'block', marginBottom: '5px' }}>Contact</label>
                        <div style={{ fontSize: '1.1rem', fontWeight: '500', color: '#64748b' }}>
                            {profile.phoneNumber} 
                            {isEditing && <span style={{fontSize: '0.7rem', color: '#ef4444', marginLeft: '5px'}}>(Cannot change)</span>}
                        </div>
                    </div>

                </div>
            </div>
        </div>
    );
};

// --- 4. MAIN DASHBOARD CONTAINER (✅ MODIFIED TO HANDLE AI RESULTS) ---
const UserDashboard = ({ onLogout, initialMode = "dashboard", emergencyContext = null }) => {
  const [activeModule, setActiveModule] = useState(initialMode);
  // Default Data or passed via Props
  const [currentEmergencyData, setCurrentEmergencyData] = useState(
      emergencyContext || { specialty: "Emergency", isCritical: true }
  );
  
  const [userName, setUserName] = useState('User');

  useEffect(() => {
    if (initialMode) setActiveModule(initialMode);
    // If context passed from Voice (App.js), update state
    if (emergencyContext) setCurrentEmergencyData(emergencyContext);
  }, [initialMode, emergencyContext]);

  // 🔴 LOGIC TO SWITCH VIEW WHEN DASHBOARD "ANALYZE" IS USED
  const handleAiTransition = (analysisResult) => {
      const specialty = analysisResult.disease_info.top_department;
      const isCritical = analysisResult.final_status === "Critical";
      
      setCurrentEmergencyData({ specialty, isCritical });
      setActiveModule('emergency');
  };

  const menuItems = [
    { key: 'dashboard', icon: '📊', label: 'Dashboard', description: 'Overview' },
    { key: 'emergency', icon: '🚨', label: 'Emergency', description: 'Get help' },
    { key: 'nearby', icon: '📍', label: 'Hospitals', description: 'Find nearby' },
    { key: 'chatbot', icon: '🤖', label: 'Medical Assistant', description: 'AI Doctor' },
    { key: 'profile', icon: '👤', label: 'Profile', description: 'Account' },
  ];

  if (activeModule === 'nearby') {
    return <NearbyHospitals onBack={() => setActiveModule('dashboard')} searchSpecialty="General" />;
  }

  // Uses local State "currentEmergencyData" which comes from Voice OR Dashboard Analyze
 // --- LOGIC 2: EMERGENCY SPECIALTY MAP ---
  if (activeModule === 'emergency') {
    const data = emergencyContext || { specialty: "Emergency", isCritical: true };
    return <EmergencyMap 
             onBack={() => setActiveModule('dashboard')} // Goes to User Dashboard
             onGoHome={onLogout} // ✅ GOES TO HOME PAGE (Using the logout function)
             symptomData={data} 
           />;
  }

  const renderModule = () => {
    switch(activeModule) {
      case 'chatbot': return <MedicalChatbot />;
      case 'profile': return <UserProfile />;
      // Pass the transition handler down
      default: return <DashboardHome onNavigate={setActiveModule} onTriggerEmergency={handleAiTransition} />;
    }
  };

  return (
    <div className="dashboard-container">
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
              onClick={() => {
                  if(item.key === 'emergency') setCurrentEmergencyData({ specialty: "Emergency", isCritical: true });
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
          <button className="nav-item logout-btn" onClick={() => { localStorage.removeItem('userPhone'); onLogout(); }}>
            <span className="nav-icon">🚪</span>
            <span className="nav-label">Logout</span>
          </button>
        </div>
      </aside>

      <main className="main-content-area">
        <header className="top-header">
          <div className="header-greeting">
            <h1>{menuItems.find(item => item.key === activeModule)?.label}</h1>
            <p>Welcome back, {userName}</p>
          </div>
          <div className="header-actions">
            <button className="notif-btn">🔔</button>
            <div className="user-avatar">{userName.charAt(0)}</div>
          </div>
        </header>

        <div className="content-scrollable">
          {renderModule()}
        </div>
      </main>
    </div>
  );
};

export default UserDashboard;