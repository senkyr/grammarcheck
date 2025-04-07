const Exercise = require('../models/Exercise');
const natural = require('natural');
const tokenizer = new natural.WordTokenizer();

exports.createExercise = async (req, res) => {
  try {
    const { title, text } = req.body;
    
    // Automatická analýza textu pro nalezení pravopisných výzev
    const challenges = analyzeText(text);
    
    const exercise = new Exercise({
      title,
      text,
      challenges
    });
    
    await exercise.save();
    res.status(201).json(exercise);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

exports.getExercises = async (req, res) => {
  try {
    const exercises = await Exercise.find().select('-challenges.correctOption');
    res.status(200).json(exercises);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.getExerciseById = async (req, res) => {
  try {
    const exercise = await Exercise.findById(req.params.id);
    
    if (!exercise) {
      return res.status(404).json({ message: 'Cvičení nenalezeno' });
    }
    
    // Pro studenty neposíláme správné odpovědi
    const exerciseForStudent = {
      ...exercise._doc,
      challenges: exercise.challenges.map(c => ({
        ...c._doc,
        correctOption: undefined
      }))
    };
    
    res.status(200).json(exerciseForStudent);
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
      position,
      options,
      correctOption: word, // V reálné implementaci by toto určovala AI
      type: 'i/y'
    });
  }
  
  // Podobně by se implementovaly další typy pravopisných jevů
  
  return challenges;
}

exports.updateExercise = async (req, res) => {
  try {
    const { title, text, showResultsImmediately, deadline, active } = req.body;
    
    const exercise = await Exercise.findById(req.params.id);
    if (!exercise) {
      return res.status(404).json({ message: 'Cvičení nenalezeno' });
    }
    
    // Aktualizace polí, která jsou poskytnutá
    if (title) exercise.title = title;
    if (text !== undefined) {
      exercise.text = text;
      // Přeanalyzovat text pro nalezení nových pravopisných výzev
      exercise.challenges = analyzeText(text);
    }
    if (showResultsImmediately !== undefined) exercise.showResultsImmediately = showResultsImmediately;
    if (deadline) exercise.deadline = deadline;
    if (active !== undefined) exercise.active = active;
    
    await exercise.save();
    res.status(200).json(exercise);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

exports.deleteExercise = async (req, res) => {
  try {
    const exercise = await Exercise.findById(req.params.id);
    if (!exercise) {
      return res.status(404).json({ message: 'Cvičení nenalezeno' });
    }
    
    await Exercise.findByIdAndDelete(req.params.id);
    res.status(200).json({ message: 'Cvičení bylo úspěšně smazáno' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.toggleExerciseStatus = async (req, res) => {
  try {
    const { active } = req.body;
    
    const exercise = await Exercise.findById(req.params.id);
    if (!exercise) {
      return res.status(404).json({ message: 'Cvičení nenalezeno' });
    }
    
    exercise.active = active;
    await exercise.save();
    
    res.status(200).json({ message: `Cvičení bylo ${active ? 'aktivováno' : 'deaktivováno'}` });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

exports.getExerciseStats = async (req, res) => {
  try {
    const exerciseId = req.params.id;
    
    // Načtení cvičení včetně všech výzev
    const exercise = await Exercise.findById(exerciseId);
    if (!exercise) {
      return res.status(404).json({ message: 'Cvičení nenalezeno' });
    }
    
    // Načtení všech odevzdání pro toto cvičení
    const submissions = await Submission.find({ exerciseId });
    
    // Pokud nejsou žádná odevzdání, vrátíme základní statistiky
    if (submissions.length === 0) {
      return res.status(200).json({
        submissionsCount: 0,
        averageScore: 0,
        maxScore: exercise.challenges.length,
        maxUserScore: 0,
        challengeStats: []
      });
    }
    
    // Výpočet průměrného skóre
    const totalScore = submissions.reduce((sum, submission) => sum + submission.score, 0);
    const averageScore = totalScore / submissions.length;
    
    // Nalezení nejvyššího dosaženého skóre
    const maxUserScore = Math.max(...submissions.map(submission => submission.score));
    
    // Statistiky pro jednotlivé výzvy
    const challengeStats = exercise.challenges.map(challenge => {
      // Pro každou výzvu zjistíme, kolik studentů odpovědělo správně
      let correctCount = 0;
      let totalAttempts = 0;
      
      submissions.forEach(submission => {
        const answer = submission.answers.find(
          a => a.challengeId === challenge._id.toString()
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
      const challengeText = exercise.text.substring(
        challenge.position.start,
        challenge.position.end
      );
      
      return {
        challengeId: challenge._id,
        text: challengeText,
        correctOption: challenge.correctOption,
        type: challenge.type,
        successRate: successRate
      };
    });
    
    // Sestavení kompletních statistik
    const stats = {
      submissionsCount: submissions.length,
      averageScore: parseFloat(averageScore.toFixed(2)),
      maxScore: exercise.challenges.length,
      maxUserScore,
      challengeStats
    };
    
    res.status(200).json(stats);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.getExerciseSubmissions = async (req, res) => {
  try {
    const exerciseId = req.params.id;
    
    // Načtení všech odevzdání pro toto cvičení
    const submissions = await Submission.find({ exerciseId })
      .sort({ submittedAt: -1 }); // Nejnovější první
    
    res.status(200).json(submissions);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
