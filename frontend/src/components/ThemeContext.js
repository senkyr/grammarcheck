import React, { createContext, useState } from 'react';

export const ThemeContext = createContext();

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
