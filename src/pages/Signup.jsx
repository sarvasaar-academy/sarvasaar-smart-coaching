import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { motion } from 'framer-motion';
import { User, Mail, ShieldCheck, Lock, ArrowRight, Loader2, Sparkles, ChevronDown, CheckCircle2 } from 'lucide-react';

const Signup = () => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState('student');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const { signup, currentUser, userRole } = useAuth();

  useEffect(() => {
    // Wait for both currentUser and userRole to be populated before redirecting
    // We strictly ignore this rule if a signup process is currently loading, to avoid race conditions.
    if (currentUser && userRole && !loading) {
      if (userRole === 'admin') navigate('/admin/dashboard');
      else navigate('/student/dashboard');
    }
  }, [currentUser, userRole, navigate, loading]);

  const handleSignup = async (e) => {
    e.preventDefault();
    try {
      setError('');
      setLoading(true);
      await signup(email, password, role, name);
      
      if (role === 'admin') {
        navigate('/admin/dashboard');
      } else {
        navigate('/student/dashboard');
      }
    } catch (err) {
      setError('Failed to create account: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '100vh', position: 'relative', overflow: 'hidden', backgroundColor: '#030305' }}>
      
      <Link to="/" style={{ position: 'absolute', top: '2rem', left: '2rem', color: 'var(--text-muted)', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '0.5rem', zIndex: 10, textDecoration: 'none', transition: 'color 0.3s' }} className="nav-back-link">
        &larr; Back to Home
      </Link>

      {/* Ultra Premium Animated Background Orbs for Signup (Emerald/Cyan Hue) */}
      <div style={{ position: 'absolute', inset: 0, overflow: 'hidden', zIndex: 0, pointerEvents: 'none' }}>
        <motion.div 
          animate={{ x: [0, -150, 100, 0], y: [0, 150, -100, 0], scale: [1, 1.2, 0.8, 1], rotate: [0, -90, -180, -360] }} 
          transition={{ duration: 25, repeat: Infinity, ease: "linear" }}
          style={{ position: 'absolute', top: '-10%', right: '-10%', width: '50vw', height: '50vw', background: 'radial-gradient(circle, rgba(52, 211, 153, 0.15) 0%, transparent 60%)', filter: 'blur(80px)', borderRadius: '50%' }}
        />
        <motion.div 
          animate={{ x: [0, 150, -150, 0], y: [0, -150, 100, 0], scale: [1, 1.3, 0.9, 1], rotate: [360, 180, 90, 0] }} 
          transition={{ duration: 30, repeat: Infinity, ease: "linear" }}
          style={{ position: 'absolute', bottom: '-10%', left: '-10%', width: '60vw', height: '60vw', background: 'radial-gradient(circle, rgba(56, 189, 248, 0.12) 0%, transparent 60%)', filter: 'blur(100px)', borderRadius: '50%' }}
        />
        <div style={{ position: 'absolute', inset: 0, backgroundImage: 'radial-gradient(rgba(255, 255, 255, 0.03) 1px, transparent 1px)', backgroundSize: '40px 40px' }}></div>
      </div>

      <motion.div 
        initial={{ opacity: 0, y: 40, scale: 0.95 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.8, type: 'spring', bounce: 0.4 }}
        style={{ 
          width: '100%', maxWidth: '540px', zIndex: 1, position: 'relative',
          padding: '3rem', margin: '2rem 1rem',
          background: 'linear-gradient(135deg, rgba(20, 20, 28, 0.8), rgba(10, 10, 15, 0.9))',
          backdropFilter: 'blur(40px)', WebkitBackdropFilter: 'blur(40px)',
          borderRadius: '24px',
          border: '1px solid rgba(255, 255, 255, 0.08)',
          boxShadow: '0 30px 60px rgba(0, 0, 0, 0.6), inset 0 1px 1px rgba(255, 255, 255, 0.1), 0 0 40px rgba(52, 211, 153, 0.1)'
        }}
      >
        <div style={{ position: 'absolute', top: 0, left: '50%', transform: 'translateX(-50%)', width: '60%', height: '2px', background: 'linear-gradient(90deg, transparent, rgba(52, 211, 153, 0.8), transparent)' }}></div>

        <div style={{ textAlign: 'center', marginBottom: '2.5rem' }}>
          <motion.div 
            initial={{ scale: 0, rotate: 180 }} animate={{ scale: 1, rotate: 0 }} transition={{ type: "spring", stiffness: 200, delay: 0.3 }}
            style={{ 
              width: '72px', height: '72px', margin: '0 auto 1.5rem auto',
              background: 'linear-gradient(135deg, rgba(52,211,153,0.2), rgba(52,211,153,0.05))', 
              borderRadius: '22px', display: 'flex', alignItems: 'center', justifyContent: 'center', 
              border: '1px solid rgba(52,211,153,0.4)', 
              boxShadow: '0 10px 30px rgba(52,211,153,0.3), inset 0 2px 10px rgba(255,255,255,0.2)' 
            }}
          >
            <CheckCircle2 size={36} color="#34d399" style={{ filter: 'drop-shadow(0 0 8px rgba(52,211,153,0.8))' }} />
          </motion.div>
          <div className="badge" style={{ marginBottom: '1rem', background: 'rgba(52, 211, 153, 0.1)', color: '#34d399', display: 'inline-flex', alignItems: 'center', gap: '6px', border: '1px solid rgba(52, 211, 153, 0.2)' }}>
            <Sparkles size={14} /> Join Now
          </div>
          <h2 style={{ fontSize: '2.4rem', fontWeight: '800', marginBottom: '0.5rem', letterSpacing: '-0.04em', color: '#fff' }}>Create Account</h2>
          <p style={{ color: 'var(--text-muted)', fontSize: '1.05rem', fontWeight: 500 }}>Join the next-generation learning ecosystem</p>
        </div>

        {error && (
          <motion.div 
            initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }}
            style={{ background: 'rgba(239, 68, 68, 0.1)', borderLeft: '4px solid var(--danger)', padding: '1rem', borderRadius: '8px', marginBottom: '1.5rem', color: '#fca5a5', fontSize: '0.9rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}
          >
            <div style={{ width: '6px', height: '6px', borderRadius: '50%', background: 'var(--danger)' }}></div>
            {error}
          </motion.div>
        )}

        <form onSubmit={handleSignup} style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          
          <div className="premium-input-wrapper">
            <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: '700', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: '0.8rem' }}>Full Name</label>
            <div style={{ position: 'relative' }}>
              <div style={{ position: 'absolute', top: '50%', left: '1.2rem', transform: 'translateY(-50%)', color: '#34d399', pointerEvents: 'none', transition: 'color 0.3s' }} className="input-icon">
                <User size={20} />
              </div>
              <input 
                type="text" 
                placeholder="Your Name" 
                value={name}
                onChange={(e) => setName(e.target.value)}
                required 
                className="premium-input"
                style={{ 
                  width: '100%', padding: '1.2rem 1.2rem 1.2rem 3.5em', 
                  background: 'rgba(0, 0, 0, 0.4)', border: '1px solid rgba(255,255,255,0.08)', 
                  borderRadius: '16px', color: 'white', fontSize: '1.05rem', 
                  outline: 'none', transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                  boxShadow: 'inset 0 2px 10px rgba(0,0,0,0.5)'
                }}
                onFocus={(e) => { 
                  e.target.style.borderColor = '#34d399'; 
                  e.target.style.background = 'rgba(52, 211, 153, 0.05)';
                  e.target.style.boxShadow = '0 0 0 4px rgba(52, 211, 153, 0.15), inset 0 2px 10px rgba(0,0,0,0.2)'; 
                }}
                onBlur={(e) => { 
                  e.target.style.borderColor = 'rgba(255,255,255,0.08)'; 
                  e.target.style.background = 'rgba(0, 0, 0, 0.4)';
                  e.target.style.boxShadow = 'inset 0 2px 10px rgba(0,0,0,0.5)'; 
                }}
              />
            </div>
          </div>

          <div className="premium-input-wrapper">
            <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: '700', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: '0.8rem' }}>Email Address</label>
            <div style={{ position: 'relative' }}>
              <div style={{ position: 'absolute', top: '50%', left: '1.2rem', transform: 'translateY(-50%)', color: '#34d399', pointerEvents: 'none', transition: 'color 0.3s' }} className="input-icon">
                <Mail size={20} />
              </div>
              <input 
                type="email" 
                placeholder="student@sarvasaar.edu" 
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required 
                className="premium-input"
                style={{ 
                  width: '100%', padding: '1.2rem 1.2rem 1.2rem 3.5em', 
                  background: 'rgba(0, 0, 0, 0.4)', border: '1px solid rgba(255,255,255,0.08)', 
                  borderRadius: '16px', color: 'white', fontSize: '1.05rem', 
                  outline: 'none', transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                  boxShadow: 'inset 0 2px 10px rgba(0,0,0,0.5)'
                }}
                onFocus={(e) => { 
                  e.target.style.borderColor = '#34d399'; 
                  e.target.style.background = 'rgba(52, 211, 153, 0.05)';
                  e.target.style.boxShadow = '0 0 0 4px rgba(52, 211, 153, 0.15), inset 0 2px 10px rgba(0,0,0,0.2)'; 
                }}
                onBlur={(e) => { 
                  e.target.style.borderColor = 'rgba(255,255,255,0.08)'; 
                  e.target.style.background = 'rgba(0, 0, 0, 0.4)';
                  e.target.style.boxShadow = 'inset 0 2px 10px rgba(0,0,0,0.5)'; 
                }}
              />
            </div>
          </div>
          
          <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '1.5rem' }}>
            {/* The role dropdown has been removed to secure the admin dashboard. All public signups are assigned 'student' role by default. Admin accounts are pre-configured. */}

            <div className="premium-input-wrapper">
              <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: '700', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: '0.8rem' }}>Password</label>
              <div style={{ position: 'relative' }}>
                <div style={{ position: 'absolute', top: '50%', left: '1.2rem', transform: 'translateY(-50%)', color: '#34d399', pointerEvents: 'none', transition: 'color 0.3s' }} className="input-icon">
                  <Lock size={20} />
                </div>
                <input 
                  type="password" 
                  placeholder="••••••••" 
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required 
                  className="premium-input"
                  style={{ 
                    width: '100%', padding: '1.2rem 1.2rem 1.2rem 3.5em', 
                    background: 'rgba(0, 0, 0, 0.4)', border: '1px solid rgba(255,255,255,0.08)', 
                    borderRadius: '16px', color: 'white', fontSize: '1.05rem', 
                    outline: 'none', transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                    boxShadow: 'inset 0 2px 10px rgba(0,0,0,0.5)'
                  }}
                  onFocus={(e) => { 
                    e.target.style.borderColor = '#34d399'; 
                    e.target.style.background = 'rgba(52, 211, 153, 0.05)';
                    e.target.style.boxShadow = '0 0 0 4px rgba(52, 211, 153, 0.15), inset 0 2px 10px rgba(0,0,0,0.2)'; 
                  }}
                  onBlur={(e) => { 
                    e.target.style.borderColor = 'rgba(255,255,255,0.08)'; 
                    e.target.style.background = 'rgba(0, 0, 0, 0.4)';
                    e.target.style.boxShadow = 'inset 0 2px 10px rgba(0,0,0,0.5)'; 
                  }}
                />
              </div>
            </div>
          </div>

          <motion.button 
            whileHover={{ scale: 1.02, backgroundImage: 'linear-gradient(135deg, #34d399, #10b981)' }}
            whileTap={{ scale: 0.98 }}
            disabled={loading} 
            type="submit" 
            style={{ 
              width: '100%', marginTop: '1.5rem', padding: '1.2rem', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.8rem', 
              background: 'linear-gradient(135deg, #10b981, #34d399)', color: 'white', border: 'none', borderRadius: '16px', 
              fontSize: '1.15rem', fontWeight: '700', cursor: loading ? 'not-allowed' : 'pointer', 
              boxShadow: '0 15px 30px rgba(52, 211, 153, 0.4), inset 0 2px 4px rgba(255,255,255,0.3)', 
              opacity: loading ? 0.8 : 1, transition: 'all 0.3s ease' 
            }}
          >
            {loading ? (
              <><Loader2 size={22} className="animate-spin" /> Creating...</>
            ) : (
              <>Create Account <ArrowRight size={22} /></>
            )}
          </motion.button>
        </form>

        <div style={{ marginTop: '3rem', paddingTop: '1.5rem', borderTop: '1px solid rgba(255,255,255,0.08)', textAlign: 'center' }}>
          <p style={{ color: 'var(--text-muted)', fontSize: '1rem' }}>
            Already have an account? <Link to="/login" style={{ color: '#34d399', fontWeight: '700', textDecoration: 'none', display: 'inline-flex', alignItems: 'center', gap: '4px' }}>Sign in instead <ArrowRight size={16}/></Link>
          </p>
        </div>
      </motion.div>
      
      <style>
      {`
        .animate-spin { animation: spin 1s linear infinite; }
        @keyframes spin { 100% { transform: rotate(360deg); } }
        .nav-back-link:hover { color: white !important; }
        .premium-input::placeholder { color: rgba(255,255,255,0.3); }
        .premium-input:focus ~ .input-icon { color: white; }
      `}
      </style>
    </div>
  );
};

export default Signup;
