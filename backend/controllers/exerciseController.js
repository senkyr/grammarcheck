const natural = require('natural');
const tokenizer = new natural.WordTokenizer();
const crypto = require('crypto');

exports.createExercise = async (req, res) => {
  const db = req.db;
  
  try {
    const { title, text, showResultsImmediately = true, deadline = null } = req.body;
    
    // Automatická analýza textu pro nalezení pravopisných výzev
    const challenges = analyzeText(text);
    
    // Uložení cvičení do SQLite databáze
    const result = await db.run(
      `INSERT INTO exercises (title, text, challenges, showResultsImmediately, deadline, active)
       VALUES (?, ?, ?, ?, ?, ?)`,
      [
        title, 
        text, 
        JSON.stringify(challenges), 
        showResultsImmediately ? 1 : 0, 
        deadline, 
        1
      ]
    );
    
    // Získání ID nově vytvořeného cvičení
    const exerciseId = result.lastID;
    
    // Načtení kompletního cvičení
    const exercise = await db.get(
      `SELECT id, title, text, challenges, showResultsImmediately, deadline, active, createdAt
       FROM exercises WHERE id = ?`,
      [exerciseId]
    );
    
    // Převod challenges zpět na objekt
    exercise.challenges = JSON.parse(exercise.challenges);
    
    // Převod SQLite boolean (0/1) na JavaScript boolean
    exercise.showResultsImmediately = exercise.showResultsImmediately === 1;
    exercise.active = exercise.active === 1;
    
    res.status(201).json(exercise);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

exports.getExercises = async (req, res) => {
  const db = req.db;
  
  try {
    const exercises = await db.all(
      `SELECT id, title, text, challenges, showResultsImmediately, deadline, active, createdAt
       FROM exercises ORDER BY createdAt DESC`
    );
    
    // Převod hodnot pro každé cvičení
    const processedExercises = exercises.map(exercise => ({
      ...exercise,
      challenges: JSON.parse(exercise.challenges),
      showResultsImmediately: exercise.showResultsImmediately === 1,
      active: exercise.active === 1
    }));
    
    // Pro studenty neposíláme správné odpovědi
    const exercisesForStudents = processedExercises.map(exercise => ({
      ...exercise,
      challenges: exercise.challenges.map(c => ({
        ...c,
        correctOption: undefined
      }))
    }));
    
    res.status(200).json(exercisesForStudents);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.getExerciseById = async (req, res) => {
  const db = req.db;
  
  try {
    const exercise = await db.get(
      `SELECT id, title, text, challenges, showResultsImmediately, deadline, active, createdAt
       FROM exercises WHERE id = ?`,
      [req.params.id]
    );
    
    if (!exercise) {
      return res.status(404).json({ message: 'Cvičení nenalezeno' });
    }
    
    // Převod hodnot
    exercise.challenges = JSON.parse(exercise.challenges);
    exercise.showResultsImmediately = exercise.showResultsImmediately === 1;
    exercise.active = exercise.active === 1;
    
    // Pro studenty neposíláme správné odpovědi
    const exerciseForStudent = {
      ...exercise,
      challenges: exercise.challenges.map(c => ({
        ...c,
        correctOption: undefined
      }))
    };
    
    res.status(200).json(exerciseForStudent);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.updateExercise = async (req, res) => {
  const db = req.db;
  
  try {
    const { title, text, showResultsImmediately, deadline, active } = req.body;
    
    // Získání aktuálního cvičení
    const currentExercise = await db.get(
      `SELECT * FROM exercises WHERE id = ?`,
      [req.params.id]
    );
    
    if (!currentExercise) {
      return res.status(404).json({ message: 'Cvičení nenalezeno' });
    }
    
    // Připravení aktualizovaných hodnot
    const updatedTitle = title || currentExercise.title;
    const updatedShowResultsImmediately = showResultsImmediately !== undefined 
      ? (showResultsImmediately ? 1 : 0) 
      : currentExercise.showResultsImmediately;
    const updatedDeadline = deadline !== undefined ? deadline : currentExercise.deadline;
    const updatedActive = active !== undefined ? (active ? 1 : 0) : currentExercise.active;
    
    let updatedChallenges = JSON.parse(currentExercise.challenges);
    let updatedText = currentExercise.text;
    
    // Přeanalyzování textu, pokud byl změněn
    if (text !== undefined && text !== currentExercise.text) {
      updatedText = text;
      updatedChallenges = analyzeText(text);
    }
    
    // Aktualizace cvičení v databázi
    await db.run(
      `UPDATE exercises
       SET title = ?, text = ?, challenges = ?, showResultsImmediately = ?, deadline = ?, active = ?
       WHERE id = ?`,
      [
        updatedTitle,
        updatedText,
        JSON.stringify(updatedChallenges),
        updatedShowResultsImmediately,
        updatedDeadline,
        updatedActive,
        req.params.id
      ]
    );
    
    // Načtení aktualizovaného cvičení
    const updatedExercise = await db.get(
      `SELECT id, title, text, challenges, showResultsImmediately, deadline, active, createdAt
       FROM exercises WHERE id = ?`,
      [req.params.id]
    );
    
    // Převod hodnot
    updatedExercise.challenges = JSON.parse(updatedExercise.challenges);
    updatedExercise.showResultsImmediately = updatedExercise.showResultsImmediately === 1;
    updatedExercise.active = updatedExercise.active === 1;
    
    res.status(200).json(updatedExercise);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

exports.deleteExercise = async (req, res) => {
  const db = req.db;
  
  try {
    // Nejprve zkontrolujeme, zda cvičení existuje
    const exercise = await db.get(
      `SELECT id FROM exercises WHERE id = ?`,
      [req.params.id]
    );
    
    if (!exercise) {
      return res.status(404).json({ message: 'Cvičení nenalezeno' });
    }
    
    // Nejprve smažeme všechna související odevzdání (kvůli integrity constraints)
    await db.run(
      `DELETE FROM submissions WHERE exerciseId = ?`,
      [req.params.id]
    );
    
    // Poté smažeme samotné cvičení
    await db.run(
      `DELETE FROM exercises WHERE id = ?`,
      [req.params.id]
    );
    
    res.status(200).json({ message: 'Cvičení bylo úspěšně smazáno' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.toggleExerciseStatus = async (req, res) => {
  const db = req.db;
  
  try {
    const { active } = req.body;
    
    // Aktualizace stavu cvičení
    await db.run(
      `UPDATE exercises SET active = ? WHERE id = ?`,
      [active ? 1 : 0, req.params.id]
    );
    
    res.status(200).json({ 
      message: `Cvičení bylo ${active ? 'aktivováno' : 'deaktivováno'}`
    });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

exports.getExerciseStats = async (req, res) => {
  const db = req.db;
  
  try {
    const exerciseId = req.params.id;
    
    // Načtení cvičení včetně všech výzev
    const exercise = await db.get(
      `SELECT id, challenges FROM exercises WHERE id = ?`,
      [exerciseId]
    );
    
    if (!exercise) {
      return res.status(404).json({ message: 'Cvičení nenalezeno' });
    }
    
    // Převod challenges na objekt
    const challenges = JSON.parse(exercise.challenges);
    
    // Načtení všech odevzdání pro toto cvičení
    const submissions = await db.all(
      `SELECT id, answers, score, maxScore FROM submissions WHERE exerciseId = ?`,
      [exerciseId]
    );
    
    // Převod answers na objekty
    const processedSubmissions = submissions.map(submission => ({
      ...submission,
      answers: JSON.parse(submission.answers)
    }));
    
    // Pokud nejsou žádná odevzdání, vrátíme základní statistiky
    if (processedSubmissions.length === 0) {
      return res.status(200).json({
        submissionsCount: 0,
        averageScore: 0,
        maxScore: challenges.length,
        maxUserScore: 0,
        challengeStats: []
      });
    }
    
    // Výpočet průměrného skóre
    const totalScore = processedSubmissions.reduce((sum, submission) => sum + submission.score, 0);
    const averageScore = totalScore / processedSubmissions.length;
    
    // Nalezení nejvyššího dosaženého skóre
    const maxUserScore = Math.max(...processedSubmissions.map(submission => submission.score));
    
    // Statistiky pro jednotlivé výzvy
    const challengeStats = challenges.map(challenge => {
      // Pro každou výzvu zjistíme, kolik studentů odpovědělo správně
      let correctCount = 0;
      let totalAttempts = 0;
      
      processedSubmissions.forEach(submission => {
        const answer = submission.answers.find(
          a => a.challengeId === challenge.id.toString()
        );
        
        if (answer) {
          totalAttempts++;
          if (answer.isCorrect) correctCount++;
        }
      });
      
      // Výpočet úspěšnosti pro tuto výzvu
      const successRate = totalAttempts > 0 
        ? Math.round((correctCount / totalAttempts) * 100) 
        : 0;
      
      // Extrahování textu pro tuto výzvu z původního textu
      const exercise = db.get(
        `SELECT text FROM exercises WHERE id = ?`,
        [exerciseId]
      );
      
      const challengeText = exercise.text?.substring(
        challenge.position.start,
        challenge.position.end
      ) || '';
      
      return {
        challengeId: challenge.id,
        text: challengeText,
        correctOption: challenge.correctOption,
        type: challenge.type,
        successRate: successRate
      };
    });
    
    // Sestavení kompletních statistik
    const stats = {
      submissionsCount: processedSubmissions.length,
      averageScore: parseFloat(averageScore.toFixed(2)),
      maxScore: challenges.length,
      maxUserScore,
      challengeStats
    };
    
    res.status(200).json(stats);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.getExerciseSubmissions = async (req, res) => {
  const db = req.db;
  
  try {
    const exerciseId = req.params.id;
    
    // Načtení všech odevzdání pro toto cvičení
    const submissions = await db.all(
      `SELECT id, studentName, answers, score, maxScore, submittedAt, sessionToken
       FROM submissions 
       WHERE exerciseId = ? 
       ORDER BY submittedAt DESC`,
      [exerciseId]
    );
    
    // Převod answers na objekty
    const processedSubmissions = submissions.map(submission => ({
      ...submission,
      answers: JSON.parse(submission.answers)
    }));
    
    res.status(200).json(processedSubmissions);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Funkce pro automatickou analýzu textu a vyhledání pravopisných výzev
function analyzeText(text) {
  const challenges = [];
  
  // Zde by byl sofistikovanější algoritmus pro detekci pravopisných jevů
  // Pro ukázku použijeme jednoduchý přístup hledání typických míst s i/y a s/z
  
  // Detekce i/y
  const iyRegex = /\b\w*(i|y|í|ý)\w*\b/gi;
  let match;
  while ((match = iyRegex.exec(text)) !== null) {
    const word = match[0];
    const position = { start: match.index, end: match.index + word.length };
    
    // Pro zjednodušení předpokládáme, že slova s i/y mohou mít dvě varianty
    const options = [
      word.replace(/[iy]/gi, 'i').replace(/[íý]/gi, 'í'),
      word.replace(/[iy]/gi, 'y').replace(/[íý]/gi, 'ý')
    ];
    
    challenges.push({
      id: crypto.randomUUID(), // Generování unikátního ID pro každou výzvu
      position,
      options,
      correctOption: word, // V reálné implementaci by toto určovala AI
      type: 'i/y'
    });
  }
  
  // Podobně by se implementovaly další typy pravopisných jevů
  
  return challenges;
}
