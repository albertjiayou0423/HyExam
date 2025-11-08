const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const Class = require('../models/Class');
const User = require('../models/User');
const { check, validationResult } = require('express-validator');

// @route   POST api/classes
// @desc    Create a class
// @access  Private (Teacher or Admin)
router.post('/', [auth, [
    check('name', 'Name is required').not().isEmpty()
]], async (req, res) => {
    // Check for role
    if (req.user.role !== 'teacher' && req.user.role !== 'admin') {
        return res.status(403).json({ msg: 'Access denied' });
    }

    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
    }

    try {
        const newClass = new Class({
            name: req.body.name,
            teacher: req.user.id
        });

        const aClass = await newClass.save();
        res.json(aClass);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
});

// @route   GET api/classes
// @desc    Get all classes for the logged-in user (teacher or student)
// @access  Private
router.get('/', auth, async (req, res) => {
    try {
        let classes;
        if (req.user.role === 'teacher' || req.user.role === 'admin') {
            classes = await Class.find({ teacher: req.user.id }).populate('teacher', ['name']);
        } else { // student
            classes = await Class.find({ students: req.user.id }).populate('teacher', ['name']);
        }
        res.json(classes);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
});


module.exports = router;
