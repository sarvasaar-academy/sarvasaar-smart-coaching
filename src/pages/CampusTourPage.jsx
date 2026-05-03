import React from 'react';
import { motion } from 'framer-motion';
import { Compass, Sparkles } from 'lucide-react';
import VirtualTour from '../components/VirtualTour';

const CampusTourPage = () => {
  return (
    <div style={{ minHeight: '100vh', padding: '8rem 2rem 4rem 2rem', position: 'relative', overflow: 'hidden' }}>
      
      {/* Background Orbs */}
      <div style={{ position: 'absolute', top: '-10%', right: '-5%', width: '40vw', height: '40vw', background: 'radial-gradient(circle, rgba(129, 140, 248, 0.15) 0%, transparent 70%)', borderRadius: '50%', zIndex: -1, pointerEvents: 'none' }}></div>
      <div style={{ position: 'absolute', bottom: '-10%', left: '-5%', width: '30vw', height: '30vw', background: 'radial-gradient(circle, rgba(168, 85, 247, 0.1) 0%, transparent 70%)', borderRadius: '50%', zIndex: -1, pointerEvents: 'none' }}></div>

      <div style={{ maxWidth: '1400px', margin: '0 auto', display: 'flex', flexDirection: 'column', height: '100%' }}>
        <motion.div 
          initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }}
          style={{ marginBottom: '2rem' }}
        >
          <div className="badge" style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem', background: 'rgba(129, 140, 248, 0.1)', color: '#818cf8', padding: '0.5rem 1rem', borderRadius: '2rem', border: '1px solid rgba(129, 140, 248, 0.2)', marginBottom: '1rem', fontSize: '0.9rem', fontWeight: 600 }}>
             <Sparkles size={16} /> Immersive Experience
          </div>
          <h1 style={{ fontSize: '3.5rem', fontWeight: '800', marginBottom: '1rem', background: 'linear-gradient(to right, #fff, #a1a1aa)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', display: 'flex', alignItems: 'center', gap: '1rem' }}>
            <Compass size={40} color="#818cf8" style={{ filter: 'drop-shadow(0 0 10px rgba(129,140,248,0.5))' }} />
            3D Virtual Campus
          </h1>
          <p style={{ color: 'var(--text-muted)', fontSize: '1.2rem', maxWidth: '800px', lineHeight: '1.6' }}>
            Step inside the Sarvasaar Education Academy campus like never before. Drag to look around in 360°, explore the library, sports arena, and science blocks in stunning high-definition.
          </p>
        </motion.div>
        
        {/* 3D Canvas Container */}
        <motion.div 
          initial={{ opacity: 0, scale: 0.98 }} animate={{ opacity: 1, scale: 1 }} transition={{ duration: 0.8, delay: 0.2 }}
          style={{ flex: 1, width: '100%', minHeight: '70vh', borderRadius: '30px', overflow: 'hidden', boxShadow: '0 30px 60px rgba(0,0,0,0.4), 0 0 40px rgba(129,140,248,0.1)', position: 'relative', border: '1px solid rgba(255,255,255,0.05)', background: '#030305' }}
        >
          <VirtualTour />
        </motion.div>
      </div>
    </div>
  );
};

export default CampusTourPage;
