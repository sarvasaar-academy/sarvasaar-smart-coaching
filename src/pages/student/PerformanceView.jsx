import { useState, useEffect, useCallback } from 'react';
import { db } from '../../firebase';
import { collection, query, where, getDocs } from 'firebase/firestore';
import { useAuth } from '../../context/AuthContext';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer
} from 'recharts';

const PerformanceView = () => {
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState(null);
  const { currentUser } = useAuth();
  
  const [filterExam, setFilterExam] = useState('All');

  const fetchResults = useCallback(async () => {
    if(!currentUser) return;
    try {
      const q = query(
        collection(db, "results"), 
        where("studentId", "==", currentUser.email || currentUser.uid),
      );
      // Note: Firestore requires a composite index to run where() and orderBy() on different fields.
      // So fetching and sorting locally for now.
      const querySnapshot = await getDocs(q);
      const fetched = [];
      querySnapshot.forEach((doc) => {
        fetched.push({ id: doc.id, ...doc.data() });
      });
      
      // Sort descending by date
      fetched.sort((a,b) => new Date(b.createdAt) - new Date(a.createdAt));
      setResults(fetched);
    } catch (err) {
      console.error(err);
      setErrorMsg("Failed to load performance metrics: " + err.message);
    } finally {
      setLoading(false);
    }
  }, [currentUser]);

  useEffect(() => {
    fetchResults();
  }, [fetchResults]);

  // Derived Data for Recharts Graph
  const chartData = results
    .filter(res => filterExam === 'All' ? true : res.examName === filterExam)
    .map(res => ({
      subject: res.subject,
      "Score (%)": Number(res.percentage),
      "Obtained": res.obtainedMarks,
      "Max": res.maxMarks,
      exam: res.examName
    }));

  return (
    <div className="glass-panel" style={{ padding: '2.5rem', width: '100%', display: 'flex', flexDirection: 'column', gap: '1.5rem', borderRadius: '1.5rem', position: 'relative', overflow: 'hidden' }}>
      <div style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1rem', gap: '1rem' }}>
        <div>
          <h3 style={{ fontSize: '1.8rem', fontWeight: '800', marginBottom: '0.8rem', display: 'flex', alignItems: 'center', gap: '0.8rem', color: 'white' }}>
            <span style={{ color: 'var(--info)', fontSize: '1.5rem' }}>📈</span>
            My Performance
          </h3>
          <p style={{ color: 'var(--text-muted)', fontSize: '1rem', maxWidth: '32rem', lineHeight: '1.5' }}>Track your exam scores visually via interactive charts.</p>
        </div>
        
        <div style={{ display: 'flex', flexDirection: 'column', minWidth: '200px' }}>
          <label style={{ fontSize: '0.85rem', fontWeight: '700', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: '0.5rem' }}>Filter Graph by Exam</label>
          <select 
            className="input-field py-1 px-3 text-sm h-10 w-full" 
            value={filterExam} 
            onChange={(e) => setFilterExam(e.target.value)}
          >
            <option value="All">All Exams (Averaged/Stacked)</option>
            <option value="Unit Test 1">Unit Test 1</option>
            <option value="Mid-Term">Mid-Term</option>
            <option value="Finals">Finals</option>
          </select>
        </div>
      </div>
      
      {errorMsg ? (
        <div className="bg-red-100 text-red-700 p-4 rounded-lg text-sm">
          {errorMsg}
        </div>
      ) : loading ? (
        <div className="h-64 flex items-center justify-center text-gray-400">Loading graphs...</div>
      ) : results.length === 0 ? (
        <div className="h-64 flex flex-col items-center justify-center text-gray-500 bg-white/5 rounded-xl border border-white/5">
          <span className="text-4xl mb-3">📉</span>
          <p>No test results have been uploaded to your profile yet.</p>
        </div>
      ) : (
        <>
          {/* Main Interactive Chart */}
          <div className="bg-black/20 p-4 rounded-xl shadow-inner border border-white/5" style={{ height: '400px' }}>
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={chartData}
                margin={{ top: 20, right: 30, left: 0, bottom: 20 }}
              >
                <defs>
                  <linearGradient id="colorScore" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#4fb9ff" stopOpacity={0.8}/>
                    <stop offset="95%" stopColor="#4fb9ff" stopOpacity={0.2}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#ffffff1a" vertical={false} />
                <XAxis 
                  dataKey="subject" 
                  tick={{fill: '#9ca3af', fontSize: 12}} 
                  axisLine={{stroke: '#ffffff3a'}}
                  tickLine={false}
                />
                <YAxis 
                  domain={[0, 100]} 
                  tick={{fill: '#9ca3af', fontSize: 12}}
                  axisLine={{stroke: '#ffffff3a'}}
                  tickLine={false}
                  label={{ value: 'Percentage %', angle: -90, position: 'insideLeft', fill: '#9ca3af', fontSize: 12, dy: 30 }}
                />
                <Tooltip 
                  cursor={{fill: '#ffffff10'}}
                  contentStyle={{ backgroundColor: '#1e293b', border: '1px solid #334155', borderRadius: '8px', color: 'white' }}
                />
                <Legend iconType="circle" wrapperStyle={{ paddingTop: "10px" }}/>
                <Bar 
                  dataKey="Score (%)" 
                  fill="url(#colorScore)" 
                  radius={[4, 4, 0, 0]} 
                  barSize={40}
                  animationDuration={1500}
                />
              </BarChart>
            </ResponsiveContainer>
          </div>

          {/* Details Table */}
          <div className="bg-white/5 rounded-xl border border-white/10 overflow-hidden mt-4">
            <h4 className="p-4 font-semibold border-b border-white/10 bg-white/5">Subject Matrix</h4>
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-white/10 text-gray-400 text-sm">
                    <th className="p-4">Subject</th>
                    <th className="p-4">Exam Type</th>
                    <th className="p-4 text-center">Score</th>
                    <th className="p-4 text-right">Percentage</th>
                  </tr>
                </thead>
                <tbody>
                  {chartData.map((data, index) => (
                    <tr key={index} className="border-b border-white/5 hover:bg-white/5 transition">
                      <td className="p-4 font-medium text-white">{data.subject}</td>
                      <td className="p-4 text-gray-300">{data.exam}</td>
                      <td className="p-4 text-center text-gray-300 font-mono">
                        {data.Obtained} <span className="text-gray-500">/ {data.Max}</span>
                      </td>
                      <td className="p-4 text-right">
                        <span className={`px-3 py-1 rounded-full text-xs font-bold ${
                          data["Score (%)"] >= 80 ? 'bg-green-500/20 text-green-400' : 
                          data["Score (%)"] >= 50 ? 'bg-yellow-500/20 text-yellow-500' : 
                          'bg-red-500/20 text-red-400'
                        }`}>
                          {data["Score (%)"]}%
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

export default PerformanceView;
