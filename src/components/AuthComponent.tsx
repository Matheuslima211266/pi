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
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <Card className="w-full max-w-md p-6 bg-card/90 border-primary text-center">
        <h1 className="text-2xl font-bold text-foreground mb-2">SIMULATORE SUPREMO</h1>
        <p className="text-muted-foreground mb-4">Anonymous login in progress...</p>
        {loading && <div className="text-primary">Loading...</div>}
      </Card>
    </div>
  );
};

export default AuthComponent;
