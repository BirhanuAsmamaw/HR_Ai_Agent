const express = require('express');
const { getApplicants, getApplicantById, sendEmailsToAll, sendEmailToApplicant, linkJob } = require('../controllers/applicant.controller');
const { authenticateHR } = require('../middleware/auth.middleware');

const router = express.Router();

router.use(authenticateHR);

router.get('/', getApplicants);

router.post('/send-email', sendEmailsToAll);

router.post('/:id/send-email', sendEmailToApplicant);

router.get('/:id', getApplicantById);


router.post('/:id/link-job', linkJob);

module.exports = router;
