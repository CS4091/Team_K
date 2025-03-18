import React, { useEffect, useState } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { useGlobalContext } from '../Context/GlobalContext';
import { ThemeProvider } from '@emotion/react';
import TopBar from '../Components/TopBar';
import UserModal from '../Components/UserModal';

const MapPage = () => {
  const [pinMode, setPinMode] = useState(false);
  const [map, setMap] = useState(null);
  const [showPinModal, setShowPinModal] = useState(false);
  const [pinName, setPinName] = useState('');
  const [pinLocation, setPinLocation] = useState(null);
  const [pins, setPins] = useState([]); // Stores all pins
  const { theme, isModalOpen, setIsModalOpen } = useGlobalContext();
  const [address, setAddress] = useState('');

  const getAllPins = async () => {
    const response = await fetch(`http://localhost:3001/event/getAll`)
    const doc = await response.json()
    const newPins = doc.map(p => {
      const newMarker = L.marker(p.latlng).addTo(map)
        .bindPopup(`<b>${pinName}</b><br>Lat: ${p.latlng.lat.toFixed(5)}<br>Lng: ${p.latlng.lng.toFixed(5)}`)
        .openPopup();
      const newP = {...p, marker: newMarker}
      return newP
    })
    setPins(newPins)
  }

  useEffect(() => {
    const bounds = [
      [37.90, -91.85], 
      [38.00, -91.65]  
    ];

    const newMap = L.map('map', {
      center: [37.95, -91.77],
      zoom: 13,
      minZoom: 12,
      maxBounds: bounds,
      maxBoundsViscosity: 1.0
    });

    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '&copy; OpenStreetMap contributors'
    }).addTo(newMap);

    setMap(newMap);
    
    return () => {
      newMap.remove();
    };
  }, []);

  useEffect(() => {
    if (!map) return;
    if (pins.length == 0) {
      getAllPins()
    }
    const handleMapClick = (e) => {
      if (pinMode) {
        setPinLocation(e.latlng);
        setShowPinModal(true);
        setPinMode(false);
      }
    };

    map.on('click', handleMapClick);
    return () => {
      map.off('click', handleMapClick);
    };
  }, [map, pinMode]);

  const handlePinSubmit = async () => {
    if (map && pinLocation && pinName.trim()) {
      console.log(pinLocation)
      const newMarker = L.marker(pinLocation).addTo(map)
        .bindPopup(`<b>${pinName}</b><br>Lat: ${pinLocation.lat.toFixed(5)}<br>Lng: ${pinLocation.lng.toFixed(5)}`)
        .openPopup();
      const newPin = { id: Date.now(), name: pinName, latlng: pinLocation, }
      const response = await fetch('http://localhost:3001/event', {
        method: 'POST',
        headers: {
        'Content-Type': 'application/json',
        },
        body: JSON.stringify(newPin),
      })
      const mapPin = {...newPin, marker: newMarker}
      setPins((prevPins) => [...prevPins, mapPin]);
      setShowPinModal(false);
      setPinName('');
      setPinLocation(null);
    }
  };

  const handlePinSelect = (e) => {
    const selectedPin = pins.find(pin => pin.id === Number(e.target.value));
    if (selectedPin && map) {
      map.setView(selectedPin.latlng, 15);
    }
  };

  const handleDeletePin = (id) => {
    const pinToRemove = pins.find(pin => pin.id === id);
    if (pinToRemove && map) {
      map.removeLayer(pinToRemove.marker);
      setPins(pins.filter(pin => pin.id !== id));
    }
  };

  const searchAddress = async () => {
    if (!address.trim()) return;

    try {
      const response = await fetch(
        `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(address)}`
      );
      const data = await response.json();

      if (data.length === 0) {
        alert("Address not found!");
        return;
      }

      const { lat, lon } = data[0];
      const latlng = { lat: parseFloat(lat), lng: parseFloat(lon) };

      if (map) {
        map.setView(latlng, 15);
        const newMarker = L.marker(latlng).addTo(map)
          .bindPopup(`<b>${address}</b><br>Lat: ${latlng.lat.toFixed(5)}<br>Lng: ${latlng.lng.toFixed(5)}`)
          .openPopup();

        setPins((prevPins) => [...prevPins, { id: Date.now(), name: address, latlng, marker: newMarker }]);
      }
    } catch (error) {
      console.error("Error fetching address:", error);
    }
  };

  return (
    <div>
      <ThemeProvider theme={theme}>
        <TopBar />

        {/* Address Search Box */}
        <div style={{ position: 'absolute', top: '65px', left: '100px', zIndex: 1000, background: 'rgb(32, 83, 27)', padding: '10px', borderRadius: '5px' }}>
          <input 
            type="text" 
            value={address} 
            onChange={(e) => setAddress(e.target.value)}
            placeholder="Enter address"
            style={{ padding: '5px', width: '200px' }}
          />
          <button onClick={searchAddress} style={{ marginLeft: '5px', padding: '5px 10px', backgroundColor: 'white', color: 'black', border: 'none', cursor: 'pointer' }}>
            Search
          </button>
        </div>

        {/* Active Pins Dropdown (TOP Right) */}
        <div style={{ position: 'absolute', top: '80px', right: '10px', zIndex: 1000, background: 'white', padding: '5px', borderRadius: '5px' }}>
          <label><b>Active Pins:</b></label>
          <select onChange={handlePinSelect}>
            <option value="">Select a Pin</option>
            {pins.map((pin) => (
              <option key={pin.id} value={pin.id}>{pin.name}</option>
            ))}
          </select>
        </div>
    
        <body>
          <button 
            className="button" 
            onClick={() => setPinMode(!pinMode)} 
            style={{ backgroundColor: pinMode ? "green" : "rgb(32, 83, 27)",
              padding: "10px 30px",
              borderRadius: "8px",
              color: 'white',
              boxShadow: "0px 4px 6px rgba(0, 0, 0, 0.1)" }}>
            {pinMode ? "Cancel Pin" : "Pin"}
          </button>

          <div id="map" style={{ height: "600px", width: "100%", marginTop: "20px", borderRadius: "10px" }}></div>

          {showPinModal && (
            <div className="pin-modal">
              <p>Enter a name for the pin:</p>
              <input 
                type="text" 
                value={pinName} 
                onChange={(e) => setPinName(e.target.value)}
                placeholder="Pin name"
              />
              <button onClick={handlePinSubmit}>Save | </button>
              <button onClick={() => setShowPinModal(false)}>| Cancel</button>
            </div>
          )}

          {/* Delete Pin Button (BOTTOM RIGHT) */}
          {pins.length > 0 && (
            <div style={{
              position: "absolute",
              bottom: "20px",
              right: "20px",
              backgroundColor: "white",
              padding: "10px",
              borderRadius: "8px",
              boxShadow: "0px 4px 6px rgba(0, 0, 0, 0.1)"
            }}>
              <label htmlFor="pinList"><b>Delete a Pin:</b></label>
              <select id="pinList" onChange={(e) => handleDeletePin(Number(e.target.value))}>
                <option value="">-- Select Pin --</option>
                {pins.map((pin) => (
                  <option key={pin.id} value={pin.id}>
                    {pin.name} (Lat: {pin.latlng.lat.toFixed(5)}, Lng: {pin.latlng.lng.toFixed(5)})
                  </option>
                ))}
              </select>
            </div>
          )}

        </body>
      </ThemeProvider>
      <UserModal isOpen={isModalOpen} setIsOpen={setIsModalOpen} />
    </div>
  );
};

export default MapPage;
