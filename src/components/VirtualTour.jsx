import React, { useState, useMemo, Suspense } from 'react';
import { Canvas, useLoader } from '@react-three/fiber';
import { OrbitControls, Html } from '@react-three/drei';
import * as THREE from 'three';
import { motion } from 'framer-motion';
import { MapPin, Eye, MousePointerClick, Maximize, Minimize, Plus, Minus } from 'lucide-react';
import { useThree } from '@react-three/fiber';

// Import the user-uploaded panoramas
import img1 from '../assets/panoramas/1.jpeg';
import img2 from '../assets/panoramas/2.jpeg';
import img3 from '../assets/panoramas/3.jpeg';
import img4 from '../assets/panoramas/4.jpeg';
import img5 from '../assets/panoramas/5.jpeg';

const locations = {
  entrance: {
    id: 'entrance',
    name: 'Main Entrance',
    texture: img1,
    hotspots: [
      { id: 'reception', name: 'Enter Reception', position: [20, 0, -30], target: 'reception' }
    ]
  },
  reception: {
    id: 'reception',
    name: 'Reception Office',
    texture: img3,
    hotspots: [
      { id: 'entrance', name: 'Back to Entrance', position: [-20, 0, 30], target: 'entrance' },
      { id: 'corridor', name: 'Go to Corridor', position: [30, 0, -10], target: 'corridor' }
    ]
  },
  corridor: {
    id: 'corridor',
    name: 'Main Corridor',
    texture: img2,
    hotspots: [
      { id: 'reception', name: 'Back to Reception', position: [-30, 0, 10], target: 'reception' },
      { id: 'lab', name: 'Enter Computer Lab', position: [25, 0, -25], target: 'lab' },
      { id: 'hall', name: 'Go to Seminar Hall', position: [10, 0, -40], target: 'hall' }
    ]
  },
  lab: {
    id: 'lab',
    name: 'Computer Lab',
    texture: img4,
    hotspots: [
      { id: 'corridor', name: 'Back to Corridor', position: [-25, 0, 25], target: 'corridor' }
    ]
  },
  hall: {
    id: 'hall',
    name: 'Seminar Hall',
    texture: img5,
    hotspots: [
      { id: 'corridor', name: 'Back to Corridor', position: [-10, 0, 40], target: 'corridor' }
    ]
  }
};

const Photosphere = ({ locationId, onHotspotClick }) => {
  const data = locations[locationId];
  const texture = useLoader(THREE.TextureLoader, data.texture);
  
  // Ensure the texture maps correctly as an equirectangular image
  useMemo(() => {
    texture.mapping = THREE.EquirectangularReflectionMapping;
    texture.colorSpace = THREE.SRGBColorSpace;
  }, [texture]);

  return (
    <group>
      {/* 360-degree Sphere mapping the image inside out */}
      <mesh>
        <sphereGeometry args={[50, 64, 64]} />
        <meshBasicMaterial map={texture} side={THREE.BackSide} />
      </mesh>
      
      {/* Render Hotspots in 3D Space */}
      {data.hotspots.map((hotspot) => (
        <group key={hotspot.id} position={hotspot.position}>
          {/* Inner glowing sphere for hotspot */}
          <mesh onClick={() => onHotspotClick(hotspot.target)}>
            <sphereGeometry args={[1.2, 32, 32]} />
            <meshBasicMaterial color="#818cf8" transparent opacity={0.6} depthTest={false} />
          </mesh>
          {/* HTML Overlay Label - Premium Redesign */}
          <Html center distanceFactor={25} zIndexRange={[100, 0]}>
            <div 
              onClick={() => onHotspotClick(hotspot.target)}
              style={{
                background: 'rgba(15, 23, 42, 0.85)',
                color: 'white',
                padding: '1rem 2rem',
                borderRadius: '40px',
                fontWeight: '800',
                fontSize: '1.25rem',
                border: '2px solid rgba(129, 140, 248, 0.6)',
                boxShadow: '0 15px 40px rgba(0,0,0,0.8), 0 0 30px rgba(129, 140, 248, 0.5)',
                backdropFilter: 'blur(16px)',
                cursor: 'pointer',
                whiteSpace: 'nowrap',
                display: 'flex', alignItems: 'center', gap: '1rem',
                pointerEvents: 'auto',
                transition: 'all 0.3s cubic-bezier(0.34, 1.56, 0.64, 1)'
              }}
              onMouseEnter={(e) => { 
                e.currentTarget.style.transform = 'scale(1.1) translateY(-5px)'; 
                e.currentTarget.style.background = 'linear-gradient(135deg, #818cf8, #a855f7)'; 
                e.currentTarget.style.borderColor = '#fff';
              }}
              onMouseLeave={(e) => { 
                e.currentTarget.style.transform = 'scale(1) translateY(0)'; 
                e.currentTarget.style.background = 'rgba(15, 23, 42, 0.85)'; 
                e.currentTarget.style.borderColor = 'rgba(129, 140, 248, 0.6)';
              }}
            >
              <Eye size={22} color="#fff" />
              {hotspot.name}
            </div>
          </Html>
        </group>
      ))}
    </group>
  );
};

