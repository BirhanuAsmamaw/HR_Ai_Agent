const express = require("express");
const { runAIForApplicant, processAllApplicants } = require("../controllers/ai.controller");
const { authenticateHR } = require("../middleware/auth.middleware");

const router = express.Router();

router.use(authenticateHR);

router.post("/run/:applicantId", runAIForApplicant);

router.post("/process-all", processAllApplicants);

module.exports = router;
