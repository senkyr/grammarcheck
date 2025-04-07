exports.submitExercise = async (req, res) => {
  const db = req.db;
  
  try {
    const { exerciseId, studentName, answers } = req.body;
    
    // Vytvoření jednoduchého session tokenu pro identifikaci studenta
    const sessionToken = crypto.randomBytes(16).toString('hex');
    
    // Načtení cvičení
    const exercise = await db.get(
      `SELECT id, challenges, showResultsImmediately, deadline
       FROM exercises WHERE id = ?`,
      [exerciseId]
    );
    
    if (!exercise) {
      return res.status(404).json({ message: 'Cvičení nenalezeno' });
    }
    
    // Převod challenges na objekt
    const challenges = JSON.parse(exercise.challenges);
    
    // Vyhodnocení správnosti odpovědí
    let score = 0;
    const evaluatedAnswers = answers.map(answer => {
      const challenge = challenges.find(
        c => c.id.toString() === answer.challengeId
      );
      
      const isCorrect = challenge && challenge.correctOption === answer.selectedOption;
      if (isCorrect) score++;
      
      return {
        ...answer,
        isCorrect
      };
    });
    
    // Uložení odevzdání do databáze
    const result = await db.run(
      `INSERT INTO submissions (exerciseId, studentName, answers, score, maxScore, sessionToken)
       VALUES (?, ?, ?, ?, ?, ?)`,
      [
        exerciseId,
        studentName,
        JSON.stringify(evaluatedAnswers),
        score,
        challenges.length,
        sessionToken
      ]
    );
    
    // Načtení kompletního odevzdání
    const submission = await db.get(
      `SELECT id, exerciseId, studentName, answers, score, maxScore, sessionToken, submittedAt
       FROM submissions WHERE id = ?`,
      [result.lastID]
    );
    
    // Převod answers na objekt
    submission.answers = JSON.parse(submission.answers);
    
    // Rozhodnutí, zda vrátit výsledky okamžitě nebo ne
    if (exercise.showResultsImmediately === 1) {
      res.status(201).json({ 
        submission,
        showResults: true
      });
    } else {
      res.status(201).json({ 
        message: 'Cvičení odevzdáno',
        sessionToken,
        showResults: false
      });
    }
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

exports.getSubmissionResults = async (req, res) => {
  const db = req.db;
  
  try {
    const { sessionToken } = req.params;
    
    // Načtení odevzdání
    const submission = await db.get(
      `SELECT s.id, s.exerciseId, s.studentName, s.answers, s.score, s.maxScore, s.submittedAt,
              e.showResultsImmediately, e.deadline
       FROM submissions s
       JOIN exercises e ON s.exerciseId = e.id
       WHERE s.sessionToken = ?`,
      [sessionToken]
    );
    
    if (!submission) {
      return res.status(404).json({ message: 'Výsledek nenalezen' });
    }
    
    // Převod answers na objekt
    submission.answers = JSON.parse(submission.answers);
    
    // Kontrola, zda už je po deadlinu nebo zda je povoleno okamžité zobrazení
    const now = new Date();
    
    if (submission.showResultsImmediately === 1 || 
        (submission.deadline && new Date(submission.deadline) < now)) {
      res.status(200).json(submission);
    } else {
      res.status(403).json({ 
        message: 'Výsledky ještě nejsou k dispozici',
        availableAt: submission.deadline
      });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
