import React, { useState, useEffect } from 'react';
import { Container, Typography, Box, Alert, CircularProgress, Paper, Table, TableBody, TableCell, TableContainer, TableRow } from '@mui/material';
import axios from 'axios';

const HealthCheck = () => {
  const [healthData, setHealthData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchHealthData = async () => {
      try {
        const res = await axios.get('/api/health');
        setHealthData(res.data);
      } catch (err) {
        setError('Failed to fetch health data from the server. This indicates the backend server is not running correctly.');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchHealthData();
  }, []);

  const renderStatus = (isLoaded) => {
    return isLoaded ? '🟢 Loaded' : '🔴 Not Loaded';
  };

  return (
    <Container component="main" maxWidth="md">
      <Box sx={{ marginTop: 8 }}>
        <Typography component="h1" variant="h4" gutterBottom>
          System Health Check
        </Typography>
        {loading && <CircularProgress />}
        {error && <Alert severity="error">{error}</Alert>}
        {healthData && (
          <TableContainer component={Paper}>
            <Table>
              <TableBody>
                <TableRow>
                  <TableCell><strong>Server Uptime</strong></TableCell>
                  <TableCell>{healthData.uptime.toFixed(2)} seconds</TableCell>
                </TableRow>
                <TableRow>
                  <TableCell><strong>Database Connection</strong></TableCell>
                  <TableCell>{healthData.database.connection_state}</TableCell>
                </TableRow>
                <TableRow>
                  <TableCell><strong>MONGO_URI Loaded</strong></TableCell>
                  <TableCell>{renderStatus(healthData.environment.mongo_uri_loaded)}</TableCell>
                </TableRow>
                <TableRow>
                  <TableCell><strong>JWT_SECRET Loaded</strong></TableCell>
                  <TableCell>{renderStatus(healthData.environment.jwt_secret_loaded)}</TableCell>
                </TableRow>
              </TableBody>
            </Table>
          </TableContainer>
        )}
      </Box>
    </Container>
  );
};

export default HealthCheck;
