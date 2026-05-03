import { useState, useEffect, useCallback } from 'react';
import { db } from '../../firebase';
import { collection, query, where, onSnapshot, updateDoc, doc } from 'firebase/firestore';
import { useAuth } from '../../context/AuthContext';

const FeeTrackingView = () => {
  const [invoices, setInvoices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState(null);
  const { currentUser } = useAuth();
  
  const [processingId, setProcessingId] = useState(null);

  useEffect(() => {
    if(!currentUser) return;
    
    setLoading(true);
    const q = query(
      collection(db, "fees"), 
      where("studentId", "==", currentUser.email || currentUser.uid)
    );

    const unsubscribe = onSnapshot(q, (snap) => {
      const fetched = [];
      snap.forEach((doc) => {
        fetched.push({ id: doc.id, ...doc.data() });
      });
      
      fetched.sort((a,b) => new Date(b.createdAt) - new Date(a.createdAt));
      setInvoices(fetched);
      setLoading(false);
      setErrorMsg(null);
    }, (err) => {
      console.error(err);
      setErrorMsg("Neural link interrupted: " + err.message);
      setLoading(false);
    });

    return () => unsubscribe();
  }, [currentUser]);

  const handleSimulatedPayment = async (id) => {
    setProcessingId(id);
    // Simulate payment gateway delay
    setTimeout(async () => {
      try {
        await updateDoc(feeRef, {
          status: 'Paid',
          paidAt: new Date().toISOString()
        });
      } catch (err) {
        setErrorMsg("Payment transaction failed: " + err.message);
      } finally {
        setProcessingId(null);
      }
    }, 1500);
  };

  // Derive dues
  const totalDues = invoices
    .filter(inv => inv.status !== 'Paid')
    .reduce((sum, inv) => sum + inv.amount, 0);

  const getStatusBadge = (invoice) => {
    if (invoice.status === 'Paid') return <span className="px-3 py-1 rounded-full text-xs font-bold bg-green-500/20 text-green-400">Paid</span>;
    
    const isLate = new Date() > new Date(invoice.dueDate);
    if (isLate) {
        return <span className="px-3 py-1 rounded-full text-xs font-bold bg-red-500/20 text-red-400">Overdue</span>;
    }
    return <span className="px-3 py-1 rounded-full text-xs font-bold bg-yellow-500/20 text-yellow-500">Pending</span>;
  };

  return (
    <div className="glass-panel" style={{ padding: '2.5rem', width: '100%', display: 'flex', flexDirection: 'column', gap: '1.5rem', borderRadius: '1.5rem', position: 'relative', overflow: 'hidden' }}>
      <div style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1rem', gap: '1rem' }}>
        <div>
          <h3 style={{ fontSize: '1.8rem', fontWeight: '800', marginBottom: '0.8rem', display: 'flex', alignItems: 'center', gap: '0.8rem', color: 'white' }}>
            <span style={{ color: 'var(--accent)', fontSize: '1.5rem' }}>💳</span>
            Fees & Dues
          </h3>
          <p style={{ color: 'var(--text-muted)', fontSize: '1rem', maxWidth: '32rem', lineHeight: '1.5' }}>Monitor your invoices and fulfill outstanding balances securely.</p>
        </div>
      </div>
      
      {errorMsg ? (
        <div className="bg-red-100 text-red-700 p-4 rounded-lg text-sm">
          {errorMsg}
        </div>
      ) : loading ? (
        <div className="h-40 flex items-center justify-center text-gray-400">Loading billing dashboard...</div>
      ) : (
        <>
          {/* Top Summary Banner */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className={`border rounded-xl p-8 flex justify-between shadow-inner ${
              totalDues > 0 
                ? 'bg-gradient-to-r from-red-600/20 to-transparent border-red-500/30' 
                : 'bg-gradient-to-r from-green-600/20 to-transparent border-green-500/30'
            }`}>
              <div className="flex flex-col justify-center gap-1">
                <span className="text-sm font-semibold text-gray-400 uppercase tracking-widest">Total Outstanding</span>
                <span className={`text-5xl font-black ${totalDues > 0 ? 'text-red-400' : 'text-green-400'}`}>
                  ₹{totalDues}
                </span>
                <span className="text-xs text-gray-500 mt-2">
                  {totalDues > 0 ? 'Action required immediately.' : 'All clear! No pending curriculum fees.'}
                </span>
              </div>
              <div className="text-6xl flex items-center">
                 {totalDues > 0 ? '💳' : '🎉'}
              </div>
            </div>
          </div>

          {/* Detailed Invoice History */}
          <div className="bg-white/5 rounded-xl border border-white/10 overflow-hidden mt-2">
            <h4 className="p-4 font-semibold border-b border-white/10 bg-white/5">
              Invoice History
            </h4>
            {invoices.length === 0 ? (
              <div className="p-10 text-center flex flex-col items-center">
                 <span className="text-4xl mb-3 text-gray-500">🧾</span>
                 <p className="text-gray-300">No invoices have been issued to your account.</p>
              </div>
            ) : (
              <div className="overflow-x-auto max-h-96">
                <table className="w-full text-left border-collapse">
                  <thead className="sticky top-0 bg-[#24334f] z-10">
                    <tr className="border-b border-white/10 text-gray-400 text-sm">
                      <th className="p-4">Description</th>
                      <th className="p-4">Amount</th>
                      <th className="p-4">Due Date</th>
                      <th className="p-4 text-center">Status</th>
                      <th className="p-4 text-right">Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {invoices.map((inv) => (
                      <tr key={inv.id} className="border-b border-white/5 hover:bg-white/5 transition">
                        <td className="p-4 font-medium text-white">{inv.feeType}</td>
                        <td className="p-4 text-blue-400 font-bold">₹{inv.amount}</td>
                        <td className="p-4 text-gray-300 text-sm">
                          {new Date(inv.dueDate).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' })}
                        </td>
                        <td className="p-4 text-center">
                          {getStatusBadge(inv)}
                        </td>
                        <td className="p-4 text-right">
                          {inv.status !== 'Paid' ? (
                            <button 
                              onClick={() => handleSimulatedPayment(inv.id)}
                              className="btn btn-primary text-xs py-1.5 px-3 flex items-center justify-center gap-2 ml-auto"
                              disabled={processingId === inv.id}
                            >
                              {processingId === inv.id ? (
                                <>
                                  <svg className="animate-spin h-4 w-4 text-white" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                                    <circle cx="12" cy="12" r="10" strokeWidth="4" strokeOpacity="0.3"></circle>
                                    <path d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" fill="currentColor"></path>
                                  </svg>
                                  Processing
                                </>
                              ) : (
                                "Pay Now"
                              )}
                            </button>
                          ) : (
                            <button disabled className="text-gray-500 font-medium text-xs py-1.5 px-3 uppercase tracking-wider">
                              Verified
                            </button>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </>
      )}
    </div>
  );
};

export default FeeTrackingView;
