import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { doc, getDoc } from 'firebase/firestore';
import { db } from '../firebase';
import { motion } from 'framer-motion';
import { Mail, Lock, ArrowRight, Loader2, Sparkles, Hexagon } from 'lucide-react';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [loginRole, setLoginRole] = useState('student');
  const navigate = useNavigate();
  const { login, currentUser, userRole } = useAuth();

  useEffect(() => {
    // Only automatically route if BOTH the user and their designated role have definitively loaded
    if (currentUser && userRole) {
      if (userRole === 'admin') navigate('/admin/dashboard');
      else navigate('/student/dashboard');
    }
  }, [currentUser, userRole, navigate]);

  const handleLogin = async (e) => {
    e.preventDefault();
    try {
      setError('');
      setLoading(true);
      await login(email, password, loginRole);
      // The useEffect listener above will automatically navigate once context updates
    } catch (err) {
      setError(err.message || 'Invalid email or password. Please try again.');
      setLoading(false);
    }
  };

  return (
    <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '100vh', position: 'relative', overflow: 'hidden', backgroundColor: '#030305' }}>
      
      <Link to="/" style={{ position: 'absolute', top: '2rem', left: '2rem', color: 'var(--text-muted)', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '0.5rem', zIndex: 10, textDecoration: 'none', transition: 'color 0.3s' }} className="nav-back-link">
        &larr; Back to Home
      </Link>

      {/* Ultra Premium Animated Background Orbs */}
      <div style={{ position: 'absolute', inset: 0, overflow: 'hidden', zIndex: 0, pointerEvents: 'none' }}>
        <motion.div 
          animate={{ x: [0, 150, -100, 0], y: [0, -150, 100, 0], scale: [1, 1.2, 0.8, 1], rotate: [0, 90, 180, 360] }} 
          transition={{ duration: 25, repeat: Infinity, ease: "linear" }}
          style={{ position: 'absolute', top: '0%', left: '-10%', width: '50vw', height: '50vw', background: 'radial-gradient(circle, rgba(129, 140, 248, 0.15) 0%, transparent 60%)', filter: 'blur(80px)', borderRadius: '50%' }}
        />
        <motion.div 
          animate={{ x: [0, -150, 150, 0], y: [0, 150, -100, 0], scale: [1, 1.3, 0.9, 1], rotate: [360, 180, 90, 0] }} 
          transition={{ duration: 30, repeat: Infinity, ease: "linear" }}
          style={{ position: 'absolute', bottom: '-10%', right: '-10%', width: '60vw', height: '60vw', background: 'radial-gradient(circle, rgba(236, 72, 153, 0.12) 0%, transparent 60%)', filter: 'blur(100px)', borderRadius: '50%' }}
        />
        <motion.div 
          animate={{ x: [0, 50, -50, 0], y: [0, 50, -50, 0], scale: [0.8, 1.1, 0.9, 0.8] }} 
          transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
          style={{ position: 'absolute', top: '30%', right: '20%', width: '30vw', height: '30vw', background: 'radial-gradient(circle, rgba(52, 211, 153, 0.1) 0%, transparent 60%)', filter: 'blur(60px)', borderRadius: '50%' }}
        />
        <div style={{ position: 'absolute', inset: 0, backgroundImage: 'radial-gradient(rgba(255, 255, 255, 0.03) 1px, transparent 1px)', backgroundSize: '40px 40px' }}></div>
      </div>

      <motion.div 
        initial={{ opacity: 0, y: 40, scale: 0.95 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.8, type: 'spring', bounce: 0.4 }}
        style={{ 
          width: '100%', maxWidth: '480px', zIndex: 1, position: 'relative',
          padding: '3rem', margin: '1rem',
          background: 'linear-gradient(135deg, rgba(20, 20, 28, 0.8), rgba(10, 10, 15, 0.9))',
          backdropFilter: 'blur(40px)', WebkitBackdropFilter: 'blur(40px)',
          borderRadius: '24px',
          border: '1px solid rgba(255, 255, 255, 0.08)',
          boxShadow: '0 30px 60px rgba(0, 0, 0, 0.6), inset 0 1px 1px rgba(255, 255, 255, 0.1), 0 0 40px rgba(129, 140, 248, 0.1)'
        }}
      >
        <div style={{ position: 'absolute', top: 0, left: '50%', transform: 'translateX(-50%)', width: '60%', height: '2px', background: 'linear-gradient(90deg, transparent, rgba(129, 140, 248, 0.8), transparent)' }}></div>

        <div style={{ display: 'flex', justifyContent: 'center', gap: '1rem', marginBottom: '2rem' }}>
          <button 
            type="button"
            onClick={() => setLoginRole('student')}
            style={{ 
              padding: '0.8rem 1.5rem', borderRadius: '12px', border: 'none', fontWeight: '700', cursor: 'pointer', transition: 'all 0.3s',
              background: loginRole === 'student' ? 'rgba(129, 140, 248, 0.2)' : 'transparent',
              color: loginRole === 'student' ? '#818cf8' : 'var(--text-muted)',
              border: loginRole === 'student' ? '1px solid rgba(129, 140, 248, 0.4)' : '1px solid transparent'
            }}
          >
            Student Login
          </button>
          <button 
            type="button"
            onClick={() => setLoginRole('admin')}
            style={{ 
              padding: '0.8rem 1.5rem', borderRadius: '12px', border: 'none', fontWeight: '700', cursor: 'pointer', transition: 'all 0.3s',
              background: loginRole === 'admin' ? 'rgba(52, 211, 153, 0.2)' : 'transparent',
              color: loginRole === 'admin' ? '#34d399' : 'var(--text-muted)',
              border: loginRole === 'admin' ? '1px solid rgba(52, 211, 153, 0.4)' : '1px solid transparent'
            }}
          >
            Admin / Principal
          </button>
        </div>

        <div style={{ textAlign: 'center', marginBottom: '2.5rem' }}>
          <motion.div 
            initial={{ scale: 0, rotate: -180 }} animate={{ scale: 1, rotate: 0 }} transition={{ type: "spring", stiffness: 200, delay: 0.3 }}
            style={{ 
              width: '72px', height: '72px', margin: '0 auto 1.5rem auto',
              background: loginRole === 'admin' ? 'linear-gradient(135deg, rgba(52,211,153,0.2), rgba(52,211,153,0.05))' : 'linear-gradient(135deg, rgba(129,140,248,0.2), rgba(129,140,248,0.05))', 
              borderRadius: '22px', display: 'flex', alignItems: 'center', justifyContent: 'center', 
              border: loginRole === 'admin' ? '1px solid rgba(52,211,153,0.4)' : '1px solid rgba(129,140,248,0.4)', 
              boxShadow: loginRole === 'admin' ? '0 10px 30px rgba(52,211,153,0.3), inset 0 2px 10px rgba(255,255,255,0.2)' : '0 10px 30px rgba(129,140,248,0.3), inset 0 2px 10px rgba(255,255,255,0.2)' 
            }}
          >
            <Hexagon size={36} color={loginRole === 'admin' ? "#34d399" : "#818cf8"} style={{ filter: loginRole === 'admin' ? 'drop-shadow(0 0 8px rgba(52,211,153,0.8))' : 'drop-shadow(0 0 8px rgba(129,140,248,0.8))' }} />
          </motion.div>
          <div className="badge" style={{ marginBottom: '1rem', background: loginRole === 'admin' ? 'rgba(52, 211, 153, 0.1)' : 'rgba(129, 140, 248, 0.1)', color: loginRole === 'admin' ? '#34d399' : '#818cf8', display: 'inline-flex', alignItems: 'center', gap: '6px', border: loginRole === 'admin' ? '1px solid rgba(52, 211, 153, 0.2)' : '1px solid rgba(129, 140, 248, 0.2)' }}>
            <Sparkles size={14} /> {loginRole === 'admin' ? 'Admin Portal' : 'Student Portal'}
          </div>
          <h2 style={{ fontSize: '2.4rem', fontWeight: '800', marginBottom: '0.5rem', letterSpacing: '-0.04em', color: '#fff' }}>Welcome Back</h2>
          <p style={{ color: 'var(--text-muted)', fontSize: '1.05rem', fontWeight: 500 }}>Sign in to continue to your {loginRole === 'admin' ? 'admin dashboard' : 'dashboard'}</p>
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

        <form onSubmit={handleLogin} style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          
          <div className="premium-input-wrapper">
            <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: '700', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: '0.8rem' }}>Email Address</label>
            <div style={{ position: 'relative' }}>
              <div style={{ position: 'absolute', top: '50%', left: '1.2rem', transform: 'translateY(-50%)', color: loginRole === 'admin' ? '#34d399' : '#818cf8', pointerEvents: 'none', transition: 'color 0.3s' }} className="input-icon">
                <Mail size={20} />
              </div>
              <input 
                type="email" 
                placeholder={loginRole === 'admin' ? "master@sarvasaar.edu" : "student@sarvasaar.edu"} 
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
                  e.target.style.borderColor = loginRole === 'admin' ? '#34d399' : '#818cf8'; 
                  e.target.style.background = loginRole === 'admin' ? 'rgba(52, 211, 153, 0.05)' : 'rgba(129, 140, 248, 0.05)';
                  e.target.style.boxShadow = loginRole === 'admin' ? '0 0 0 4px rgba(52, 211, 153, 0.15), inset 0 2px 10px rgba(0,0,0,0.2)' : '0 0 0 4px rgba(129, 140, 248, 0.15), inset 0 2px 10px rgba(0,0,0,0.2)'; 
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
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.8rem' }}>
              <label style={{ fontSize: '0.85rem', fontWeight: '700', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.08em' }}>Password</label>
              <Link to="#" style={{ color: '#818cf8', fontSize: '0.85rem', fontWeight: '600', textDecoration: 'none' }}>Forgot password?</Link>
            </div>
            <div style={{ position: 'relative' }}>
              <div style={{ position: 'absolute', top: '50%', left: '1.2rem', transform: 'translateY(-50%)', color: loginRole === 'admin' ? '#34d399' : '#818cf8', pointerEvents: 'none', transition: 'color 0.3s' }} className="input-icon">
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
                  e.target.style.borderColor = loginRole === 'admin' ? '#34d399' : '#818cf8'; 
                  e.target.style.background = loginRole === 'admin' ? 'rgba(52, 211, 153, 0.05)' : 'rgba(129, 140, 248, 0.05)';
                  e.target.style.boxShadow = loginRole === 'admin' ? '0 0 0 4px rgba(52, 211, 153, 0.15), inset 0 2px 10px rgba(0,0,0,0.2)' : '0 0 0 4px rgba(129, 140, 248, 0.15), inset 0 2px 10px rgba(0,0,0,0.2)'; 
                }}
                onBlur={(e) => { 
                  e.target.style.borderColor = 'rgba(255,255,255,0.08)'; 
                  e.target.style.background = 'rgba(0, 0, 0, 0.4)';
                  e.target.style.boxShadow = 'inset 0 2px 10px rgba(0,0,0,0.5)'; 
                }}
              />
            </div>
          </div>

          <motion.button 
            whileHover={{ scale: 1.02, backgroundImage: loginRole === 'admin' ? 'linear-gradient(135deg, #34d399, #10b981)' : 'linear-gradient(135deg, #a855f7, #818cf8)' }}
            whileTap={{ scale: 0.98 }}
            disabled={loading} 
            type="submit" 
            style={{ 
              width: '100%', marginTop: '1.5rem', padding: '1.2rem', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.8rem', 
              background: loginRole === 'admin' ? 'linear-gradient(135deg, #10b981, #34d399)' : 'linear-gradient(135deg, #818cf8, #a855f7)', color: 'white', border: 'none', borderRadius: '16px', 
              fontSize: '1.15rem', fontWeight: '700', cursor: loading ? 'not-allowed' : 'pointer', 
              boxShadow: loginRole === 'admin' ? '0 15px 30px rgba(52, 211, 153, 0.4), inset 0 2px 4px rgba(255,255,255,0.3)' : '0 15px 30px rgba(129, 140, 248, 0.4), inset 0 2px 4px rgba(255,255,255,0.3)', 
              opacity: loading ? 0.8 : 1, transition: 'all 0.3s ease' 
            }}
          >
            {loading ? (
              <><Loader2 size={22} className="animate-spin" /> Authenticating...</>
            ) : (
              <>Sign In to Ecosystem <ArrowRight size={22} /></>
            )}
          </motion.button>
        </form>

        <div style={{ marginTop: '3rem', paddingTop: '1.5rem', borderTop: '1px solid rgba(255,255,255,0.08)', textAlign: 'center' }}>
          <p style={{ color: 'var(--text-muted)', fontSize: '1rem' }}>
            New to Sarvasaar Education Academy Ecosystem? <Link to="/signup" style={{ color: '#818cf8', fontWeight: '700', textDecoration: 'none', display: 'inline-flex', alignItems: 'center', gap: '4px' }}>Create an account <ArrowRight size={16}/></Link>
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

export default Login;
