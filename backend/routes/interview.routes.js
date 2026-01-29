const express = require('express');
const {
  generateInterviewSlots,
  sendInterviewEmails,
  getInterviews,
  getInterviewById,
  getAvailability,
  setAvailability
} = require('../controllers/interview.controller');
const { authenticateHR } = require('../middleware/auth.middleware');

const router = express.Router();


router.use(authenticateHR);


router.get('/availability', getAvailability);


router.post('/availability', setAvailability);


router.post('/generate', generateInterviewSlots);


router.post('/send-emails', sendInterviewEmails);

router.get('/', getInterviews);

router.get('/:id', getInterviewById);

module.exports = router;

