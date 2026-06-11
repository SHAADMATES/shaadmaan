import mongoose from 'mongoose';

const studentSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  name: {
    type: String,
    required: true
  },
  studentId: {
    type: String,
    unique: true,
    trim: true,
    default: function() { return `STU-${Math.random().toString(36).substring(3, 9).toUpperCase()}`; }
  },
  admissionNumber: {
    type: String,
    required: true,
    unique: true,
    trim: true
  },
  class: {
    type: String,
    default: 'Class XII'
  },
  wing: {
    type: String,
    default: ''
  },
  photo: {
    type: String,
    default: ''
  },
  dob: {
    type: Date,
    default: Date.now
  },
  address: {
    type: String,
    default: ''
  },
  phone: {
    type: String,
    default: ''
  },
  email: {
    type: String,
    default: ''
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

const Student = mongoose.model('Student', studentSchema);
export default Student;
