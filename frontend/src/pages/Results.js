import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useTheme } from '../contexts/ThemeContext';
import Loading from '../components/Loading';
import '../styles/Results.css';

const Results = () => {
  const { theme } = useTheme();
  const { token } = useParams();
  const [results, setResults] = useState(null);
  const [exercise, setExercise] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchResults = async () => {
      try {
        const response = await fetch(`/api/submissions/${token}`);
        
        if (!response.ok) {
          throw new Error(
            response.status === 403 
              ? 'Výsledky ještě nejsou k dispozici' 
              : 'Nepodařilo se načíst výsledky'
          );
        }
        
        const data = await response.json();
        setResults(data);
        
        // Načtení detailů cvičení
        const exerciseResponse = await fetch(`/api/exercises/${data.exerciseId}`);
        if (exerciseResponse.ok) {
          const exerciseData = await exerciseResponse.json();
          setExercise(exerciseData);
        }
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };
    
    fetchResults();
  }, [token]);

  if (loading) return <Loading />;
  if (error) return <div className="error-message">{error}</div>;
  if (!results || !exercise) return <div className="error-message">Výsledky nenalezeny</div>;

  const percentage = Math.round((results.score / results.maxScore) * 100);

  return (
    <div className="results-page" style={{ backgroundColor: theme.background }}>
      <div className="results-container">
        <h1 style={{ color: theme.primary, fontFamily: theme.fontFamily }}>
          Výsledky cvičení
        </h1>
        
        <div className="student-info">
          <p style={{ color: theme.text, fontFamily: theme.fontFamily }}>
            Student: <strong>{results.studentName}</strong>
          </p>
          <p style={{ color: theme.text, fontFamily: theme.fontFamily }}>
            Cvičení: <strong>{exercise.title}</strong>
          </p>
          <p style={{ color: theme.text, fontFamily: theme.fontFamily }}>
            Odevzdáno: <strong>{new Date(results.submittedAt).toLocaleString()}</strong>
          </p>
        </div>
        
        <div 
          className="score-card"
          style={{ 
            borderColor: theme.primary,
            backgroundColor: theme.secondary + '30' // 30% opacity
          }}
        >
          <div className="score">
            <h2 style={{ color: theme.primary, fontFamily: theme.fontFamily }}>
              {percentage}%
            </h2>
            <p style={{ color: theme.text, fontFamily: theme.fontFamily }}>
              {results.score} / {results.maxScore} správně
            </p>
          </div>
          
          {percentage >= 90 ? (
            <p style={{ color: 'green', fontFamily: theme.fontFamily }}>Výborně!</p>
          ) : percentage >= 75 ? (
            <p style={{ color: 'darkgreen', fontFamily: theme.fontFamily }}>Velmi dobře!</p>
          ) : percentage >= 60 ? (
            <p style={{ color: 'orange', fontFamily: theme.fontFamily }}>Dobře, ale ještě to chce procvičit.</p>
          ) : (
            <p style={{ color: 'darkred', fontFamily: theme.fontFamily }}>Je potřeba více procvičování.</p>
          )}
        </div>
        
        <div className="answer-review">
          <h3 style={{ color: theme.primary, fontFamily: theme.fontFamily }}>
            Přehled odpovědí
          </h3>
          
          <ul className="answer-list">
            {results.answers.map((answer, index) => {
              const challenge = exercise.challenges.find(
                c => c._id === answer.challengeId
              );
              
              if (!challenge) return null;
              
              return (
                <li 
                  key={index}
                  className={`answer-item ${answer.isCorrect ? 'correct' : 'incorrect'}`}
                  style={{ 
                    borderColor: answer.isCorrect ? 'green' : 'red',
                    backgroundColor: answer.isCorrect ? 'rgba(0, 128, 0, 0.1)' : 'rgba(255, 0, 0, 0.1)'
                  }}
                >
                  <div className="answer-content">
                    <span style={{ fontFamily: theme.fontFamily }}>
                      <strong>Vaše odpověď:</strong> {answer.selectedOption}
                    </span>
                    
                    {!answer.isCorrect && (
                      <span 
                        className="correct-answer"
                        style={{ color: 'green', fontFamily: theme.fontFamily }}
                      >
                        <strong>Správně:</strong> {challenge.correctOption}
                      </span>
                    )}
                  </div>
                  <div className="answer-status">
                    {answer.isCorrect ? '✓' : '✗'}
                  </div>
                </li>
              );
            })}
          </ul>
        </div>
        
        <div className="buttons">
          <Link 
            to="/exercises"
            className="button-link"
            style={{
              backgroundColor: theme.primary,
              color: 'white',
              fontFamily: theme.fontFamily
            }}
          >
            Další cvičení
          </Link>
        </div>
      </div>
    </div>
  );
};

export default Results;
