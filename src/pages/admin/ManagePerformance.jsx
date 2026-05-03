import { useState, useEffect } from 'react';
import { db } from '../../firebase';
import { collection, addDoc, onSnapshot, deleteDoc, doc, query, orderBy, limit } from 'firebase/firestore';
import { Trophy, Target, Trash2, User, BookOpen, Clock, Search, BarChart2, CheckCircle, AlertCircle } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import toast from 'react-hot-toast';

const ManagePerformance = () => {
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  
  // Form State
  const [studentId, setStudentId] = useState('');
  const [examName, setExamName] = useState('First Terminal');
  const [subject, setSubject] = useState('');
  const [marks, setMarks] = useState('');
  const [totalMarks, setTotalMarks] = useState('100');

  useEffect(() => {
    setLoading(true);
    const q = query(collection(db, "performance"), orderBy("createdAt", "desc"), limit(50));
    
    const unsubscribe = onSnapshot(q, (snap) => {
      const fetched = [];
      snap.forEach((doc) => {
        fetched.push({ id: doc.id, ...doc.data() });
      });
      setResults(fetched);
      setLoading(false);
    }, (err) => {
      console.error(err);
      toast.error("Live performance sync failed");
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!studentId || !marks || !subject) {
      toast.error("Required performance metrics missing");
      return;
    }

    setUploading(true);
    try {
      const percentage = ((Number(marks) / Number(totalMarks)) * 100).toFixed(2);
      let grade = 'F';
      if (percentage >= 90) grade = 'A+';
      else if (percentage >= 80) grade = 'A';
      else if (percentage >= 70) grade = 'B';
      else if (percentage >= 60) grade = 'C';
      else if (percentage >= 35) grade = 'D';

      const newResult = {
        studentId: studentId.toLowerCase().trim(),
        examName,
        subject: subject.trim(),
        marks: Number(marks),
        totalMarks: Number(totalMarks),
        percentage,
        grade,
        createdAt: new Date().toISOString()
      };

      await addDoc(collection(db, "performance"), newResult);
      
      toast.success(`Metrics published for ${studentId}`);
      setMarks('');
    } catch (err) {
      console.error(err);
      toast.error("Failed to publish results");
    } finally {
      setUploading(false);
    }
  };

  const handleDelete = async (id) => {
    if(!window.confirm("Permanently archive this performance record?")) return;
    try {
      await deleteDoc(doc(db, "performance", id));
      toast.success("Record archived");
    } catch(err) {
      toast.error("Erasure failed");
    }
  };

  return (
    <motion.div 
      initial={{ opacity: 0, scale: 0.98 }}
      animate={{ opacity: 1, scale: 1 }}
      className="flex flex-col gap-6"
    >
      <div className="glass-panel" style={{ padding: '2rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '1.5rem', borderBottom: '1px solid rgba(255,255,255,0.05)', paddingBottom: '1rem' }}>
          <div style={{ padding: '0.8rem', background: 'rgba(168, 85, 247, 0.15)', borderRadius: '14px', color: 'var(--accent)' }}>
            <Trophy size={26} />
          </div>
          <div>
            <h3 style={{ fontSize: '1.4rem', fontWeight: 800, margin: 0 }}>Examination Hub</h3>
            <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', margin: 0 }}>Log student grades and academic performance metrics</p>
          </div>
        </div>

        <form onSubmit={handleSubmit} style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '1.5rem', alignItems: 'flex-end' }}>
          <div className="input-group" style={{ marginBottom: 0 }}>
            <label className="input-label">Student ID</label>
            <div style={{ position: 'relative' }}>
               <User size={16} style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
               <input 
                type="text" className="input-field" style={{ paddingLeft: '2.8rem' }}
                placeholder="search-student@edu.com" 
                value={studentId} onChange={(e) => setStudentId(e.target.value)} required 
              />
            </div>
          </div>

          <div className="input-group" style={{ marginBottom: 0 }}>
            <label className="input-label">Exam Session</label>
            <select className="input-field" value={examName} onChange={e => setExamName(e.target.value)}>
              <option value="First Terminal">First Terminal</option>
              <option value="Mid-Term">Mid-Term</option>
              <option value="Final Examination">Final Examination</option>
              <option value="Weekly Assessment">Weekly Assessment</option>
            </select>
          </div>

          <div className="input-group" style={{ marginBottom: 0 }}>
            <label className="input-label">Subject</label>
             <div style={{ position: 'relative' }}>
               <BookOpen size={16} style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
               <input 
                type="text" className="input-field" style={{ paddingLeft: '2.8rem' }}
                placeholder="e.g. Science" 
                value={subject} onChange={(e) => setSubject(e.target.value)} required 
              />
            </div>
          </div>

          <div className="input-group" style={{ marginBottom: 0 }}>
            <label className="input-label">Score (Obtained/Total)</label>
            <div style={{ display: 'flex', gap: '8px' }}>
              <input 
                type="number" className="input-field" placeholder="Marks"
                value={marks} onChange={(e) => setMarks(e.target.value)} required 
              />
              <input 
                type="number" className="input-field" placeholder="Total" style={{ width: '80px' }}
                value={totalMarks} onChange={(e) => setTotalMarks(e.target.value)} required 
              />
            </div>
          </div>

          <button 
            type="submit" 
            className="btn btn-primary" 
            style={{ height: '3.2rem', background: 'linear-gradient(135deg, var(--accent), #9333ea)' }}
            disabled={uploading}
          >
            {uploading ? 'Publishing...' : 'Deploy Result'}
          </button>
        </form>
      </div>

      <div className="glass-panel" style={{ padding: '0', overflow: 'hidden' }}>
        <div style={{ padding: '1.5rem 2rem', borderBottom: '1px solid rgba(255,255,255,0.05)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <h4 style={{ margin: 0, fontSize: '1.1rem', fontWeight: 700 }}>Registry Analytics</h4>
          <span className="badge badge-primary">{results.length} Entries</span>
        </div>

        <div style={{ padding: '1rem' }}>
          {loading ? (
             <div style={{ padding: '4rem', textAlign: 'center', color: 'var(--text-muted)' }}>
               <div style={{ width: '32px', height: '32px', border: '3px solid rgba(168, 85, 247, 0.1)', borderTopColor: 'var(--accent)', borderRadius: '50%', animation: 'spin 1.s linear infinite', margin: '0 auto 1rem auto' }}></div>
               <p>Syncing Academic HQ...</p>
             </div>
          ) : results.length === 0 ? (
            <div style={{ padding: '4rem', textAlign: 'center', color: 'var(--text-muted)' }}>
              <BarChart2 size={40} style={{ margin: '0 auto 1rem auto', opacity: 0.3 }} />
              <p>No academic results found in this sector.</p>
            </div>
          ) : (
            <div className="glass-table-container">
              <table className="glass-table">
                <thead>
                  <tr>
                    <th>STUDENT ACCOUNT</th>
                    <th>EXAM & SUBJECT</th>
                    <th>SCORE</th>
                    <th style={{ textAlign: 'center' }}>RESULT</th>
                    <th style={{ textAlign: 'right' }}>OPS</th>
                  </tr>
                </thead>
                <tbody>
                  <AnimatePresence>
                    {results.map(res => (
                      <motion.tr 
                        key={res.id}
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                      >
                        <td>
                          <div className="truncate max-w-[200px]" style={{ fontWeight: 600, color: 'white' }} title={res.studentId}>{res.studentId}</div>
                        </td>
                        <td>
                          <div style={{ display: 'flex', flexDirection: 'column' }}>
                             <span style={{ fontSize: '0.85rem', color: 'white', fontWeight: 600 }}>{res.examName}</span>
                             <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{res.subject}</span>
                          </div>
                        </td>
                        <td>
                           <div style={{ display: 'flex', alignItems: 'baseline', gap: '4px' }}>
                             <span style={{ fontSize: '1.1rem', fontWeight: 800, color: 'var(--accent)' }}>{res.marks}</span>
                             <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>/ {res.totalMarks}</span>
                           </div>
                        </td>
                        <td style={{ textAlign: 'center' }}>
                           <div className={`badge ${res.grade === 'F' ? 'badge-danger' : 'badge-success'}`}>
                             {res.grade === 'F' ? <AlertCircle size={12} style={{marginRight: '4px'}}/> : <CheckCircle size={12} style={{marginRight: '4px'}}/> }
                             Grade {res.grade} ({res.percentage}%)
                           </div>
                        </td>
                        <td style={{ textAlign: 'right' }}>
                          <button 
                            onClick={() => handleDelete(res.id)}
                            className="btn-icon"
                            style={{ background: 'rgba(239, 68, 68, 0.1)', color: 'var(--danger)', border: 'none' }}
                            title="Delete Result"
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
    </motion.div>
  );
};

export default ManagePerformance;
