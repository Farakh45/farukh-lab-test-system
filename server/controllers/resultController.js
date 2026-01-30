const LabResult = require('../models/LabResult');
const Joi = require('joi');

const createSchema = Joi.object({
  patientName: Joi.string().required().trim(),
  patientId: Joi.string().optional().trim(),
  testType: Joi.string().required().trim(),
  resultValue: Joi.string().required().trim(),
  unit: Joi.string().optional().trim(),
  referenceRange: Joi.string().optional().trim(),
  notes: Joi.string().optional().trim()
});

const updateStatusSchema = Joi.object({
  status: Joi.string().valid('Reviewed', 'Approved').required()
});

const create = async (req, res) => {
  try {
    const { error, value } = createSchema.validate(req.body);
    if (error) {
      return res.fail(error.details[0].message, 400);
    }

    const result = await LabResult.create({
      ...value,
      status: 'Pending',
      uploadedBy: req.user._id
    });

    const populated = await LabResult.findById(result._id)
      .populate('uploadedBy', 'name email')
      .lean();

    res.success({ result: populated }, 'Test result uploaded', 201);
  } catch (err) {
    res.fail(err.message, 500);
  }
};

const list = async (req, res) => {
  try {
    const { status } = req.query;
    const role = req.user.role;

    let filter = {};

    if (role === 'lab_technician') {
      filter.uploadedBy = req.user._id;
    } else if (role === 'doctor') {
      filter.status = { $in: ['Pending', 'Reviewed'] };
    }
    if (status && ['Pending', 'Reviewed', 'Approved'].includes(status)) {
      filter.status = status;
    }

    const results = await LabResult.find(filter)
      .populate('uploadedBy', 'name email')
      .populate('reviewedBy', 'name email')
      .populate('approvedBy', 'name email')
      .sort({ createdAt: -1 })
      .lean();

    res.success({ results }, 'Results retrieved');
  } catch (err) {
    res.fail(err.message, 500);
  }
};

const getOne = async (req, res) => {
  try {
    const result = await LabResult.findById(req.params.id)
      .populate('uploadedBy', 'name email')
      .populate('reviewedBy', 'name email')
      .populate('approvedBy', 'name email')
      .lean();

    if (!result) {
      return res.fail('Result not found', 404);
    }

    const role = req.user.role;
    if (role === 'lab_technician' && result.uploadedBy._id.toString() !== req.user._id.toString()) {
      return res.fail('Insufficient permissions', 403);
    }
    if (role === 'doctor' && !['Pending', 'Reviewed'].includes(result.status)) {
      return res.fail('Insufficient permissions', 403);
    }

    res.success({ result }, 'Result retrieved');
  } catch (err) {
    res.fail(err.message, 500);
  }
};

const updateStatus = async (req, res) => {
  try {
    const { error, value } = updateStatusSchema.validate(req.body);
    if (error) {
      return res.fail(error.details[0].message, 400);
    }

    const result = await LabResult.findById(req.params.id);
    if (!result) {
      return res.fail('Result not found', 404);
    }

    const role = req.user.role;

    if (value.status === 'Reviewed') {
      if (role !== 'doctor') {
        return res.fail('Only doctor can mark as Reviewed', 403);
      }
      if (result.status !== 'Pending') {
        return res.fail('Only Pending results can be marked as Reviewed', 400);
      }
      result.status = 'Reviewed';
      result.reviewedBy = req.user._id;
      result.reviewedAt = new Date();
    } else if (value.status === 'Approved') {
      if (role !== 'admin') {
        return res.fail('Only admin can approve results', 403);
      }
      if (result.status !== 'Reviewed') {
        return res.fail('Only Reviewed results can be approved', 400);
      }
      result.status = 'Approved';
      result.approvedBy = req.user._id;
      result.approvedAt = new Date();
    }

    await result.save();
    const populated = await LabResult.findById(result._id)
      .populate('uploadedBy', 'name email')
      .populate('reviewedBy', 'name email')
      .populate('approvedBy', 'name email')
      .lean();

    res.success({ result: populated }, 'Status updated');
  } catch (err) {
    res.fail(err.message, 500);
  }
};

module.exports = { create, list, getOne, updateStatus };
