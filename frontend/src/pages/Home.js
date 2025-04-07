import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTheme } from '../contexts/ThemeContext';
import '../styles/Home.css';

const Home = () => {
  const { theme } = useTheme();
  const [studentName, setStudentName] = useState('');
  const navigate = useNavigate();

  const handleSubmit = (e) => {
    e.preventDefault();
    if (studentName.trim()) {
      // Uložení jména studenta do localStorage pro pozdější použití
      localStorage.setItem('studentName', studentName);
      navigate('/exercises');
    }
  };

  return (
    <div className="home" style={{ backgroundColor: theme.background }}>
      <div className="home-container">
        <h1 style={{ color: theme.primary, fontFamily: theme.fontFamily }}>
          Pravopisná cvičení
        </h1>
        <p style={{ color: theme.text, fontFamily: theme.fontFamily }}>
          Vítejte v aplikaci pro procvičování českého pravopisu.
        </p>
        
        <form onSubmit={handleSubmit} className="student-form">
          <div className="form-group">
            <label htmlFor="studentName" style={{ color: theme.text, fontFamily: theme.fontFamily }}>
              Jak se jmenuješ?
            </label>
            <input
              type="text"
              id="studentName"
              value={studentName}
              onChange={(e) => setStudentName(e.target.value)}
              required
              style={{
                borderColor: theme.primary,
                color: theme.text,
                fontFamily: theme.fontFamily
              }}
            />
          </div>
          <button 
            type="submit"
            style={{
              backgroundColor: theme.primary,
              color: 'white',
              fontFamily: theme.fontFamily
            }}
          >
            Pokračovat
          </button>
        </form>
        
        <div className="teacher-link">
          <a 
            href="/teacher/login"
            style={{ color: theme.primary, fontFamily: theme.fontFamily }}
          >
            Jsem učitel
          </a>
        </div>
      </div>
    </div>
  );
};

export default Home;
