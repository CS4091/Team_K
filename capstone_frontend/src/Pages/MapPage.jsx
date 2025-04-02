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
  const [pins, setPins] = useState([]);
  const { theme, isModalOpen, setIsModalOpen } = useGlobalContext();
  const [address, setAddress] = useState('');
  const [filteredAddresses, setFilteredAddresses] = useState([]);

  const hardcodedAddresses = [
    { name: "Computer Science Building", lat: 37.95586, lng: -91.77464 },
    { name: "Library", lat: 37.95556, lng: -91.77355 },
    { name: "Havener Center", lat: 37.95491, lng: -91.77624 }
  ];

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

    const initialPins = hardcodedAddresses.map((location) => {
      const marker = L.marker([location.lat, location.lng]).addTo(newMap)
        .bindPopup(`<b>${location.name}</b><br>Lat: ${location.lat.toFixed(5)}<br>Lng: ${location.lng.toFixed(5)}`)
        .openPopup();
    
      return { id: Date.now() + Math.random(), name: location.name, latlng: { lat: location.lat, lng: location.lng }, marker };
    });
    
    setPins(initialPins);
    

    setMap(newMap);

    return () => {
      newMap.remove();
    };
  }, []);

  useEffect(() => {
    if (!map) return;

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

  const handlePinSubmit = () => {
    if (map && pinLocation && pinName.trim()) {
      const newMarker = L.marker(pinLocation).addTo(map)
        .bindPopup(`<b>${pinName}</b><br>Lat: ${pinLocation.lat.toFixed(5)}<br>Lng: ${pinLocation.lng.toFixed(5)}`)
        .openPopup();

      setPins((prevPins) => [...prevPins, { id: Date.now(), name: pinName, latlng: pinLocation, marker: newMarker }]);
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

  const handleAddressChange = (e) => {
    const input = e.target.value;
    setAddress(input);

    if (input.trim() === '') {
      setFilteredAddresses([]);
    } else {
      const matches = hardcodedAddresses.filter(loc =>
        loc.name.toLowerCase().includes(input.toLowerCase())
      );
      setFilteredAddresses(matches);
    }
  };

  const selectAddress = (location) => {
    setAddress(location.name);
    setFilteredAddresses([]);

    if (map) {
      map.setView([location.lat, location.lng], 15);
      const newMarker = L.marker([location.lat, location.lng]).addTo(map)
        .bindPopup(`<b>${location.name}</b><br>Lat: ${location.lat.toFixed(5)}<br>Lng: ${location.lng.toFixed(5)}`)
        .openPopup();
      
      setPins((prevPins) => [...prevPins, { id: Date.now(), name: location.name, latlng: { lat: location.lat, lng: location.lng }, marker: newMarker }]);
    }
  };

  return (
    <div>
      <ThemeProvider theme={theme}>
        <TopBar />

        <div style={{ position: 'absolute', top: '65px', left: '135px', zIndex: 1000, background: 'rgb(25, 71, 47)', padding: '10px', borderRadius: '5px' }}>
          <input 
            type="text" 
            value={address} 
            onChange={handleAddressChange}
            placeholder="Enter address"
            style={{ padding: '5px', width: '200px' }}
          />

          {filteredAddresses.length > 0 && (
            <ul style={{ background: 'white', position: 'absolute', top: '30px', left: '0', listStyle: 'none', padding: '5px', width: '100%', boxShadow: '0 2px 5px rgba(0,0,0,0.2)', borderRadius: '5px', maxHeight: '150px', overflowY: 'auto' }}>
              {filteredAddresses.map((loc) => (
                <li 
                  key={loc.name} 
                  onClick={() => selectAddress(loc)} 
                  style={{ padding: '5px', cursor: 'pointer', borderBottom: '1px solid #ddd' }}
                >
                  {loc.name}
                </li>
              ))}
            </ul>
          )}
        </div>

        <button 
          className="button" 
          onClick={() => setPinMode(!pinMode)} 
          style={{ backgroundColor: pinMode ? "green" : "rgb(25, 71, 47)", marginTop: '5px', padding: "10px 30px", borderRadius: "8px", color: 'white' }}>
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
            <button onClick={handlePinSubmit}>Save |</button>
            <button onClick={() => setShowPinModal(false)}>| Cancel</button>
          </div>
        )}
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
        {pins.length > 0 && (
          <div style={{ position: "absolute", bottom: "20px", right: "20px", backgroundColor: "white", padding: "10px", borderRadius: "8px" }}>
            <label><b>Delete a Pin:</b></label>
            <select onChange={(e) => handleDeletePin(Number(e.target.value))}>
              <option value="">-- Select Pin --</option>
              {pins.map((pin) => (
                <option key={pin.id} value={pin.id}>{pin.name}</option>
              ))}
            </select>
          </div>
        )}
      </ThemeProvider>
      <UserModal isOpen={isModalOpen} setIsOpen={setIsModalOpen} />
    </div>
  );
};

export default MapPage;
