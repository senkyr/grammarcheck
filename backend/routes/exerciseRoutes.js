const express = require('express');
const router = express.Router();
const exerciseController = require('../controllers/exerciseController');

// Základní CRUD operace pro cvičení
router.post('/', exerciseController.createExercise);
router.get('/', exerciseController.getExercises);
router.get('/:id', exerciseController.getExerciseById);
router.patch('/:id', exerciseController.updateExercise);
router.delete('/:id', exerciseController.deleteExercise);

// Specifické operace pro cvičení
router.patch('/:id/status', exerciseController.toggleExerciseStatus);
router.get('/:id/stats', exerciseController.getExerciseStats);
router.get('/:id/submissions', exerciseController.getExerciseSubmissions);

module.exports = router;
