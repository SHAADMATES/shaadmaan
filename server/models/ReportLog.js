import mongoose from 'mongoose';

const reportLogSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true
  },
  type: {
    type: String,
    required: true
  },
  generatedAt: {
    type: Date,
    default: Date.now
  }
});

const ReportLog = mongoose.model('ReportLog', reportLogSchema);
export default ReportLog;
