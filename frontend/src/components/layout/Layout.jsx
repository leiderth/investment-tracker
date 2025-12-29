import React, { useEffect } from 'react';
import Navbar from './Navbar.jsx';
import { useAuth } from '../../hooks/useAuth';
import { initializeSocket, disconnectSocket } from '../../services/socketService';

export default function Layout({ children }) {
  const { user, token } = useAuth();

  useEffect(() => {
    if (token) {
      initializeSocket(token);
    }

    return () => {
      // Solo desconectamos al desloguear, no en cada re-render
    };
  }, [token]);

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950 transition-colors duration-200">
      <Navbar />
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {children}
      </main>
    </div>
  );
}