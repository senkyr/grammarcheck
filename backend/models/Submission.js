const mongoose = require('mongoose');

const SubmissionSchema = new mongoose.Schema({
  exerciseId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Exercise',
    required: true
  },
  studentName: {
    type: String,
    required: true
  },
  answers: [{
    challengeId: String,
    selectedOption: String,
    isCorrect: Boolean
  }],
  score: {
    type: Number,
    required: true
  },
  maxScore: {
    type: Number,
    required: true
  },
  submittedAt: {
    type: Date,
    default: Date.now
  },
  sessionToken: {
    type: String,
    required: true
  }
});

module.exports = mongoose.model('Submission', SubmissionSchema);
