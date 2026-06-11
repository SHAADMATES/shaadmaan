import mongoose from 'mongoose';

const financeSchema = new mongoose.Schema({
  type: {
    type: String,
    required: true,
    enum: ['income', 'expense']
  },
  category: {
    type: String,
    required: true
  },
  amount: {
    type: Number,
    required: true
  },
  description: {
    type: String,
    default: ''
  },
  date: {
    type: Date,
    required: true,
    default: Date.now
  },
  programId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Program'
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

const Finance = mongoose.model('Finance', financeSchema);
export default Finance;
