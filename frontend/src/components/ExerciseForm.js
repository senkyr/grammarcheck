import React, { useState } from 'react';
import { useTheme } from '../contexts/ThemeContext';
import '../styles/ExerciseForm.css';

const ExerciseForm = ({ onSubmit }) => {
  const { theme } = useTheme();
  const [title, setTitle] = useState('');
  const [text, setText] = useState('');
  const [showResultsImmediately, setShowResultsImmediately] = useState(true);
  const [deadline, setDeadline] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    
    if (!title.trim() || !text.trim()) {
      setError('Vyplňte prosím název a text cvičení');
      return;
    }
    
    // Vytvoření objektu s daty cvičení
    const exerciseData = {
      title,
      text,
      showResultsImmediately
    };
    
    // Přidání deadline, pokud je nastaveno
    if (deadline) {
      exerciseData.deadline = new Date(deadline);
    }
    
    onSubmit(exerciseData);
    
    // Reset formuláře
    setTitle('');
    setText('');
    setShowResultsImmediately(true);
    setDeadline('');
    setError('');
  };

  return (
    <div className="exercise-form-container">
      <h2 style={{ color: theme.primary, fontFamily: theme.fontFamily }}>
        Vytvořit nové cvičení
      </h2>
      
      {error && (
        <div className="error-message" style={{ color: 'red', fontFamily: theme.fontFamily }}>
          {error}
        </div>
      )}
      
      <form onSubmit={handleSubmit} className="exercise-form">
        <div className="form-group">
          <label htmlFor="title" style={{ color: theme.text, fontFamily: theme.fontFamily }}>
            Název cvičení
          </label>
          <input
            type="text"
            id="title"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            style={{
              borderColor: theme.primary,
              color: theme.text,
              fontFamily: theme.fontFamily
            }}
          />
        </div>
        
        <div className="form-group">
          <label htmlFor="text" style={{ color: theme.text, fontFamily: theme.fontFamily }}>
            Text cvičení
          </label>
          <p className="form-description" style={{ color: theme.text, fontFamily: theme.fontFamily }}>
            Zadejte text s pravopisnými jevy. Systém automaticky identifikuje problematická místa.
          </p>
          <textarea
            id="text"
            value={text}
            onChange={(e) => setText(e.target.value)}
            rows={10}
            style={{
              borderColor: theme.primary,
              color: theme.text,
              fontFamily: theme.fontFamily
            }}
          />
        </div>
        
        <div className="form-group">
          <label style={{ color: theme.text, fontFamily: theme.fontFamily }}>
            Zobrazení výsledků
          </label>
          <div className="radio-group">
            <label className="radio-label" style={{ fontFamily: theme.fontFamily }}>
              <input
                type="radio"
                checked={showResultsImmediately}
                onChange={() => setShowResultsImmediately(true)}
              />
              Zobrazit výsledky ihned po odevzdání
            </label>
            <label className="radio-label" style={{ fontFamily: theme.fontFamily }}>
              <input
                type="radio"
                checked={!showResultsImmediately}
                onChange={() => setShowResultsImmediately(false)}
              />
              Zobrazit výsledky až po termínu
            </label>
          </div>
        </div>
        
        {!showResultsImmediately && (
          <div className="form-group">
            <label htmlFor="deadline" style={{ color: theme.text, fontFamily: theme.fontFamily }}>
              Termín (deadline)
            </label>
            <input
              type="datetime-local"
              id="deadline"
              value={deadline}
              onChange={(e) => setDeadline(e.target.value)}
              style={{
                borderColor: theme.primary,
                color: theme.text,
                fontFamily: theme.fontFamily
              }}
            />
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
          Vytvořit cvičení
        </button>
      </form>
    </div>
  );
};

export default ExerciseForm;
