import { useState, useEffect } from 'react';
import { db } from '../../firebase';
import { collection, addDoc, getDocs, deleteDoc, doc, query, orderBy, limit, onSnapshot } from 'firebase/firestore';
import { Megaphone, Send, Trash2, Bell, AlertTriangle, Info, Calendar, Sparkles, Clock } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import toast from 'react-hot-toast';

const ManageNotifications = () => {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  
  // Form State
  const [title, setTitle] = useState('');
  const [message, setMessage] = useState('');
  const [type, setType] = useState('News'); // News, Alert, Holiday
  const [target, setTarget] = useState('All Students');

  useEffect(() => {
    const q = query(collection(db, "notifications"), orderBy("createdAt", "desc"), limit(30));
    const unsubscribe = onSnapshot(q, (querySnapshot) => {
      const fetched = [];
      querySnapshot.forEach((doc) => {
        fetched.push({ id: doc.id, ...doc.data() });
      });
      setNotifications(fetched);
      setLoading(false);
    }, (err) => {
      console.error(err);
      toast.error("Real-time sync failed");
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!title || !message) {
      toast.error("Announcement content is empty");
      return;
    }

    setUploading(true);
    try {
      const newNotification = {
        title,
        message,
        type,
        targetStudent: target === 'All Students' ? 'all' : target,
        createdAt: new Date().toISOString()
      };

      await addDoc(collection(db, "notifications"), newNotification);
      
      toast.success("Broadcast deployed successfully!");
      setTitle('');
      setMessage('');
    } catch (err) {
      console.error(err);
      toast.error("Broadcast failed to deploy");
    } finally {
      setUploading(false);
    }
  };

  const handleDelete = async (id) => {
    if(!window.confirm("Retract this broadcast forever?")) return;
    try {
      await deleteDoc(doc(db, "notifications", id));
      setNotifications(notifications.filter(n => n.id !== id));
      toast.success("Broadcast retracted");
    } catch(err) {
      toast.error("Operation failed");
    }
  };

  const getTypeIcon = (notifType) => {
    switch(notifType) {
      case 'Alert': return <AlertTriangle size={18} />;
      case 'Holiday': return <Calendar size={18} />;
      default: return <Info size={18} />;
    }
  };

  const getTypeColor = (notifType) => {
    switch(notifType) {
      case 'Alert': return 'var(--danger)';
      case 'Holiday': return 'var(--warning)';
      default: return 'var(--primary)';
    }
  };

  return (
    <motion.div 
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      className="flex flex-col gap-8"
    >
      <div className="glass-panel" style={{ padding: '2.5rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '2rem', borderBottom: '1px solid rgba(255,255,255,0.05)', paddingBottom: '1.5rem' }}>
          <div style={{ padding: '0.8rem', background: 'rgba(245, 158, 11, 0.15)', borderRadius: '16px', color: 'var(--warning)', boxShadow: '0 0 20px rgba(245, 158, 11, 0.2)' }}>
            <Megaphone size={28} />
          </div>
          <div>
            <h3 style={{ fontSize: '1.6rem', fontWeight: 900, margin: 0, letterSpacing: '-0.02em' }}>Broadcast Center</h3>
            <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', margin: 0, fontWeight: 500 }}>Deploy real-time announcements to the student dashboard</p>
          </div>
        </div>

        <form onSubmit={handleSubmit} style={{ display: 'grid', gridTemplateColumns: 'repeat(12, 1fr)', gap: '1.5rem' }}>
          <div className="input-group" style={{ gridColumn: 'span 8', marginBottom: 0 }}>
            <label className="input-label">Announcement Title</label>
            <div style={{ position: 'relative' }}>
               <Sparkles size={16} style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--warning)' }} />
               <input 
                type="text" className="input-field" style={{ paddingLeft: '2.8rem' }}
                placeholder="e.g. Annual Sport Meet 2026" 
                value={title} onChange={(e) => setTitle(e.target.value)} required 
              />
            </div>
          </div>

          <div className="input-group" style={{ gridColumn: 'span 4', marginBottom: 0 }}>
            <label className="input-label">Category</label>
            <select className="input-field" value={type} onChange={e => setType(e.target.value)}>
              <option value="News">General News</option>
              <option value="Alert">Urgent Alert</option>
              <option value="Holiday">Holiday Notice</option>
            </select>
          </div>

          <div className="input-group" style={{ gridColumn: 'span 12', marginBottom: 0 }}>
            <label className="input-label">Detailed Message</label>
            <textarea 
              className="input-field" 
              style={{ minHeight: '120px', resize: 'vertical' }}
              placeholder="Provide complete details about the announcement..."
              value={message} onChange={(e) => setMessage(e.target.value)} required
            />
          </div>

          <div className="md:col-span-12" style={{ gridColumn: 'span 12' }}>
            <button 
              type="submit" 
              className="btn btn-primary w-full" 
              style={{ height: '3.5rem', background: 'linear-gradient(135deg, var(--warning), #ea580c)' }}
              disabled={uploading}
            >
              <Send size={18} /> {uploading ? 'Transmitting Data...' : 'Deploy Global Announcement'}
            </button>
          </div>
        </form>
      </div>

      <div className="glass-panel" style={{ padding: '0', overflow: 'hidden' }}>
        <div style={{ padding: '1.5rem 2.5rem', borderBottom: '1px solid rgba(255,255,255,0.05)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: 'rgba(255,255,255,0.02)' }}>
          <h4 style={{ margin: 0, fontSize: '1.15rem', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '10px' }}>
             <Bell size={18} color="var(--primary)" /> Transmission History
          </h4>
          <span className="badge badge-primary" style={{ padding: '0.5rem 1rem' }}>{notifications.length} Active Feeds</span>
        </div>

        <div style={{ padding: '1.5rem' }}>
          {loading ? (
             <div style={{ padding: '5rem', textAlign: 'center', color: 'var(--text-muted)' }}>
               <div style={{ width: '40px', height: '40px', border: '3px solid rgba(245, 158, 11, 0.1)', borderTopColor: 'var(--warning)', borderRadius: '50%', animation: 'spin 1s linear infinite', margin: '0 auto 1.5rem auto' }}></div>
               <p style={{ fontWeight: 600, letterSpacing: '0.05em' }}>Accessing Broadcast Logs...</p>
             </div>
          ) : notifications.length === 0 ? (
            <div style={{ padding: '5rem', textAlign: 'center', color: 'var(--text-muted)' }}>
              <Megaphone size={50} style={{ margin: '0 auto 1.5rem auto', opacity: 0.2 }} />
              <p>No active announcements in the broadcast queue.</p>
            </div>
          ) : (
            <div className="glass-table-container">
              <table className="glass-table">
                <thead>
                  <tr>
                    <th style={{ width: '25%' }}>TRANSMISSION</th>
                    <th style={{ width: '50%' }}>CONTENT PREVIEW</th>
                    <th style={{ width: '15%' }}>TIMESTAMP</th>
                    <th style={{ width: '10%', textAlign: 'right' }}>OPS</th>
                  </tr>
                </thead>
                <tbody>
                  <AnimatePresence>
                    {notifications.map(notif => (
                      <motion.tr 
                        key={notif.id}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.98 }}
                      >
                        <td>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                             <div style={{ padding: '0.6rem', background: `${getTypeColor(notif.type)}20`, borderRadius: '12px', color: getTypeColor(notif.type) }}>
                               {getTypeIcon(notif.type)}
                             </div>
                             <div>
                                <div style={{ fontWeight: 700, color: 'white', fontSize: '0.95rem' }}>{notif.type}</div>
                                <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', textTransform: 'uppercase' }}>Target: Students</div>
                             </div>
                          </div>
                        </td>
                        <td>
                          <div style={{ maxWidth: '400px' }}>
                            <div style={{ fontWeight: 600, color: 'white', marginBottom: '4px' }} className="truncate">{notif.title}</div>
                            <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)', lineHeight: '1.4' }} className="truncate">{notif.message}</div>
                          </div>
                        </td>
                        <td style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>
                           <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                             <Clock size={12} /> {new Date(notif.createdAt).toLocaleDateString()}
                           </div>
                        </td>
                        <td style={{ textAlign: 'right' }}>
                          <button 
                            onClick={() => handleDelete(notif.id)}
                            className="btn-icon"
                            style={{ background: 'rgba(239, 68, 68, 0.1)', color: 'var(--danger)', border: 'none' }}
                            title="Retract Broadcast"
                          >
                            <Trash2 size={18} />
                          </button>
                        </td>
                      </motion.tr>
                    ))}
                  </AnimatePresence>
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
      <style>{`@keyframes spin { 100% { transform: rotate(360deg); } }`}</style>
    </motion.div>
  );
};

export default ManageNotifications;
