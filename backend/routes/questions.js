const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const Question = require('../models/Question');
const { check, validationResult } = require('express-validator');

// @route   POST api/questions
// @desc    Create a question
// @access  Private (Teacher or Admin)
router.post('/', [auth, [
    check('questionText', 'Question text is required').not().isEmpty(),
    check('questionType', 'Question type is required').isIn(['single', 'multiple', 'true_false', 'fill_in_the_blank', 'essay']),
]], async (req, res) => {
    if (req.user.role !== 'teacher' && req.user.role !== 'admin') {
        return res.status(403).json({ msg: 'Access denied' });
    }

    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
    }

    const { questionText, questionType, options, correctAnswer } = req.body;

    try {
        const newQuestion = new Question({
            questionText,
            questionType,
            options,
            correctAnswer,
            createdBy: req.user.id
        });

        const question = await newQuestion.save();
        res.json(question);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
});

// @route   GET api/questions
// @desc    Get all questions created by the user
// @access  Private (Teacher or Admin)
router.get('/', auth, async (req, res) => {
    if (req.user.role !== 'teacher' && req.user.role !== 'admin') {
        return res.status(403).json({ msg: 'Access denied' });
    }
    try {
        const questions = await Question.find({ createdBy: req.user.id });
        res.json(questions);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
});

module.exports = router;
