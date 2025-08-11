
"use client";

import React, { createContext, useContext, useEffect, useState } from 'react';
import { getAuth, onAuthStateChanged, User, signOut as firebaseSignOut } from 'firebase/auth';
import { app } from '@/lib/firebase'; // Ensure you have firebase configured

interface AuthContextType {
  user: User | null;
  loading: boolean;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  loading: true,
  logout: async () => {},
});

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const auth = getAuth(app);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setUser(user);
      setLoading(false);
    });

    return () => unsubscribe();
  }, [auth]);
  
  const logout = async () => {
    await firebaseSignOut(auth);
    // Clear user-specific data from local storage
    if (user) {
        localStorage.removeItem(`transactions_${user.uid}`);
        localStorage.removeItem(`savingsGoal_${user.uid}`);
        localStorage.removeItem(`savedLoans_${user.uid}`);
    }
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, loading, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
