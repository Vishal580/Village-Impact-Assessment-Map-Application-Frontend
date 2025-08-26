import React from 'react';
import './StatsPanel.css';

const StatsPanel = ({ stats }) => {
  if (!stats) {
    return null;
  }

  const formatNumber = (num) => {
    if (num === null || num === undefined) return 'N/A';
    return num.toLocaleString();
  };

  const formatPopulation = (num) => {
    if (num === null || num === undefined) return 'N/A';
    if (num >= 1000000) {
      return `${(num / 1000000).toFixed(1)}M`;
    } else if (num >= 1000) {
      return `${(num / 1000).toFixed(1)}K`;
    }
    return num.toLocaleString();
  };

  const getPopulationCategory = (avgPop) => {
    if (avgPop < 500) return 'Very Small';
    if (avgPop < 1000) return 'Small';
    if (avgPop < 2000) return 'Medium';
    if (avgPop < 5000) return 'Large';
    return 'Very Large';
  };

  return (
    <div className="stats-panel">
      <h3>Statistics</h3>
      
      <div className="stats-grid">
        <div className="stat-card primary">
          <div className="stat-label">Total Villages</div>
          <div className="stat-value">{formatNumber(stats.totalVillages)}</div>
        </div>
        
        <div className="stat-card secondary">
          <div className="stat-label">Total Population</div>
          <div className="stat-value">{formatPopulation(stats.totalPopulation)}</div>
          <div className="stat-detail">{formatNumber(stats.totalPopulation)}</div>
        </div>
        
        <div className="stat-card tertiary">
          <div className="stat-label">Average Population</div>
          <div className="stat-value">{formatNumber(Math.round(stats.avgPopulation || 0))}</div>
          <div className="stat-detail">{getPopulationCategory(stats.avgPopulation)}</div>
        </div>
      </div>
      
      <div className="stats-range">
        <h4>Population Range</h4>
        <div className="range-container">
          <div className="range-item">
            <span className="range-label">Minimum:</span>
            <span className="range-value">{formatNumber(stats.minPopulation)}</span>
          </div>
          <div className="range-item">
            <span className="range-label">Maximum:</span>
            <span className="range-value">{formatNumber(stats.maxPopulation)}</span>
          </div>
        </div>
      </div>
      
      {stats.totalVillages > 0 && (
        <div className="stats-insights">
          <h4>Insights</h4>
          <ul>
            <li>
              <strong>Population Density:</strong> {
                stats.avgPopulation > 2000 ? 'High density area' : 
                stats.avgPopulation > 1000 ? 'Medium density area' : 'Low density area'
              }
            </li>
            <li>
              <strong>Village Size:</strong> {
                stats.totalVillages > 100 ? 'Large administrative area' :
                stats.totalVillages > 50 ? 'Medium administrative area' : 'Small administrative area'
              }
            </li>
            {stats.maxPopulation > stats.avgPopulation * 3 && (
              <li>
                <strong>Distribution:</strong> Wide population variation detected
              </li>
            )}
          </ul>
        </div>
      )}
    </div>
  );
};

export default StatsPanel;