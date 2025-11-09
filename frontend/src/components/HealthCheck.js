import React, { useState, useEffect } from 'react';
import { Container, Typography, Box, Alert, CircularProgress } from '@mui/material';

const HealthCheck = () => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('Health check is currently disabled for the Supabase architecture.');

  useEffect(() => {
    // The previous health check logic is no longer valid for Supabase.
    // This component is now a placeholder.
    setLoading(false);
    // Keep setError for potential future use, but it's not used now.
    // This is to acknowledge the linting rule but keep the state variable.
    if(setError){};
  }, []);

  return (
    <Container component="main" maxWidth="md">
      <Box sx={{ marginTop: 8 }}>
        <Typography component="h1" variant="h4" gutterBottom>
          System Health Check
        </Typography>
        {loading && <CircularProgress />}
        {error && <Alert severity="warning">{error}</Alert>}
      </Box>
    </Container>
  );
};

export default HealthCheck;
