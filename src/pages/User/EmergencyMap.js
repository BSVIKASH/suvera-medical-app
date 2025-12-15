import React, { useState, useEffect, useRef } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import 'leaflet-routing-machine/dist/leaflet-routing-machine.css';
import 'leaflet-routing-machine';
import api from '../../api'; // ✅ Ensure API is imported

/* 
   -------------------------------------------------
   🚨 FIX FOR "appendChild" ERROR STARTS HERE 🚨
   This block fixes the Webpack issue with Leaflet icons.
   -------------------------------------------------
*/
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
    iconRetinaUrl: require('leaflet/dist/images/marker-icon-2x.png'),
    iconUrl: require('leaflet/dist/images/marker-icon.png'),
    shadowUrl: require('leaflet/dist/images/marker-shadow.png'),
});
/* ------------------------------------------------- */

// --- Custom Icons ---
const userIcon = L.divIcon({
    className: 'user-marker',
    html: '<div style="background-color:#2563eb; width:16px; height:16px; border-radius:50%; border:3px solid white; box-shadow:0 0 8px rgba(0,0,0,0.4);"></div>',
    iconSize: [16, 16],
    iconAnchor: [8, 8]
});

const hospitalIcon = L.divIcon({
    className: 'hospital-marker',
    html: '<div style="font-size:28px; filter: drop-shadow(2px 2px 2px rgba(0,0,0,0.3));">🏥</div>',
    iconSize: [28, 28],
    iconAnchor: [14, 14]
});

