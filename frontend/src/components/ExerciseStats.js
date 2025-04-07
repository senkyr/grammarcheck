import React, { useState, useEffect } from 'react';
import { useTheme } from '../contexts/ThemeContext';
import Loading from './Loading';
import '../styles/ExerciseStats.css';

const ExerciseStats = ({ exerciseId }) => {
  const { theme } = useTheme();
  const [stats, setStats] = useState(null);
  const [submissions, setSubmissions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        setLoading(true);
        
        // Načtení statistik cvičení
        const statsResponse = await fetch(`/api/exercises/${exerciseId}/stats`);
        if (!statsResponse.ok) {
          throw new Error('Nepodařilo se načíst statistiky');
        }
        const statsData = await statsResponse.json();
        setStats(statsData);
        
        // Načtení odevzdaných řešení
        const submissionsResponse = await fetch(`/api/exercises/${exerciseId}/submissions`);
        if (!submissionsResponse.ok) {
          throw new Error('Nepodařilo se načíst odevzdané práce');
        }
        const submissionsData = await submissionsResponse.json();
        setSubmissions(submissionsData);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };
    
    fetchStats();
  }, [exerciseId]);

  if (loading) return <Loading />;
  if (error) return <div className="error-message">{error}</div>;
  if (!stats) return <div className="error-message">Statistiky nejsou k dispozici</div>;

  // Výpočet procenta úspěšnosti
  const averageScorePercentage = Math.round((stats.averageScore / stats.maxScore) * 100);

  return (
    <div className="exercise-stats">
      <h2 style={{ color: theme.primary, fontFamily: theme.fontFamily }}>
        Statistiky cvičení
      </h2>
      
      <div 
        className="stats-summary"
        style={{ 
          borderColor: theme.primary,
          backgroundColor: theme.secondary + '20' // 20% opacity
        }}
      >
        <div className="stat-item">
          <h3 style={{ color: theme.primary, fontFamily: theme.fontFamily }}>
            Počet odevzdání
          </h3>
          <p className="stat-value" style={{ fontFamily: theme.fontFamily }}>
            {stats.submissionsCount}
          </p>
        </div>
        
        <div className="stat-item">
          <h3 style={{ color: theme.primary, fontFamily: theme.fontFamily }}>
            Průměrná úspěšnost
          </h3>
          <p className="stat-value" style={{ fontFamily: theme.fontFamily }}>
            {averageScorePercentage}%
          </p>
        </div>
        
        <div className="stat-item">
          <h3 style={{ color: theme.primary, fontFamily: theme.fontFamily }}>
            Nejvyšší skóre
          </h3>
          <p className="stat-value" style={{ fontFamily: theme.fontFamily }}>
            {stats.maxUserScore} / {stats.maxScore}
          </p>
        </div>
      </div>
      
      <h3 style={{ color: theme.primary, fontFamily: theme.fontFamily, marginTop: '30px' }}>
        Problematická místa
      </h3>
      
      {stats.challengeStats && stats.challengeStats.length > 0 ? (
        <div className="challenge-stats">
          <table className="stats-table">
            <thead>
              <tr>
                <th style={{ fontFamily: theme.fontFamily }}>Jev</th>
                <th style={{ fontFamily: theme.fontFamily }}>Úspěšnost</th>
                <th style={{ fontFamily: theme.fontFamily }}>Správná odpověď</th>
              </tr>
            </thead>
            <tbody>
              {stats.challengeStats
                .sort((a, b) => a.successRate - b.successRate) // Seřazení od nejproblematičtějších
                .map((challenge, index) => (
                  <tr key={index}>
                    <td style={{ fontFamily: theme.fontFamily }}>{challenge.text}</td>
                    <td style={{ fontFamily: theme.fontFamily }}>
                      <div className="progress-bar-container">
                        <div 
                          className="progress-bar"
                          style={{ 
                            width: `${challenge.successRate}%`,
                            backgroundColor: challenge.successRate < 50 ? 'red' : 
                                           challenge.successRate < 75 ? 'orange' : 'green'
                          }}
                        ></div>
                        <span className="progress-text">{challenge.successRate}%</span>
                      </div>
                    </td>
                    <td style={{ fontFamily: theme.fontFamily }}>{challenge.correctOption}</td>
                  </tr>
                ))}
            </tbody>
          </table>
        </div>
      ) : (
        <p style={{ color: theme.text, fontFamily: theme.fontFamily }}>
          Zatím nejsou k dispozici statistiky pro jednotlivé jevy.
        </p>
      )}
      
      <h3 style={{ color: theme.primary, fontFamily: theme.fontFamily, marginTop: '30px' }}>
        Odevzdané práce
      </h3>
      
      {submissions.length > 0 ? (
        <table className="submissions-table">
          <thead>
            <tr>
              <th style={{ fontFamily: theme.fontFamily }}>Student</th>
              <th style={{ fontFamily: theme.fontFamily }}>Skóre</th>
              <th style={{ fontFamily: theme.fontFamily }}>Datum odevzdání</th>
            </tr>
          </thead>
          <tbody>
            {submissions.map((submission, index) => (
              <tr key={index}>
                <td style={{ fontFamily: theme.fontFamily }}>{submission.studentName}</td>
                <td style={{ fontFamily: theme.fontFamily }}>
                  {submission.score} / {submission.maxScore} ({Math.round((submission.score / submission.maxScore) * 100)}%)
                </td>
                <td style={{ fontFamily: theme.fontFamily }}>
                  {new Date(submission.submittedAt).toLocaleString()}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      ) : (
        <p style={{ color: theme.text, fontFamily: theme.fontFamily }}>
          Zatím nejsou k dispozici žádné odevzdané práce.
        </p>
      )}
      
      <div className="export-section">
        <button 
          className="export-button"
          style={{
            backgroundColor: theme.secondary,
            color: theme.text,
            fontFamily: theme.fontFamily
          }}
        >
          Exportovat výsledky (CSV)
        </button>
      </div>
    </div>
  );
};

export default ExerciseStats;
