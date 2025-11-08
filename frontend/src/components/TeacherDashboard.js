import React, { useState, useEffect } from 'react';
import { Container, Typography, Button, Box, TextField, Select, MenuItem, FormControl, InputLabel, CircularProgress, Alert } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

const TeacherDashboard = ({ setToken }) => {
  const navigate = useNavigate();
  const [questions, setQuestions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Form state
  const [questionText, setQuestionText] = useState('');
  const [questionType, setQuestionType] = useState('single');
  const [options, setOptions] = useState(['', '', '', '']);
  const [correctAnswer, setCorrectAnswer] = useState('');

  const fetchQuestions = async () => {
    try {
      const token = localStorage.getItem('token');
      const res = await axios.get('/api/questions', { headers: { 'x-auth-token': token } });
      setQuestions(res.data);
    } catch (err) {
      setError('Failed to fetch questions.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchQuestions();
  }, []);

  const handleLogout = () => {
    setToken(null);
    localStorage.removeItem('token');
    navigate('/login');
  };

  const handleCreateQuestion = async (e) => {
    e.preventDefault();
    const token = localStorage.getItem('token');
    const newQuestion = {
        questionText,
        questionType,
        options: questionType === 'single' || questionType === 'multiple' ? options.filter(opt => opt !== '') : [],
        correctAnswer
    };

    try {
        await axios.post('/api/questions', newQuestion, { headers: { 'x-auth-token': token } });
        fetchQuestions(); // Refresh the list
        // Reset form
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
        <Button variant="contained" color="secondary" onClick={handleLogout}>
          Logout
        </Button>
      </Box>

      {/* Create Question Form */}
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

        <TextField fullWidth label="Correct Answer" value={correctAnswer} onChange={(e) => setCorrectAnswer(e.target.value)} margin="normal" required helperText="For multiple choice, separate answers with a comma." />

        <Button type="submit" variant="contained" sx={{ mt: 2 }}>Add Question</Button>
      </Box>

      {/* Question List */}
      <Typography variant="h6">Your Questions</Typography>
      {loading ? <CircularProgress /> : error ? <Alert severity="error">{error}</Alert> : (
        <Box>
          {questions.map(q => (
            <Box key={q._id} sx={{ p: 2, border: '1px solid grey', borderRadius: '4px', mb: 1 }}>
              <Typography variant="body1"><strong>{q.questionText}</strong></Typography>
              <Typography variant="caption">Type: {q.questionType}</Typography>
            </Box>
          ))}
        </Box>
      )}
    </Container>
  );
};

export default TeacherDashboard;
