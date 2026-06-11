import mongoose from 'mongoose';

const auditLogSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  username: {
    type: String,
    default: 'system'
  },
  action: {
    type: String,
    required: true
  },
  details: {
    type: String,
    default: ''
  },
  timestamp: {
    type: Date,
    default: Date.now
  }
});

const AuditLog = mongoose.model('AuditLog', auditLogSchema);
export default AuditLog;
