import React, { useEffect, useRef, useState } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
const API_BASE_URL = process.env.REACT_APP_API_BASE_URL;
import './MapComponent.css';

// Fix for default markers in Leaflet
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: require('leaflet/dist/images/marker-icon-2x.png'),
  iconUrl: require('leaflet/dist/images/marker-icon.png'),
  shadowUrl: require('leaflet/dist/images/marker-shadow.png'),
});

const MapComponent = ({ villages, loading, selectedState, selectedDistrict, selectedSubdistrict }) => {
  const mapRef = useRef(null);
  const mapInstanceRef = useRef(null);
  const layerGroupRef = useRef(null);
  const [currentZoom, setCurrentZoom] = useState(6);

  useEffect(() => {
    // Initialize map
    if (!mapInstanceRef.current) {
      mapInstanceRef.current = L.map(mapRef.current).setView([20.5937, 78.9629], 6);
      
      // Add tile layer
      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '© OpenStreetMap contributors',
        maxZoom: 18,
      }).addTo(mapInstanceRef.current);

      // Create layer group for villages
      layerGroupRef.current = L.layerGroup().addTo(mapInstanceRef.current);

      // Add zoom event listener
      mapInstanceRef.current.on('zoom', () => {
        setCurrentZoom(mapInstanceRef.current.getZoom());
      });

      // Add move event listener for viewport-based loading
      mapInstanceRef.current.on('moveend', () => {
        if (mapInstanceRef.current.getZoom() > 10) {
          loadVillagesInViewport();
        }
      });
    }

    return () => {
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
      }
    };
  }, []);

  const loadVillagesInViewport = async () => {
    const bounds = mapInstanceRef.current.getBounds();
    const zoom = mapInstanceRef.current.getZoom();
    
    try {
      const response = await fetch(
        `${API_BASE_URL}/villages/bounds?minLat=${bounds.getSouth()}&maxLat=${bounds.getNorth()}&minLng=${bounds.getWest()}&maxLng=${bounds.getEast()}&zoom=${zoom}`
      );
      const result = await response.json();
      const villagesInViewport = result.success ? result.data : [];
      
      // Clear existing layers
      layerGroupRef.current.clearLayers();
      
      // Add villages to map
      addVillagesToMap(villagesInViewport, zoom);
    } catch (error) {
      console.error('Error loading villages in viewport:', error);
    }
  };

  const addVillagesToMap = (villagesToShow, zoom) => {
    villagesToShow.forEach(village => {
      if (!village.centroid) return;

      let marker;

      if (zoom > 12 && village.geometry && village.geometry.coordinates) {
        // Show polygon for high zoom levels
        try {
          const coordinates = village.geometry.coordinates[0].map(coord => [coord[1], coord[0]]);
          marker = L.polygon(coordinates, {
            color: village.color,
            fillColor: village.color,
            fillOpacity: 0.7,
            weight: 1
          });
        } catch (error) {
          // Fallback to circle marker if polygon creation fails
          marker = createCircleMarker(village);
        }
      } else {
        // Use circle markers for lower zoom levels for better performance
        marker = createCircleMarker(village);
      }

      if (marker) {
        // Add popup
        const popupContent = `
          <div class="village-popup">
            <h4>${village.village_na || 'Unknown Village'}</h4>
            <p><strong>Population:</strong> ${village.tot_p?.toLocaleString() || 'N/A'}</p>
            ${selectedState ? `<p><strong>State:</strong> ${selectedState}</p>` : ''}
            ${selectedDistrict ? `<p><strong>District:</strong> ${selectedDistrict}</p>` : ''}
            ${selectedSubdistrict ? `<p><strong>Subdistrict:</strong> ${selectedSubdistrict}</p>` : ''}
          </div>
        `;
        
        marker.bindPopup(popupContent);
        marker.addTo(layerGroupRef.current);
      }
    });
  };

  const createCircleMarker = (village) => {
    const radius = Math.max(3, Math.min(15, Math.sqrt(village.tot_p || 0) / 10));
    
    return L.circleMarker([village.centroid.lat, village.centroid.lng], {
      radius: radius,
      fillColor: village.color,
      color: village.color,
      weight: 1,
      opacity: 0.8,
      fillOpacity: 0.6
    });
  };

  useEffect(() => {
    if (!villages || villages.length === 0) {
      if (layerGroupRef.current) {
        layerGroupRef.current.clearLayers();
      }
      return;
    }

    // Clear existing layers
    if (layerGroupRef.current) {
      layerGroupRef.current.clearLayers();
    }

    // Add villages to map
    addVillagesToMap(villages, currentZoom);

    // Fit map to show all villages if we have location data
    if (villages.length > 0 && villages[0].centroid) {
      const group = new L.featureGroup(layerGroupRef.current.getLayers());
      if (group.getBounds().isValid()) {
        mapInstanceRef.current.fitBounds(group.getBounds(), { padding: [20, 20] });
      }
    }

  }, [villages, currentZoom]);

  return (
    <div className="map-component">
      {loading && (
        <div className="loading-overlay">
          <div className="loading-spinner"></div>
        </div>
      )}
      <div ref={mapRef} className="map-container-inner"></div>
      
      <div className="map-info">
        <div className="zoom-info">
          Zoom Level: {currentZoom}
          {currentZoom <= 10 && (
            <span className="zoom-hint"> (Zoom in to see detailed polygons)</span>
          )}
        </div>
        <div className="village-count">
          Villages Shown: {villages?.length || 0}
        </div>
      </div>
    </div>
  );
};

export default MapComponent;