const CameraController = ({ fov }) => {
  const { camera } = useThree();
  React.useEffect(() => {
    camera.fov = fov;
    camera.updateProjectionMatrix();
  }, [fov, camera]);
  return null;
};

export default function VirtualTour() {
  const [currentLocation, setCurrentLocation] = useState('entrance');
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [fov, setFov] = useState(100);
  const containerRef = React.useRef(null);

  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      if (containerRef.current && containerRef.current.requestFullscreen) {
        containerRef.current.requestFullscreen();
      }
    } else {
      if (document.exitFullscreen) {
        document.exitFullscreen();
      }
    }
  };

  const handleZoomIn = () => setFov(prev => Math.max(prev - 10, 40));
  const handleZoomOut = () => setFov(prev => Math.min(prev + 10, 130));

  const handleWheel = (e) => {
    // Only scroll zoom if they're holding a modifier or simply allow wheel directly
    // Using simple wheel logic here
    if (e.deltaY > 0) {
      setFov(prev => Math.min(prev + 5, 130));
    } else {
      setFov(prev => Math.max(prev - 5, 40));
    }
  };

  React.useEffect(() => {
    const handleFullscreenChange = () => {
      setIsFullscreen(!!document.fullscreenElement);
    };
    document.addEventListener('fullscreenchange', handleFullscreenChange);
    return () => document.removeEventListener('fullscreenchange', handleFullscreenChange);
  }, []);

  return (
    <div ref={containerRef} onWheel={handleWheel} style={{ width: '100%', position: 'relative', height: isFullscreen ? '100vh' : '70vh', overflow: 'hidden', background: '#000' }}>
      
      {/* Absolute UI Overlay for selecting locations & Info - Sleek & Compact */}
      <motion.div 
        initial={{ x: -40, opacity: 0 }}
        animate={{ x: 0, opacity: 1 }}
        transition={{ duration: 0.7, delay: 0.6, type: 'spring', stiffness: 100 }}
        style={{ 
          position: 'absolute', top: '2rem', left: '2rem', zIndex: 10, padding: '1.5rem', 
          background: 'linear-gradient(135deg, rgba(15, 15, 22, 0.85), rgba(5, 5, 10, 0.9))', 
          color: 'white', borderRadius: '24px', 
          backdropFilter: 'blur(20px)', WebkitBackdropFilter: 'blur(20px)', 
          border: '1px solid rgba(255,255,255,0.08)', 
          boxShadow: '0 20px 40px rgba(0,0,0,0.6), inset 0 1px 1px rgba(255,255,255,0.1), 0 0 30px rgba(129,140,248,0.1)', 
          minWidth: '260px' 
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '0.8rem' }}>
           <div style={{ background: 'linear-gradient(135deg, rgba(129, 140, 248, 0.2), rgba(168, 85, 247, 0.1))', padding: '0.6rem', borderRadius: '12px', border: '1px solid rgba(129,140,248,0.3)', boxShadow: 'inset 0 2px 5px rgba(255,255,255,0.1)' }}>
              <MapPin size={22} color="#818cf8" style={{ filter: 'drop-shadow(0 0 5px rgba(129,140,248,0.8))' }} />
           </div>
           <h2 style={{ fontSize: '1.35rem', fontWeight: '800', background: 'linear-gradient(135deg, #fff, #a1a1aa)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', margin: 0 }}>
             {locations[currentLocation].name}
           </h2>
        </div>
        
        <p style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.75rem', color: '#a855f7', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: '1.5rem', opacity: 0.9 }}>
          <MousePointerClick size={14} /> Drag to look around
        </p>
        
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.8rem' }}>
          {Object.values(locations).map((loc, idx) => {
            const isActive = currentLocation === loc.id;
            return (
              <motion.button
                key={loc.id}
                onClick={() => setCurrentLocation(loc.id)}
                initial={{ opacity: 0, y: 5 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.8 + (idx * 0.1) }}
                whileHover={{ scale: isActive ? 1 : 1.02, x: isActive ? 0 : 3 }}
                whileTap={{ scale: 0.98 }}
                style={{
                  padding: '0.9rem 1.2rem',
                  display: 'flex', alignItems: 'center', gap: '0.8rem',
                  width: '100%', textAlign: 'left',
                  fontSize: '1rem', fontWeight: isActive ? '700' : '500',
                  borderRadius: '14px', cursor: 'pointer', outline: 'none',
                  background: isActive ? 'linear-gradient(135deg, #818cf8, #a855f7)' : 'rgba(255, 255, 255, 0.03)',
                  color: isActive ? 'white' : 'var(--text-muted)',
                  boxShadow: isActive ? '0 10px 20px rgba(129, 140, 248, 0.3), inset 0 2px 4px rgba(255,255,255,0.2)' : 'inset 0 1px 1px rgba(255,255,255,0.02)',
                  border: isActive ? '1px solid transparent' : '1px solid rgba(255,255,255,0.05)',
                  transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)'
                }}
              >
                <div style={{ 
                  width: '10px', height: '10px', borderRadius: '50%', 
                  background: isActive ? '#fff' : 'rgba(255,255,255,0.15)',
                  boxShadow: isActive ? '0 0 10px #fff' : 'none',
                  border: isActive ? 'none' : '1px solid rgba(255,255,255,0.3)',
                  transition: 'all 0.4s'
                }} />
                {loc.name}
              </motion.button>
            );
          })}
        </div>
      </motion.div>

      {/* Fullscreen Toggle Button */}
      <motion.button 
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ delay: 0.8 }}
        onClick={toggleFullscreen}
        title={isFullscreen ? "Exit Fullscreen" : "Enter Fullscreen"}
        style={{
          position: 'absolute', top: '1.5rem', right: '1.5rem', zIndex: 10,
          background: 'rgba(15, 15, 22, 0.75)', backdropFilter: 'blur(12px)', WebkitBackdropFilter: 'blur(12px)',
          border: '1px solid rgba(255,255,255,0.15)', borderRadius: '14px',
          padding: '0.8rem', color: 'white', cursor: 'pointer',
          boxShadow: '0 10px 20px rgba(0,0,0,0.4)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          transition: 'all 0.3s ease'
        }}
        onMouseEnter={(e) => { 
          e.currentTarget.style.background = 'rgba(129, 140, 248, 0.25)'; 
          e.currentTarget.style.borderColor = 'rgba(129, 140, 248, 0.6)'; 
          e.currentTarget.style.transform = 'scale(1.05)';
        }}
        onMouseLeave={(e) => { 
          e.currentTarget.style.background = 'rgba(15, 15, 22, 0.75)'; 
          e.currentTarget.style.borderColor = 'rgba(255,255,255,0.15)'; 
          e.currentTarget.style.transform = 'scale(1)';
        }}
      >
        {isFullscreen ? <Minimize size={22} color="#818cf8" /> : <Maximize size={22} color="#818cf8" />}
      </motion.button>

      {/* Embedded Zoom Controls - Glassmorphic */}
      <div style={{ position: 'absolute', bottom: '2rem', right: '1.5rem', zIndex: 10, display: 'flex', flexDirection: 'column', gap: '0.8rem' }}>
        <motion.button 
          initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.9 }}
          onClick={handleZoomIn}
          title="Zoom In"
          style={{
            background: 'rgba(15, 15, 22, 0.75)', backdropFilter: 'blur(12px)', border: '1px solid rgba(255,255,255,0.15)', borderRadius: '12px', padding: '0.8rem', color: 'white', cursor: 'pointer', boxShadow: '0 10px 20px rgba(0,0,0,0.4)', display: 'flex', alignItems: 'center', justifyContent: 'center', transition: 'all 0.3s ease'
          }}
          onMouseEnter={(e) => { e.currentTarget.style.background = 'rgba(129, 140, 248, 0.25)'; e.currentTarget.style.borderColor = 'rgba(129, 140, 248, 0.6)'; }}
          onMouseLeave={(e) => { e.currentTarget.style.background = 'rgba(15, 15, 22, 0.75)'; e.currentTarget.style.borderColor = 'rgba(255,255,255,0.15)'; }}
        >
          <Plus size={22} color="#fff" />
        </motion.button>
        <motion.button 
          initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 1.0 }}
          onClick={handleZoomOut}
          title="Zoom Out"
          style={{
            background: 'rgba(15, 15, 22, 0.75)', backdropFilter: 'blur(12px)', border: '1px solid rgba(255,255,255,0.15)', borderRadius: '12px', padding: '0.8rem', color: 'white', cursor: 'pointer', boxShadow: '0 10px 20px rgba(0,0,0,0.4)', display: 'flex', alignItems: 'center', justifyContent: 'center', transition: 'all 0.3s ease'
          }}
          onMouseEnter={(e) => { e.currentTarget.style.background = 'rgba(129, 140, 248, 0.25)'; e.currentTarget.style.borderColor = 'rgba(129, 140, 248, 0.6)'; }}
          onMouseLeave={(e) => { e.currentTarget.style.background = 'rgba(15, 15, 22, 0.75)'; e.currentTarget.style.borderColor = 'rgba(255,255,255,0.15)'; }}
        >
          <Minus size={22} color="#fff" />
        </motion.button>
      </div>

      {/* 3D Canvas rendering the Photosphere */}
      <Canvas camera={{ position: [0, 0, 0.1] }}>
        <CameraController fov={fov} />
        {/* Suspense is needed when using useLoader to load textures */}
        <Suspense fallback={
          <Html center>
            <div style={{ background: 'rgba(10, 10, 15, 0.85)', color: 'white', padding: '1.8rem 3rem', borderRadius: '24px', display: 'flex', alignItems: 'center', gap: '1.2rem', fontWeight: 700, fontSize: '1.2rem', backdropFilter: 'blur(16px)', border: '1px solid rgba(129,140,248,0.4)', boxShadow: '0 30px 60px rgba(0,0,0,0.6), 0 0 40px rgba(129, 140, 248, 0.2)', whiteSpace: 'nowrap' }}>
               <div style={{ width: '28px', height: '28px', border: '3px solid rgba(255,255,255,0.1)', borderTopColor: '#818cf8', borderRightColor: '#a855f7', borderRadius: '50%', animation: 'spin 1s linear infinite' }} />
               <style>{`@keyframes spin { 100% { transform: rotate(360deg); } }`}</style>
               Initializing 360° Environment...
            </div>
          </Html>
        }>
          <Photosphere locationId={currentLocation} onHotspotClick={setCurrentLocation} />
        </Suspense>
        
        {/* Controls to look around from inside the globe */}
        <OrbitControls 
          enablePan={false}
          enableZoom={false} 
          enableRotate={true}
          reverseOrbit={false} // Adjusting drag direction to feel natural
          rotateSpeed={-0.6}   // Inverting rotation speed to match drag direction for back side
          minDistance={0.1}
          maxDistance={30}
        />
      </Canvas>
    </div>
  );
}
