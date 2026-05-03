import React from 'react';
import SchoolMap from '../components/SchoolMap';

const MapPage = () => {
  return (
    <div className="container animate-fade-up" style={{ padding: '6rem 1rem 2rem 1rem', display: 'flex', flexDirection: 'column', height: '100vh', width: '100%' }}>
      <div style={{ marginBottom: '2rem', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div>
          <h1 style={{ fontSize: '2.5rem', fontWeight: '800', marginBottom: '0.5rem', background: 'linear-gradient(135deg, var(--text-primary), var(--text-muted))', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>Interactive Location Map</h1>
          <p style={{ color: 'var(--text-muted)', maxWidth: '600px', fontSize: '1.1rem', lineHeight: '1.6' }}>
            Locate Sarvasaar Education Academy precisely. You can zoom in and out to check transport and accessible routes around our campus.
          </p>
        </div>
      </div>
      
      {/* Map Container */}
      <div style={{ flex: 1, width: '100%', borderRadius: 'var(--radius-lg)', position: 'relative' }}>
        <SchoolMap />
      </div>
    </div>
  );
};

export default MapPage;
