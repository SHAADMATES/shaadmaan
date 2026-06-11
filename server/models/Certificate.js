import mongoose from 'mongoose';

const certificateSchema = new mongoose.Schema({
  certificateId: {
    type: String,
    required: true,
    unique: true
  },
  studentId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Student',
    required: true
  },
  programId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Program',
    required: true
  },
  position: {
    type: String,
    required: true
  },
  grade: {
    type: String,
    required: true
  },
  approved: {
    type: Boolean,
    default: false
  },
  issueDate: {
    type: Date,
    default: Date.now
  }
});

const Certificate = mongoose.model('Certificate', certificateSchema);
export default Certificate;
