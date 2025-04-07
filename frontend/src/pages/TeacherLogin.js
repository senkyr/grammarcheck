import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTheme } from '../contexts/ThemeContext';
import '../styles/TeacherLogin.css';

const TeacherLogin = () => {
  const { theme } = useTheme();
  const [accessCode, setAccessCode] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleSubmit = (e) => {
    e.preventDefault();
    
    // Jednoduchá autentizace pomocí přístupového kódu
    // V reálné aplikaci by se kód ověřoval na serveru
    if (accessCode === 'ucitel123') { // Ukázkový přístupový kód
      localStorage.setItem('teacherAuthenticated', 'true');
      navigate('/teacher/dashboard');
    } else {
      setError('Nesprávný přístupový kód');
    }
  };

  return (
    <div className="teacher-login" style={{ backgroundColor: theme.background }}>
      <div className="login-container">
        <h1 style={{ color: theme.primary, fontFamily: theme.fontFamily }}>
          Přihlášení pro učitele
        </h1>
        
        <form onSubmit={handleSubmit} className="login-form">
          <div className="form-group">
            <label htmlFor="accessCode" style={{ color: theme.text, fontFamily: theme.fontFamily }}>
              Zadejte přístupový kód
            </label>
            <input
              type="password"
              id="accessCode"
              value={accessCode}
              onChange={(e) => setAccessCode(e.target.value)}
              required
              style={{
                borderColor: theme.primary,
                color: theme.text,
                fontFamily: theme.fontFamily
              }}
            />
          </div>
          
          {error && (
            <div className="error-message" style={{ color: 'red', fontFamily: theme.fontFamily }}>
              {error}
            </div>
          )}
          
          <button 
            type="submit"
            style={{
              backgroundColor: theme.primary,
              color: 'white',
              fontFamily: theme.fontFamily
            }}
          >
            Přihlásit se
          </button>
        </form>
        
        <div className="back-link">
          <a 
            href="/"
            style={{ color: theme.primary, fontFamily: theme.fontFamily }}
          >
            Zpět na úvodní stránku
          </a>
        </div>
      </div>
    </div>
  );
};

export default TeacherLogin;
