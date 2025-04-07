import React, { createContext, useState, useContext } from 'react';

// Vytvoření kontextu
export const ThemeContext = createContext();

// Hook pro snadnější použití kontextu v komponentách
export const useTheme = () => useContext(ThemeContext);

// Provider komponenta
export const ThemeProvider = ({ children }) => {
  const [theme] = useState({
    primary: '#8B7D6B', // Sépiový tón
    secondary: '#D2B48C', // Světlejší sépiový tón
    background: '#F5F5DC', // Béžové pozadí
    text: '#3E2723', // Tmavý text
    fontFamily: '"Times New Roman", Times, serif' // Klasické písmo
  });

  return (
    <ThemeContext.Provider value={{ theme }}>
      {children}
    </ThemeContext.Provider>
  );
};
