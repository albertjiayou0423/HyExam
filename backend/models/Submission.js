const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const SubmissionSchema = new Schema({
  exam: {
    type: Schema.Types.ObjectId,
    ref: 'Exam',
    required: true,
  },
  student: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  answers: [{
    questionId: {
      type: Schema.Types.ObjectId,
      ref: 'Question',
    },
    answer: Schema.Types.Mixed, // Storing user's answer
  }],
  score: {
    type: Number,
    default: null, // Initially null, will be updated after grading
  },
  startTime: {
    type: Date,
    default: Date.now,
  },
  submittedTime: {
    type: Date,
  },
  status: {
    type: String,
    enum: ['in-progress', 'submitted', 'graded'],
    default: 'in-progress',
  }
}, { timestamps: true });

// Ensure a student can only take an exam once
SubmissionSchema.index({ exam: 1, student: 1 }, { unique: true });

module.exports = mongoose.model('Submission', SubmissionSchema);
