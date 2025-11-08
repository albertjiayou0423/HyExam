const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const Exam = require('../models/Exam');
const Class = require('../models/Class');
const { check, validationResult } = require('express-validator');

// @route   POST api/exams
// @desc    Create an exam
// @access  Private (Teacher or Admin)
router.post('/', [auth, [
    check('name', 'Exam name is required').not().isEmpty(),
    check('class', 'Class is required').isMongoId(),
    check('questions', 'Please include at least one question').isArray({ min: 1 }),
    check('duration', 'Duration is required').isNumeric(),
    check('startTime', 'Start time is required').isISO8601(),
    check('endTime', 'End time is required').isISO8601(),
]], async (req, res) => {
    if (req.user.role !== 'teacher' && req.user.role !== 'admin') {
        return res.status(403).json({ msg: 'Access denied' });
    }

    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
    }

    const { name, class: classId, questions, duration, startTime, endTime } = req.body;

    try {
        // Optional: Check if the teacher owns the class
        const ownClass = await Class.findOne({ _id: classId, teacher: req.user.id });
        if (!ownClass && req.user.role === 'teacher') {
            return res.status(403).json({ msg: 'You can only create exams for your own classes' });
        }

        const newExam = new Exam({
            name,
            class: classId,
            questions,
            duration,
            startTime,
            endTime,
            createdBy: req.user.id
        });

        const exam = await newExam.save();
        res.json(exam);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
});

// @route   GET api/exams
// @desc    Get exams for a class
// @access  Private
router.get('/class/:classId', auth, async (req, res) => {
    try {
        const exams = await Exam.find({ class: req.params.classId }).populate('createdBy', ['name']);
        res.json(exams);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
});


module.exports = router;
