import mongoose from 'mongoose';

const clientSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Client name is required'],
    trim: true,
    unique: true,
    minlength: [1, 'Client name cannot be empty'],
  },
  publicKey: {
    type: String,
    required: true,
    unique: true,
    index: true,
  },
}, {
  timestamps: true,
});

export const Client = mongoose.model('Client', clientSchema);
