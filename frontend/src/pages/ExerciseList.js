import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useTheme } from '../contexts/ThemeContext';
import Loading from '../components/Loading';
import '../styles/ExerciseList.css';

const ExerciseList = () => {
  const { theme } = useTheme();
  const [exercises, setExercises] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [studentName] = useState(localStorage.getItem('studentName') || '');

  useEffect(() => {
    const fetchExercises = async () => {
      try {
        setLoading(true);
        // V reálné aplikaci by byl API endpoint
        // Nyní použijeme mock data pro demonstraci
        
        // Simulace načítání dat
        setTimeout(() => {
          const mockExercises = [
            {
              id: 1,
              title: 'Vyjmenovaná slova',
              createdAt: '2025-04-05T12:00:00Z',
              active: true,
              difficulty: 2 // 1-3, kde 3 je nejtěžší
            },
            {
              id: 2,
              title: 'Předpony s/z',
              createdAt: '2025-04-06T14:30:00Z',
              active: true,
              difficulty: 3
            },
            {
              id: 3,
              title: 'Shoda podmětu s přísudkem',
              createdAt: '2025-04-07T09:15:00Z',
              active: true,
              difficulty: 3
            }
          ];
          
          setExercises(mockExercises);
          setLoading(false);
        }, 1000);
        
      } catch (err) {
        setError('Nepodařilo se načíst cvičení');
        setLoading(false);
      }
    };
    
    fetchExercises();
  }, []);

  // Funkce pro zobrazení hvězdiček obtížnosti
  const renderDifficulty = (level) => {
    const stars = [];
    for (let i = 0; i < 3; i++) {
      stars.push(
        <span key={i} style={{ color: i < level ? 'gold' : '#ccc' }}>
          ★
        </span>
      );
    }
    return stars;
  };

  if (loading) return <Loading />;

  return (
    <div className="exercise-list-page" style={{ backgroundColor: theme.background }}>
      <div className="exercise-list-container">
        <h1 style={{ color: theme.primary, fontFamily: theme.fontFamily }}>
          Dostupná cvičení
        </h1>
        
        {studentName && (
          <p style={{ color: theme.text, fontFamily: theme.fontFamily }}>
            Vítej, <strong>{studentName}</strong>
          </p>
        )}
        
        {error && (
          <div className="error-message" style={{ color: 'red', fontFamily: theme.fontFamily }}>
            {error}
          </div>
        )}
        
        {exercises.length === 0 ? (
          <p style={{ color: theme.text, fontFamily: theme.fontFamily }}>
            Žádná cvičení nejsou k dispozici.
          </p>
        ) : (
          <div className="exercises-grid">
            {exercises.map(exercise => (
              <Link 
                to={`/exercise/${exercise.id}`} 
                key={exercise.id}
                className="exercise-card"
                style={{
                  borderColor: theme.secondary,
                  backgroundColor: 'white'
                }}
              >
                <h2 style={{ color: theme.primary, fontFamily: theme.fontFamily }}>
                  {exercise.title}
                </h2>
                
                <div className="exercise-details">
                  <p style={{ color: theme.text, fontFamily: theme.fontFamily }}>
                    Obtížnost: {renderDifficulty(exercise.difficulty)}
                  </p>
                  <p style={{ color: theme.text, fontFamily: theme.fontFamily, fontSize: '0.9rem' }}>
                    Vytvořeno: {new Date(exercise.createdAt).toLocaleDateString()}
                  </p>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default ExerciseList;
