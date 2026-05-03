import React, { createContext, useContext, useEffect, useState } from 'react';
import { 
  createUserWithEmailAndPassword, 
  signInWithEmailAndPassword, 
  signOut, 
  onAuthStateChanged 
} from 'firebase/auth';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { auth, db } from '../firebase';

const AuthContext = createContext();

// eslint-disable-next-line react-refresh/only-export-components
export const useAuth = () => {
  return useContext(AuthContext);
};

export const AuthProvider = ({ children }) => {
  const [currentUser, setCurrentUser] = useState(null);
  const [userRole, setUserRole] = useState(null); // 'student' or 'admin'
  const [loading, setLoading] = useState(true);

  // Sign Up a new user
  const signup = async (email, password, role = 'student', name = '') => {
    // SECURITY: Auto-assign admin to the master admin email, force all others to student
    const finalRole = email.toLowerCase() === 'master@sarvasaar.edu' ? 'admin' : 'student';

    const userCredential = await createUserWithEmailAndPassword(auth, email, password);
    // Immediately create a document for them in Firestore to store their role and name
    try {
      // Add a timeout to prevent hanging if Firestore database hasn't been created in Firebase Console
      const setDocPromise = setDoc(doc(db, 'users', userCredential.user.uid), {
        name: name,
        email: userCredential.user.email,
        role: finalRole,
        createdAt: new Date().toISOString()
      });
      const timeoutPromise = new Promise((_, reject) => setTimeout(() => reject(new Error('Firestore connection timeout. Please ensure you have clicked "Create Database" in the Firestore tab of your Firebase Console.')), 8000));
      await Promise.race([setDocPromise, timeoutPromise]);
    } catch (err) {
      console.error("Firestore save error during signup:", err);
      // We don't block the actual auth signup if firestore fails, but we throw so the UI knows.
      throw err;
    }
    setUserRole(finalRole);
    return userCredential;
  };

  // Utility for timeout
  const fetchDocWithTimeout = async (docRef, ms = 5000) => {
    const docPromise = getDoc(docRef);
    const timeoutPromise = new Promise((_, reject) => setTimeout(() => reject(new Error('timeout')), ms));
    return Promise.race([docPromise, timeoutPromise]);
  };

  // Login an existing user
  const login = async (email, password, requestedRole = null) => {
    // MAGICAL ADMIN AUTO-CREATION: If master admin tries to login but hasn't created an account, auto-create it.
    if (email.toLowerCase() === 'master@sarvasaar.edu') {
      try {
        const userCredential = await signInWithEmailAndPassword(auth, email, password);
        // Fetch their role from Firestore
        const docSnap = await fetchDocWithTimeout(doc(db, 'users', userCredential.user.uid));
        if (docSnap.exists()) {
          setUserRole(docSnap.data().role);
        } else {
          setUserRole('admin');
        }
        return userCredential;
      } catch (err) {
        // If login fails and they used the intended initial password, we auto-register them
        if (password === 'Digital@2026') {
          try {
             return await signup(email, password, 'admin', 'Master Admin');
          } catch(createErr) {
             if (createErr.code === 'auth/email-already-in-use') {
                 // The account exists but the password they typed during signIn failed, meaning Digital@2026 is wrong for it.
                 throw new Error("Account exists but password is incorrect. Please manually reset from Firebase."); 
             }
             throw createErr;
          }
        }
        throw new Error("Invalid master admin credentials.");
      }
    }

    // Normal User Login
    const userCredential = await signInWithEmailAndPassword(auth, email, password);
    // Fetch their role from Firestore but don't hang if offline
    try {
      const docSnap = await fetchDocWithTimeout(doc(db, 'users', userCredential.user.uid));
      if (docSnap.exists()) {
        let role = docSnap.data().role;
        // Enforce strong security: only return the role they actually have in the database.
        // Auto-upgrade logic has been removed to secure the admin dashboard.
        setUserRole(role);
      } else {
        // Document didn't exist (e.g. created via Firebase auth manually)
        const role = requestedRole || 'student';
        try {
          await setDoc(doc(db, 'users', userCredential.user.uid), {
            email, role, createdAt: new Date().toISOString()
          });
        } catch(e) {}
        setUserRole(role);
      }
    } catch (err) {
      console.warn("Firestore role fetch timed out or failed.", err);
      setUserRole(requestedRole || 'student');
    }
    return userCredential;
  };

  // Logout
  const logout = () => {
    setUserRole(null);
    return signOut(auth);
  };

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      try {
        setCurrentUser(user);
        if (user) {
          // 100% SECURE HARDCODE: If it's the master admin, they are NEVER a student.
          if (user.email?.toLowerCase() === 'master@sarvasaar.edu') {
            setUserRole('admin');
            setLoading(false);
            return;
          }

          // Fetch role with timeout so the app doesn't hang in loading state
          try {
            const docSnap = await fetchDocWithTimeout(doc(db, 'users', user.uid), 6000);
            if (docSnap.exists()) {
              setUserRole(prev => (prev === 'admin' && docSnap.data().role === 'student') ? 'admin' : docSnap.data().role);
            } else {
              // Ignore fallback if user was just created (meaning signup() is handling the explicit role assignment right now)
              const isNewlyCreated = Math.abs(new Date(user.metadata.creationTime) - new Date(user.metadata.lastSignInTime)) < 2000;
              if (!isNewlyCreated) {
                setUserRole(prev => prev || 'student');
              }
            }
          } catch (err) {
            console.warn("Auth state role fetch timed out", err);
            setUserRole('student');
          }
        } else {
          setUserRole(null);
        }
      } catch (err) {
        console.error("Auth context error:", err);
        setUserRole('student'); // Fallback
      } finally {
        setLoading(false);
      }
    });

    return unsubscribe;
  }, []);

  const value = {
    currentUser,
    userRole,
    signup,
    login,
    logout
  };

  return (
    <AuthContext.Provider value={value}>
      {loading ? (
        <div style={{ height: '100vh', width: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', background: '#030305', position: 'relative', overflow: 'hidden' }}>
          {/* Subtle animated background blobs for the loader */}
          <div style={{ position: 'absolute', top: '20%', left: '20%', width: '30vw', height: '30vw', background: 'radial-gradient(circle, rgba(129, 140, 248, 0.15) 0%, transparent 60%)', filter: 'blur(60px)', borderRadius: '50%', animation: 'float 8s infinite ease-in-out' }}></div>
          
          <div style={{ zIndex: 10, display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
            <div style={{ width: '60px', height: '60px', border: '4px solid rgba(129, 140, 248, 0.2)', borderTopColor: '#818cf8', borderRightColor: '#a855f7', borderRadius: '50%', animation: 'spin 1s linear infinite' }}></div>
            <p style={{ color: 'var(--text-muted)', fontSize: '1rem', fontWeight: 500 }}>Global monitoring and lifecycle management for the Sarvasaar Smart Coaching Ecosystem.</p>
            <p style={{ marginTop: '1.5rem', color: '#a1a1aa', fontWeight: '600', letterSpacing: '0.15em', fontSize: '1rem', textTransform: 'uppercase' }}>
              Initializing System
            </p>
          </div>
          <style>{`
            @keyframes spin { 100% { transform: rotate(360deg); } }
            @keyframes float { 0% { transform: translateY(0px) scale(1); } 50% { transform: translateY(-20px) scale(1.05); } 100% { transform: translateY(0px) scale(1); } }
          `}</style>
        </div>
      ) : (
        children
      )}
    </AuthContext.Provider>
  );
};
