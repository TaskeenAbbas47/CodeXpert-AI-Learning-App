import React, { createContext, useContext, useState, useEffect } from 'react';
import { useColorScheme } from 'react-native';
// Adjust this import path if your theme file is named differently or located elsewhere
import { Colors } from '../utils/theme'; 

type ThemeContextType = {
  isDark: boolean;
  colors: typeof Colors.dark;
  toggleTheme: () => void;
  setTheme: (mode: 'light' | 'dark') => void;
};

// Default safe values
const ThemeContext = createContext<ThemeContextType>({
  isDark: true,
  colors: Colors.dark,
  toggleTheme: () => {},
  setTheme: () => {},
});

export const ThemeProvider = ({ children }: { children: React.ReactNode }) => {
  const systemScheme = useColorScheme();
  // Default to Dark Mode if system preference is unknown, or sync with system
  const [isDark, setIsDark] = useState(systemScheme === 'dark');

  // Optional: Sync with system changes automatically
  useEffect(() => {
    if (systemScheme) {
      setIsDark(systemScheme === 'dark');
    }
  }, [systemScheme]);

  const toggleTheme = () => {
    setIsDark((prev) => !prev);
  };

  const setTheme = (mode: 'light' | 'dark') => {
    setIsDark(mode === 'dark');
  };

  const currentColors = isDark ? Colors.dark : Colors.light;

  return (
    <ThemeContext.Provider value={{ isDark, colors: currentColors, toggleTheme, setTheme }}>
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = () => useContext(ThemeContext);