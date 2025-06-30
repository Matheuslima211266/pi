import React, { useEffect, useState } from 'react';
import { Card } from '@/components/ui/card';
import { getAuth, signInAnonymously, onAuthStateChanged, User as FirebaseUser } from 'firebase/auth';

interface AuthComponentProps {
  onAuth: (user: FirebaseUser) => void;
}

const AuthComponent = ({ onAuth }: AuthComponentProps) => {
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const auth = getAuth();
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user) {
        onAuth(user);
        setLoading(false);
      } else {
        signInAnonymously(auth).catch(() => setLoading(false));
      }
    });
    return () => unsubscribe();
  }, [onAuth]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-purple-900 flex items-center justify-center p-4">
      <Card className="w-full max-w-md p-6 bg-slate-800/90 border-gold-400 text-center">
        <h1 className="text-2xl font-bold text-white mb-2">SIMULATORE SUPREMO</h1>
        <p className="text-gray-400 mb-4">Accesso anonimo in corso...</p>
        {loading && <div className="text-gold-400">Loading...</div>}
      </Card>
    </div>
  );
};

export default AuthComponent;
