import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Bell, ShieldCheck, BookOpen, CheckSquare, TrendingUp, CreditCard, Compass } from 'lucide-react';
import DigitalLocker from '../../components/DigitalLocker';
import MaterialView from './MaterialView';
import PerformanceView from './PerformanceView';
import AttendanceView from './AttendanceView';
import FeeTrackingView from './FeeTrackingView';
import NotificationsView from './NotificationsView';

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.1 }
  }
};

const itemVariants = {
  hidden: { opacity: 0, x: -20 },
  visible: { opacity: 1, x: 0, transition: { type: "spring", stiffness: 300, damping: 24 } }
};

const contentVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { type: "spring", stiffness: 300, damping: 24 } },
  exit: { opacity: 0, y: -20, transition: { duration: 0.2 } }
};

const StudentDashboard = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  // Set default tab to notifications so they see alerts immediately
  const [activeTab, setActiveTab] = useState('notifications');

  const tabs = [
    { id: 'notifications', label: 'Notifications', icon: <Bell size={18} />, colorColor: 'var(--warning)' },
    { id: 'locker', label: 'Student Resource Vault', icon: <ShieldCheck size={18} />, colorColor: 'var(--primary)' },
    { id: 'materials', label: 'Study Materials', icon: <BookOpen size={18} />, colorColor: 'var(--primary)' },
    { id: 'attendance', label: 'My Attendance', icon: <CheckSquare size={18} />, colorColor: 'var(--success)' },
    { id: 'performance', label: 'My Performance', icon: <TrendingUp size={18} />, colorColor: 'var(--info)' },
    { id: 'fees', label: 'Fees & Dues', icon: <CreditCard size={18} />, colorColor: 'var(--accent)' },
  ];

  return (
    <motion.div 
      style={{ display: 'flex', flexDirection: 'row', gap: '2rem', padding: '1.5rem', width: '100%', maxWidth: '1600px', margin: '0 auto', flexWrap: 'wrap' }}
      className="animate-fade-up"
      initial="hidden"
      animate="visible"
      variants={containerVariants}
    >
      {/* Sidebar Navigation */}
      <motion.div 
        className="glass-panel premium-border-gradient"
        style={{ width: '100%', maxWidth: '280px', flex: '1 1 250px', padding: '1.8rem', display: 'flex', flexDirection: 'column', gap: '1rem', height: 'fit-content', position: 'relative', borderRadius: '1.5rem' }}
        variants={itemVariants}
      >
        <div style={{ position: 'absolute', top: 0, right: 0, width: '150px', height: '150px', background: 'radial-gradient(circle, rgba(129, 140, 248, 0.15) 0%, transparent 70%)', zIndex: -1, pointerEvents: 'none', borderTopRightRadius: '1.5rem' }}></div>

        <h2 style={{ fontSize: '1.3rem', fontWeight: '800', marginBottom: '1.5rem', marginLeft: '0.5rem', color: 'var(--primary)', letterSpacing: '0.02em', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          {t('dashboard.student.title')}
        </h2>
        
        {tabs.map((tab) => {
          const isActive = activeTab === tab.id;
          return (
            <motion.button 
              key={tab.id}
              whileHover={{ scale: 1.02, x: 5 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => setActiveTab(tab.id)}
              style={{
                textAlign: 'left', padding: '1rem 1.2rem', borderRadius: '1rem', transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)', display: 'flex', alignItems: 'center', gap: '14px', cursor: 'pointer', border: 'none',
                background: isActive ? 'linear-gradient(135deg, rgba(129, 140, 248, 0.15), rgba(168, 85, 247, 0.05))' : 'transparent',
                color: isActive ? 'white' : 'var(--text-muted)',
                fontWeight: isActive ? '700' : '500',
                boxShadow: isActive ? 'inset 0 1px 1px rgba(255,255,255,0.1), 0 4px 10px rgba(0,0,0,0.1)' : 'none',
                borderTop: isActive ? '1px solid rgba(255,255,255,0.1)' : '1px solid transparent',
              }}
            >
              <div style={{ 
                background: isActive ? tab.colorColor : 'rgba(255,255,255,0.05)', 
                color: isActive ? 'black' : tab.colorColor,
                padding: '0.4rem', borderRadius: '0.5rem', display: 'flex', alignItems: 'center', justifyContent: 'center',
                boxShadow: isActive ? `0 0 15px ${tab.colorColor}80` : 'none', transition: 'all 0.3s'
              }}>
                {tab.icon}
              </div>
              <span style={{ fontSize: '1.05rem' }}>{tab.label}</span>
            </motion.button>
          );
        })}

        <hr style={{ border: 'none', borderTop: '1px solid rgba(255,255,255,0.05)', margin: '1rem 0' }} />

        <motion.button 
          whileHover={{ scale: 1.03, boxShadow: '0 0 20px rgba(129, 140, 248, 0.4)' }}
          whileTap={{ scale: 0.98 }}
          onClick={() => navigate('/campus-tour')}
          style={{ padding: '1rem', borderRadius: '1rem', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '10px', cursor: 'pointer', color: 'white', fontWeight: '700', border: 'none', background: 'linear-gradient(135deg, var(--primary), var(--accent))' }}
        >
          <Compass size={20} /> Enter 3D Tour
        </motion.button>
      </motion.div>

      {/* Main Content Area */}
      <div style={{ flex: '1 1 600px', display: 'flex', flexDirection: 'column', gap: '2rem', minWidth: '0' }}>
        {/* Responsive Header Banner */}
        <motion.div 
          className="glass-panel"
          style={{ padding: '2.5rem', borderRadius: '1.5rem', position: 'relative', overflow: 'hidden', background: 'linear-gradient(135deg, rgba(129, 140, 248, 0.1), transparent)', borderLeft: '4px solid var(--primary)', boxShadow: '0 10px 30px rgba(0,0,0,0.3)' }}
          variants={itemVariants}
        >
          <div style={{ position: 'absolute', top: '-100px', right: '-100px', width: '300px', height: '300px', background: 'radial-gradient(circle, rgba(129, 140, 248, 0.2) 0%, transparent 60%)', zIndex: -1, pointerEvents: 'none' }}></div>
          <h2 style={{ fontSize: '2.2rem', fontWeight: '800', marginBottom: '0.8rem', color: 'white', letterSpacing: '-0.02em' }}>{t('dashboard.student.welcome')}</h2>
          <p style={{ color: 'var(--text-muted)', fontSize: '1.1rem', maxWidth: '600px', lineHeight: '1.6' }}>Your student resource vault, attendance, and tour functions will appear here. Navigate using the sidebar.</p>
        </motion.div>

        <AnimatePresence mode="wait">
          <motion.div
            key={activeTab}
            variants={contentVariants}
            initial="hidden"
            animate="visible"
            exit="exit"
            style={{ flex: 1, width: '100%' }}
          >
            {activeTab === 'notifications' && <NotificationsView />}
            {activeTab === 'locker' && <DigitalLocker />}
            {activeTab === 'materials' && <MaterialView />}
            {activeTab === 'attendance' && <AttendanceView />}
            {activeTab === 'performance' && <PerformanceView />}
            {activeTab === 'fees' && <FeeTrackingView />}
          </motion.div>
        </AnimatePresence>
      </div>
    </motion.div>
  );
};

export default StudentDashboard;
