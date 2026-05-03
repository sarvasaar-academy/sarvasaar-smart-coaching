import { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../context/AuthContext';
import { Menu, X, LayoutDashboard, LogOut, Hexagon } from 'lucide-react';
import './Navbar.css';

const Navbar = () => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const { t, i18n } = useTranslation();
  const { currentUser, userRole, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const toggleLanguage = () => {
    const newLang = i18n.language === 'en' ? 'gu' : 'en';
    i18n.changeLanguage(newLang);
    setIsMobileMenuOpen(false);
  };

  const handleLogout = async () => {
    try {
      await logout();
      navigate('/');
      setIsMobileMenuOpen(false);
    } catch (error) {
      console.error('Failed to log out', error);
    }
  };

  const closeMobileMenu = () => {
    setIsMobileMenuOpen(false);
  };

  const renderNavItems = (isMobile = false) => (
    <>
      <button 
        onClick={toggleLanguage} 
        className="btn btn-secondary" 
        style={{ padding: '0.4rem 0.8rem', fontSize: '0.9rem', width: isMobile ? '100%' : 'auto', borderRadius: 'var(--radius-lg)' }}
      >
        {i18n.language === 'en' ? 'ગુજરાતી' : 'English'}
      </button>
      
      <Link to="/" className={`nav-link ${location.pathname === '/' ? 'active' : ''}`} onClick={closeMobileMenu}>{t('navbar.home')}</Link>
      <Link to="/campus-tour" className={`nav-link ${location.pathname === '/campus-tour' ? 'active' : ''}`} onClick={closeMobileMenu}>3D Tour</Link>
      <Link to="/map" className={`nav-link ${location.pathname === '/map' ? 'active' : ''}`} onClick={closeMobileMenu}>Map</Link>

      {currentUser ? (
        <div style={{ display: 'flex', alignItems: isMobile ? 'flex-start' : 'center', gap: '1rem', flexDirection: isMobile ? 'column' : 'row', width: isMobile ? '100%' : 'auto', marginLeft: isMobile ? '0' : '1rem' }}>
          <Link 
            to={userRole === 'admin' ? '/admin/dashboard' : '/student/dashboard'} 
            className="btn btn-primary" 
            style={{ padding: '0.5rem 1.2rem', borderRadius: 'var(--radius-lg)', display: 'flex', alignItems: 'center', gap: '0.5rem' }}
            onClick={closeMobileMenu}
          >
            <LayoutDashboard size={18} />
            Dashboard
          </Link>
          <button onClick={handleLogout} className="btn btn-icon" title="Logout" style={{ width: isMobile ? '100%' : '40px', height: '40px' }}>
            <LogOut size={18} />
            {isMobile && <span style={{ marginLeft: '0.5rem' }}>Logout</span>}
          </button>
        </div>
      ) : (
        <Link to="/login" className="btn btn-primary premium-border-gradient" onClick={closeMobileMenu} style={{ width: isMobile ? '100%' : 'auto', justifyContent: 'center', marginLeft: isMobile ? '0' : '1rem' }}>
          {t('navbar.login')}
        </Link>
      )}
    </>
  );

  return (
    <nav className={`navbar ${scrolled ? 'glass-panel scrolled' : ''}`} style={{ 
      position: 'sticky', top: 0, zIndex: 100, 
      border: scrolled ? '1px solid var(--surface-border)' : '1px solid transparent',
      background: scrolled ? 'rgba(15, 15, 20, 0.8)' : 'transparent',
      boxShadow: scrolled ? 'var(--shadow-md)' : 'none',
      transition: 'all 0.4s ease',
      borderRadius: scrolled ? '0 0 var(--radius-xl) var(--radius-xl)' : '0'
    }}>
      <div className="container nav-container" style={{ padding: '1rem 2rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Link to="/" className="nav-logo" onClick={closeMobileMenu} style={{ display: 'flex', alignItems: 'center', gap: '0.8rem', fontSize: '1.4rem', fontWeight: '800' }}>
          <div style={{ background: 'linear-gradient(135deg, var(--primary), var(--secondary))', padding: '0.5rem', borderRadius: 'var(--radius-md)', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 4px 15px var(--primary-glow)' }}>
            <Hexagon size={24} color="white" />
          </div>
          <span className="text-gradient">{t('navbar.brand')}</span>
        </Link>
        
        {/* Desktop Links */}
        <div className="nav-links desktop-only" style={{ display: 'flex', alignItems: 'center', gap: '1.5rem' }}>
          {renderNavItems(false)}
        </div>

        {/* Mobile Hamburger Button */}
        <button 
          className="mobile-menu-btn"
          onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          style={{ background: 'transparent', border: 'none', color: 'var(--text)', cursor: 'pointer', display: 'none' }} // Ensure css handles mobile block
        >
          {isMobileMenuOpen ? <X size={28} /> : <Menu size={28} />}
        </button>
      </div>

      {/* Mobile Menu Overlay */}
      <div className={`mobile-menu ${isMobileMenuOpen ? 'open' : ''}`} style={{ 
        position: 'absolute', top: '100%', left: 0, right: 0, 
        background: 'rgba(15, 15, 20, 0.95)', backdropFilter: 'blur(20px)',
        borderBottom: '1px solid var(--surface-border)',
        transform: isMobileMenuOpen ? 'translateY(0)' : 'translateY(-150%)',
        opacity: isMobileMenuOpen ? 1 : 0,
        transition: 'all 0.4s cubic-bezier(0.16, 1, 0.3, 1)',
        pointerEvents: isMobileMenuOpen ? 'all' : 'none',
        zIndex: 99
      }}>
        <div className="mobile-menu-content" style={{ padding: '2rem', display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          {renderNavItems(true)}
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
