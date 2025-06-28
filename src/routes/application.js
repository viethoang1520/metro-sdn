const express = require('express');
const router = express.Router();
const application = require('../app/controllers/applicationController');

router.post('/approve', application.approveExemptionApplication);
router.post('/reject', application.rejectExemptionApplication);
router.get('/list', application.listExemptionApplications);

module.exports = router; 