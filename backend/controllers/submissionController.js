const Submission = require('../models/Submission');
const Exercise = require('../models/Exercise');
const crypto = require('crypto');

exports.submitExercise = async (req, res) => {
  try {
    const { exerciseId, studentName, answers } = req.body;
    
    // Vytvoření jednoduchého session tokenu pro identifikaci studenta
    const sessionToken = crypto.randomBytes(16).toString('hex');
    
    const exercise = await Exercise.findById(exerciseId);
    if (!exercise) {
      return res.status(404).json({ message: 'Cvičení nenalezeno' });
    }
    
    // Vyhodnocení správnosti odpovědí
    let score = 0;
    const evaluatedAnswers = answers.map(answer => {
      const challenge = exercise.challenges.find(
        c => c._id.toString() === answer.challengeId
      );
      
      const isCorrect = challenge && challenge.correctOption === answer.selectedOption;
      if (isCorrect) score++;
      
      return {
        ...answer,
        isCorrect
      };
    });
    
    const submission = new Submission({
      exerciseId,
      studentName,
      answers: evaluatedAnswers,
      score,
      maxScore: exercise.challenges.length,
      sessionToken
    });
    
    await submission.save();
    
    // Rozhodnutí, zda vrátit výsledky okamžitě nebo ne
    if (exercise.showResultsImmediately) {
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
  try {
    const { sessionToken } = req.params;
    
    const submission = await Submission.findOne({ sessionToken })
      .populate('exerciseId');
    
    if (!submission) {
      return res.status(404).json({ message: 'Výsledek nenalezen' });
    }
    
    // Kontrola, zda už je po deadlinu nebo zda je povoleno okamžité zobrazení
    const exercise = submission.exerciseId;
    const now = new Date();
    
    if (exercise.showResultsImmediately || (exercise.deadline && now > exercise.deadline)) {
      res.status(200).json(submission);
    } else {
      res.status(403).json({ 
        message: 'Výsledky ještě nejsou k dispozici',
        availableAt: exercise.deadline
      });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
