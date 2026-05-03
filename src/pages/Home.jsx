import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { motion } from 'framer-motion';
import { Shield, Globe, Map as MapIcon, ArrowRight, Sparkles, Activity, Users, Star } from 'lucide-react';

const Home = () => {
  const { t } = useTranslation();

  const features = [
    { icon: <Shield size={32} className="text-primary" />, title: t('home.features.locker_title'), desc: t('home.features.locker_desc') },
    { icon: <Globe size={32} className="text-secondary" />, title: t('home.features.tour_title'), desc: t('home.features.tour_desc') },
    { icon: <MapIcon size={32} className="text-primary" />, title: t('home.features.map_title'), desc: t('home.features.map_desc') }
  ];

  const stats = [
    { icon: <Users size={24} />, value: "50k+", label: "Active Students" },
    { icon: <Activity size={24} />, value: "99.9%", label: "Uptime" },
    { icon: <Star size={24} />, value: "4.9/5", label: "User Rating" }
  ];

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: { 
      opacity: 1,
      transition: { staggerChildren: 0.15, delayChildren: 0.2 }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 30 },
    visible: { 
      opacity: 1, 
      y: 0,
      transition: { type: "spring", stiffness: 100, damping: 12 }
    }
  };

  return (
    <div className="home-container" style={{ marginTop: '2rem', paddingBottom: '6rem' }}>
      
      {/* Hero Section */}
      <div className="container" style={{ marginBottom: '8rem' }}>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '4rem', alignItems: 'center' }} className="grid-2-cols flex-col-mobile">
          
          <motion.div 
            initial={{ opacity: 0, x: -40 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
            style={{ position: 'relative', textAlign: 'left' }}
          >
            <div style={{ position: 'absolute', top: '-20%', left: '-10%', width: '300px', height: '300px', background: 'radial-gradient(circle, var(--primary-glow-subtle) 0%, transparent 70%)', zIndex: -1 }}></div>

            <motion.div className="badge badge-primary" style={{ marginBottom: '2rem', background: 'rgba(129, 140, 248, 0.1)', padding: '0.5rem 1rem' }}>
              <Sparkles size={16} style={{ marginRight: '8px', display: 'inline-block' }} />
              Welcome to the Future of Education
            </motion.div>

            <h1 className="hero-title" style={{ marginLeft: 0, textAlign: 'left', fontSize: '4.5rem' }}>
              {t('home.title').split(' ').map((word, i) => (
                <span key={i} className={i > 2 ? 'text-gradient-primary' : 'text-gradient'} style={{ display: 'inline-block', marginRight: '10px' }}>
                  {word}
                </span>
              ))}
            </h1>

            <p className="hero-subtitle" style={{ marginLeft: 0, textAlign: 'left', fontSize: '1.25rem' }}>
              {t('home.subtitle')}
            </p>

            <div className="hero-actions" style={{ justifyContent: 'flex-start', marginTop: '2rem' }}>
              <Link to="/login" className="btn btn-primary" style={{ padding: '1rem 2.5rem', fontSize: '1.1rem' }}>
                {t('home.getStarted')}
                <ArrowRight size={20} />
              </Link>
              <Link to="/campus-tour" className="btn btn-secondary premium-border-gradient" style={{ padding: '1rem 2.5rem', fontSize: '1.1rem' }}>
                Explore 3D Campus
              </Link>
            </div>
            
            <div style={{ marginTop: '3rem', display: 'flex', gap: '2rem', flexWrap: 'wrap' }}>
              {stats.map((stat, idx) => (
                <div key={idx} style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                  <div style={{ color: 'var(--primary)', background: 'rgba(129, 140, 248, 0.1)', padding: '0.8rem', borderRadius: '50%' }}>
                    {stat.icon}
                  </div>
                  <div>
                    <div style={{ fontSize: '1.5rem', fontWeight: '800', color: 'var(--text)' }}>{stat.value}</div>
                    <div style={{ fontSize: '0.9rem', color: 'var(--text-muted)' }}>{stat.label}</div>
                  </div>
                </div>
              ))}
            </div>

          </motion.div>

          <motion.div
            initial={{ opacity: 0, scale: 0.9, x: 40 }}
            animate={{ opacity: 1, scale: 1, x: 0 }}
            transition={{ duration: 1, ease: [0.16, 1, 0.3, 1], delay: 0.2 }}
            className="animate-float-dynamic"
            style={{ position: 'relative', width: '100%', aspectRatio: '4/3', borderRadius: 'var(--radius-xl)', overflow: 'hidden', boxShadow: 'var(--shadow-lg), 0 0 40px var(--primary-glow-subtle)' }}
          >
            <div className="glass-panel" style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'linear-gradient(145deg, rgba(129, 140, 248, 0.2), rgba(52, 211, 153, 0.1))' }}>
              <div style={{ position: 'absolute', inset: 0, background: 'radial-gradient(circle at 50% 50%, rgba(129, 140, 248, 0.4) 0%, transparent 60%)', animation: 'pulseGlow 6s infinite alternate' }} />
              {/* Note: In a real app we would copy the generated image to public/ here, but we will use the abstract shapes for now to guarantee it loads! */}
              <div style={{ position: 'absolute', zIndex: 3, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '1rem' }} className="fallback-3d-text">
                 <Globe size={100} className="text-secondary animate-float" style={{ opacity: 0.9 }} />
                 <div style={{ fontSize: '1.5rem', fontWeight: 800, color: 'var(--text-primary)' }}>Interactive Ecosystem</div>
              </div>
            </div>
          </motion.div>

        </div>
      </div>

      {/* Features Section */}
      <div className="container" style={{ textAlign: 'center' }}>
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          style={{ marginBottom: '4rem' }}
        >
          <div className="badge badge-secondary" style={{ marginBottom: '1rem', background: 'rgba(52, 211, 153, 0.1)', color: 'var(--secondary)' }}>Core Ecosystem</div>
          <h2 style={{ fontSize: '3rem', marginBottom: '1rem' }}>Next-Generation <span className="text-gradient">Capabilities</span></h2>
          <p style={{ color: 'var(--text-muted)', fontSize: '1.2rem', maxWidth: '600px', margin: '0 auto' }}>Experience education elevated through seamlessly integrated smart tools and immersive environments.</p>
        </motion.div>

        <motion.div 
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-100px" }}
          className="feature-grid" 
          style={{ 
            display: 'grid', 
            gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', 
            gap: '2rem',
            maxWidth: '1200px',
            margin: '0 auto'
          }}
        >
          {features.map((feature, idx) => (
            <motion.div key={idx} variants={itemVariants} className="glass-panel glass-panel-hover premium-border-gradient" style={{ padding: '2.5rem', textAlign: 'left', position: 'relative' }}>
              <div style={{ 
                marginBottom: '1.5rem', 
                width: '64px', height: '64px', 
                background: 'rgba(255,255,255,0.03)', 
                borderRadius: 'var(--radius-md)', 
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                border: '1px solid rgba(255,255,255,0.08)',
                boxShadow: 'inset 0 2px 10px rgba(0,0,0,0.2)'
              }}>
                {feature.icon}
              </div>
              <h3 style={{ fontSize: '1.5rem', marginBottom: '1rem', fontWeight: '700' }}>{feature.title}</h3>
              <p style={{ color: 'var(--text-muted)', lineHeight: '1.6' }}>{feature.desc}</p>
            </motion.div>
          ))}
        </motion.div>
      </div>
      
    </div>
  );
};

export default Home;
