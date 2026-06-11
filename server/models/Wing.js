import mongoose from 'mongoose';

const wingSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    unique: true
  },
  logo: {
    type: String,
    default: ''
  },
  description: {
    type: String,
    default: ''
  },
  chairmanId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'WingChairman'
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

const Wing = mongoose.model('Wing', wingSchema);
export default Wing;
