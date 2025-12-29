import React, { createContext, useState, useEffect } from 'react';

export const ThemeContext = createContext();

export const ThemeProvider = ({ children }) => {
  const [isDark, setIsDark] = useState(() => {
    // Inicializar desde localStorage o preferencia del sistema
    if (typeof window === 'undefined') return false;
    
    try {
      const saved = localStorage.getItem('theme-dark');
      if (saved !== null) {
        return JSON.parse(saved);
      }
    } catch (e) {
      console.error('Error reading localStorage:', e);
    }
    
    return window.matchMedia('(prefers-color-scheme: dark)').matches;
  });

  // Aplicar clase al HTML root cuando isDark cambia
  useEffect(() => {
    console.log('🌙 Theme updated:', isDark ? 'DARK' : 'LIGHT');
    
    const root = document.documentElement;
    if (isDark) {
      root.classList.add('dark');
      console.log('✅ Added dark class to html element');
    } else {
      root.classList.remove('dark');
      console.log('✅ Removed dark class from html element');
    }
    
    // Guardar en localStorage
    try {
      localStorage.setItem('theme-dark', JSON.stringify(isDark));
      console.log('💾 Saved to localStorage:', isDark);
    } catch (e) {
      console.error('Error saving to localStorage:', e);
    }
  }, [isDark]);

  const toggleTheme = () => {
    console.log('🔄 Toggle clicked. Current isDark:', isDark, 'Setting to:', !isDark);
    setIsDark(prev => {
      const newValue = !prev;
      console.log('📊 State updated from', prev, 'to', newValue);
      return newValue;
    });
  };

  return (
    <ThemeContext.Provider value={{ isDark, toggleTheme }}>
      {children}
    </ThemeContext.Provider>
  );
};
