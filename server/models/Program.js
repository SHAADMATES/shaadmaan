import mongoose from 'mongoose';

const programSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true
  },
  type: {
    type: String,
    required: true,
    enum: ['single', 'group']
  },
  wing: {
    type: String,
    required: true
  },
  date: {
    type: Date,
    required: true
  },
  time: {
    type: String,
    required: true
  },
  venue: {
    type: String,
    required: true
  },
  description: {
    type: String,
    default: ''
  },
  maxParticipants: {
    type: Number,
    default: 0
  },
  rules: {
    type: [String],
    default: []
  },
  approved: {
    type: Boolean,
    default: false
  },
  status: {
    type: String,
    default: 'Upcoming',
    enum: ['Upcoming', 'Active', 'Completed', 'Result Published']
  },
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

const Program = mongoose.model('Program', programSchema);
export default Program;
