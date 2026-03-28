import React, { createContext, useContext, useEffect, useState } from 'react';
import { auth } from './firebase';
import { onAuthStateChanged, signInAnonymously, User } from 'firebase/auth';

const FirebaseContext = createContext<{ user: User | null; loading: boolean; error: string | null }>({ user: null, loading: true, error: null });

export const FirebaseProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user) {
        setUser(user);
        setLoading(false);
        setError(null);
      } else {
        try {
          await signInAnonymously(auth);
        } catch (err: any) {
          console.error("Error signing in anonymously:", err);
          if (err.code === 'auth/operation-not-allowed') {
            setError("Anonymous authentication is not enabled.");
          } else {
            setError(err.message || "Failed to authenticate.");
          }
          setLoading(false);
        }
      }
    });
    return unsubscribe;
  }, []);

  return (
    <FirebaseContext.Provider value={{ user, loading, error }}>
      {children}
    </FirebaseContext.Provider>
  );
};

export const useFirebase = () => useContext(FirebaseContext);
