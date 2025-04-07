async function initializeDatabase(db) {
  // Vytvoření tabulky pro cvičení
  await db.exec(`
    CREATE TABLE IF NOT EXISTS exercises (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      title TEXT NOT NULL,
      text TEXT NOT NULL,
      challenges TEXT NOT NULL,
      showResultsImmediately INTEGER DEFAULT 1,
      deadline TEXT,
      active INTEGER DEFAULT 1,
      createdAt TEXT DEFAULT CURRENT_TIMESTAMP
    )
  `);

  // Vytvoření tabulky pro odevzdání
  await db.exec(`
    CREATE TABLE IF NOT EXISTS submissions (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      exerciseId INTEGER NOT NULL,
      studentName TEXT NOT NULL,
      answers TEXT NOT NULL,
      score INTEGER NOT NULL,
      maxScore INTEGER NOT NULL,
      sessionToken TEXT NOT NULL UNIQUE,
      submittedAt TEXT DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (exerciseId) REFERENCES exercises(id)
    )
  `);

  // Vytvoření indexů pro rychlejší vyhledávání
  await db.exec(`
    CREATE INDEX IF NOT EXISTS idx_submissions_exerciseId ON submissions(exerciseId);
    CREATE INDEX IF NOT EXISTS idx_submissions_sessionToken ON submissions(sessionToken);
  `);
}

module.exports = { initializeDatabase };
