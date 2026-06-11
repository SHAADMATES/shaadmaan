import mongoose from 'mongoose';

const librarySchema = new mongoose.Schema({
  title: {
    type: String,
    required: true
  },
  author: {
    type: String,
    required: true
  },
  category: {
    type: String,
    required: true
  },
  pdfUrl: {
    type: String,
    required: true
  },
  downloads: {
    type: Number,
    default: 0
  },
  description: {
    type: String,
    default: ''
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

const Library = mongoose.model('Library', librarySchema);
export default Library;
