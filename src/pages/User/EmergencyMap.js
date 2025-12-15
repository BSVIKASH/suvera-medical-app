import React, { useState, useEffect, useRef } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import 'leaflet-routing-machine/dist/leaflet-routing-machine.css';
import 'leaflet-routing-machine';
import api from '../../api';

// --- Fix Leaflet Icons ---
import icon from 'leaflet/dist/images/marker-icon.png';
import iconShadow from 'leaflet/dist/images/marker-shadow.png';

let DefaultIcon = L.icon({
    iconUrl: icon,
    shadowUrl: iconShadow,
    iconSize: [25, 41],
    iconAnchor: [12, 41],
    popupAnchor: [1, -34],
});
L.Marker.prototype.options.icon = DefaultIcon;

// --- 🔥 FEATURE 1: ANIMATED RADAR USER ICON ---
const userIcon = L.divIcon({
    className: 'user-marker',
    html: `
        <div style="position:relative; width:20px; height:20px;">
            <div style="position:absolute; background-color:#2563eb; width:100%; height:100%; border-radius:50%; border:2px solid white; z-index:2;"></div>
            <div class="radar-pulse"></div>
        </div>
    `,
    iconSize: [20, 20],
    iconAnchor: [10, 10]
});

const hospitalIcon = L.divIcon({
    className: 'hospital-marker',
    html: '<div style="font-size:32px; filter: drop-shadow(2px 4px 6px rgba(0,0,0,0.3)); transition: transform 0.2s;">🏥</div>',
    iconSize: [32, 32],
    iconAnchor: [16, 16]
});

