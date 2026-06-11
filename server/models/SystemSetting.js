import mongoose from 'mongoose';

const systemSettingSchema = new mongoose.Schema({
  orgName: {
    type: String,
    default: 'Shaad-Mates WebSuite'
  },
  orgLogo: {
    type: String,
    default: '🎓'
  },
  orgEmail: {
    type: String,
    default: 'admin@shaadmates.com'
  },
  signatureUrl: {
    type: String,
    default: ''
  }
});

const SystemSetting = mongoose.model('SystemSetting', systemSettingSchema);
export default SystemSetting;
