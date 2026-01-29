const express = require('express');
const { 
  createJobListing, 
  getJobListings, 
  getJobListingById, 
  updateJobListing, 
  deleteJobListing 
} = require('../controllers/job.controller');
const { authenticateHR } = require('../middleware/auth.middleware');

const router = express.Router();


router.use(authenticateHR);

router.post('/create', createJobListing);

router.get('/', getJobListings);


router.get('/:id', getJobListingById);

router.post('/:id', updateJobListing);

router.delete('/:id', deleteJobListing);

module.exports = router;
