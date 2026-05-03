import React, { useState, useEffect } from 'react';
import { db } from '../../firebase';
import { collection, getDocs, updateDoc, doc, deleteDoc, query, orderBy } from 'firebase/firestore';
import { Users, Shield, User, Trash2, ShieldCheck, Mail, Search, Clock, ShieldAlert, Award } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import toast from 'react-hot-toast';

const ManageUsers = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  const fetchUsers = async () => {
    setLoading(true);
    try {
      const q = query(collection(db, "users"), orderBy("role", "asc"));
      const querySnapshot = await getDocs(q);
      const fetched = [];
      querySnapshot.forEach((doc) => {
        fetched.push({ id: doc.id, ...doc.data() });
      });
      setUsers(fetched);
    } catch (err) {
      console.error(err);
      toast.error("User directory sync failed");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const toggleRole = async (userId, currentRole) => {
    const newRole = currentRole === 'admin' ? 'student' : 'admin';
    if (!window.confirm(`Elevate/Restrict this user to ${newRole.toUpperCase()}?`)) return;
    
    try {
      const userRef = doc(db, "users", userId);
      await updateDoc(userRef, { role: newRole });
      setUsers(users.map(u => u.id === userId ? { ...u, role: newRole } : u));
      toast.success(`Access updated to ${newRole}`);
    } catch (err) {
      toast.error("Permission update failed");
    }
  };

  const deleteUser = async (userId) => {
    if (!window.confirm("Permanently erase this user profile? All linked data will be lost.")) return;
    try {
      await deleteDoc(doc(db, "users", userId));
      setUsers(users.filter(u => u.id !== userId));
      toast.success("User successfully removed");
    } catch (err) {
      console.error("Delete failed:", err);
      toast.error("Failed to delete user");
    } finally {
      setActionLoading(null);
    }
  };

  const filteredUsers = users.filter(user => 
    (user.name?.toLowerCase().includes(searchTerm.toLowerCase())) || 
    (user.email?.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="glass-panel" 
      style={{ padding: '2rem', display: 'flex', flexDirection: 'column', gap: '2rem' }}
    >
      <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', justifyContent: 'space-between', gap: '1rem', borderBottom: '1px solid rgba(255,255,255,0.08)', paddingBottom: '1.5rem' }}>
        <div>
          <h2 style={{ fontSize: '1.8rem', fontWeight: '800', margin: '0 0 0.5rem 0', display: 'flex', alignItems: 'center', gap: '0.8rem', color: 'white' }}>
            <User size={28} color="#818cf8" /> User Configuration
          </h2>
          <p style={{ color: 'var(--text-muted)', margin: 0 }}>Manage access roles, students, and system privileges.</p>
        </div>

        <div style={{ position: 'relative', width: '100%', maxWidth: '300px' }}>
          <div style={{ position: 'absolute', top: '50%', left: '1rem', transform: 'translateY(-50%)', color: 'var(--text-muted)' }}>
            <Search size={18} />
          </div>
          <input 
            type="text" 
            placeholder="Search by name or email..." 
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            style={{ 
              width: '100%', padding: '0.7rem 1rem 0.7rem 2.8rem', 
              background: 'rgba(0,0,0,0.3)', border: '1px solid rgba(255,255,255,0.1)', 
              borderRadius: '12px', color: 'white', outline: 'none', transition: 'all 0.3s'
            }}
            onFocus={(e) => e.target.style.borderColor = '#818cf8'}
            onBlur={(e) => e.target.style.borderColor = 'rgba(255,255,255,0.1)'}
          />
        </div>
      </div>

      <div style={{ position: 'relative', minHeight: '300px' }}>
        {loading ? (
          <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', flexDirection: 'column', gap: '1rem' }}>
            <RefreshCw className="animate-spin" size={32} color="#818cf8" />
            <span style={{ color: 'var(--text-muted)', fontWeight: 600, letterSpacing: '0.05em' }}>FETCHING DIRECTORY...</span>
          </div>
        ) : filteredUsers.length === 0 ? (
          <div style={{ padding: '4rem', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '1rem', color: 'var(--text-muted)' }}>
            <AlertCircle size={48} style={{ opacity: 0.5 }} />
            <h3 style={{ fontSize: '1.2rem', fontWeight: 600, color: 'white' }}>No Users Found</h3>
            <p>We couldn't find any users matching your criteria.</p>
          </div>
        ) : (
          <div style={{ overflowX: 'auto', borderRadius: '12px', border: '1px solid rgba(255,255,255,0.05)' }}>
            <table style={{ width: '100%', textAlign: 'left', borderCollapse: 'collapse' }}>
              <thead>
                <tr style={{ background: 'rgba(255,255,255,0.03)', borderBottom: '1px solid rgba(255,255,255,0.1)' }}>
                  <th style={{ padding: '1.2rem', color: 'var(--text-muted)', fontWeight: 700, fontSize: '0.85rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>User Details</th>
                  <th style={{ padding: '1.2rem', color: 'var(--text-muted)', fontWeight: 700, fontSize: '0.85rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Current Role</th>
                  <th style={{ padding: '1.2rem', color: 'var(--text-muted)', fontWeight: 700, fontSize: '0.85rem', textTransform: 'uppercase', letterSpacing: '0.05em', textAlign: 'right' }}>Management Actions</th>
                </tr>
              </thead>
              <tbody>
                <AnimatePresence>
                  {filteredUsers.map((user) => (
                    <motion.tr 
                      key={user.id}
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0, x: -20 }}
                      style={{ borderBottom: '1px solid rgba(255,255,255,0.05)', transition: 'background 0.2s', ':hover': { background: 'rgba(255,255,255,0.02)' } }}
                    >
                      <td style={{ padding: '1.2rem' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                          <div style={{ width: '40px', height: '40px', borderRadius: '10px', background: 'linear-gradient(135deg, #3730a3, #4f46e5)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', fontWeight: 'bold' }}>
                            {user.name ? user.name.charAt(0).toUpperCase() : <User size={20} />}
                          </div>
                          <div>
                            <div style={{ fontWeight: 700, color: 'white', fontSize: '1rem' }}>{user.name || 'Unknown User'}</div>
                            <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginTop: '0.2rem' }}>{user.email}</div>
                          </div>
                        </div>
                      </td>
                      <td style={{ padding: '1.2rem' }}>
                        <div style={{ 
                            display: 'inline-flex', alignItems: 'center', gap: '0.4rem', 
                            padding: '0.4rem 0.8rem', borderRadius: '20px', fontSize: '0.8rem', fontWeight: 700, textTransform: 'uppercase',
                            background: user.role === 'admin' ? 'rgba(52, 211, 153, 0.15)' : 'rgba(255,255,255,0.05)',
                            color: user.role === 'admin' ? '#34d399' : 'var(--text-muted)',
                            border: `1px solid ${user.role === 'admin' ? 'rgba(52, 211, 153, 0.3)' : 'rgba(255,255,255,0.1)'}`
                          }}
                        >
                          {user.role === 'admin' ? <ShieldCheck size={14} /> : <User size={14} />} 
                          {user.role || 'student'}
                        </div>
                      </td>
                      <td style={{ padding: '1.2rem', textAlign: 'right' }}>
                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: '0.8rem' }}>
                          
                          {/* Role Toggle Button */}
                          <button 
                            disabled={actionLoading === user.id}
                            onClick={() => handleRoleToggle(user.id, user.role || 'student')}
                            style={{ 
                              background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', cursor: 'pointer',
                              color: 'white', padding: '0.5rem 1rem', borderRadius: '8px', fontSize: '0.85rem', fontWeight: 600,
                              display: 'flex', alignItems: 'center', gap: '0.4rem', transition: 'all 0.2s', opacity: actionLoading === user.id ? 0.5 : 1
                            }}
                            onMouseEnter={(e) => e.currentTarget.style.background = 'rgba(255,255,255,0.1)'}
                            onMouseLeave={(e) => e.currentTarget.style.background = 'rgba(255,255,255,0.05)'}
                          >
                            {actionLoading === user.id ? <RefreshCw className="animate-spin" size={14} /> : <Shield size={14} />}
                            {user.role === 'admin' ? 'Revoke Admin' : 'Make Admin'}
                          </button>

                          {/* Delete Button */}
                          <button 
                            disabled={actionLoading === user.id}
                            onClick={() => handleDeleteUser(user.id, user.name)}
                            style={{ 
                              background: 'transparent', border: 'none', color: '#f87171', cursor: 'pointer',
                              padding: '0.5rem', borderRadius: '8px', transition: 'all 0.2s', opacity: actionLoading === user.id ? 0.5 : 1
                            }}
                            onMouseEnter={(e) => e.currentTarget.style.background = 'rgba(239, 68, 68, 0.1)'}
                            onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}
                            title="Delete User"
                          >
                            <Trash2 size={18} />
                          </button>

                        </div>
                      </td>
                    </motion.tr>
                  ))}
                </AnimatePresence>
              </tbody>
            </table>
          </div>
        )}
      </div>
      <style>{`
        .animate-spin { animation: spin 1s linear infinite; }
        @keyframes spin { 100% { transform: rotate(360deg); } }
      `}</style>
    </motion.div>
  );
};

export default ManageUsers;
