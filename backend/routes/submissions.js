const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const Submission = require('../models/Submission');
const Exam = require('../models/Exam');
const Class = require('../models/Class');

// @route   POST api/submissions/start/:examId
// @desc    Start an exam, create a submission record
// @access  Private (Student)
router.post('/start/:examId', auth, async (req, res) => {
    if (req.user.role !== 'student') {
        return res.status(403).json({ msg: 'Only students can start exams.' });
    }

    try {
        const exam = await Exam.findById(req.params.examId).select('-questions.correctAnswer');

        if (!exam) {
            return res.status(404).json({ msg: 'Exam not found' });
        }

        // Check if student is in the class for this exam
        const studentClass = await Class.findOne({ _id: exam.class, students: req.user.id });
        if (!studentClass) {
            return res.status(403).json({ msg: 'You are not enrolled in the class for this exam.' });
        }

        // Check if already submitted
        let submission = await Submission.findOne({ exam: req.params.examId, student: req.user.id });
        if (submission) {
            return res.status(400).json({ msg: 'You have already started this exam.' });
        }

        submission = new Submission({
            exam: req.params.examId,
            student: req.user.id,
        });

        await submission.save();

        // Return exam details for the student to take the test
        res.json({ submissionId: submission.id, exam });

    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
});

// @route   POST api/submissions/submit/:submissionId
// @desc    Submit answers for an exam
// @access  Private (Student)
router.post('/submit/:submissionId', auth, async (req, res) => {
    if (req.user.role !== 'student') {
        return res.status(403).json({ msg: 'Only students can submit exams.' });
    }

    const { answers } = req.body; // Expecting an array of { questionId, answer }

    try {
        const submission = await Submission.findById(req.params.submissionId);

        if (!submission || submission.student.toString() !== req.user.id) {
            return res.status(404).json({ msg: 'Submission not found or you are not authorized.' });
        }

        if (submission.status === 'submitted') {
            return res.status(400).json({ msg: 'This exam has already been submitted.' });
        }

        submission.answers = answers;
        submission.submittedTime = Date.now();
        submission.status = 'submitted';

        await submission.save();

        // Auto-grading can be triggered here in a real-world scenario
        res.json({ msg: 'Exam submitted successfully.' });

    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
});

module.exports = router;
