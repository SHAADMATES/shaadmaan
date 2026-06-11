import mongoose from 'mongoose';

const wingChairmanSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  name: {
    type: String,
    required: true
  },
  wing: {
    type: String,
    required: true,
    unique: true
  },
  phone: {
    type: String,
    default: ''
  },
  email: {
    type: String,
    default: ''
  },
  assistantName: {
    type: String,
    default: ''
  },
  photo: {
    type: String,
    default: ''
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

const WingChairman = mongoose.model('WingChairman', wingChairmanSchema);
export default WingChairman;
