import { useState, useEffect } from 'react';
import { storage, db } from '../../firebase';
import { ref, uploadBytesResumable, getDownloadURL, deleteObject } from 'firebase/storage';
import { collection, addDoc, onSnapshot, deleteDoc, doc, query, orderBy, limit } from 'firebase/firestore';
import { Cloud, Upload, Trash2, FileText, Download, ExternalLink, Search, Clock, AlertCircle, HardDrive } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import toast from 'react-hot-toast';

const ManageMaterials = () => {
  const [materials, setMaterials] = useState([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState(0);

  // Form State
  const [title, setTitle] = useState('');
  const [subject, setSubject] = useState('');
  const [grade, setGrade] = useState('');
  const [file, setFile] = useState(null);

  useEffect(() => {
    setLoading(true);
    const q = query(collection(db, "materials"), limit(200));
    
    const unsubscribe = onSnapshot(q, (snap) => {
      const fetched = [];
      snap.forEach((doc) => {
        fetched.push({ id: doc.id, ...doc.data() });
      });
      // Sort on client side
      fetched.sort((a,b) => new Date(b.createdAt) - new Date(a.createdAt));
      setMaterials(fetched);
      setLoading(false);
    }, (err) => {
      console.error(err);
      toast.error("Error syncing registry");
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const handleUpload = async (e) => {
    e.preventDefault();
    if (!file || !title || !subject || !grade) {
      toast.error("Missing required metadata or file");
      return;
    }
    
    setUploading(true);
    setProgress(0);

    try {
      const storageRef = ref(storage, `materials/${grade}/${subject}/${Date.now()}_${file.name}`);
      const uploadTask = uploadBytesResumable(storageRef, file);

      uploadTask.on('state_changed', 
        (snapshot) => {
          const p = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
          setProgress(p);
        }, 
        (error) => {
          toast.error("Upload stream interrupted");
          setUploading(false);
        }, 
        async () => {
          const downloadURL = await getDownloadURL(uploadTask.snapshot.ref);
          const newMaterial = {
            title: title.trim(),
            subject: subject.trim(),
            grade,
            fileName: file.name,
            size: (file.size / (1024 * 1024)).toFixed(2) + ' MB',
            type: file.type,
            url: downloadURL,
            storagePath: uploadTask.snapshot.ref.fullPath,
            createdAt: new Date().toISOString()
          };
          
          await addDoc(collection(db, "materials"), newMaterial);
          
          setTitle(''); setSubject(''); setGrade(''); setFile(null);
          document.getElementById('file-upload-input').value = '';
          toast.success("Material synced to cloud");
          setUploading(false);
        }
      );
    } catch (err) {
      console.error(err);
      toast.error("Cloud deployment failed");
      setUploading(false);
    }
  };

  const handleDelete = async (id, storagePath) => {
    if (!window.confirm("Permanently archive this file?")) return;
    try {
      const fileRef = ref(storage, storagePath);
      await deleteObject(fileRef);
      await deleteDoc(doc(db, "materials", id));
      toast.success("Material purged from system");
    } catch (err) {
      toast.error("Erasure failed");
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
          <div style={{ padding: '0.8rem', background: 'rgba(56, 189, 248, 0.15)', borderRadius: '14px', color: '#38bdf8' }}>
            <Cloud size={26} />
          </div>
          <div>
            <h3 style={{ fontSize: '1.4rem', fontWeight: 800, margin: 0 }}>Cloud Repository</h3>
            <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', margin: 0 }}>Publish academic resources for global student access</p>
          </div>
        </div>

        <form onSubmit={handleUpload} style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '1.5rem', alignItems: 'flex-end' }}>
          <div className="input-group" style={{ marginBottom: 0 }}>
            <label className="input-label">Title / Topic</label>
            <input 
              type="text" className="input-field" 
              placeholder="e.g. Physics Quantum Mechanics" 
              value={title} onChange={(e) => setTitle(e.target.value)} required 
            />
          </div>
          <div className="input-group" style={{ marginBottom: 0 }}>
            <label className="input-label">Subject</label>
            <div style={{ position: 'relative' }}>
              <Search size={16} style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
              <input 
                type="text" className="input-field" style={{ paddingLeft: '2.8rem' }}
                placeholder="e.g. Science" 
                value={subject} onChange={(e) => setSubject(e.target.value)} required 
              />
            </div>
          </div>
          <div className="input-group" style={{ marginBottom: 0 }}>
            <label className="input-label">Target Grade</label>
            <select className="input-field" value={grade} onChange={(e) => setGrade(e.target.value)} required>
              <option value="" disabled>Choose Class</option>
              {[9,10,11,12].map(c => <option key={c} value={`Class ${c}`}>Class {c}</option>)}
            </select>
          </div>
          <div className="input-group" style={{ marginBottom: 0 }}>
            <label className="input-label">Select File</label>
            <input 
              id="file-upload-input"
              type="file" className="input-field pt-2"
              onChange={(e) => setFile(e.target.files[0])} required 
            />
          </div>
          
          <div className="md:col-span-full">
            {uploading && (
              <div style={{ marginBottom: '1rem' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.8rem', marginBottom: '0.4rem', color: 'var(--text-muted)' }}>
                  <span>Uploading Content...</span>
                  <span>{progress.toFixed(0)}%</span>
                </div>
                <div style={{ height: '6px', background: 'rgba(255,255,255,0.05)', borderRadius: '10px', overflow: 'hidden' }}>
                  <motion.div 
                    initial={{ width: 0 }}
                    animate={{ width: `${progress}%` }}
                    style={{ height: '100%', background: 'linear-gradient(90deg, #38bdf8, #818cf8)' }}
                  />
                </div>
              </div>
            )}
            <button 
              type="submit" 
              className="btn btn-primary w-full" 
              style={{ background: 'linear-gradient(135deg, #38bdf8, #818cf8)', height: '3.2rem' }}
              disabled={uploading}
            >
              <Upload size={18} /> {uploading ? 'Processing Deployment...' : 'Sync to Cloud Drive'}
            </button>
          </div>
        </form>
      </div>

      <div className="glass-panel" style={{ padding: '0', overflow: 'hidden' }}>
        <div style={{ padding: '1.5rem 2rem', borderBottom: '1px solid rgba(255,255,255,0.05)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <h4 style={{ margin: 0, fontSize: '1.1rem', fontWeight: 700 }}>Deployed Materials</h4>
          <span className="badge badge-primary">{materials.length} Files</span>
        </div>

        <div style={{ padding: '1rem' }}>
          {loading ? (
             <div style={{ padding: '4rem', textAlign: 'center', color: 'var(--text-muted)' }}>
               <div style={{ width: '32px', height: '32px', border: '3px solid rgba(56, 189, 248, 0.1)', borderTopColor: '#38bdf8', borderRadius: '50%', animation: 'spin 1s linear infinite', margin: '0 auto 1rem auto' }}></div>
               <p>Accessing Cloud registry...</p>
             </div>
          ) : materials.length === 0 ? (
            <div style={{ padding: '4rem', textAlign: 'center', color: 'var(--text-muted)' }}>
              <HardDrive size={40} style={{ margin: '0 auto 1rem auto', opacity: 0.3 }} />
              <p>No materials published to the cloud yet.</p>
            </div>
          ) : (
            <div className="glass-table-container">
              <table className="glass-table">
                <thead>
                  <tr>
                    <th>FILE ASSET</th>
                    <th>METADATA</th>
                    <th>SIZE</th>
                    <th><Clock size={14} style={{marginRight: '6px'}}/> UPLOADED</th>
                    <th style={{textAlign: 'right'}}>ACTIONS</th>
                  </tr>
                </thead>
                <tbody>
                  <AnimatePresence>
                    {materials.map(mat => (
                      <motion.tr 
                        key={mat.id}
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                      >
                        <td>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                             <div style={{ padding: '0.6rem', background: 'rgba(255,255,255,0.05)', borderRadius: '10px', color: '#38bdf8' }}>
                               <FileText size={20} />
                             </div>
                             <div>
                                <div className="truncate max-w-[200px]" style={{ fontWeight: 600, color: 'white' }} title={mat.title}>{mat.title}</div>
                                <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>{mat.fileName}</div>
                             </div>
                          </div>
                        </td>
                        <td>
                          <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                            <span className="badge badge-primary" style={{ fontSize: '0.7rem' }}>{mat.grade}</span>
                            <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>{mat.subject}</span>
                          </div>
                        </td>
                        <td><span style={{ fontSize: '0.9rem', color: 'var(--text-muted)' }}>{mat.size}</span></td>
                        <td style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>{new Date(mat.createdAt).toLocaleDateString()}</td>
                        <td style={{ textAlign: 'right' }}>
                          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.5rem' }}>
                            <a 
                              href={mat.url} 
                              target="_blank" 
                              rel="noreferrer"
                              className="btn-icon"
                              style={{ background: 'rgba(56, 189, 248, 0.1)', color: '#38bdf8', border: 'none' }}
                              title="Download Asset"
                            >
                              <Download size={18} />
                            </a>
                            <button 
                              onClick={() => handleDelete(mat.id, mat.storagePath)}
                              className="btn-icon"
                              style={{ background: 'rgba(239, 68, 68, 0.1)', color: 'var(--danger)', border: 'none' }}
                              title="Purge Asset"
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

export default ManageMaterials;
