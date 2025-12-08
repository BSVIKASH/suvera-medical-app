import React, { useState, useRef, useEffect } from 'react';
import api from '../../api'; // ✅ Import API
import NearbyHospitals from "./NearbyHospitals";
import '../../styles/Dashboard.css';
import '../../styles/Chatbot.css'; 

// --- 1. CHATBOT COMPONENT (Unchanged) ---
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

// --- 2. DASHBOARD HOME (Unchanged) ---
const DashboardHome = ({ onNavigate }) => {
  const liveStats = [
    { label: 'Active Hospitals', value: '12', color: '#2ecc71' },
    { label: 'Avg Wait Time', value: '8 min', color: '#3498db' },
    { label: 'ICU Availability', value: 'High', color: '#e67e22' }
  ];

  return (
    <div className="dashboard-home fade-in">
      <section className="dashboard-hero">
        <div className="hero-content-left">
          <h2><span className="wave">👋</span> How can Suvera help?</h2>
          <p className="hero-subtitle">AI-powered symptom analysis & specialist matching.</p>
          <div className="ai-input-wrapper">
            <span className="ai-icon">🧠</span>
            <input type="text" placeholder="Describe symptoms..." className="ai-input" />
            <button className="ai-analyze-btn" onClick={() => onNavigate('chatbot')}>Analyze</button>
          </div>
          <div className="quick-tags">
            <span>Try:</span>
            <button className="tag" onClick={() => onNavigate('chatbot')}>Stomach ache</button>
            <button className="tag" onClick={() => onNavigate('chatbot')}>Trauma</button>
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

// --- 3. USER PROFILE (UPDATED - Fetches from DB) ---
const UserProfile = () => {
    const [profile, setProfile] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        // Get the phone number saved during login
        const phone = localStorage.getItem('userPhone');
        
        if (phone) {
            fetchProfile(phone);
        } else {
            setLoading(false); // No phone found
        }
    }, []);

    const fetchProfile = async (phone) => {
        try {
            // NOTE: You need to create this endpoint in your C# backend:
            // GET /api/Patients/profile/{phoneNumber}
            // Or assume we filter the list (Not recommended for production but works for now if you lack the specific endpoint)
            const response = await api.get(`/Patients`); 
            
            // Temporary Logic: Filter client-side until specific endpoint is made
            const myProfile = response.data.find(p => p.phoneNumber === phone);
            setProfile(myProfile);

        } catch (error) {
            console.error("Error fetching profile:", error);
        } finally {
            setLoading(false);
        }
    };

    if (loading) return <div className="content-card">Loading Profile...</div>;
    if (!profile) return <div className="content-card"><h3>Profile Not Found</h3><p>Could not load details for the logged-in number.</p></div>;

    return (
        <div className="content-card">
            <div style={{ display: 'flex', alignItems: 'center', gap: '20px', marginBottom: '20px' }}>
                <div style={{ width: '80px', height: '80px', background: '#4f46e5', color: 'white', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '2rem', fontWeight: 'bold' }}>
                    {profile.name.charAt(0).toUpperCase()}
                </div>
                <div>
                    <h2 style={{ margin: 0 }}>{profile.name}</h2>
                    <p style={{ color: '#64748b', margin: '5px 0' }}>Patient ID: #{profile.patientId}</p>
                </div>
            </div>

            <div className="card standard-card">
                <h3>📋 Medical Details</h3>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px', marginTop: '15px' }}>
                    <div>
                        <label style={{ fontSize: '0.85rem', color: '#64748b', display: 'block' }}>Age</label>
                        <div style={{ fontSize: '1.1rem', fontWeight: '500' }}>{profile.age} Years</div>
                    </div>
                    <div>
                        <label style={{ fontSize: '0.85rem', color: '#64748b', display: 'block' }}>Gender</label>
                        <div style={{ fontSize: '1.1rem', fontWeight: '500' }}>{profile.gender}</div>
                    </div>
                    <div>
                        <label style={{ fontSize: '0.85rem', color: '#64748b', display: 'block' }}>Blood Group</label>
                        <div style={{ fontSize: '1.1rem', fontWeight: '500', color: '#ef4444' }}>{profile.bloodGroup}</div>
                    </div>
                    <div>
                        <label style={{ fontSize: '0.85rem', color: '#64748b', display: 'block' }}>Contact</label>
                        <div style={{ fontSize: '1.1rem', fontWeight: '500' }}>{profile.phoneNumber}</div>
                    </div>
                </div>
            </div>
        </div>
    );
};

// --- 4. MAIN DASHBOARD CONTAINER ---
const UserDashboard = ({ onLogout }) => {
  const [activeModule, setActiveModule] = useState('dashboard');
  const [userName, setUserName] = useState('User');

  // Optional: Fetch user name for header
  useEffect(() => {
    const phone = localStorage.getItem('userPhone');
    if(phone) {
        // Fetch logic could go here to update header name
        // For now, we keep it simple
    }
  }, []);

  const menuItems = [
    { key: 'dashboard', icon: '📊', label: 'Dashboard', description: 'Overview' },
    { key: 'emergency', icon: '🚨', label: 'Emergency', description: 'Get help' },
    { key: 'nearby', icon: '📍', label: 'Hospitals', description: 'Find nearby' },
    { key: 'chatbot', icon: '🤖', label: 'Medical Assistant', description: 'AI Doctor' },
    { key: 'profile', icon: '👤', label: 'Profile', description: 'Account' },
  ];

  if (activeModule === 'nearby') {
    return <NearbyHospitals onBack={() => setActiveModule('dashboard')} />;
  }

  const renderModule = () => {
    switch(activeModule) {
      case 'emergency': return <EmergencyAssistance />;
      case 'chatbot': return <MedicalChatbot />;
      case 'profile': return <UserProfile />;
      default: return <DashboardHome onNavigate={setActiveModule} />;
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