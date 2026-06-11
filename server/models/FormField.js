import mongoose from 'mongoose';

const formFieldSchema = new mongoose.Schema({
  formName: {
    type: String,
    required: true,
    enum: ['student', 'wing', 'program', 'result', 'transaction']
  },
  label: {
    type: String,
    required: true
  },
  name: {
    type: String,
    required: true,
    trim: true
  },
  type: {
    type: String,
    required: true,
    enum: ['text', 'number', 'date', 'email', 'textarea']
  },
  required: {
    type: Boolean,
    default: false
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

const FormField = mongoose.model('FormField', formFieldSchema);
export default FormField;
