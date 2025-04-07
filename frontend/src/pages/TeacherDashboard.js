import React, { useState, useEffect } from 'react';
import { Navigate } from 'react-router-dom';
import { useTheme } from '../contexts/ThemeContext';
import Loading from '../components/Loading';
import ExerciseForm from '../components/ExerciseForm';
import ExerciseStats from '../components/ExerciseStats';
import '../styles/TeacherDashboard.css';

const TeacherDashboard = () => {
  const { theme } = useTheme();
  const [isAuthenticated, setIsAuthenticated] = useState(true);
  const [exercises, setExercises] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState('exercises');
  const [selectedExercise, setSelectedExercise] = useState(null);

  useEffect(() => {
    // Ověření autentizace učitele
    const authenticated = localStorage.getItem('teacherAuthenticated') === 'true';
    setIsAuthenticated(authenticated);
    
    if (authenticated) {
      fetchExercises();
    }
  }, []);

  const fetchExercises = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/exercises');
      
      if (!response.ok) {
        throw new Error('Nepodařilo se načíst cvičení');
      }
      
      const data = await response.json();
      setExercises(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateExercise = async (newExercise) => {
    try {
      setLoading(true);
      const response = await fetch('/api/exercises', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(newExercise)
      });
      
      if (!response.ok) {
        throw new Error('Nepodařilo se vytvořit cvičení');
      }
      
      // Obnovení seznamu cvičení
      fetchExercises();
      setActiveTab('exercises');
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleToggleStatus = async (exerciseId, currentStatus) => {
    try {
      const response = await fetch(`/api/exercises/${exerciseId}/status`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ active: !currentStatus })
      });
      
      if (!response.ok) {
        throw new Error('Nepodařilo se změnit stav cvičení');
      }
      
      // Aktualizace stavu cvičení v seznamu
      setExercises(exercises.map(ex => 
        ex._id === exerciseId ? { ...ex, active: !currentStatus } : ex
      ));
    } catch (err) {
      setError(err.message);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('teacherAuthenticated');
    setIsAuthenticated(false);
  };

  if (!isAuthenticated) {
    return <Navigate to="/teacher/login" />;
  }

  return (
    <div className="teacher-dashboard" style={{ backgroundColor: theme.background }}>
      <div className="dashboard-header" style={{ backgroundColor: theme.primary }}>
        <h1 style={{ color: 'white', fontFamily: theme.fontFamily }}>
          Administrace pravopisných cvičení
        </h1>
        <button 
          onClick={handleLogout}
          className="logout-button"
          style={{
            backgroundColor: 'white',
            color: theme.primary,
            fontFamily: theme.fontFamily
          }}
        >
          Odhlásit se
        </button>
      </div>
      
      <div className="dashboard-tabs">
        <button 
          className={`tab ${activeTab === 'exercises' ? 'active' : ''}`}
          onClick={() => setActiveTab('exercises')}
          style={{
            backgroundColor: activeTab === 'exercises' ? theme.primary : 'transparent',
            color: activeTab === 'exercises' ? 'white' : theme.primary,
            fontFamily: theme.fontFamily,
            borderColor: theme.primary
          }}
        >
          Seznam cvičení
        </button>
        <button 
          className={`tab ${activeTab === 'create' ? 'active' : ''}`}
          onClick={() => setActiveTab('create')}
          style={{
            backgroundColor: activeTab === 'create' ? theme.primary : 'transparent',
            color: activeTab === 'create' ? 'white' : theme.primary,
            fontFamily: theme.fontFamily,
            borderColor: theme.primary
          }}
        >
          Vytvořit cvičení
        </button>
        {selectedExercise && (
          <button 
            className={`tab ${activeTab === 'stats' ? 'active' : ''}`}
            onClick={() => setActiveTab('stats')}
            style={{
              backgroundColor: activeTab === 'stats' ? theme.primary : 'transparent',
              color: activeTab === 'stats' ? 'white' : theme.primary,
              fontFamily: theme.fontFamily,
              borderColor: theme.primary
            }}
          >
            Výsledky - {selectedExercise.title}
          </button>
        )}
      </div>
      
      <div className="dashboard-content">
        {loading && <Loading />}
        
        {error && (
          <div className="error-message" style={{ color: 'red', fontFamily: theme.fontFamily }}>
            {error}
          </div>
        )}
        
        {activeTab === 'exercises' && !loading && (
          <div className="exercises-list">
            <h2 style={{ color: theme.primary, fontFamily: theme.fontFamily }}>
              Seznam cvičení
            </h2>
            
            {exercises.length === 0 ? (
              <p style={{ color: theme.text, fontFamily: theme.fontFamily }}>
                Zatím nebylo vytvořeno žádné cvičení.
              </p>
            ) : (
              <table className="exercises-table">
                <thead>
                  <tr>
                    <th style={{ fontFamily: theme.fontFamily }}>Název</th>
                    <th style={{ fontFamily: theme.fontFamily }}>Vytvořeno</th>
                    <th style={{ fontFamily: theme.fontFamily }}>Deadline</th>
                    <th style={{ fontFamily: theme.fontFamily }}>Stav</th>
                    <th style={{ fontFamily: theme.fontFamily }}>Akce</th>
                  </tr>
                </thead>
                <tbody>
                  {exercises.map(exercise => (
                    <tr key={exercise._id}>
                      <td style={{ fontFamily: theme.fontFamily }}>{exercise.title}</td>
                      <td style={{ fontFamily: theme.fontFamily }}>
                        {new Date(exercise.createdAt).toLocaleDateString()}
                      </td>
                      <td style={{ fontFamily: theme.fontFamily }}>
                        {exercise.deadline 
                          ? new Date(exercise.deadline).toLocaleDateString() 
                          : 'Není nastaveno'}
                      </td>
                      <td style={{ fontFamily: theme.fontFamily }}>
                        <span 
                          className={`status-badge ${exercise.active ? 'active' : 'inactive'}`}
                          style={{
                            backgroundColor: exercise.active ? 'green' : 'gray',
                            color: 'white'
                          }}
                        >
                          {exercise.active ? 'Aktivní' : 'Neaktivní'}
                        </span>
                      </td>
                      <td>
                        <div className="action-buttons">
                          <button 
                            onClick={() => {
                              setSelectedExercise(exercise);
                              setActiveTab('stats');
                            }}
                            className="view-button"
                            style={{
                              backgroundColor: theme.secondary,
                              color: theme.text,
                              fontFamily: theme.fontFamily
                            }}
                          >
                            Výsledky
                          </button>
                          <button 
                            onClick={() => handleToggleStatus(exercise._id, exercise.active)}
                            className={`toggle-button ${exercise.active ? 'deactivate' : 'activate'}`}
                            style={{
                              backgroundColor: exercise.active ? '#ffcccc' : '#ccffcc',
                              color: theme.text,
                              fontFamily: theme.fontFamily
                            }}
                          >
                            {exercise.active ? 'Deaktivovat' : 'Aktivovat'}
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        )}
        
        {activeTab === 'create' && (
          <ExerciseForm 
            onSubmit={handleCreateExercise} 
            theme={theme} 
          />
        )}
        
        {activeTab === 'stats' && selectedExercise && (
          <ExerciseStats 
            exerciseId={selectedExercise._id} 
            theme={theme} 
          />
        )}
      </div>
    </div>
  );
};

export default TeacherDashboard;
