import { useState, useEffect } from 'react';
import { db } from '../../firebase';
import { collection, getDocs, query, orderBy } from 'firebase/firestore';

const MaterialView = () => {
  const [materials, setMaterials] = useState([]);
  const [loading, setLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState(null);
  
  // Optional: Add filtering by class/subject
  const [filterClass, setFilterClass] = useState('All');

  const fetchMaterials = async () => {
    try {
      const q = query(collection(db, "materials"), orderBy("createdAt", "desc"));
      const querySnapshot = await getDocs(q);
      const fetched = [];
      querySnapshot.forEach((doc) => {
        fetched.push({ id: doc.id, ...doc.data() });
      });
      setMaterials(fetched);
    } catch (err) {
      console.error(err);
      setErrorMsg("Failed to load study materials: " + err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMaterials();
  }, []);

  const filteredMaterials = filterClass === 'All' 
    ? materials 
    : materials.filter(m => m.grade === filterClass);

  return (
    <div className="glass-panel" style={{ padding: '2.5rem', width: '100%', display: 'flex', flexDirection: 'column', gap: '1.5rem', borderRadius: '1.5rem', position: 'relative', overflow: 'hidden' }}>
      <div style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1rem', gap: '1rem' }}>
        <div>
          <h3 style={{ fontSize: '1.8rem', fontWeight: '800', marginBottom: '0.8rem', display: 'flex', alignItems: 'center', gap: '0.8rem', color: 'white' }}>
            <span style={{ color: 'var(--primary)', fontSize: '1.5rem' }}>📚</span>
            Study Materials
          </h3>
          <p style={{ color: 'var(--text-muted)', fontSize: '1rem', maxWidth: '32rem', lineHeight: '1.5' }}>Access and download your course materials.</p>
        </div>
        
        {/* Simple Filter */}
        <div style={{ display: 'flex', flexDirection: 'column', minWidth: '200px' }}>
          <label style={{ fontSize: '0.85rem', fontWeight: '700', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: '0.5rem' }}>Filter by Class</label>
          <select 
            style={{ padding: '0.8rem 1rem', background: 'rgba(0,0,0,0.3)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '1rem', color: 'white', fontWeight: '600', outline: 'none', cursor: 'pointer' }}
            value={filterClass} 
            onChange={(e) => setFilterClass(e.target.value)}
          >
            <option value="All" style={{ background: '#0a0a0f' }}>All Classes</option>
            <option value="Class 1" style={{ background: '#0a0a0f' }}>Class 1</option>
            <option value="Class 2" style={{ background: '#0a0a0f' }}>Class 2</option>
            <option value="Class 3" style={{ background: '#0a0a0f' }}>Class 3</option>
            <option value="Class 4" style={{ background: '#0a0a0f' }}>Class 4</option>
            <option value="Class 5" style={{ background: '#0a0a0f' }}>Class 5</option>
            <option value="Class 6" style={{ background: '#0a0a0f' }}>Class 6</option>
            <option value="Class 7" style={{ background: '#0a0a0f' }}>Class 7</option>
            <option value="Class 8" style={{ background: '#0a0a0f' }}>Class 8</option>
            <option value="Class 9" style={{ background: '#0a0a0f' }}>Class 9</option>
            <option value="Class 10" style={{ background: '#0a0a0f' }}>Class 10</option>
            <option value="Class 11" style={{ background: '#0a0a0f' }}>Class 11</option>
            <option value="Class 12" style={{ background: '#0a0a0f' }}>Class 12</option>
          </select>
        </div>
      </div>
      
      {errorMsg && (
        <div className="bg-red-100 text-red-700 p-4 rounded-lg mb-6 text-sm">
          {errorMsg}
        </div>
      )}

      {loading ? (
        <p className="text-center text-gray-400 py-8">Loading materials...</p>
      ) : filteredMaterials.length === 0 ? (
        <div className="text-center py-12 bg-white/5 rounded-xl border border-white/5">
          <span className="text-4xl block mb-3">📚</span>
          <p className="text-gray-400">No study materials found for this selection.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredMaterials.map(mat => (
            <div key={mat.id} className="bg-white/5 border border-white/10 rounded-xl p-5 hover:bg-white/10 transition flex flex-col">
              <div className="flex items-start justify-between mb-4">
                <div className="text-3xl">
                  {mat.type?.includes('pdf') ? '📕' : mat.type?.includes('image') ? '🎨' : '📘'}
                </div>
                <span className="text-xs font-semibold bg-primary/20 text-primary px-2 py-1 rounded-full">
                  {mat.grade}
                </span>
              </div>
              
              <h4 className="font-bold text-lg mb-1">{mat.title}</h4>
              <p className="text-sm text-primary mb-3">{mat.subject}</p>
              
              <div className="mt-auto space-y-3">
                <div className="flex justify-between text-xs text-gray-400 border-t border-white/10 pt-3">
                  <span>{new Date(mat.createdAt).toLocaleDateString()}</span>
                  <span>{mat.size}</span>
                </div>
                
                <div className="flex gap-2 w-full">
                  <a 
                    href={mat.url} 
                    target="_blank" 
                    rel="noreferrer"
                    className="btn btn-secondary flex-1 py-2 text-center text-sm"
                  >
                    View
                  </a>
                  {/* Download attribute works best with same origin, but provides fallback for cross-origin PDF */}
                  <a 
                    href={mat.url} 
                    download={mat.fileName}
                    target="_blank"
                    rel="noreferrer"
                    className="btn btn-primary flex-1 py-2 text-center text-sm flex justify-center items-center gap-1"
                  >
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path>
                      <polyline points="7 10 12 15 17 10"></polyline>
                      <line x1="12" y1="15" x2="12" y2="3"></line>
                    </svg>
                    Download
                  </a>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default MaterialView;
