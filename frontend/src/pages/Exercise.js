import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useTheme } from '../contexts/ThemeContext';
import Loading from '../components/Loading';
import '../styles/Exercise.css';

const Exercise = () => {
  const { theme } = useTheme();
  const { id } = useParams();
  const navigate = useNavigate();
  const [exercise, setExercise] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [answers, setAnswers] = useState({});
  const [studentName] = useState(localStorage.getItem('studentName') || '');

  useEffect(() => {
    const fetchExercise = async () => {
      try {
        const response = await fetch(`/api/exercises/${id}`);
        
        if (!response.ok) {
          throw new Error('Cvičení se nepodařilo načíst');
        }
        
        const data = await response.json();
        setExercise(data);
        
        // Inicializace prázdných odpovědí
        const initialAnswers = {};
        data.challenges.forEach(challenge => {
          initialAnswers[challenge._id] = '';
        });
        setAnswers(initialAnswers);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };
    
    fetchExercise();
  }, [id]);

  const handleOptionSelect = (challengeId, option) => {
    setAnswers(prev => ({
      ...prev,
      [challengeId]: option
    }));
  };

  const handleSubmit = async () => {
    // Kontrola, zda jsou vyplněna všechna pole
    const unanswered = Object.values(answers).some(answer => answer === '');
    
    if (unanswered) {
      alert('Prosím vyplňte všechny odpovědi před odevzdáním.');
      return;
    }
    
    try {
      const formattedAnswers = Object.entries(answers).map(([challengeId, selectedOption]) => ({
        challengeId,
        selectedOption
      }));
      
      const response = await fetch('/api/submissions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          exerciseId: id,
          studentName,
          answers: formattedAnswers
        })
      });
      
      if (!response.ok) {
        throw new Error('Nepodařilo se odeslat odpovědi');
      }
      
      const result = await response.json();
      
      if (result.showResults) {
        // Přesměrování na stránku s výsledky
        navigate(`/results/${result.submission.sessionToken}`);
      } else {
        // Přesměrování na stránku s potvrzením a informací o deadlinu
        alert(`Cvičení úspěšně odevzdáno! ${result.message}`);
        navigate('/exercises');
      }
    } catch (err) {
      setError(err.message);
    }
  };

  if (loading) return <Loading />;
  if (error) return <div className="error-message">{error}</div>;
  if (!exercise) return <div className="error-message">Cvičení nenalezeno</div>;

  // Rozdělení textu na části podle výzev
  const renderText = () => {
    if (!exercise || !exercise.challenges) return <p>{exercise?.text}</p>;
    
    const sortedChallenges = [...exercise.challenges].sort((a, b) => 
      a.position.start - b.position.start
    );
    
    const textParts = [];
    let lastIndex = 0;
    
    sortedChallenges.forEach((challenge, index) => {
      // Text před výzvou
      if (challenge.position.start > lastIndex) {
        textParts.push(
          <span key={`text-${index}`}>
            {exercise.text.substring(lastIndex, challenge.position.start)}
          </span>
        );
      }
      
      // Dropdown s možnostmi
      textParts.push(
        <select
          key={`challenge-${challenge._id}`}
          value={answers[challenge._id] || ''}
          onChange={(e) => handleOptionSelect(challenge._id, e.target.value)}
          className="option-select"
          style={{ 
            borderColor: theme.primary,
            color: theme.text,
            fontFamily: theme.fontFamily,
            backgroundColor: answers[challenge._id] ? theme.secondary : 'white',
          }}
        >
          <option value="">?</option>
          {challenge.options.map((option, i) => (
            <option key={i} value={option}>
              {option}
            </option>
          ))}
        </select>
      );
      
      lastIndex = challenge.position.end;
    });
    
    // Text po poslední výzvě
    if (lastIndex < exercise.text.length) {
      textParts.push(
        <span key="text-end">
          {exercise.text.substring(lastIndex)}
        </span>
      );
    }
    
    return textParts;
  };

  return (
    <div className="exercise-page" style={{ backgroundColor: theme.background }}>
      <div className="exercise-container">
        <h1 style={{ color: theme.primary, fontFamily: theme.fontFamily }}>
          {exercise.title}
        </h1>
        
        <div 
          className="exercise-text"
          style={{ 
            color: theme.text, 
            fontFamily: theme.fontFamily,
            borderColor: theme.secondary
          }}
        >
          {renderText()}
        </div>
        
        <div className="student-info">
          <p style={{ color: theme.text, fontFamily: theme.fontFamily }}>
            Student: <strong>{studentName}</strong>
          </p>
        </div>
        
        <button 
          onClick={handleSubmit}
          className="submit-button"
          style={{
            backgroundColor: theme.primary,
            color: 'white',
            fontFamily: theme.fontFamily
          }}
        >
          Odevzdat
        </button>
      </div>
    </div>
  );
};

export default Exercise;
