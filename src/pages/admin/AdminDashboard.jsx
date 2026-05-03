import { useState, useEffect } from 'react';
import { db } from '../../firebase';
import { collection, onSnapshot } from 'firebase/firestore';
import {
  PieChart, Pie, Cell, Tooltip as ChartTooltip, ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid
} from 'recharts';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  BarChart3, Megaphone, Cloud, CheckSquare, Trophy, Receipt, Users, Database, AlertCircle
} from 'lucide-react';

import ManageMaterials from './ManageMaterials';
import ManagePerformance from './ManagePerformance';
import ManageAttendance from './ManageAttendance';
import ManageFees from './ManageFees';
import ManageNotifications from './ManageNotifications';

import ManageUsers from './ManageUsers';

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.1 }
  }
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { type: "spring", stiffness: 300, damping: 24 } }
};

const contentVariants = {
  hidden: { opacity: 0, y: 15 },
  visible: { opacity: 1, y: 0, transition: { type: "spring", stiffness: 300, damping: 24 } },
  exit: { opacity: 0, y: -15, transition: { duration: 0.15 } }
};

const AdminDashboard = () => {
  const [activeTab, setActiveTab] = useState('overview');

  // Analytics State
  const [stats, setStats] = useState({
      users: 0,
      totalFees: 0,
      collectedFees: 0,
      documents: 0,
      perfLogs: 0
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (activeTab !== 'overview') return;

    setLoading(true);
    
    // Set up real-time listeners for all key metrics
    const unsubUsers = onSnapshot(collection(db, "users"), (snap) => {
      setStats(prev => ({ ...prev, users: snap.size }));
    });

    const unsubFees = onSnapshot(collection(db, "fees"), (snap) => {
      let totalReq = 0;
      let collected = 0;
      snap.forEach(doc => {
        const f = doc.data();
        totalReq += Number(f.amount);
        if (f.status === 'Paid') collected += Number(f.amount);
      });
      setStats(prev => ({ ...prev, totalFees: totalReq, collectedFees: collected }));
    });

    const unsubLockers = onSnapshot(collection(db, "lockers"), (snap) => {
      setStats(prev => ({ ...prev, documents: snap.size }));
    });

    const unsubPerf = onSnapshot(collection(db, "performance"), (snap) => {
      setStats(prev => ({ ...prev, perfLogs: snap.size }));
      setLoading(false); // Only stop loading after at least one vital metric set resolves
    });

    return () => {
      unsubUsers();
      unsubFees();
      unsubLockers();
      unsubPerf();
    };
  }, [activeTab]);

  const COLORS = ['#10b981', '#ef4444'];
  const feeData = [
      { name: 'Collected', value: stats.collectedFees },
      { name: 'Unpaid Dues', value: Math.max(0, stats.totalFees - stats.collectedFees) }
  ];

  const tabs = [
    { id: 'overview', label: 'Dashboard', icon: <BarChart3 size={18} />, theme: 'var(--primary)' },
    { id: 'notifications', label: 'Broadcasts', icon: <Megaphone size={18} />, theme: 'var(--warning)' },
    { id: 'materials', label: 'Cloud Drive', icon: <Cloud size={18} />, theme: 'var(--info)' },
    { id: 'attendance', label: 'Attendance', icon: <CheckSquare size={18} />, theme: 'var(--success)' },
    { id: 'performance', label: 'Exams Hub', icon: <Trophy size={18} />, theme: 'var(--accent)' },
    { id: 'fees', label: 'Financials', icon: <Receipt size={18} />, theme: 'var(--danger)' },
    { id: 'users', label: 'User Directory', icon: <Users size={18} />, theme: 'var(--text-muted)' },
  ];

  return (
    <motion.div 
      className="container flex flex-col-mobile gap-8 animate-fade-up"
      style={{ marginTop: '2rem', flexWrap: 'nowrap', maxWidth: '1600px' }}
      initial="hidden"
      animate="visible"
      variants={containerVariants}
    >
      {/* Sidebar Navigation */}
      <motion.div 
        className="glass-panel"
        style={{ 
          width: '100%', maxWidth: '280px', padding: '1.5rem', display: 'flex', flexDirection: 'column', gap: '0.6rem', 
          height: 'fit-content', position: 'sticky', top: '2rem', flexShrink: 0,
          border: '1px solid rgba(255,255,255,0.08)',
          boxShadow: '0 20px 40px rgba(0,0,0,0.3)',
          background: 'rgba(15, 23, 42, 0.4)'
        }}
        variants={itemVariants}
      >
        <div style={{ padding: '0 0.5rem 1.5rem 0.5rem', borderBottom: '1px solid rgba(255,255,255,0.05)', marginBottom: '1rem' }}>
          <h2 style={{ fontSize: '1.2rem', fontWeight: '900', display: 'flex', alignItems: 'center', gap: '10px', color: 'white', letterSpacing: '0.05em' }}>
            <Database size={22} color="var(--primary)" /> ADMIN CENTRAL
          </h2>
          <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '0.5rem', textTransform: 'uppercase', letterSpacing: '0.1em' }}>School Ecosystem</p>
        </div>
        
        {tabs.map((tab) => (
          <motion.button 
            key={tab.id}
            whileHover={{ x: 8 }}
            whileTap={{ scale: 0.96 }}
            onClick={() => setActiveTab(tab.id)}
            style={{
              textAlign: 'left', padding: '0.9rem 1.2rem', borderRadius: '14px', transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)', 
              display: 'flex', alignItems: 'center', gap: '14px', cursor: 'pointer',
              border: 'none', position: 'relative', overflow: 'hidden',
              background: activeTab === tab.id ? 'rgba(255,255,255,0.06)' : 'transparent',
              color: activeTab === tab.id ? 'white' : 'var(--text-muted)',
              fontWeight: activeTab === tab.id ? '700' : '500',
              fontSize: '0.95rem'
            }}
          >
            {activeTab === tab.id && (
              <motion.div 
                layoutId="activeTabGlow"
                style={{ position: 'absolute', left: 0, top: '20%', bottom: '20%', width: '3px', background: tab.theme, borderRadius: '0 4px 4px 0', boxShadow: `0 0 10px ${tab.theme}` }} 
              />
            )}
            <span style={{ 
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              color: activeTab === tab.id ? tab.theme : 'var(--text-muted)',
              transition: 'color 0.3s ease'
            }}>
               {tab.icon}
            </span> 
            {tab.label}
          </motion.button>
        ))}
      </motion.div>

      {/* Main Content Area */}
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '1.5rem', minWidth: '300px' }}>
        <AnimatePresence mode="wait">
          <motion.div
            key={activeTab}
            variants={contentVariants}
            initial="hidden"
            animate="visible"
            exit="exit"
          >
            {activeTab === 'overview' && (
              <motion.div variants={containerVariants} initial="hidden" animate="visible" className="flex flex-col gap-8">
                <motion.div variants={itemVariants} className="glass-panel" style={{ padding: '2.5rem', borderLeft: '5px solid var(--primary)', background: 'rgba(30, 41, 59, 0.4)' }}>
                  <h1 style={{ fontSize: '2.2rem', fontWeight: '900', marginBottom: '0.5rem', color: 'white', letterSpacing: '-0.03em' }}>Administrative Command Center</h1>
                  <p style={{ color: 'var(--text-muted)', fontSize: '1rem', fontWeight: 500 }}>Global monitoring and lifecycle management for the Sarvasaar Smart Coaching Ecosystem.</p>
                </motion.div>
                
                {loading ? (
                    <div style={{ padding: '6rem', textAlign: 'center', color: 'var(--primary)', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '1.5rem' }}>
                      <div className="loading-spinner"></div>
                      <p style={{ fontWeight: '700', textTransform: 'uppercase', letterSpacing: '0.1em', fontSize: '0.9rem' }}>Synchronizing Enterprise Data...</p>
                    </div>
                ) : (
                  <div className="flex flex-col gap-8">
                     {/* Key Performance Indicators */}
                     <div className="dashboard-grid">
                        <motion.div variants={itemVariants} className="stat-card glass-panel" style={{ borderTop: '4px solid var(--primary)' }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                              <span style={{ fontSize: '0.75rem', fontWeight: '800', textTransform: 'uppercase', color: 'var(--text-muted)', letterSpacing: '0.1em' }}>Member Registry</span>
                              <Users size={16} color="var(--primary)" />
                            </div>
                            <span className="text-gradient-primary" style={{ marginTop: '0.8rem', fontSize: '3.2rem', fontWeight: 900 }}>{stats.users}</span>
                            <span style={{ fontSize: '0.75rem', color: 'var(--success)', fontWeight: 600 }}>Active Nodes</span>
                        </motion.div>
                        
                        <motion.div variants={itemVariants} className="stat-card glass-panel" style={{ borderTop: '4px solid var(--success)' }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                               <span style={{ fontSize: '0.75rem', fontWeight: '800', textTransform: 'uppercase', color: 'var(--text-muted)', letterSpacing: '0.1em' }}>Revenue Ingress</span>
                               <Receipt size={16} color="var(--success)" />
                            </div>
                            <span className="text-gradient-secondary" style={{ marginTop: '0.8rem', fontSize: '3.2rem', fontWeight: 900 }}>₹{stats.collectedFees}</span>
                            <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontWeight: 500 }}>Gross Collected</span>
                        </motion.div>

                        <motion.div variants={itemVariants} className="stat-card glass-panel" style={{ borderTop: '4px solid var(--danger)' }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                               <span style={{ fontSize: '0.75rem', fontWeight: '800', textTransform: 'uppercase', color: 'var(--text-muted)', letterSpacing: '0.1em' }}>Account Receivables</span>
                               <AlertCircle size={16} color="var(--danger)" />
                            </div>
                            <span style={{ marginTop: '0.8rem', fontSize: '3.2rem', fontWeight: 900, color: 'var(--danger)' }}>₹{Math.max(0, stats.totalFees - stats.collectedFees)}</span>
                            <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontWeight: 500 }}>Unpaid Dues</span>
                        </motion.div>

                        <motion.div variants={itemVariants} className="stat-card glass-panel" style={{ borderTop: '4px solid var(--info)' }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                               <span style={{ fontSize: '0.75rem', fontWeight: '800', textTransform: 'uppercase', color: 'var(--text-muted)', letterSpacing: '0.1em' }}>Digital Assets</span>
                               <Cloud size={16} color="var(--info)" />
                            </div>
                            <span style={{ marginTop: '0.8rem', fontSize: '3.2rem', fontWeight: 900, color: '#38bdf8' }}>{stats.documents}</span>
                            <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontWeight: 500 }}>Cloud Units</span>
                        </motion.div>
                     </div>

                     {/* Intelligence Containers */}
                     <div className="dashboard-grid">
                        <motion.div variants={itemVariants} className="glass-panel" style={{ padding: '2rem' }}>
                            <h4 style={{ fontWeight: '800', color: 'white', marginBottom: '1.5rem', textTransform: 'uppercase', fontSize: '0.85rem', letterSpacing: '0.1em', display: 'flex', alignItems: 'center', gap: '10px' }}>
                              <Database size={16} color="var(--success)"/> Financial Distribution
                            </h4>
                            {stats.totalFees === 0 ? (
                                <div style={{ height: '280px', display: 'flex', alignItems: 'center', justifyContent: 'center', border: '1px dashed rgba(255,255,255,0.1)', borderRadius: '16px', color: 'var(--text-muted)' }}>No financial data active</div>
                            ) : (
                                <div style={{width:'100%', height:'280px'}}>
                                    <ResponsiveContainer>
                                        <PieChart>
                                            <Pie
                                              data={feeData} innerRadius={80} outerRadius={110}
                                              paddingAngle={8} dataKey="value" stroke="none" label strokeWidth={0}
                                            >
                                              {feeData.map((entry, index) => (
                                                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                              ))}
                                            </Pie>
                                            <ChartTooltip 
                                              contentStyle={{backgroundColor:'rgba(15,23,42,0.95)', backdropFilter:'blur(12px)', border:'1px solid rgba(255,255,255,0.1)', borderRadius:'14px', boxShadow: '0 10px 20px rgba(0,0,0,0.3)'}} 
                                              itemStyle={{color:'white', fontWeight: 700}} 
                                            />
                                        </PieChart>
                                    </ResponsiveContainer>
                                    <div style={{ display: 'flex', justifyContent: 'center', gap: '1.5rem', marginTop: '1rem' }}>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', fontSize: '0.8rem', fontWeight: '700', color: 'var(--text-muted)' }}><span style={{ width: '10px', height: '10px', borderRadius: '3px', background: 'var(--success)', boxShadow: '0 0 8px var(--success)' }}></span> PAID</div>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', fontSize: '0.8rem', fontWeight: '700', color: 'var(--text-muted)' }}><span style={{ width: '10px', height: '10px', borderRadius: '3px', background: 'var(--danger)', boxShadow: '0 0 8px var(--danger)' }}></span> UNPAID</div>
                                    </div>
                                </div>
                            )}
                        </motion.div>

                        <motion.div variants={itemVariants} className="glass-panel" style={{ padding: '2rem' }}>
                            <h4 style={{ fontWeight: '800', color: 'white', marginBottom: '1.5rem', textTransform: 'uppercase', fontSize: '0.85rem', letterSpacing: '0.1em', display: 'flex', alignItems: 'center', gap: '10px' }}>
                              <BarChart3 size={16} color="var(--primary)"/> Infrastructure Growth
                            </h4>
                            <div style={{width:'100%', height:'280px'}}>
                                <ResponsiveContainer>
                                    <BarChart data={[
                                        { name: 'Accounts', count: stats.users },
                                        { name: 'Results', count: stats.perfLogs },
                                        { name: 'Registry', count: stats.documents }
                                    ]}>
                                        <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" vertical={false} />
                                        <XAxis dataKey="name" stroke="var(--text-muted)" fontSize={12} axisLine={false} tickLine={false} />
                                        <YAxis stroke="var(--text-muted)" fontSize={12} axisLine={false} tickLine={false} />
                                        <ChartTooltip contentStyle={{backgroundColor:'rgba(15,23,42,0.95)', backdropFilter:'blur(12px)', border:'1px solid rgba(255,255,255,0.1)', borderRadius:'14px'}} />
                                        <Bar dataKey="count" fill="var(--primary)" radius={[6, 6, 0, 0]} barSize={40} />
                                    </BarChart>
                                </ResponsiveContainer>
                            </div>
                        </motion.div>
                     </div>
                  </div>
                )}
              </motion.div>
            )}

            {activeTab === 'notifications' && <ManageNotifications />}
            {activeTab === 'materials' && <ManageMaterials />}
            {activeTab === 'attendance' && <ManageAttendance />}
            {activeTab === 'performance' && <ManagePerformance />}
            {activeTab === 'fees' && <ManageFees />}
            
            {activeTab === 'users' && <ManageUsers />}
          </motion.div>
        </AnimatePresence>
      </div>
      <style>{`
        @keyframes spin { 100% { transform: rotate(360deg); } }
      `}</style>
    </motion.div>
  );
};

export default AdminDashboard;
