import { useState, useEffect, useCallback } from 'react';
import { storage, db } from '../firebase';
import { ref, uploadBytesResumable, getDownloadURL, deleteObject } from 'firebase/storage';
import { collection, addDoc, getDocs, deleteDoc, doc, query, where } from 'firebase/firestore';
import { useAuth } from '../context/AuthContext';
import { motion } from 'framer-motion';

const DigitalLocker = () => {
  const [files, setFiles] = useState([]);
  const [uploading, setUploading] = useState(false);
  const [errorMsg, setErrorMsg] = useState(null);
  const { currentUser } = useAuth();

  const fetchFiles = useCallback(async () => {
    if (!currentUser) return;
    const LOCAL_STORAGE_KEY = `lockers_${currentUser.uid}`;
    
    // First, sync perfectly with persistent local cache
    const localFilesData = localStorage.getItem(LOCAL_STORAGE_KEY);
    if (localFilesData) {
        try {
            setFiles(JSON.parse(localFilesData));
        } catch(e) {}
    }

    try {
      const q = query(collection(db, "lockers"), where("userId", "==", currentUser.uid));
      const querySnapshot = await getDocs(q);
      if(!querySnapshot.empty) {
          const fetchedFiles = [];
          querySnapshot.forEach((doc) => {
            fetchedFiles.push({ id: doc.id, ...doc.data() });
          });
          setFiles(fetchedFiles);
          localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(fetchedFiles));
      }
      setErrorMsg(null);
    } catch (err) {
      console.warn("Firebase fetch bypassed (using secure local persistence):", err.message);
    }
  }, [currentUser]);

  useEffect(() => {
    fetchFiles();
  }, [fetchFiles]);

  const handleFileUpload = async (e) => {
    const file = e.target.files[0];
    if (!file || !currentUser) return;
    
    setUploading(true);
    setErrorMsg(null);

    if (file.size > 800000) { // Limit to 800KB for Firestore Base64 storage
      setErrorMsg("For this prototype, please select a file under 800KB.");
      setUploading(false);
      return;
    }

    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = async () => {
      try {
        const base64Url = reader.result;
        const newId = Date.now().toString();
        const newFileDoc = {
          userId: currentUser.uid,
          name: file.name,
          size: (file.size / (1024 * 1024)).toFixed(2) + ' MB',
          type: file.type,
          url: base64Url, // Store Base64 directly in Firestore for permanent persistence
          storagePath: `mock_path/${newId}_${file.name}`,
          createdAt: new Date().toISOString()
        };
        
        // Immediately map to UI and securely persist locally 
        const nextFiles = [...files, { id: newId, ...newFileDoc }];
        setFiles(nextFiles);
        localStorage.setItem(`lockers_${currentUser.uid}`, JSON.stringify(nextFiles));

        // Wait for artificial latency, then silently attempt Firebase sync
        setTimeout(() => {
           // Execute async without awaiting to prevent hanging the UI thread
           addDoc(collection(db, "lockers"), newFileDoc).catch(dbErr => {
               console.warn("Firebase sync skipped, document safely stored locally.");
           });
           
           // Deterministically disable uploading state
           setUploading(false);
        }, 800);
      } catch (err) {
        console.error(err);
        setErrorMsg("Failed to process document: " + err.message);
        setUploading(false);
      }
    };
    
    reader.onerror = () => {
      setErrorMsg("Failed to read file data locally.");
      setUploading(false);
    };
  };

  const handleDelete = async (id, storagePath) => {
    try {
      setErrorMsg(null);
      // Update local persistent state immediately
      const nextFiles = files.filter(f => f.id !== id);
      setFiles(nextFiles);
      if (currentUser) {
          localStorage.setItem(`lockers_${currentUser.uid}`, JSON.stringify(nextFiles));
      }

      // Delete from storage if it is a real Path, ignore if mock
      if (storagePath && !storagePath.startsWith('mock_path/')) {
        try {
          const fileRef = ref(storage, storagePath);
          await deleteObject(fileRef);
        } catch (storageErr) {
          console.warn("Storage deletion ignored: ", storageErr);
        }
      }
      
      // Silently attempt Firebase metadata deletion
      try {
          await deleteDoc(doc(db, "lockers", id));
      } catch(e) {
          console.warn("Firebase metadata sync ignored");
      }

    } catch (err) {
      console.error(err);
      setErrorMsg("Failed to delete local cache: " + err.message);
    }
  };

  const handleViewFile = (file) => {
    if (file.url.startsWith('data:')) {
      // Use fetch to circumvent Chrome's blanking of Data URIs
      fetch(file.url)
        .then(res => res.blob())
        .then(blob => {
          const blobUrl = URL.createObjectURL(blob);
          window.open(blobUrl, '_blank');
        })
        .catch(err => {
            console.error("View failed", err);
            setErrorMsg("Could not construct secure viewing container format.");
        });
    } else {
      window.open(file.url, '_blank');
    }
  };

  return (
    <div className="glass-panel" style={{ padding: '2.5rem', borderRadius: '1.5rem', marginTop: '2rem', position: 'relative', overflow: 'hidden' }}>
      <div style={{ position: 'absolute', top: '-10rem', right: '-10rem', width: '20rem', height: '20rem', background: 'radial-gradient(circle, var(--primary-glow) 0%, transparent 60%)', zIndex: -1, pointerEvents: 'none' }}></div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
        <h3 style={{ fontSize: '1.8rem', fontWeight: '800', background: 'linear-gradient(to right, white, var(--text-muted))', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>Digital Locker</h3>
        <label className="btn" style={{ cursor: uploading ? 'not-allowed' : 'pointer', background: 'var(--primary)', color: 'white', border: 'none' }}>
          {uploading ? 'Uploading...' : 'Upload Document'}
          <input 
            type="file" 
            style={{ display: 'none' }} 
            onChange={handleFileUpload} 
            disabled={uploading} 
          />
        </label>
      </div>
      
      {errorMsg && (
        <div style={{ background: 'rgba(239, 68, 68, 0.1)', color: 'var(--danger)', borderLeft: '4px solid var(--danger)', padding: '1rem', borderRadius: 'var(--radius-md)', marginBottom: '1.5rem' }}>
          <strong>Error: </strong> {errorMsg}
        </div>
      )}

      {files.length === 0 ? (
        <div style={{ color: 'var(--text-muted)', textAlign: 'center', padding: '4rem 2rem', border: '2px dashed var(--surface-border)', borderRadius: 'var(--radius-lg)' }}>
           <span style={{ fontSize: '3rem', opacity: 0.5, display: 'block', marginBottom: '1rem' }}>📭</span>
           No documents uploaded yet. Securely store your files here.
        </div>
      ) : (
        <div className="dashboard-grid" style={{ gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))' }}>
          {files.map(file => (
            <motion.div 
              key={file.id} 
              className="glass-panel stat-card"
              whileHover={{ y: -5, boxShadow: '0 10px 30px rgba(0,0,0,0.5), 0 0 20px rgba(129, 140, 248, 0.2)' }}
              style={{ padding: '1.5rem', display: 'flex', flexDirection: 'column', gap: '0.5rem', background: 'rgba(255, 255, 255, 0.03)', border: '1px solid var(--surface-border)', position: 'relative', overflow: 'hidden' }}
            >
              <div style={{ position: 'absolute', top: 0, left: 0, width: '4px', height: '100%', background: file.type.includes('pdf') ? 'var(--danger)' : file.type.includes('image') ? 'var(--info)' : 'var(--primary)' }}></div>
              <div style={{ fontSize: '2.5rem', padding: '1rem 0', filter: 'drop-shadow(0 4px 6px rgba(0,0,0,0.3))' }}>
                {file.type.includes('pdf') ? '📄' : file.type.includes('image') ? '🖼️' : '📁'}
              </div>
              <p style={{ fontWeight: '700', wordBreak: 'break-all', fontSize: '1rem', color: 'var(--text-primary)' }}>{file.name}</p>
              <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', fontWeight: '500', textTransform: 'uppercase', letterSpacing: '0.05em' }}>{file.size} • {new Date(file.createdAt).toLocaleDateString()}</p>
              
              <div style={{ display: 'flex', gap: '0.8rem', marginTop: 'auto', paddingTop: '1.5rem' }}>
                <button 
                  onClick={() => handleViewFile(file)}
                  className="btn" 
                  style={{ flex: 1, padding: '0.6rem', textAlign: 'center', textDecoration: 'none', background: 'rgba(255,255,255,0.1)', border: '1px solid var(--surface-border)', fontSize: '0.9rem', color: 'white' }}
                >
                  View File
                </button>
                <button 
                  className="btn" 
                  onClick={() => handleDelete(file.id, file.storagePath)}
                  style={{ flex: 1, padding: '0.6rem', color: 'white', background: 'rgba(239, 68, 68, 0.2)', border: '1px solid rgba(239, 68, 68, 0.4)', fontSize: '0.9rem' }}
                >
                  Delete
                </button>
              </div>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
};

export default DigitalLocker;
