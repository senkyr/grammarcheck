const mongoose = require('mongoose');

const ChallengeSchema = new mongoose.Schema({
  position: {
    start: Number,
    end: Number
  },
  options: [String],
  correctOption: String,
  type: {
    type: String,
    enum: ['i/y', 's/z', 'mě/mně', 'other'],
    default: 'other'
  }
});

const ExerciseSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true
  },
  text: {
    type: String,
    required: true
  },
  challenges: [ChallengeSchema],
  createdAt: {
    type: Date,
    default: Date.now
  },
  showResultsImmediately: {
    type: Boolean,
    default: true
  },
  deadline: {
    type: Date
  },
  active: {
    type: Boolean,
    default: true
  }
});

module.exports = mongoose.model('Exercise', ExerciseSchema);
