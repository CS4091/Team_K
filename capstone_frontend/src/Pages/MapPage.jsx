import React, { useEffect, useState } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

import { useGlobalContext } from '../Context/GlobalContext'
import { ThemeProvider } from '@emotion/react'
import TopBar from '../Components/TopBar'
import UserModal from '../Components/UserModal'



const MapPage = () => {
  const [pinMode, setPinMode] = useState(false);
  const {theme, isModalOpen, setIsModalOpen} = useGlobalContext()

  useEffect(() => {
    
    const bounds = [
      [37.90, -91.85], // Southwest corner
      [38.00, -91.65]  // Northeast corner
    ];

    
    const map = L.map('map', {
      center: [37.95, -91.77],
      zoom: 13,
      minZoom: 12,
      maxBounds: bounds,
      maxBoundsViscosity: 1.0
    });

    
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '&copy; OpenStreetMap contributors'
    }).addTo(map);

    
    map.on('click', (e) => {
      if (pinMode) {
        const marker = L.marker(e.latlng).addTo(map)
          .bindPopup("Pinned Location:<br>Lat: " + e.latlng.lat.toFixed(5) + "<br>Lng: " + e.latlng.lng.toFixed(5))
          .openPopup();
        setPinMode(false); 
      }
    });

    
    return () => {
      map.remove();
    };
  }, [pinMode]);
  return (
    <div>

    <ThemeProvider theme={theme}>
    <TopBar></TopBar>
      <head>
        <title>Rolla</title>
      </head>

      <body>
        <p className="welcome">Rolla Map</p>
        <button className="button" onClick={() => setPinMode(!pinMode)} style={{ backgroundColor: pinMode ? "green" : "rgb(52, 52, 5)" }}>
          {pinMode ? "Cancel Pin" : "Pin"}
        </button>

        <div id="map" style={{ height: "800px", width: "100%", marginTop: "20px", borderRadius: "10px" }}></div>
      </body>
      </ThemeProvider>
      <UserModal isOpen={isModalOpen} setIsOpen={setIsModalOpen}/>
    </div>
  );
};

export default MapPage;
