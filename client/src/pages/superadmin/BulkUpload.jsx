import React, { useState } from 'react';
import { api } from '../../context/AuthContext';
import { Box, Typography, Button, Paper, Alert } from '@mui/material';

const BulkUpload = () => {
  const [jsonInput, setJsonInput] = useState('');
  const [message, setMessage] = useState(null);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);

  const handleUpload = async () => {
    setLoading(true);
    setMessage(null);
    setError(null);
    try {
      const data = JSON.parse(jsonInput);
      if (!Array.isArray(data)) {
        throw new Error('Data must be an array of objects');
      }

      const res = await api.post('/superadmin/bulk-upload/students', { students: data });
      setMessage(res.data.message);
      setJsonInput('');
    } catch (err) {
      setError(err.message || 'Invalid JSON or API error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box p={4}>
      <Typography variant="h4" mb={2} fontWeight="bold">Bulk Upload Students</Typography>
      <Paper sx={{ p: 3, mb: 3 }}>
        <Typography variant="body1" mb={2}>
          Paste an array of student objects (JSON format) below to bulk register students.
        </Typography>
        
        {message && <Alert severity="success" sx={{ mb: 2 }}>{message}</Alert>}
        {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
        
        <textarea 
          value={jsonInput}
          onChange={(e) => setJsonInput(e.target.value)}
          placeholder={`[\n  {\n    "username": "student1",\n    "password": "pass",\n    "name": "John Doe",\n    "studentId": "S001",\n    "admissionNumber": "A001",\n    "className": "Class 10",\n    "wing": "North Wing"\n  }\n]`}
          style={{ width: '100%', height: '300px', fontFamily: 'monospace', padding: '10px' }}
        />
        <Box mt={2}>
          <Button variant="contained" onClick={handleUpload} disabled={loading || !jsonInput}>
            {loading ? 'Uploading...' : 'Upload Students'}
          </Button>
        </Box>
      </Paper>
    </Box>
  );
};

export default BulkUpload;