const EmergencyMap = ({ symptomData, onBack, onGoHome }) => {
    // --- State ---
    const [map, setMap] = useState(null);
    const [hospitals, setHospitals] = useState([]);
    const [selectedId, setSelectedId] = useState(null);
    const [userLoc, setUserLoc] = useState(null);
    const [routeInfo, setRouteInfo] = useState(null);
    const [statusMsg, setStatusMsg] = useState('Acquiring Satellites...');
    
    // --- Request / Forum State ---
    const [requestStatus, setRequestStatus] = useState(null); 
    const [activeRequestId, setActiveRequestId] = useState(null); 
    
    const mapRef = useRef(null);
    const routingControlRef = useRef(null); 

    const specialty = symptomData?.specialty || "Emergency";

    // 1. Initialize Map (WHITE BACKGROUND FIX INCLUDED)
    useEffect(() => {
        if (!mapRef.current) return;
        if (map) map.remove();

        const mapInstance = L.map(mapRef.current, { zoomControl: false }).setView([20.59, 78.96], 5);
        
        // ✅ USING STANDARD LIGHT MAP (Clean Visibility)
        L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
            attribution: 'OpenStreetMap'
        }).addTo(mapInstance);

        L.control.zoom({ position: 'bottomright' }).addTo(mapInstance);
        setMap(mapInstance);

        return () => { if (mapInstance) mapInstance.remove(); };
    }, []);

    // 2. Fetch Logic
    useEffect(() => {
        if (!map) return;

        navigator.geolocation.getCurrentPosition(
            (pos) => {
                const lat = pos.coords.latitude;
                const lng = pos.coords.longitude;
                setUserLoc([lat, lng]);

                if(map) {
                    L.marker([lat, lng], { icon: userIcon }).addTo(map).bindPopup("<b>You are Here</b>").openPopup();
                    map.setView([lat, lng], 14);
                    fetchBackendHospitals(lat, lng, map);
                }
            },
            () => setStatusMsg("Location Signal Lost."),
            { enableHighAccuracy: true }
        );
    }, [map]);

    const fetchBackendHospitals = async (lat, lng, currentMap) => {
        try {
            const response = await fetch(`https://localhost:7189/api/hospitals/search?specialty=${specialty}`);
            if(!response.ok) throw new Error("Failed");
            const data = await response.json();
            
            setHospitals(data);

            if (data.length > 0) {
                setStatusMsg(`${data.length} UNITS FOUND`);
                data.forEach(h => {
                    const hLat = parseFloat(h.latitude);
                    const hLng = parseFloat(h.longitude);
                    if(hLat && hLng && currentMap) {
                        const marker = L.marker([hLat, hLng], { icon: hospitalIcon }).addTo(currentMap);
                        marker.on('click', () => {
                            setSelectedId(h.hospitalId); 
                            drawRoute([lat, lng], [hLat, hLng], currentMap);
                        });
                    }
                });
                
                const nearest = data[0];
                setSelectedId(nearest.hospitalId);
                drawRoute([lat, lng], [parseFloat(nearest.latitude), parseFloat(nearest.longitude)], currentMap);
            } else {
                setStatusMsg(`No ${specialty} coverage in this sector.`);
            }
        } catch (e) {
            console.error(e);
            setStatusMsg("Network Offline");
        }
    };

    // --- 🔥 FEATURE 2: ANIMATED ROUTE LINE ---
    const drawRoute = (start, end, mapInstance) => {
        if (!mapInstance) return;

        if (routingControlRef.current) {
            try { mapInstance.removeControl(routingControlRef.current); } catch(e){}
        }

        const control = L.Routing.control({
            waypoints: [L.latLng(start), L.latLng(end)],
            lineOptions: { 
                styles: [
                    // Outer Red Glow
                    { color: '#dc2626', opacity: 0.8, weight: 8 },
                    // Inner Dashed Animation Line (Controlled via CSS below)
                    { color: 'white', opacity: 1, weight: 3, dashArray: '10, 10', className: 'animated-route' } 
                ] 
            },
            createMarker: () => null, 
            addWaypoints: false,
            draggableWaypoints: false,
            fitSelectedRoutes: true,
            show: false,
            containerClassName: 'display-none'
        });

        control.on('routesfound', (e) => {
            const summary = e.routes[0].summary;
            setRouteInfo(`${Math.round(summary.totalTime / 60)} min (${(summary.totalDistance / 1000).toFixed(1)} km)`);
        });

        control.addTo(mapInstance);
        routingControlRef.current = control;
    };

    // --- REQUEST FUNCTION ---
    const sendRequest = async (hospital) => {
        if (!window.confirm(`Transmit Critical Request to ${hospital.name}?`)) return;

        try {
            const payload = {
                HospitalId: hospital.hospitalId,
                PatientName: "Emergency User", 
                ContactNumber: "9876543210", 
                SymptomDescription: `${specialty} Emergency`
            };

            const res = await api.post('/Requests/create', payload);
            setActiveRequestId(hospital.hospitalId);
            setRequestStatus("Pending");
            
            startStatusPolling(res.data.id);

        } catch (e) {
            alert("Signal Failed. Switch to Manual Call.");
        }
    };

    const startStatusPolling = (reqId) => {
        const interval = setInterval(async () => {
            try {
                const res = await api.get(`/Requests/check-status/${reqId}`);
                const status = res.data.status;
                
                if (status !== 'Pending') {
                    setRequestStatus(status);
                    clearInterval(interval);
                    if (status === 'Accepted') alert("✅ HOSPITAL APPROVED. UNIT PREPARING FOR ARRIVAL.");
                    if (status === 'Declined') alert("❌ HOSPITAL FULL. REROUTING ADVISED.");
                }
            } catch (e) { console.error(e); }
        }, 3000); 
    };

    // --- RENDER ---
    return (
        <div style={{ 
            position: 'fixed', top: 0, left: 0, width: '100vw', height: '100vh', 
            backgroundColor: '#fff', zIndex: 9999, display: 'flex', flexDirection: 'column', 
            fontFamily: 'Segoe UI, sans-serif'
        }}>
            
            {/* Header */}
            <div style={{ 
                background: '#dc2626', color: 'white', padding: '10px 20px', 
                display: 'flex', justifyContent: 'space-between', alignItems: 'center', 
                height: '60px', boxShadow: '0 4px 12px rgba(0,0,0,0.15)', zIndex: 10, flexShrink: 0 
            }}>
                <div style={{ display:'flex', alignItems:'center', gap:'15px' }}>
                    <button onClick={onGoHome} style={{ background: 'white', color: '#dc2626', border: 'none', padding: '6px 12px', borderRadius: '4px', cursor:'pointer', fontWeight:'bold', fontSize:'0.9rem' }}>
                        🏠 Home
                    </button>
                    <button onClick={onBack} style={{ background: 'rgba(255,255,255,0.2)', color: 'white', border: 'none', padding: '6px 12px', borderRadius: '4px', cursor:'pointer', fontWeight:'bold', fontSize:'0.9rem' }}>
                        ← Dashboard
                    </button>
                    <h2 style={{ margin: 0, fontSize: '1.2rem', fontWeight:'700', letterSpacing:'0.5px' }}>{specialty.toUpperCase()} ALERT</h2>
                </div>
                
                {routeInfo && (
                    <div style={{ background: 'white', color: '#dc2626', padding: '5px 15px', borderRadius: '20px', fontWeight: 'bold', fontSize: '1rem', boxShadow: '0 2px 5px rgba(0,0,0,0.2)' }}>
                        ⏱ {routeInfo}
                    </div>
                )}
            </div>

            <div style={{ display: 'flex', flex: 1, position: 'relative', overflow: 'hidden' }}>
                
                {/* Sidebar */}
                <div style={{ 
                    width: '360px', backgroundColor: '#fff', borderRight: '1px solid #e5e7eb', 
                    zIndex: 5, overflowY: 'auto', display: 'flex', flexDirection: 'column', boxShadow:'2px 0 10px rgba(0,0,0,0.05)' 
                }}>
                    <div style={{ padding: '15px 15px 5px' }}>
                        <p style={{ margin: 0, fontSize: '0.85rem', color: '#6b7280', fontWeight: '600', textTransform:'uppercase', letterSpacing:'1px' }}>
                            {statusMsg}
                        </p>
                    </div>
                    
                    <div style={{ padding: '10px' }}>
                        {hospitals.map((h, i) => {
                            const isSelected = selectedId === h.hospitalId;
                            const isRequestActive = activeRequestId === h.hospitalId;

                            return (
                                <div key={i} 
                                    onClick={() => {
                                        setSelectedId(h.hospitalId); 
                                        if (userLoc) drawRoute(userLoc, [h.latitude, h.longitude], map);
                                    }}
                                    style={{ 
                                        padding: '15px', marginBottom: '12px', 
                                        borderRadius: '8px', cursor: 'pointer',
                                        backgroundColor: isSelected ? '#fef2f2' : 'white',
                                        border: isSelected ? '2px solid #ef4444' : '1px solid #e5e7eb',
                                        boxShadow: isSelected ? '0 4px 10px rgba(239, 68, 68, 0.15)' : '0 2px 4px rgba(0,0,0,0.05)',
                                        transition: 'all 0.2s ease'
                                    }}
                                >
                                    <div style={{ display:'flex', justifyContent:'space-between', alignItems:'start' }}>
                                        <strong style={{ color: isSelected ? '#b91c1c' : '#1f2937', fontSize: '1.05rem' }}>{h.name}</strong>
                                        {i === 0 && <span style={{fontSize:'0.65rem', background:'#ef4444', color:'white', padding:'2px 6px', borderRadius:'4px'}}>BEST</span>}
                                    </div>
                                    <div style={{ fontSize: '0.85rem', color: '#6b7280', margin: '6px 0' }}>{h.address}</div>
                                    <div style={{ fontSize: '0.9rem', fontWeight: '600', color: '#374151', display:'flex', alignItems:'center', gap:'5px', marginBottom:'12px' }}>
                                        📞 {h.phoneNumber}
                                    </div>

                                    {/* Request Button */}
                                    <button 
                                        onClick={(e) => { e.stopPropagation(); sendRequest(h); }}
                                        disabled={isRequestActive && requestStatus !== null}
                                        style={{
                                            width: '100%', padding: '10px', borderRadius: '6px', border: 'none',
                                            fontWeight: 'bold', cursor: 'pointer', fontSize:'0.9rem',
                                            backgroundColor: isRequestActive && requestStatus === 'Pending' ? '#f59e0b' : 
                                                             isRequestActive && requestStatus === 'Accepted' ? '#22c55e' :
                                                             isRequestActive && requestStatus === 'Declined' ? '#ef4444' : '#2563eb',
                                            color: 'white',
                                            boxShadow: '0 2px 5px rgba(0,0,0,0.1)'
                                        }}
                                    >
                                        {isRequestActive && requestStatus === 'Pending' ? '⏳ CONTACTING UNIT...' :
                                         isRequestActive && requestStatus === 'Accepted' ? '✅ ADMISSION APPROVED' :
                                         isRequestActive && requestStatus === 'Declined' ? '❌ CAPACITY FULL' :
                                         '🔔 REQUEST ADMISSION'}
                                    </button>

                                </div>
                            );
                        })}
                    </div>
                </div>

                {/* Map */}
                <div ref={mapRef} style={{ flex: 1, height: '100%', backgroundColor: '#fff', zIndex: 1 }} />
            </div>

            {/* CSS FOR ANIMATIONS */}
            <style>{`
                .leaflet-routing-container { display: none !important; }
                
                /* Animated Route Line */
                .animated-route {
                    stroke-dasharray: 10;
                    animation: dash-animation 1s linear infinite;
                }
                @keyframes dash-animation {
                    from { stroke-dashoffset: 20; }
                    to { stroke-dashoffset: 0; }
                }

                /* User Radar Pulse */
                .radar-pulse {
                    position: absolute;
                    width: 100%; height: 100%;
                    border-radius: 50%;
                    border: 2px solid #2563eb;
                    opacity: 0;
                    z-index: 1;
                    animation: radar-scale 2s infinite ease-out;
                }
                @keyframes radar-scale {
                    0% { transform: scale(1); opacity: 0.8; }
                    100% { transform: scale(3); opacity: 0; }
                }
            `}</style>
        </div>
    );
};

export default EmergencyMap;