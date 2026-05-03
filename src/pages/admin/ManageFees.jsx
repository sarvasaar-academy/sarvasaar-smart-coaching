import { useState, useEffect } from 'react';
import { db } from '../../firebase';
import { collection, addDoc, onSnapshot, updateDoc, doc, query, orderBy, deleteDoc, limit } from 'firebase/firestore';
import { Receipt, Wallet, Calendar, Trash2, CheckCircle2, Clock, Search, AlertCircle, CreditCard, Filter } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import toast from 'react-hot-toast';

const ManageFees = () => {
  const [fees, setFees] = useState([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  
  // Form State
  const [studentId, setStudentId] = useState('');
  const [feeType, setFeeType] = useState('Tuition Fee');
  const [amount, setAmount] = useState('');
  const [dueDate, setDueDate] = useState('');

  useEffect(() => {
    setLoading(true);
    const q = query(collection(db, "fees"), limit(150));
    
    const unsubscribe = onSnapshot(q, (snap) => {
      const fetched = [];
      snap.forEach((doc) => {
        fetched.push({ id: doc.id, ...doc.data() });
      });
      // Sort on client side
      fetched.sort((a,b) => new Date(b.createdAt) - new Date(a.createdAt));
      setFees(fetched);
      setLoading(false);
    }, (err) => {
      console.error(err);
      toast.error("Live financial sync failed");
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!studentId || !amount || !dueDate) {
      toast.error("All financial fields are required");
      return;
    }

    setUploading(true);
    try {
      const newInvoice = {
        studentId: studentId.toLowerCase().trim(),
        feeType,
        amount: Number(amount),
        dueDate,
        status: 'Pending', 
        createdAt: new Date().toISOString()
      };

      await addDoc(collection(db, "fees"), newInvoice);
      toast.success("Financial invoice generated");
      setAmount('');
    } catch (err) {
      console.error(err);
      toast.error("Invoice generation failed");
    } finally {
      setUploading(false);
    }
  };

  const markAsPaid = async (id) => {
    if(!window.confirm("Confirm payment receipt?")) return;
    try {
      const feeRef = doc(db, "fees", id);
      await updateDoc(feeRef, {
        status: 'Paid',
        paidAt: new Date().toISOString()
      });
      toast.success("Invoice cleared");
    } catch (err) {
      toast.error("Payment update failed");
    }
  };

  const handleDelete = async (id) => {
    if(!window.confirm("Permanently delete this invoice?")) return;
    try {
      await deleteDoc(doc(db, "fees", id));
      toast.success("Invoice removed");
    } catch(err) {
      toast.error("Delete failed");
    }
  };

  const getStatusBadge = (invoice) => {
    if (invoice.status === 'Paid') return <span className="badge badge-success"><CheckCircle2 size={12} style={{marginRight: '4px'}}/> Paid</span>;
    const isLate = new Date() > new Date(invoice.dueDate);
    if (isLate) return <span className="badge badge-danger"><AlertCircle size={12} style={{marginRight: '4px'}}/> Overdue</span>;
    return <span className="badge badge-warning"><Clock size={12} style={{marginRight: '4px'}}/> Pending</span>;
  };

  return (
    <motion.div 
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      className="flex flex-col gap-6"
    >
      <div className="glass-panel" style={{ padding: '2rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '1.5rem', borderBottom: '1px solid rgba(255,255,255,0.05)', paddingBottom: '1rem' }}>
          <div style={{ padding: '0.8rem', background: 'rgba(239, 68, 68, 0.15)', borderRadius: '14px', color: 'var(--danger)' }}>
            <Wallet size={26} />
          </div>
          <div>
            <h3 style={{ fontSize: '1.4rem', fontWeight: 800, margin: 0 }}>Financial Ledger</h3>
            <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', margin: 0 }}>Generate invoices and track student payments</p>
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
            <label className="input-label">Fee Category</label>
            <div style={{ position: 'relative' }}>
               <Filter size={16} style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
               <select className="input-field" style={{ paddingLeft: '2.8rem' }} value={feeType} onChange={e => setFeeType(e.target.value)}>
                <option value="Tuition Fee">Tuition Fee</option>
                <option value="Transport/Bus">Transport / Bus</option>
                <option value="Library Penalty">Library Penalty</option>
                <option value="Extracurricular">Extracurricular</option>
              </select>
            </div>
          </div>

          <div className="input-group" style={{ marginBottom: 0 }}>
            <label className="input-label">Amount (₹)</label>
            <div style={{ position: 'relative' }}>
               <CreditCard size={16} style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
               <input 
                type="number" className="input-field" style={{ paddingLeft: '2.8rem' }}
                min="1"
                placeholder="0.00"
                value={amount} onChange={(e) => setAmount(e.target.value)} required 
              />
            </div>
          </div>

          <div className="input-group" style={{ marginBottom: 0 }}>
            <label className="input-label">Due Date</label>
            <input 
              type="date" className="input-field" 
              value={dueDate} onChange={(e) => setDueDate(e.target.value)} required 
            />
          </div>

          <button 
            type="submit" 
            className="btn btn-primary" 
            style={{ height: '3.2rem' }}
            disabled={uploading}
          >
            {uploading ? 'Processing...' : 'Generate Invoice'}
          </button>
        </form>
      </div>

      <div className="glass-panel" style={{ padding: '0', overflow: 'hidden' }}>
        <div style={{ padding: '1.5rem 2rem', borderBottom: '1px solid rgba(255,255,255,0.05)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <h4 style={{ margin: 0, fontSize: '1.1rem', fontWeight: 700 }}>Active Invoices</h4>
          <span className="badge badge-primary">{fees.length} Invoices</span>
        </div>

        <div style={{ padding: '1rem' }}>
          {loading ? (
             <div style={{ padding: '4rem', textAlign: 'center', color: 'var(--text-muted)' }}>
               <div style={{ width: '32px', height: '32px', border: '3px solid rgba(129, 140, 248, 0.1)', borderTopColor: 'var(--primary)', borderRadius: '50%', animation: 'spin 1s linear infinite', margin: '0 auto 1rem auto' }}></div>
               <p>Syncing Financials...</p>
             </div>
          ) : fees.length === 0 ? (
            <div style={{ padding: '4rem', textAlign: 'center', color: 'var(--text-muted)' }}>
              <Receipt size={40} style={{ margin: '0 auto 1rem auto', opacity: 0.3 }} />
              <p>No financial records found in the database.</p>
            </div>
          ) : (
            <div className="glass-table-container">
              <table className="glass-table">
                <thead>
                  <tr>
                    <th>STUDENT ACCOUNT</th>
                    <th>CATEGORY</th>
                    <th>AMOUNT</th>
                    <th><Calendar size={14} style={{marginRight: '6px'}}/> DUE DATE</th>
                    <th style={{textAlign: 'center'}}>STATUS</th>
                    <th style={{textAlign: 'right'}}>ACTIONS</th>
                  </tr>
                </thead>
                <tbody>
                  <AnimatePresence>
                    {fees.map(fee => (
                      <motion.tr 
                        key={fee.id}
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                      >
                        <td>
                          <div className="truncate max-w-[200px]" style={{ fontWeight: 600, color: 'white' }} title={fee.studentId}>{fee.studentId}</div>
                        </td>
                        <td><span style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>{fee.feeType}</span></td>
                        <td><span style={{ fontWeight: 800, color: 'var(--primary)', fontSize: '1.1rem' }}>₹{fee.amount}</span></td>
                        <td>{new Date(fee.dueDate).toLocaleDateString()}</td>
                        <td style={{ textAlign: 'center' }}>{getStatusBadge(fee)}</td>
                        <td style={{ textAlign: 'right' }}>
                          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.5rem' }}>
                            {fee.status !== 'Paid' && (
                              <button 
                                onClick={() => markAsPaid(fee.id)}
                                className="btn-icon"
                                style={{ background: 'rgba(16, 185, 129, 0.1)', color: 'var(--success)', border: 'none' }}
                                title="Confirm Receipt"
                              >
                                <CheckCircle2 size={18} />
                              </button>
                            )}
                            <button 
                              onClick={() => handleDelete(fee.id)}
                              className="btn-icon"
                              style={{ background: 'rgba(239, 68, 68, 0.1)', color: 'var(--danger)', border: 'none' }}
                              title="Delete Invoice"
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
      </div>
      <style>{`
        @keyframes spin { 100% { transform: rotate(360deg); } }
      `}</style>
    </motion.div>
  );
};

export default ManageFees;
