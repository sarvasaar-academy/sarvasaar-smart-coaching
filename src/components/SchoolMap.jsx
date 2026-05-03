import React, { useState } from 'react';
import { MapPin, Navigation } from 'lucide-react';
import { motion } from 'framer-motion';

const SchoolMap = () => {
  const [isLoading, setIsLoading] = useState(true);

  // Exact location of Gurukul Education and Research (Sarvasaar Academy)
  const lat = "23.4653654";
  const lng = "73.3056512";
  const mapSrc = `https://maps.google.com/maps?q=GURUKUL+EDUCATION+AND+RESEARCH,${lat},${lng}&t=m&z=17&ie=UTF8&iwloc=&output=embed`;
  const exactLink = "https://www.google.com/maps/place/GURUKUL+EDUCATION+AND+RESEARCH/@23.4653654,73.3030763,17z/";

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem', width: '100%' }}>
      
      {/* Premium Info Card Moved Outside Map Container */}
      <motion.div 
        initial={{ y: -20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.2, duration: 0.6, type: 'spring' }}
        style={{ 
          background: 'linear-gradient(135deg, rgba(15, 23, 42, 0.9), rgba(5, 5, 10, 0.95))', 
          padding: '1.5rem 2rem', borderRadius: '20px', 
          border: '1px solid rgba(129, 140, 248, 0.3)', color: 'white', 
          boxShadow: '0 15px 30px rgba(0,0,0,0.4), inset 0 1px 1px rgba(255,255,255,0.1)',
          display: 'flex', flexWrap: 'wrap', alignItems: 'center', justifyContent: 'space-between', gap: '1.5rem'
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '1.5rem', flex: '1 1 min-content' }}>
          <div style={{ padding: '0.8rem', background: 'linear-gradient(135deg, rgba(129, 140, 248, 0.25), rgba(168, 85, 247, 0.15))', borderRadius: '16px', border: '1px solid rgba(129,140,248,0.4)', boxShadow: 'inset 0 2px 10px rgba(255,255,255,0.1)' }}>
             <MapPin size={30} color="#818cf8" style={{ filter: 'drop-shadow(0 0 8px rgba(129,140,248,0.8))' }} />
          </div>
          <div>
            <h3 style={{ fontSize: '1.6rem', fontWeight: 800, margin: '0 0 0.4rem 0', background: 'linear-gradient(135deg, #fff, #e4e4e7)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', letterSpacing: '-0.02em' }}>
              Sarvasaar Education Academy
            </h3>
            <p style={{ color: 'var(--text-muted, #a1a1aa)', fontSize: '0.95rem', lineHeight: 1.5, margin: 0 }}>
              Explore the institute surroundings perfectly with this 100% authentic Google Maps integration.
            </p>
          </div>
        </div>
        
        <a 
          href={exactLink} 
          target="_blank" 
          rel="noopener noreferrer"
          style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', justifyItems: 'center', background: 'linear-gradient(135deg, #818cf8, #a855f7)', color: 'white', padding: '0.9rem 1.4rem', borderRadius: '12px', textDecoration: 'none', fontWeight: 700, fontSize: '1rem', width: 'fit-content', boxShadow: '0 10px 20px rgba(129,140,248,0.4), inset 0 2px 4px rgba(255,255,255,0.2)', transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)', whiteSpace: 'nowrap' }}
          onMouseEnter={(e) => { e.currentTarget.style.transform = 'scale(1.05) translateY(-2px)'; e.currentTarget.style.boxShadow = '0 15px 30px rgba(129,140,248,0.5), inset 0 2px 4px rgba(255,255,255,0.3)'; }}
          onMouseLeave={(e) => { e.currentTarget.style.transform = 'scale(1) translateY(0)'; e.currentTarget.style.boxShadow = '0 10px 20px rgba(129,140,248,0.4), inset 0 2px 4px rgba(255,255,255,0.2)'; }}
        >
          <Navigation size={20} /> Get Directions
        </a>
      </motion.div>

      {/* Map Container - Clear and unobstructed */}
      <div style={{ width: '100%', height: '45vh', minHeight: '350px', borderRadius: '24px', overflow: 'hidden', position: 'relative', border: '1px solid rgba(255,255,255,0.1)', boxShadow: '0 30px 60px rgba(0,0,0,0.5), 0 0 30px rgba(129, 140, 248, 0.15)', background: '#08080c' }}>
        {/* High-End Loading Skeleton */}
        {isLoading && (
          <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 5, background: '#08080c' }}>
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '1.2rem' }}>
              <div style={{ width: '45px', height: '45px', border: '4px solid rgba(129, 140, 248, 0.1)', borderTopColor: '#818cf8', borderRightColor: '#a855f7', borderRadius: '50%', animation: 'spin 1s linear infinite' }}></div>
              <style>{`@keyframes spin { 100% { transform: rotate(360deg); } }`}</style>
              <span style={{ color: '#818cf8', fontWeight: 700, letterSpacing: '0.15em', fontSize: '0.9rem' }}>INITIALIZING GOOGLE MAPS...</span>
            </div>
          </div>
        )}

        {/* Authentic Google Maps iFrame Widget */}
        <iframe 
          title="Sarvasaar Education Academy Authentic Google Map"
          src={mapSrc}
          width="100%" 
          height="100%" 
          style={{ border: 0, zIndex: 1, position: 'relative' }} 
          allowFullScreen="" 
          loading="lazy" 
          referrerPolicy="no-referrer-when-downgrade"
          onLoad={() => setIsLoading(false)}
        ></iframe>
      </div>
    </div>
  );
};

export default SchoolMap;
