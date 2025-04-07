const express = require('express');
const router = express.Router();
const submissionController = require('../controllers/submissionController');

// Routes pro odevzdání a hodnocení
router.post('/', submissionController.submitExercise);
router.get('/:token', submissionController.getSubmissionResults);

module.exports = router;
