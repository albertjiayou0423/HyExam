import React, { useState, useEffect, useCallback } from 'react';
import { Container, Typography, Button, Box, TextField, Select, MenuItem, FormControl, InputLabel, CircularProgress, Alert } from '@mui/material';
import { supabase } from '../supabaseClient';

const TeacherDashboard = () => {
  const [questions, setQuestions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [user, setUser] = useState(null);

  // Form state
  const [questionText, setQuestionText] = useState('');
  const [questionType, setQuestionType] = useState('single');
  const [options, setOptions] = useState(['', '', '', '']);
  const [correctAnswer, setCorrectAnswer] = useState('');

  const fetchQuestions = useCallback(async (userId) => {
    if (!userId) return;
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('questions')
        .select('*')
        .eq('created_by', userId);

      if (error) throw error;
      setQuestions(data);
    } catch (err) {
      setError('Failed to fetch questions.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    // The user object is now stable and comes from the session.
    const getUser = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        setUser(user);
        fetchQuestions(user.id);
      }
    };
    getUser();
  }, [fetchQuestions]);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    // App.js will handle the navigation.
  };

  const handleCreateQuestion = async (e) => {
    e.preventDefault();
    if (!user) {
        setError('You must be logged in to create a question.');
        return;
    }
    try {
      const { error } = await supabase
        .from('questions')
        .insert([{
            question_text: questionText,
            question_type: questionType,
            options: questionType === 'single' || questionType === 'multiple' ? options.filter(opt => opt) : null,
            correct_answer: correctAnswer,
            created_by: user.id
        }]);

      if (error) throw error;

      fetchQuestions(user.id);
      setQuestionText('');
      setQuestionType('single');
      setOptions(['', '', '', '']);
      setCorrectAnswer('');
    } catch (err) {
      setError('Failed to create question.');
    }
  };

  const handleOptionChange = (index, value) => {
    const newOptions = [...options];
    newOptions[index] = value;
    setOptions(newOptions);
  };

  return (
    <Container>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mt: 4, mb: 4 }}>
        <Typography variant="h4">Teacher Dashboard</Typography>
        <Button variant="contained" color="secondary" onClick={handleLogout}>Logout</Button>
      </Box>

      <Box component="form" onSubmit={handleCreateQuestion} sx={{ mb: 4 }}>
        <Typography variant="h6">Create New Question</Typography>
        <TextField fullWidth label="Question Text" value={questionText} onChange={(e) => setQuestionText(e.target.value)} margin="normal" required />
        <FormControl fullWidth margin="normal">
          <InputLabel>Question Type</InputLabel>
          <Select value={questionType} label="Question Type" onChange={(e) => setQuestionType(e.target.value)}>
            <MenuItem value="single">Single Choice</MenuItem>
            <MenuItem value="multiple">Multiple Choice</MenuItem>
            <MenuItem value="true_false">True/False</MenuItem>
            <MenuItem value="fill_in_the_blank">Fill in the Blank</MenuItem>
            <MenuItem value="essay">Essay</MenuItem>
          </Select>
        </FormControl>
        {(questionType === 'single' || questionType === 'multiple') && (
            options.map((opt, index) => (
                <TextField key={index} fullWidth label={`Option ${index + 1}`} value={opt} onChange={(e) => handleOptionChange(index, e.target.value)} margin="dense" />
            ))
        )}
        <TextField fullWidth label="Correct Answer" value={correctAnswer} onChange={(e) => setCorrectAnswer(e.target.value)} margin="normal" required helperText="For multiple choice, use a comma-separated list." />
        <Button type="submit" variant="contained" sx={{ mt: 2 }}>Add Question</Button>
      </Box>

      <Typography variant="h6">Your Questions</Typography>
      {loading ? <CircularProgress /> : error ? <Alert severity="error">{error}</Alert> : (
        <Box>
          {questions.map(q => (
            <Box key={q.id} sx={{ p: 2, border: '1px solid grey', borderRadius: '4px', mb: 1 }}>
              <Typography variant="body1"><strong>{q.question_text}</strong></Typography>
              <Typography variant="caption">Type: {q.question_type}</Typography>
            </Box>
          ))}
        </Box>
      )}
    </Container>
  );
};

export default TeacherDashboard;
