
import React, { createContext, useContext, useEffect, useState } from 'react';

type Theme = 'light' | 'dark';

interface ThemeContextType {
  theme: Theme;
  toggleTheme: () => void;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
};

interface ThemeProviderProps {
  children: React.ReactNode;
}

export const ThemeProvider = ({ children }: ThemeProviderProps) => {
  const [theme, setTheme] = useState<Theme>(() => {
    // Check localStorage or default to light
    const saved = localStorage.getItem('theme') as Theme;
    return saved || 'light';
  });

  const toggleTheme = () => {
    setTheme(prev => prev === 'light' ? 'dark' : 'light');
  };

  useEffect(() => {
    // Update localStorage
    localStorage.setItem('theme', theme);
    
    // Update document class
    const root = document.documentElement;
    if (theme === 'dark') {
      root.classList.add('dark');
    } else {
      root.classList.remove('dark');
    }

    // Update favicon based on theme
    const updateFavicon = () => {
      const link = document.querySelector("link[rel*='icon']") as HTMLLinkElement || document.createElement('link');
      link.type = 'image/x-icon';
      link.rel = 'shortcut icon';
      
      // Use placeholder SVG icons for now since we don't have the actual favicon files
      if (theme === 'dark') {
        // Dark theme favicon - light icon on dark background
        link.href = 'data:image/svg+xml;base64,' + btoa(`
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 32 32" fill="white">
            <circle cx="16" cy="16" r="12" fill="white"/>
            <path d="M16 8v16M8 16h16" stroke="black" stroke-width="2"/>
          </svg>
        `);
      } else {
        // Light theme favicon - dark icon on light background
        link.href = 'data:image/svg+xml;base64,' + btoa(`
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 32 32" fill="black">
            <circle cx="16" cy="16" r="12" fill="black"/>
            <path d="M16 8v16M8 16h16" stroke="white" stroke-width="2"/>
          </svg>
        `);
      }
      
      document.getElementsByTagName('head')[0].appendChild(link);
    };

    updateFavicon();
  }, [theme]);

  return (
    <ThemeContext.Provider value={{ theme, toggleTheme }}>
      {children}
    </ThemeContext.Provider>
  );
};
