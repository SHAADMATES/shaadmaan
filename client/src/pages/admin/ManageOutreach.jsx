import React, { useState, useEffect } from 'react';
import axios from 'axios';
import {
  Box,
  Typography,
  Card,
  CardContent,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Chip,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Alert,
  IconButton,
  Grid
} from '@mui/material';
import DeleteIcon from '@mui/icons-material/Delete';
import AddIcon from '@mui/icons-material/Add';
import { format } from 'date-fns';

const ManageOutreach = () => {
  const [outreaches, setOutreaches] = useState([]);
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [open, setOpen] = useState(false);
  const [formData, setFormData] = useState({
    studentId: '',
    programDate: '',
    organization: '',
    type: '',
    position: ''
  });

  const fetchData = async () => {
    try {
      const [outreachRes, studentsRes] = await Promise.all([
        axios.get(`${import.meta.env.VITE_API_URL}/outreach`, {
          headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
        }),
        axios.get(`${import.meta.env.VITE_API_URL}/student`, {
          headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
        })
      ]);
      setOutreaches(outreachRes.data);
      setStudents(studentsRes.data);
      setLoading(false);
    } catch (err) {
      console.error(err);
      setError('Failed to load data');
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await axios.post(`${import.meta.env.VITE_API_URL}/outreach`, formData, {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
      });
      setOpen(false);
      setFormData({ studentId: '', programDate: '', organization: '', type: '', position: '' });
      fetchData();
    } catch (err) {
      console.error(err);
      alert('Failed to add outreach');
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this outreach record?')) return;
    try {
      await axios.delete(`${import.meta.env.VITE_API_URL}/outreach/${id}`, {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
      });
      fetchData();
    } catch (err) {
      console.error(err);
      alert('Failed to delete');
    }
  };

  if (loading) return <Typography>Loading...</Typography>;

  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 3 }}>
        <Typography variant="h4" fontWeight="bold">Outreach Achievements</Typography>
        <Button variant="contained" startIcon={<AddIcon />} onClick={() => setOpen(true)}>
          Add Outreach
        </Button>
      </Box>

      {error && <Alert severity="error" sx={{ mb: 3 }}>{error}</Alert>}

      <TableContainer component={Paper} elevation={3}>
        <Table>
          <TableHead>
            <TableRow sx={{ backgroundColor: 'primary.main' }}>
              <TableCell sx={{ color: 'white' }}>Student Name</TableCell>
              <TableCell sx={{ color: 'white' }}>Date</TableCell>
              <TableCell sx={{ color: 'white' }}>Organization</TableCell>
              <TableCell sx={{ color: 'white' }}>Type</TableCell>
              <TableCell sx={{ color: 'white' }}>Position</TableCell>
              <TableCell sx={{ color: 'white' }}>Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {outreaches.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} align="center">No outreach records found</TableCell>
              </TableRow>
            ) : (
              outreaches.map((outreach) => (
                <TableRow key={outreach.id}>
                  <TableCell>{outreach.student?.name}</TableCell>
                  <TableCell>{format(new Date(outreach.programDate), 'dd MMM yyyy')}</TableCell>
                  <TableCell>{outreach.organization}</TableCell>
                  <TableCell>
                    <Chip label={outreach.type} color="primary" variant="outlined" size="small" />
                  </TableCell>
                  <TableCell>{outreach.position || '-'}</TableCell>
                  <TableCell>
                    <IconButton color="error" onClick={() => handleDelete(outreach.id)}>
                      <DeleteIcon />
                    </IconButton>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </TableContainer>

      <Dialog open={open} onClose={() => setOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Add New Outreach Achievement</DialogTitle>
        <DialogContent>
          <Box component="form" sx={{ mt: 2 }} id="outreach-form" onSubmit={handleSubmit}>
            <Grid container spacing={2}>
              <Grid item xs={12}>
                <TextField
                  select
                  fullWidth
                  label="Select Student"
                  name="studentId"
                  value={formData.studentId}
                  onChange={handleChange}
                  required
                  SelectProps={{ native: true }}
                >
                  <option value=""></option>
                  {students.map((student) => (
                    <option key={student.id} value={student.id}>
                      {student.name} ({student.admissionNumber})
                    </option>
                  ))}
                </TextField>
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  type="date"
                  label="Program Date"
                  name="programDate"
                  InputLabelProps={{ shrink: true }}
                  value={formData.programDate}
                  onChange={handleChange}
                  required
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Type of Program"
                  name="type"
                  placeholder="e.g. Competition, Workshop"
                  value={formData.type}
                  onChange={handleChange}
                  required
                />
              </Grid>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Organization"
                  name="organization"
                  value={formData.organization}
                  onChange={handleChange}
                  required
                />
              </Grid>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Position / Status (Optional)"
                  name="position"
                  placeholder="e.g. 1st Place, Participant"
                  value={formData.position}
                  onChange={handleChange}
                />
              </Grid>
            </Grid>
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpen(false)}>Cancel</Button>
          <Button type="submit" form="outreach-form" variant="contained">Save</Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default ManageOutreach;
