const express = require('express');
const router = express.Router();
const application = require('../app/controllers/applicationController');
const AuthenticateJWT = require('../middleware/AuthenticateJWT');

router.post('/approve', application.approveExemptionApplication);
router.post('/reject', application.rejectExemptionApplication);
router.get('/list', application.listExemptionApplications);
router.get('/details/:applicationId', AuthenticateJWT, application.getExemptionApplicationDetails);
router.get('/me', AuthenticateJWT, application.getUserExemptionApplications);

module.exports = router; 