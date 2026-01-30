const mongoose = require('mongoose');

const labResultSchema = new mongoose.Schema({
  patientName: {
    type: String,
    required: [true, 'Patient name is required'],
    trim: true
  },
  patientId: {
    type: String,
    trim: true
  },
  testType: {
    type: String,
    required: [true, 'Test type is required'],
    trim: true
  },
  resultValue: {
    type: String,
    required: [true, 'Result value is required'],
    trim: true
  },
  unit: {
    type: String,
    trim: true
  },
  referenceRange: {
    type: String,
    trim: true
  },
  notes: {
    type: String,
    trim: true
  },
  status: {
    type: String,
    enum: ['Pending', 'Reviewed', 'Approved'],
    default: 'Pending'
  },
  uploadedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  reviewedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  reviewedAt: {
    type: Date
  },
  approvedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  approvedAt: {
    type: Date
  }
}, {
  timestamps: true
});

labResultSchema.index({ status: 1 });
labResultSchema.index({ uploadedBy: 1 });
labResultSchema.index({ createdAt: -1 });

module.exports = mongoose.model('LabResult', labResultSchema);
