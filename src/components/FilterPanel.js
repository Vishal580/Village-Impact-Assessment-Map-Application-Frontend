import React, { useState, useEffect } from 'react';
import './FilterPanel.css';

const FilterPanel = ({
  selectedState,
  selectedDistrict,
  selectedSubdistrict,
  onStateChange,
  onDistrictChange,
  onSubdistrictChange
}) => {
  const [states, setStates] = useState([]);
  const [districts, setDistricts] = useState([]);
  const [subdistricts, setSubdistricts] = useState([]);
  const [loadingStates, setLoadingStates] = useState(false);
  const [loadingDistricts, setLoadingDistricts] = useState(false);
  const [loadingSubdistricts, setLoadingSubdistricts] = useState(false);

  // Fetch states on component mount
  useEffect(() => {
    fetchStates();
  }, []);

  // Fetch districts when state changes
  useEffect(() => {
    if (selectedState) {
      fetchDistricts(selectedState);
    } else {
      setDistricts([]);
      setSubdistricts([]);
    }
  }, [selectedState]);

  // Fetch subdistricts when district changes
  useEffect(() => {
    if (selectedState && selectedDistrict) {
      fetchSubdistricts(selectedState, selectedDistrict);
    } else {
      setSubdistricts([]);
    }
  }, [selectedState, selectedDistrict]);

  const fetchStates = async () => {
    setLoadingStates(true);
    try {
      const response = await fetch('http://localhost:5000/api/villages/states');
      const result = await response.json();
      setStates(result.success ? result.data.sort() : []);
    } catch (error) {
      console.error('Error fetching states:', error);
      setStates([]);
    } finally {
      setLoadingStates(false);
    }
  };

  const fetchDistricts = async (state) => {
    setLoadingDistricts(true);
    try {
      const response = await fetch(`http://localhost:5000/api/villages/districts/${encodeURIComponent(state)}`);
      const result = await response.json();
      setDistricts(result.success ? result.data.sort() : []);
    } catch (error) {
      console.error('Error fetching districts:', error);
      setDistricts([]);
    } finally {
      setLoadingDistricts(false);
    }
  };

  const fetchSubdistricts = async (state, district) => {
    setLoadingSubdistricts(true);
    try {
      const response = await fetch(
        `http://localhost:5000/api/villages/subdistricts/${encodeURIComponent(state)}/${encodeURIComponent(district)}`
      );
      const result = await response.json();
      setSubdistricts(result.success ? result.data.sort() : []);
    } catch (error) {
      console.error('Error fetching subdistricts:', error);
      setSubdistricts([]);
    } finally {
      setLoadingSubdistricts(false);
    }
  };

  const handleStateChange = (e) => {
    const value = e.target.value;
    onStateChange(value);
  };

  const handleDistrictChange = (e) => {
    const value = e.target.value;
    onDistrictChange(value);
  };

  const handleSubdistrictChange = (e) => {
    const value = e.target.value;
    onSubdistrictChange(value);
  };

  const clearFilters = () => {
    onStateChange('');
    onDistrictChange('');
    onSubdistrictChange('');
  };

  return (
    <div className="filter-panel">
      <div className="filter-header">
        <h3>Filters</h3>
        <button 
          className="clear-button" 
          onClick={clearFilters}
          disabled={!selectedState && !selectedDistrict && !selectedSubdistrict}
        >
          Clear All
        </button>
      </div>

      <div className="filter-group">
        <label htmlFor="state-select">Select State</label>
        <div className="select-container">
          <select
            id="state-select"
            value={selectedState}
            onChange={handleStateChange}
            disabled={loadingStates}
          >
            <option value="">All States</option>
            {states.map(state => (
              <option key={state} value={state}>
                {state}
              </option>
            ))}
          </select>
          {loadingStates && <div className="select-spinner"></div>}
        </div>
      </div>

      <div className="filter-group">
        <label htmlFor="district-select">Select District</label>
        <div className="select-container">
          <select
            id="district-select"
            value={selectedDistrict}
            onChange={handleDistrictChange}
            disabled={!selectedState || loadingDistricts}
          >
            <option value="">All Districts</option>
            {districts.map(district => (
              <option key={district} value={district}>
                {district}
              </option>
            ))}
          </select>
          {loadingDistricts && <div className="select-spinner"></div>}
        </div>
      </div>

      <div className="filter-group">
        <label htmlFor="subdistrict-select">Select Subdistrict</label>
        <div className="select-container">
          <select
            id="subdistrict-select"
            value={selectedSubdistrict}
            onChange={handleSubdistrictChange}
            disabled={!selectedDistrict || loadingSubdistricts}
          >
            <option value="">All Subdistricts</option>
            {subdistricts.map(subdistrict => (
              <option key={subdistrict} value={subdistrict}>
                {subdistrict}
              </option>
            ))}
          </select>
          {loadingSubdistricts && <div className="select-spinner"></div>}
        </div>
      </div>

      <div className="filter-info">
        <div className="breadcrumb">
          {selectedState && (
            <span className="breadcrumb-item">
              {selectedState}
              {selectedDistrict && (
                <>
                  <span className="breadcrumb-separator">›</span>
                  <span className="breadcrumb-item">
                    {selectedDistrict}
                    {selectedSubdistrict && (
                      <>
                        <span className="breadcrumb-separator">›</span>
                        <span className="breadcrumb-item">{selectedSubdistrict}</span>
                      </>
                    )}
                  </span>
                </>
              )}
            </span>
          )}
        </div>
      </div>
    </div>
  );
};

export default FilterPanel;