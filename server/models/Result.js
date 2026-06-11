import mongoose from 'mongoose';

const winnerSchema = new mongoose.Schema({
  position: {
    type: String,
    required: true,
    enum: ['1st', '2nd', '3rd', 'Runner-up', 'Participation']
  },
  studentId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Student'
  },
  groupId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Group'
  },
  grade: {
    type: String,
    required: true
  },
  marks: {
    type: Number,
    required: true,
    min: 0,
    max: 100
  },
  points: {
    type: Number,
    required: true,
    min: 0
  },
  remarks: {
    type: String,
    default: ''
  }
});

const resultSchema = new mongoose.Schema({
  programId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Program',
    required: true
  },
  type: {
    type: String,
    required: true,
    enum: ['single', 'group']
  },
  winners: {
    type: [winnerSchema],
    default: []
  },
  publishedAt: {
    type: Date,
    default: Date.now
  }
});

const Result = mongoose.model('Result', resultSchema);
export default Result;
