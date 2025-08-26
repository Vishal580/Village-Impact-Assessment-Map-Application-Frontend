import React, { useState, useEffect } from 'react';
import MapComponent from './components/MapComponent';
import FilterPanel from './components/FilterPanel';
import StatsPanel from './components/StatsPanel';
import FileUpload from './components/FileUpload';
const API_BASE_URL = process.env.REACT_APP_API_BASE_URL;
import './App.css';

function App() {
  const [selectedState, setSelectedState] = useState('');
  const [selectedDistrict, setSelectedDistrict] = useState('');
  const [selectedSubdistrict, setSelectedSubdistrict] = useState('');
  const [villages, setVillages] = useState([]);
  const [loading, setLoading] = useState(false);
  const [stats, setStats] = useState(null);
  const [dataUploaded, setDataUploaded] = useState(false);

  // Check if data exists on component mount
  useEffect(() => {
    checkDataExists();
  }, []);

  const checkDataExists = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/villages/states`);
      const result = await response.json();
      setDataUploaded(result.success && result.data && result.data.length > 0);
    } catch (error) {
      console.error('Error checking data:', error);
    }
  };

  const fetchVillages = async (state = selectedState, district = selectedDistrict, subdistrict = selectedSubdistrict) => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (state) params.append('state', state);
      if (district) params.append('district', district);
      if (subdistrict) params.append('subdistrict', subdistrict);

      const response = await fetch(`${API_BASE_URL}/villages?${params}`);
      const result = await response.json();
      setVillages(result.success ? result.data : []);
    } catch (error) {
      console.error('Error fetching villages:', error);
      setVillages([]);
    } finally {
      setLoading(false);
    }
  };

  const fetchStats = async (state = selectedState, district = selectedDistrict, subdistrict = selectedSubdistrict) => {
    try {
      const params = new URLSearchParams();
      if (state) params.append('state', state);
      if (district) params.append('district', district);
      if (subdistrict) params.append('subdistrict', subdistrict);

      const response = await fetch(`${API_BASE_URL}/stats?${params}`);
      const result = await response.json();
      setStats(result.success ? result.data : null);
    } catch (error) {
      console.error('Error fetching stats:', error);
    }
  };

  const handleStateChange = (state) => {
    setSelectedState(state);
    setSelectedDistrict('');
    setSelectedSubdistrict('');
    if (state) {
      fetchVillages(state, '', '');
      fetchStats(state, '', '');
    } else {
      setVillages([]);
      setStats(null);
    }
  };

  const handleDistrictChange = (district) => {
    setSelectedDistrict(district);
    setSelectedSubdistrict('');
    if (district) {
      fetchVillages(selectedState, district, '');
      fetchStats(selectedState, district, '');
    } else {
      fetchVillages(selectedState, '', '');
      fetchStats(selectedState, '', '');
    }
  };

  const handleSubdistrictChange = (subdistrict) => {
    setSelectedSubdistrict(subdistrict);
    if (subdistrict) {
      fetchVillages(selectedState, selectedDistrict, subdistrict);
      fetchStats(selectedState, selectedDistrict, subdistrict);
    } else {
      fetchVillages(selectedState, selectedDistrict, '');
      fetchStats(selectedState, selectedDistrict, '');
    }
  };

  const handleUploadSuccess = () => {
    setDataUploaded(true);
    checkDataExists();
  };

  if (!dataUploaded) {
    return (
      <div className="app">
        <div className="upload-container">
          <h1>Village Impact Assessment</h1>
          <p>Please upload your shapefile data to get started.</p>
          <FileUpload onUploadSuccess={handleUploadSuccess} />
        </div>
      </div>
    );
  }

  return (
    <div className="app">
      <header className="app-header">
        <h1>Impact Assessment</h1>
        <p>Our impact assessment focuses on increased Rabi acreage as the primary indicator of watershed programme success.</p>
      </header>
      
      <div className="app-content">
        <div className="sidebar">
          <FilterPanel
            selectedState={selectedState}
            selectedDistrict={selectedDistrict}
            selectedSubdistrict={selectedSubdistrict}
            onStateChange={handleStateChange}
            onDistrictChange={handleDistrictChange}
            onSubdistrictChange={handleSubdistrictChange}
          />
          
          {stats && <StatsPanel stats={stats} />}
          
          <div className="legend">
            <h3>Population Legend</h3>
            <div className="legend-item">
              <span className="legend-color" style={{ backgroundColor: '#ffffcc' }}></span>
              <span>500</span>
            </div>
            <div className="legend-item">
              <span className="legend-color" style={{ backgroundColor: '#c7e9b4' }}></span>
              <span>500 - 999</span>
            </div>
            <div className="legend-item">
              <span className="legend-color" style={{ backgroundColor: '#7fcdbb' }}></span>
              <span>1,000 - 1,999</span>
            </div>
            <div className="legend-item">
              <span className="legend-color" style={{ backgroundColor: '#41b6c4' }}></span>
              <span>2,000 - 4,999</span>
            </div>
            <div className="legend-item">
              <span className="legend-color" style={{ backgroundColor: '#2c7fb8' }}></span>
              <span>5,000 - 9,999</span>
            </div>
            <div className="legend-item">
              <span className="legend-color" style={{ backgroundColor: '#253494' }}></span>
              <span>10,000 - 19,999</span>
            </div>
            <div className="legend-item">
              <span className="legend-color" style={{ backgroundColor: '#081d58' }}></span>
              <span>≥ 20,000</span>
            </div>
          </div>
        </div>
        
        <div className="map-container">
          <MapComponent
            villages={villages}
            loading={loading}
            selectedState={selectedState}
            selectedDistrict={selectedDistrict}
            selectedSubdistrict={selectedSubdistrict}
          />
        </div>
      </div>
    </div>
  );
}

export default App;