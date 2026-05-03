import { useState, useEffect, useCallback } from 'react';
import { db } from '../../firebase';
import { collection, query, where, onSnapshot } from 'firebase/firestore';
import { useAuth } from '../../context/AuthContext';

const AttendanceView = () => {
  const [records, setRecords] = useState([]);
  const [loading, setLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState(null);
  const { currentUser } = useAuth();
  
  useEffect(() => {
    if(!currentUser) return;
    
    setLoading(true);
    const q = query(
      collection(db, "attendance"), 
      where("studentId", "==", currentUser.email || currentUser.uid)
    );

    const unsubscribe = onSnapshot(q, (snap) => {
      const fetched = [];
      snap.forEach((doc) => {
        fetched.push({ id: doc.id, ...doc.data() });
      });
      
      fetched.sort((a,b) => new Date(b.date) - new Date(a.date));
      setRecords(fetched);
      setLoading(false);
      setErrorMsg(null);
    }, (err) => {
      console.error(err);
      setErrorMsg("Neural link interrupted: " + err.message);
      setLoading(false);
    });

    return () => unsubscribe();
  }, [currentUser]);

  const totalClasses = records.length;
  const presentCount = records.filter(r => r.status === 'Present').length;
  const percentage = totalClasses === 0 ? 0 : Math.round((presentCount / totalClasses) * 100);

  return (
    <div className="glass-panel" style={{ padding: '2.5rem', width: '100%', display: 'flex', flexDirection: 'column', gap: '1.5rem', borderRadius: '1.5rem', position: 'relative', overflow: 'hidden' }}>
      <div style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1rem', gap: '1rem' }}>
        <div>
          <h3 style={{ fontSize: '1.8rem', fontWeight: '800', marginBottom: '0.8rem', display: 'flex', alignItems: 'center', gap: '0.8rem', color: 'white' }}>
            <span style={{ color: 'var(--success)', fontSize: '1.5rem' }}>✅</span>
            My Attendance
          </h3>
          <p style={{ color: 'var(--text-muted)', fontSize: '1rem', maxWidth: '32rem', lineHeight: '1.5' }}>Review your daily class attendance and overall compliance.</p>
        </div>
      </div>
      
      {errorMsg ? (
        <div className="bg-red-100 text-red-700 p-4 rounded-lg text-sm">
          {errorMsg}
        </div>
      ) : loading ? (
        <div className="h-40 flex items-center justify-center text-gray-400">Loading attendance data...</div>
      ) : totalClasses === 0 ? (
        <div className="h-40 flex flex-col items-center justify-center text-gray-500 bg-white/5 rounded-xl border border-white/5">
          <span className="text-4xl mb-3">📅</span>
          <p>Your homeroom teacher hasn't posted any attendance records for you yet.</p>
        </div>
      ) : (
        <>
          {/* Top Summary Stats */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-white/5 border border-white/10 rounded-xl p-6 text-center shadow-inner flex flex-col items-center justify-center">
              <span className="text-sm font-semibold text-gray-400 mb-1 uppercase tracking-wider">Attendance Rate</span>
              <div className={`text-5xl font-black ${percentage >= 75 ? 'text-green-400' : 'text-danger'}`}>
                {percentage}%
              </div>
              <span className="text-xs text-gray-500 mt-2">Target &gt;= 75%</span>
            </div>
            
            <div className="bg-white/5 border border-white/10 rounded-xl p-6 flex flex-col items-start shadow-inner justify-center gap-1 bg-gradient-to-br from-green-500/10 to-transparent">
              <span className="text-3xl font-bold text-green-400">{presentCount}</span>
              <span className="font-semibold text-gray-300">Days Present</span>
              <span className="text-sm text-gray-500">Out of {totalClasses} logged sessions</span>
            </div>

            <div className="bg-white/5 border border-white/10 rounded-xl p-6 flex flex-col items-start shadow-inner justify-center gap-1 bg-gradient-to-br from-red-500/10 to-transparent">
              <span className="text-3xl font-bold text-red-400">{totalClasses - presentCount}</span>
              <span className="font-semibold text-gray-300">Days Absent</span>
              <span className="text-sm text-gray-500">Missed curriculum</span>
            </div>
          </div>

          {/* Detailed Log History */}
          <div className="bg-white/5 rounded-xl border border-white/10 overflow-hidden mt-2">
            <h4 className="p-4 font-semibold border-b border-white/10 bg-white/5 flex items-center justify-between">
              <span>Log History</span>
              <span className="text-xs font-normal text-gray-400 bg-black/40 px-3 py-1 rounded-full">Sorted by Latest date</span>
            </h4>
            <div className="overflow-x-auto max-h-80">
              <table className="w-full text-left border-collapse">
                <thead className="sticky top-0 bg-[#24334f] z-10">
                  <tr className="border-b border-white/10 text-gray-400 text-sm">
                    <th className="p-4">Date Logged</th>
                    <th className="p-4 text-right">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {records.map((rec) => (
                    <tr key={rec.id} className="border-b border-white/5 hover:bg-white/5 transition">
                      <td className="p-4 font-medium text-gray-300">
                        {new Date(rec.date).toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
                      </td>
                      <td className="p-4 text-right">
                        <span className={`px-4 py-1.5 rounded-full text-xs font-bold shadow-md ${
                          rec.status === 'Present' 
                            ? 'bg-gradient-to-r from-green-600 to-green-500 text-white' 
                            : 'bg-gradient-to-r from-red-600 to-red-500 text-white'
                        }`}>
                          {rec.status === 'Present' ? '✔ PRESENT' : '✖ ABSENT'}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default AttendanceView;
