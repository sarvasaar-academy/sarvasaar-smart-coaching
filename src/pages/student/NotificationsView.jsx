import { useState, useEffect, useCallback } from 'react';
import { db } from '../../firebase';
import { collection, query, where, or, onSnapshot, limit } from 'firebase/firestore';
import { useAuth } from '../../context/AuthContext';
// eslint-disable-next-line no-unused-vars
import { motion } from 'framer-motion';
import { Bell, AlertTriangle, CheckCircle, Info, RefreshCw, BellOff } from 'lucide-react';

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

const NotificationsView = () => {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState(null);
  const { currentUser } = useAuth();

  useEffect(() => {
    if (!currentUser) return;
    setLoading(true);

    // Fetch notifications and filter/sort on client side to avoid index requirements
    const q = query(
      collection(db, "notifications"),
      limit(100)
    );

    const unsubscribe = onSnapshot(q, (querySnapshot) => {
      const fetched = [];
      querySnapshot.forEach((doc) => {
        const data = doc.data();
        const target = data.targetStudent ? data.targetStudent.toLowerCase() : '';
        const userEmail = currentUser.email ? currentUser.email.toLowerCase() : '';
        
        if (target === 'all' || target === userEmail) {
          fetched.push({ id: doc.id, ...data });
        }
      });
      
      // Sort on client side
      fetched.sort((a,b) => new Date(b.createdAt) - new Date(a.createdAt));
      setNotifications(fetched);
      setLoading(false);
      setErrorMsg(null);
    }, (err) => {
      console.error("Notification sync error:", err);
      setErrorMsg("Neural link interrupted: " + err.message);
      setLoading(false);
    });

    return () => unsubscribe();
  }, [currentUser]);

  const getSeverityIcon = (type) => {
      switch(type) {
          case 'Alert': return <AlertTriangle size={28} className="text-yellow-400" />;
          case 'Holiday': return <CheckCircle size={28} className="text-emerald-400" />;
          default: return <Info size={28} className="text-blue-400" />;
      }
  };

  const getSeverityStyle = (type) => {
      switch(type) {
          case 'Alert': return 'border-l-4 border-yellow-500 bg-yellow-500/5 hover:bg-yellow-500/10';
          case 'Holiday': return 'border-l-4 border-emerald-500 bg-emerald-500/5 hover:bg-emerald-500/10';
          default: return 'border-l-4 border-blue-500 bg-blue-500/5 hover:bg-blue-500/10';
      }
  };

  return (
    <div className="glass-panel" style={{ padding: '2.5rem', width: '100%', display: 'flex', flexDirection: 'column', gap: '1.5rem', borderRadius: '1.5rem', position: 'relative', overflow: 'hidden' }}>
      <div style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1rem', gap: '1rem', position: 'relative', zIndex: 10 }}>
        <div>
          <h3 style={{ fontSize: '1.8rem', fontWeight: '800', marginBottom: '0.8rem', display: 'flex', alignItems: 'center', gap: '0.8rem', color: 'white' }}>
            <Bell color="var(--primary)" size={28} />
            Notification Center
            {notifications.length > 0 && (
                <motion.span 
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  style={{ background: 'var(--accent)', color: 'white', fontSize: '0.8rem', fontWeight: 'bold', padding: '0.2rem 0.6rem', borderRadius: '999px', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)' }}
                >
                    {notifications.length}
                </motion.span>
            )}
          </h3>
          <p style={{ color: 'var(--text-muted)', fontSize: '1rem', maxWidth: '32rem', lineHeight: '1.5' }}>Review critical alerts and positive updates dispatched to your terminal.</p>
        </div>
        <div className="glass-panel" style={{ fontSize: '0.8rem', padding: '0.6rem 1rem', display: 'flex', alignItems: 'center', gap: '0.6rem', color: 'var(--success)', fontWeight: '600', border: '1px solid rgba(16, 185, 129, 0.2)' }}>
            <RefreshCw size={14} className="animate-spin" /> Live Connection Active
        </div>
      </div>
      
      <div style={{ position: 'relative', zIndex: 10 }}>
        {errorMsg ? (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} style={{ background: 'rgba(239, 68, 68, 0.1)', border: '1px solid rgba(239, 68, 68, 0.3)', color: '#fca5a5', fontWeight: '500', padding: '1.5rem', borderRadius: '1rem', fontSize: '1rem', boxShadow: 'inset 0 2px 4px rgba(0,0,0,0.1)' }}>
            {errorMsg}
          </motion.div>
        ) : loading ? (
          <div style={{ height: '12rem', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', color: 'var(--text-muted)', gap: '1rem' }}>
            <RefreshCw size={32} className="animate-spin" color="rgba(129, 140, 248, 0.5)" />
            <p style={{ fontSize: '1.1rem', fontWeight: '500' }}>Loading neural network alerts...</p>
          </div>
        ) : notifications.length === 0 ? (
          <motion.div 
            initial={{ opacity: 0, scale: 0.9 }} 
            animate={{ opacity: 1, scale: 1 }} 
            className="h-64 flex flex-col items-center justify-center text-gray-500 bg-surface/50 rounded-2xl border border-surface-border shadow-inner"
          >
            <div className="bg-surface p-4 rounded-full mb-4 shadow-lg">
              <BellOff size={40} className="text-gray-500/50" />
            </div>
            <p className="mt-2 text-text-muted font-medium text-lg">All clear!</p>
            <p className="text-sm text-gray-500">No pending notifications in your feed.</p>
          </motion.div>
        ) : (
          <motion.div 
            className="flex flex-col gap-4"
            variants={containerVariants}
            initial="hidden"
            animate="visible"
          >
            {notifications.map((notif) => (
              <motion.div 
                  key={notif.id} 
                  variants={itemVariants}
                  whileHover={{ x: 4 }}
                  className={`p-5 rounded-xl border border-surface-border transition-all duration-300 shadow-md ${getSeverityStyle(notif.type)}`}
              >
                  <div className="flex gap-4 items-start">
                      <div className="mt-1 drop-shadow-md p-2 bg-background/50 rounded-lg">
                          {getSeverityIcon(notif.type)}
                      </div>
                      <div className="flex-1">
                          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-1 gap-2">
                              <h4 className="font-bold text-lg text-white tracking-wide">{notif.title}</h4>
                              <span className="text-xs text-text-muted font-mono whitespace-nowrap bg-background/50 px-2 py-1 rounded">
                                  {notif.createdAt ? new Date(notif.createdAt).toLocaleDateString() : 'Recent'} &bull; {notif.createdAt ? new Date(notif.createdAt).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'}) : 'Now'}
                              </span>
                          </div>
                          
                          {notif.targetStudent !== 'all' && (
                              <span className="inline-block bg-primary/20 text-indigo-300 border border-primary/30 text-[10px] font-bold px-2 py-0.5 rounded uppercase tracking-wider mb-2 shadow-sm mt-1">
                                  Targeted Alert 🎯
                              </span>
                          )}
                          
                          <p className="text-gray-300 text-sm leading-relaxed whitespace-pre-line mt-2">
                              {notif.message}
                          </p>
                      </div>
                  </div>
              </motion.div>
            ))}
          </motion.div>
        )}
      </div>
    </div>
  );
};

export default NotificationsView;
