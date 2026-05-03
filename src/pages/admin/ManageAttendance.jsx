import { useState, useEffect } from 'react';
import { db } from '../../firebase';
import { collection, addDoc, getDocs, deleteDoc, doc, query, orderBy, limit } from 'firebase/firestore';
import { UserCheck, Calendar, Trash2, Clock, Search, AlertCircle, CheckCircle2 } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import toast from 'react-hot-toast';

const ManageAttendance = () => {
  const [records, setRecords] = useState([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  
  // Form State
  const [studentId, setStudentId] = useState('');
  const [status, setStatus] = useState('Present');
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]); 

  const fetchRecords = async () => {
    setLoading(true);
    try {
      const q = query(collection(db, "attendance"), orderBy("date", "desc"), limit(50));
      const querySnapshot = await getDocs(q);
      const fetched = [];
      querySnapshot.forEach((doc) => {
        fetched.push({ id: doc.id, ...doc.data() });
      });
      setRecords(fetched);
    } catch (err) {
      console.error(err);
      toast.error("Failed to load attendance logs");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRecords();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!studentId || !date) {
      toast.error("Required fields missing");
      return;
    }

    setUploading(true);
    try {
      const newRecord = {
        studentId: studentId.toLowerCase().trim(),
        status,
        date,
        createdAt: new Date().toISOString()
      };

      const docRef = await addDoc(collection(db, "attendance"), newRecord);
      setRecords([{ id: docRef.id, ...newRecord }, ...records]);
      
      toast.success(`Success: ${studentId} marked ${status}`);
      setStudentId('');
    } catch (err) {
      console.error(err);
      toast.error("Save failed: " + err.message);
    } finally {
      setUploading(false);
    }
  };

  const handleDelete = async (id) => {
    if(!window.confirm("Permanently delete this attendance record?")) return;
    try {
      await deleteDoc(doc(db, "attendance", id));
      setRecords(records.filter(r => r.id !== id));
      toast.success("Record purged");
    } catch(err) {
      toast.error("Delete failed");
    }
  };

  return (
    <motion.div 
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      className="flex flex-col gap-6"
    >
      <div className="glass-panel" style={{ padding: '2rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '1.5rem', borderBottom: '1px solid rgba(255,255,255,0.05)', paddingBottom: '1rem' }}>
          <div style={{ padding: '0.8rem', background: 'rgba(16, 185, 129, 0.15)', borderRadius: '14px', color: 'var(--success)' }}>
            <UserCheck size={26} />
          </div>
          <div>
            <h3 style={{ fontSize: '1.4rem', fontWeight: 800, margin: 0 }}>Attendance Management</h3>
            <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', margin: 0 }}>Register and track daily student presence</p>
          </div>
        </div>

        <form onSubmit={handleSubmit} style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '1.5rem', alignItems: 'flex-end' }}>
          <div className="input-group" style={{ marginBottom: 0 }}>
            <label className="input-label">Student ID / Email</label>
            <div style={{ position: 'relative' }}>
               <Search size={16} style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
               <input 
                type="text" className="input-field" style={{ paddingLeft: '2.8rem' }}
                placeholder="search-student@edu.com" 
                value={studentId} onChange={(e) => setStudentId(e.target.value)} required 
              />
            </div>
          </div>

          <div className="input-group" style={{ marginBottom: 0 }}>
            <label className="input-label">Attendance Date</label>
            <input 
              type="date" className="input-field" 
              value={date} onChange={(e) => setDate(e.target.value)} required 
            />
          </div>

          <div className="input-group" style={{ marginBottom: 0 }}>
            <label className="input-label">Presence Status</label>
            <select 
              className="input-field" 
              style={{ color: status === 'Present' ? 'var(--success)' : 'var(--danger)', fontWeight: 700 }}
              value={status} onChange={e => setStatus(e.target.value)}
            >
              <option value="Present">PRESENT</option>
              <option value="Absent">ABSENT</option>
            </select>
          </div>

          <button 
            type="submit" 
            className="btn btn-primary" 
            style={{ height: '3.2rem', background: status === 'Present' ? '' : 'linear-gradient(135deg, var(--danger), #f43f5e)' }}
            disabled={uploading}
          >
            {uploading ? 'Registering...' : `Mark ${status.toUpperCase()}`}
          </button>
        </form>
      </div>

      <div className="glass-panel" style={{ padding: '0', overflow: 'hidden' }}>
        <div style={{ padding: '1.5rem 2rem', borderBottom: '1px solid rgba(255,255,255,0.05)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <h4 style={{ margin: 0, fontSize: '1.1rem', fontWeight: 700 }}>Latest Activity Logs</h4>
          <span className="badge badge-primary">{records.length} Records</span>
        </div>

        <div style={{ padding: '1rem' }}>
          {loading ? (
             <div style={{ padding: '4rem', textAlign: 'center', color: 'var(--text-muted)' }}>
               <Clock className="animate-spin" style={{ margin: '0 auto 1rem auto' }} />
               <p>Syncing Registry...</p>
             </div>
          ) : records.length === 0 ? (
            <div style={{ padding: '4rem', textAlign: 'center', color: 'var(--text-muted)' }}>
              <AlertCircle size={40} style={{ margin: '0 auto 1rem auto', opacity: 0.3 }} />
              <p>No presence logs found for this period.</p>
            </div>
          ) : (
            <div className="glass-table-container">
              <table className="glass-table">
                <thead>
                  <tr>
                    <th><Calendar size={14} style={{ marginRight: '8px' }} /> DATE</th>
                    <th>STUDENT ACCOUNT</th>
                    <th>STATUS</th>
                    <th style={{ textAlign: 'right' }}>ACTIONS</th>
                  </tr>
                </thead>
                <tbody>
                  <AnimatePresence>
                    {records.map(rec => (
                      <motion.tr 
                        key={rec.id}
                        initial={{ opacity: 0, x: -10 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, scale: 0.95 }}
                      >
                        <td style={{ fontWeight: 600, color: 'var(--text-primary)' }}>{rec.date}</td>
                        <td>
                          <div className="truncate max-w-[300px]" title={rec.studentId}>{rec.studentId}</div>
                        </td>
                        <td>
                          <div className={`badge ${rec.status === 'Present' ? 'badge-success' : 'badge-danger'}`}>
                            {rec.status === 'Present' ? <CheckCircle2 size={12} style={{ marginRight: '4px' }} /> : <AlertCircle size={12} style={{ marginRight: '4px' }} />}
                            {rec.status}
                          </div>
                        </td>
                        <td style={{ textAlign: 'right' }}>
                          <button 
                            onClick={() => handleDelete(rec.id)}
                            className="btn-icon"
                            style={{ background: 'rgba(239, 68, 68, 0.1)', color: 'var(--danger)', border: 'none' }}
                            title="Purge Entry"
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
      <style>{`
        .animate-spin { animation: spin 1.5s linear infinite; }
        @keyframes spin { 100% { transform: rotate(360deg); } }
      `}</style>
    </motion.div>
  );
};

export default ManageAttendance;
