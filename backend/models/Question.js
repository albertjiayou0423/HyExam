const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const QuestionSchema = new Schema({
  questionText: {
    type: String,
    required: true,
  },
  questionType: {
    type: String,
    required: true,
    enum: ['single', 'multiple', 'true_false', 'fill_in_the_blank', 'essay'],
  },
  // For single, multiple, true_false
  options: [{
    type: String,
  }],
  // For single, multiple, true_false, fill_in_the_blank
  correctAnswer: {
    type: Schema.Types.Mixed, // Can be a string, or an array of strings
    required: function() {
      return this.questionType !== 'essay';
    },
  },
  createdBy: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  // Optional: For better organization, questions can be associated with a course/subject
  // subject: { type: String }
}, { timestamps: true });

module.exports = mongoose.model('Question', QuestionSchema);
