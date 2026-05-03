const Footer = () => {
  return (
    <footer className="footer glass-panel" style={{ 
      marginTop: 'auto', 
      borderRadius: 'var(--radius-xl) var(--radius-xl) 0 0', 
      padding: '2.5rem', 
      textAlign: 'center',
      borderBottom: 'none',
      borderLeft: 'none',
      borderRight: 'none',
      background: 'linear-gradient(to top, rgba(15, 15, 20, 0.9), rgba(15, 15, 20, 0.4))'
    }}>
      <p style={{ color: 'var(--text-dim)', fontSize: '0.95rem', fontWeight: '500', letterSpacing: '0.05em' }}>
        &copy; {new Date().getFullYear()} <span className="text-gradient">Sarvasaar Smart Coaching Ecosystem</span>
      </p>
    </footer>
  );
};

export default Footer;
