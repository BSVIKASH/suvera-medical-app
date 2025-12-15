import React, { useState } from 'react';

const BodySelector = ({ onSelect }) => {
  const [hoveredPart, setHoveredPart] = useState(null);

  // SVG Paths for Body Parts (Simplified Silhouette)
  const bodyParts = [
    { 
      id: 'Head', 
      label: 'Head / Brain', 
      symptom: 'Severe Headache, Stroke, Trauma', 
      path: "M100 20 Q100 0 120 0 T140 20 Q140 40 120 40 T100 20",
      color: "#FF6B6B"
    },
    { 
      id: 'Chest', 
      label: 'Chest / Heart', 
      symptom: 'Chest Pain, Difficulty Breathing', 
      path: "M80 50 Q120 50 160 50 L150 110 Q120 120 90 110 Z",
      color: "#4ECDC4"
    },
    { 
      id: 'Abdomen', 
      label: 'Stomach / GI', 
      symptom: 'Severe Pain, Vomiting Blood', 
      path: "M90 110 Q120 120 150 110 L145 160 Q120 170 95 160 Z",
      color: "#FFE66D"
    },
    { 
      id: 'Arms', 
      label: 'Arms / Injury', 
      symptom: 'Fracture, Numbness, Bleeding', 
      path: "M80 50 L60 120 L80 120 L95 65 M160 50 L180 120 L160 120 L145 65", // Both arms
      color: "#1A535C"
    },
    { 
      id: 'Legs', 
      label: 'Legs / Trauma', 
      symptom: 'Fracture, Inability to Walk', 
      path: "M95 160 L90 280 L115 280 L118 170 M145 160 L150 280 L125 280 L122 170", // Both legs
      color: "#FF9F1C"
    }
  ];

  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', fontFamily: 'Segoe UI' }}>
      <h3 style={{color:'#333', marginBottom:'5px'}}>Tap Pain Area</h3>
      <p style={{color:'#666', fontSize:'0.9rem', marginBottom:'20px'}}>Select the affected area to find a specialist.</p>
      
      <div style={{ position: 'relative', height: '320px', width: '240px' }}>
        <svg viewBox="0 0 240 320" style={{ height: '100%', width: '100%', dropShadow: '0 10px 20px rgba(0,0,0,0.1)' }}>
          {/* Base Body Outline (Grey Background) */}
          <path 
            d="M100 20 Q100 0 120 0 T140 20 Q140 40 120 40 T100 20 M80 50 Q120 50 160 50 L150 110 Q120 120 90 110 Z M90 110 Q120 120 150 110 L145 160 Q120 170 95 160 Z M80 50 L60 120 L80 120 L95 65 M160 50 L180 120 L160 120 L145 65 M95 160 L90 280 L115 280 L118 170 M145 160 L150 280 L125 280 L122 170" 
            fill="#f0f0f0" 
            stroke="#e0e0e0" 
            strokeWidth="2"
          />

          {/* Interactive Parts */}
          {bodyParts.map((part) => (
            <path
              key={part.id}
              d={part.path}
              fill={hoveredPart === part.id ? part.color : "transparent"} // Fill only on hover
              stroke={hoveredPart === part.id ? part.color : "transparent"}
              strokeWidth="3"
              style={{ cursor: 'pointer', transition: 'all 0.3s ease', opacity: 0.6 }}
              onMouseEnter={() => setHoveredPart(part.id)}
              onMouseLeave={() => setHoveredPart(null)}
              onClick={() => onSelect(part.id)}
            />
          ))}
        </svg>

        {/* Floating Tooltip Label */}
        {hoveredPart && (
          <div style={{
            position: 'absolute',
            bottom: '20px',
            left: '50%',
            transform: 'translateX(-50%)',
            background: 'rgba(0,0,0,0.8)',
            color: 'white',
            padding: '8px 12px',
            borderRadius: '20px',
            pointerEvents: 'none',
            whiteSpace: 'nowrap',
            animation: 'fadeIn 0.2s ease'
          }}>
            <strong>{bodyParts.find(p => p.id === hoveredPart).label}</strong>
            <div style={{ fontSize: '0.75rem', opacity: 0.9 }}>
              {bodyParts.find(p => p.id === hoveredPart).symptom}
            </div>
          </div>
        )}
      </div>
      
      {/* Click Hints */}
      <div style={{display:'flex', gap:'10px', marginTop:'20px'}}>
          <div style={{width:'10px', height:'10px', background:'#FF6B6B', borderRadius:'50%'}}></div>
          <span style={{fontSize:'0.8rem', color:'#666'}}>Neuro</span>
          <div style={{width:'10px', height:'10px', background:'#4ECDC4', borderRadius:'50%'}}></div>
          <span style={{fontSize:'0.8rem', color:'#666'}}>Cardio</span>
          <div style={{width:'10px', height:'10px', background:'#FFE66D', borderRadius:'50%'}}></div>
          <span style={{fontSize:'0.8rem', color:'#666'}}>Gastro</span>
      </div>
    </div>
  );
};

export default BodySelector;