import mongoose from 'mongoose';

const publicationSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true
  },
  content: {
    type: String,
    required: true
  },
  language: {
    type: String,
    required: true,
    enum: ['English', 'Arabic', 'Urdu']
  },
  category: {
    type: String,
    required: true,
    enum: ['Article', 'Story', 'Essay', 'Research', 'News', 'Report']
  },
  studentId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Student',
    required: true
  },
  status: {
    type: String,
    required: true,
    enum: ['Pending', 'Approved', 'Rejected'],
    default: 'Pending'
  },
  fileUrl: {
    type: String,
    default: ''
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

const Publication = mongoose.model('Publication', publicationSchema);
export default Publication;
