import React from 'react';
import { useTheme } from '../contexts/ThemeContext';
import '../styles/Loading.css';

const Loading = () => {
  const { theme } = useTheme();
  
  return (
    <div className="loading-container" style={{ backgroundColor: theme.background }}>
      <div className="spinner" style={{ borderTopColor: theme.primary }}></div>
      <p style={{ color: theme.text, fontFamily: theme.fontFamily }}>Načítání...</p>
    </div>
  );
};

export default Loading;
