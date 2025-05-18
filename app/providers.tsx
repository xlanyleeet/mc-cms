'use client';

import { useEffect } from 'react';
import { SessionProvider, useSession } from 'next-auth/react';

// Компонент-обгортка для відстеження стану сесії
function AuthStatusLogger({ children }: { children: React.ReactNode }) {
  const { data: session, status } = useSession();
  
  useEffect(() => {
    console.log('Auth Status (Global):', status);
    console.log('Session Data (Global):', session);
  }, [session, status]);
  
  return <>{children}</>;
}

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <SessionProvider>
      <AuthStatusLogger>
        {children}
      </AuthStatusLogger>
    </SessionProvider>
  );
}