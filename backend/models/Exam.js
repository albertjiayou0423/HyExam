const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const ExamSchema = new Schema({
  name: {
    type: String,
    required: true,
  },
  class: {
    type: Schema.Types.ObjectId,
    ref: 'Class',
    required: true,
  },
  questions: [{
    type: Schema.Types.ObjectId,
    ref: 'Question',
  }],
  createdBy: {
    type: Schema.Types.ObjectId,
    ref: 'User', // Teacher or Admin
    required: true,
  },
  duration: {
    type: Number, // in minutes
    required: true,
  },
  startTime: {
    type: Date,
    required: true,
  },
  endTime: {
    type: Date,
    required: true,
  },
}, { timestamps: true });

module.exports = mongoose.model('Exam', ExamSchema);