const EmergencyMap = ({ symptomData, onBack, onGoHome }) => {
    // --- State ---
    const [map, setMap] = useState(null);
    const [hospitals, setHospitals] = useState([]);
    const [selectedId, setSelectedId] = useState(null);
    const [userLoc, setUserLoc] = useState(null);
    const [routeInfo, setRouteInfo] = useState(null);
    const [statusMsg, setStatusMsg] = useState('Locating...');
    
    // --- Request / Forum State ---
    const [requestStatus, setRequestStatus] = useState(null); // 'Pending', 'Accepted', 'Declined'
    const [activeRequestId, setActiveRequestId] = useState(null); 
    
    const mapRef = useRef(null);
    const routingControlRef = useRef(null); 

    const specialty = symptomData?.specialty || "Emergency";

    // 1. Initialize Map
    useEffect(() => {
        if (!mapRef.current) return;
        
        // Proper Cleanup to prevent multiple instances
        if (map) {
            map.remove();
            setMap(null);
        }

        const mapInstance = L.map(mapRef.current, { zoomControl: false }).setView([13.0827, 80.2707], 13);
        
        L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
            attribution: 'OpenStreetMap'
        }).addTo(mapInstance);

        L.control.zoom({ position: 'bottomright' }).addTo(mapInstance);
        setMap(mapInstance);

        // Cleanup on unmount
        return () => { 
            if (mapInstance) {
                mapInstance.remove(); 
            }
        };
        // eslint-disable-next-line
    }, []);

    // 2. Fetch Logic
    useEffect(() => {
        if (!map) return;

        navigator.geolocation.getCurrentPosition(
            (pos) => {
                const lat = pos.coords.latitude;
                const lng = pos.coords.longitude;
                setUserLoc([lat, lng]);

                // Ensure map exists before adding marker
                if(map) {
                    L.marker([lat, lng], { icon: userIcon }).addTo(map).bindPopup("<b>You are Here</b>").openPopup();
                    map.setView([lat, lng], 14);
                    fetchBackendHospitals(lat, lng, map);
                }
            },
            () => setStatusMsg("Location Access Denied."),
            { enableHighAccuracy: true }
        );
        // eslint-disable-next-line
    }, [map]);

    const fetchBackendHospitals = async (lat, lng, currentMap) => {
        try {
            const response = await fetch(`https://localhost:7189/api/hospitals/search?specialty=${specialty}`);
            if(!response.ok) throw new Error("Failed");
            const data = await response.json();
            
            setHospitals(data);

            if (data.length > 0) {
                setStatusMsg(`${data.length} found`);
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
                
                // Select first by default
                const nearest = data[0];
                setSelectedId(nearest.hospitalId);
                drawRoute([lat, lng], [parseFloat(nearest.latitude), parseFloat(nearest.longitude)], currentMap);
            } else {
                setStatusMsg(`No results for ${specialty}.`);
            }
        } catch (e) {
            console.error(e);
            setStatusMsg("Connection Failed");
        }
    };

    const drawRoute = (start, end, mapInstance) => {
        if (!mapInstance) return;

        if (routingControlRef.current) {
            try { mapInstance.removeControl(routingControlRef.current); } catch(e){}
        }

        const control = L.Routing.control({
            waypoints: [L.latLng(start), L.latLng(end)],
            lineOptions: { styles: [{ color: '#dc2626', weight: 6, opacity: 0.8 }] },
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

    // --- 🚨 REQUEST ADMISSION FUNCTION ---
    const sendRequest = async (hospital) => {
        if (!window.confirm(`Request Immediate Admission at ${hospital.name}?`)) return;

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
            
            // Poll for response
            startStatusPolling(res.data.id);

        } catch (e) {
            alert("Failed to send alert. Try calling directly.");
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
                    
                    if (status === 'Accepted') alert("✅ HOSPITAL ACCEPTED! Proceed immediately.");
                    if (status === 'Declined') alert("❌ FACILITY UNAVAILABLE. Try another hospital.");
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
                height: '60px', boxShadow: '0 2px 8px rgba(0,0,0,0.1)', zIndex: 10, flexShrink: 0 
            }}>
                <div style={{ display:'flex', alignItems:'center', gap:'15px' }}>
                    
                    {/* ✅ HOME & DASHBOARD BUTTONS */}
                    <button onClick={onGoHome} style={{ background: 'white', color: '#dc2626', border: 'none', padding: '6px 12px', borderRadius: '4px', cursor:'pointer', fontWeight:'bold', fontSize:'0.9rem' }}>
                        🏠 Home
                    </button>
                    <button onClick={onBack} style={{ background: 'rgba(255,255,255,0.2)', color: 'white', border: 'none', padding: '6px 12px', borderRadius: '4px', cursor:'pointer', fontWeight:'bold', fontSize:'0.9rem' }}>
                        ← Dashboard
                    </button>

                    <h2 style={{ margin: 0, fontSize: '1.1rem', fontWeight:'600' }}>EMERGENCY: {specialty}</h2>
                </div>
                
                {routeInfo && (
                    <div style={{ background: 'white', color: '#dc2626', padding: '4px 12px', borderRadius: '20px', fontWeight: 'bold', fontSize: '0.9rem' }}>
                        ⏱ {routeInfo}
                    </div>
                )}
            </div>

            <div style={{ display: 'flex', flex: 1, position: 'relative', overflow: 'hidden' }}>
                
                {/* Sidebar */}
                <div style={{ 
                    width: '340px', backgroundColor: '#fff', borderRight: '1px solid #e5e7eb', 
                    zIndex: 5, overflowY: 'auto', display: 'flex', flexDirection: 'column' 
                }}>
                    <div style={{ padding: '15px 15px 5px' }}>
                        <p style={{ margin: 0, fontSize: '0.85rem', color: '#6b7280', fontWeight: '600' }}>
                            {statusMsg.toUpperCase()}
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
                                        padding: '15px', marginBottom: '10px', 
                                        borderRadius: '8px', cursor: 'pointer',
                                        backgroundColor: isSelected ? '#fef2f2' : 'white',
                                        border: isSelected ? '2px solid #ef4444' : '1px solid #e5e7eb',
                                        boxShadow: isSelected ? '0 4px 6px rgba(239, 68, 68, 0.1)' : 'none',
                                        transition: 'all 0.2s ease'
                                    }}
                                >
                                    <div style={{ display:'flex', justifyContent:'space-between', alignItems:'start' }}>
                                        <strong style={{ color: isSelected ? '#b91c1c' : '#1f2937', fontSize: '1rem' }}>{h.name}</strong>
                                        {i === 0 && <span style={{fontSize:'0.65rem', background:'#ef4444', color:'white', padding:'2px 6px', borderRadius:'4px'}}>NEAREST</span>}
                                    </div>
                                    <div style={{ fontSize: '0.85rem', color: '#6b7280', margin: '6px 0' }}>{h.address}</div>
                                    <div style={{ fontSize: '0.9rem', fontWeight: '600', color: '#374151', display:'flex', alignItems:'center', gap:'5px', marginBottom:'10px' }}>
                                        📞 {h.phoneNumber}
                                    </div>

                                    {/* ✅ THE REQUEST ADMIT BUTTON */}
                                    <button 
                                        onClick={(e) => { e.stopPropagation(); sendRequest(h); }}
                                        disabled={isRequestActive && requestStatus !== null}
                                        style={{
                                            width: '100%', padding: '8px', borderRadius: '4px', border: 'none',
                                            fontWeight: 'bold', cursor: 'pointer',
                                            backgroundColor: isRequestActive && requestStatus === 'Pending' ? '#f59e0b' : 
                                                             isRequestActive && requestStatus === 'Accepted' ? '#22c55e' :
                                                             isRequestActive && requestStatus === 'Declined' ? '#ef4444' : '#2563eb',
                                            color: 'white'
                                        }}
                                    >
                                        {isRequestActive && requestStatus === 'Pending' ? '⏳ Requesting...' :
                                         isRequestActive && requestStatus === 'Accepted' ? '✅ ADMIT ACCEPTED' :
                                         isRequestActive && requestStatus === 'Declined' ? '❌ DECLINED' :
                                         '🔔 Request Admission'}
                                    </button>

                                </div>
                            );
                        })}
                    </div>
                </div>

                <div ref={mapRef} style={{ flex: 1, height: '100%', backgroundColor: '#f3f4f6', zIndex: 1 }} />
            </div>
            <style>{`.leaflet-routing-container { display: none !important; }`}</style>
        </div>
    );
};

export default EmergencyMap;