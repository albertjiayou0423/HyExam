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

        // --- Auto-grading logic starts here ---
        const examDetails = await Exam.findById(submission.exam).populate('questions');
        let score = 0;
        let pendingGrading = false; // Flag for subjective questions

        for (const studentAnswer of submission.answers) {
            const question = examDetails.questions.find(q => q._id.toString() === studentAnswer.questionId.toString());
            if (!question) continue;

            const questionType = question.questionType;
            if (questionType === 'single' || questionType === 'true_false') {
                if (studentAnswer.answer === question.correctAnswer) {
                    score++; // Assuming 1 point per question
                }
            } else if (questionType === 'multiple') {
                // For multiple choice, expecting answer to be an array of strings
                const correct = Array.isArray(question.correctAnswer) ? question.correctAnswer : [question.correctAnswer];
                const submitted = Array.isArray(studentAnswer.answer) ? studentAnswer.answer : [studentAnswer.answer];
                if (correct.length === submitted.length && correct.every(val => submitted.includes(val))) {
                    score++;
                }
            } else if (questionType === 'fill_in_the_blank' || questionType === 'essay') {
                pendingGrading = true;
            }
        }

        submission.score = score;
        if (!pendingGrading) {
            submission.status = 'graded';
        }
        // --- Auto-grading logic ends here ---

        await submission.save();

        res.json({ msg: 'Exam submitted successfully. Auto-grading complete.' });

    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
});

// @route   GET api/submissions/myresults
// @desc    Get all graded submissions for the logged-in student
// @access  Private (Student)
router.get('/myresults', auth, async (req, res) => {
    if (req.user.role !== 'student') {
        return res.status(403).json({ msg: 'Only students can view their results.' });
    }
    try {
        const submissions = await Submission.find({ student: req.user.id, status: 'graded' })
            .populate('exam', ['name']);
        res.json(submissions);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
});

// @route   GET api/submissions/exam/:examId
// @desc    Get all submissions for an exam (for teachers)
// @access  Private (Teacher or Admin)
router.get('/exam/:examId', auth, async (req, res) => {
    if (req.user.role !== 'teacher' && req.user.role !== 'admin') {
        return res.status(403).json({ msg: 'Access denied' });
    }

    try {
        const submissions = await Submission.find({ exam: req.params.examId }).populate('student', ['name', 'email']);
        res.json(submissions);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
});

// @route   GET api/submissions/:submissionId
// @desc    Get a single submission details (for grading)
// @access  Private (Teacher or Admin)
router.get('/:submissionId', auth, async (req, res) => {
    if (req.user.role !== 'teacher' && req.user.role !== 'admin') {
        return res.status(403).json({ msg: 'Access denied' });
    }

    try {
        const submission = await Submission.findById(req.params.submissionId)
            .populate('student', ['name'])
            .populate({
                path: 'exam',
                populate: {
                    path: 'questions'
                }
            });

        if (!submission) {
            return res.status(404).json({ msg: 'Submission not found' });
        }
        res.json(submission);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
});

// @route   POST api/submissions/grade/:submissionId
// @desc    Grade a submission (specifically for subjective questions)
// @access  Private (Teacher or Admin)
router.post('/grade/:submissionId', auth, async (req, res) => {
    if (req.user.role !== 'teacher' && req.user.role !== 'admin') {
        return res.status(403).json({ msg: 'Access denied' });
    }

    const { subjectiveScores } = req.body; // Expecting an array of { questionId, score }

    try {
        const submission = await Submission.findById(req.params.submissionId);
        if (!submission) {
            return res.status(404).json({ msg: 'Submission not found' });
        }

        let finalScore = submission.score; // Start with the auto-graded score
        for (const item of subjectiveScores) {
            finalScore += item.score;
        }

        submission.score = finalScore;
        submission.status = 'graded'; // Mark as fully graded

        await submission.save();
        res.json(submission);

    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
});


// @route   GET api/submissions/myresults
// @desc    Get all graded submissions for the logged-in student
// @access  Private (Student)
router.get('/myresults', auth, async (req, res) => {
    if (req.user.role !== 'student') {
        return res.status(403).json({ msg: 'Only students can view their results.' });
    }
    try {
        const submissions = await Submission.find({ student: req.user.id, status: 'graded' })
            .populate('exam', ['name']);
        res.json(submissions);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
});

module.exports = router;
