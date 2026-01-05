// Report model - MongoDB schema for generated reports
// Fields: type, dateRange, data, userId, createdAt, exportedAt

const mongoose = require('mongoose');
const reportSchema = require('../../database/schemas/reportSchema');

module.exports = mongoose.model('Report', reportSchema);
