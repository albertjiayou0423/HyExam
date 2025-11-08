import React, { useState } from 'react';
import { Container, TextField, Button, Typography, Box, Alert } from '@mui/material';
import axios from 'axios';

function App() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [token, setToken] = useState(null);

  const handleLogin = async (e) => {
    e.preventDefault();
    setError('');
    try {
      const res = await axios.post('/api/auth', { email, password });
      setToken(res.data.token);
      console.log('Login successful, token:', res.data.token);
      // Here you would typically save the token (e.g., in localStorage)
      // and redirect the user to a dashboard.
    } catch (err) {
      setError('Invalid credentials. Please try again.');
      console.error('Login failed:', err.response ? err.response.data : err.message);
    }
  };

  if (token) {
    return (
      <Container>
        <Box sx={{ mt: 8, textAlign: 'center' }}>
          <Typography variant="h4">Login Successful!</Typography>
          <Typography>Welcome to the exam portal.</Typography>
        </Box>
      </Container>
    );
  }

  return (
    <Container component="main" maxWidth="xs">
      <Box
        sx={{
          marginTop: 8,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
        }}
      >
        <img src="/logo-placeholder.png" alt="Logo" style={{ width: '100px', height: '100px', marginBottom: '20px' }} />
        <Typography component="h1" variant="h5">
          Sign In
        </Typography>
        {error && <Alert severity="error" sx={{ width: '100%', mt: 2 }}>{error}</Alert>}
        <Box component="form" onSubmit={handleLogin} noValidate sx={{ mt: 1 }}>
          <TextField
            margin="normal"
            required
            fullWidth
            id="email"
            label="Email Address"
            name="email"
            autoComplete="email"
            autoFocus
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
          <TextField
            margin="normal"
            required
            fullWidth
            name="password"
            label="Password"
            type="password"
            id="password"
            autoComplete="current-password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
          <Button
            type="submit"
            fullWidth
            variant="contained"
            sx={{ mt: 3, mb: 2 }}
          >
            Sign In
          </Button>
        </Box>
      </Box>
    </Container>
  );
}

export default App;
