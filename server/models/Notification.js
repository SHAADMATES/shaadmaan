import mongoose from 'mongoose';

const notificationSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true
  },
  message: {
    type: String,
    required: true
  },
  type: {
    type: String,
    required: true,
    enum: ['program', 'result', 'publication', 'event']
  },
  recipientRole: {
    type: String,
    required: true,
    default: 'all' // e.g. 'all', 'student', 'wing_chairman'
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

const Notification = mongoose.model('Notification', notificationSchema);
export default Notification;
