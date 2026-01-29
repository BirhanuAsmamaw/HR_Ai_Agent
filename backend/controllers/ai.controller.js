const {supabase} = require("../config/supabase.config")
const AIService = require("../services/ai.service");
const ApplicantService = require("../services/applicant.service");

exports.runAIForApplicant = async (req, res) => {
  try {
    const { applicantId } = req.params;

    if (!applicantId) {
      return res.status(400).json({ 
        success: false,
        error: "Applicant ID is required" 
      });
    }

    console.log(`Fetching applicant with ID: ${applicantId}`);

    const hrUserId = req.hrUserId; 

   
    const { data: applicant, error: applicantError } = await supabase
      .from("applicants")
      .select("*")
      .eq("id", applicantId)
      .eq("hr_user_id", hrUserId) 
      .single();

    if (applicantError) {
      
      return res.status(404).json({ 
        success: false,
        error: "Applicant not found",
        details: applicantError.message 
      });
    }

    if (!applicant) {
      return res.status(404).json({ 
        success: false,
        error: "Applicant not found" 
      });
    }

    

    
    const resume = applicant.body;
    if (!resume || resume.trim() === '') {
      return res.status(400).json({ 
        success: false,
        error: "Applicant resume (body) is empty or missing" 
      });
    }

    
    if (!applicant.job_id) {
      console.log("applicant job id not found")
      return res.status(400).json({ 
        success: false,
        error: "Applicant is not linked to a job listing. Cannot score applicant without knowing which job they applied for.",
        hint: "Please link the applicant to a job listing by setting the job_id field."
      });
    }
    
    const { data: jobListingData, error: jobError } = await supabase
      .from("job_listings")
      .select("*")
      .eq("id", applicant.job_id)
      .single();

    if (jobError || !jobListingData) {
      console.error("Error fetching job listing:", jobError);
      return res.status(400).json({ 
        success: false,
        error: "Job listing not found for this applicant",
        details: jobError?.message || "Job listing does not exist",
        job_id: applicant.job_id
      });
    }

    const jobListing = jobListingData;
    const requirements = jobListingData?.requirements;

    if (!requirements || requirements.trim() === '') {
      return res.status(400).json({ 
        success: false,
        error: `Job listing "${jobListingData.title || 'the job listing'}" has no requirements. Cannot score applicant without job requirements.`,
        job_id: applicant.job_id,
        job_title: jobListingData.title || 'the job listing'
      });
    }

    console.log("Using job listing linked to applicant:", jobListingData.title);

    

    
    
    const aiResult = await AIService.scoreApplicant(resume, requirements);
    

    
    const emailDraft = await AIService.generateEmail(
      aiResult.verdict,
      applicant.name
    );
    

 
    
    const { error: updateError } = await ApplicantService.updateAIResult(
      applicantId,
      aiResult.score,
      aiResult.matches,
      aiResult.verdict,
      emailDraft
    );

    if (updateError) {
      console.error("Error updating applicant:", updateError);
      
    }

    res.json({
      success: true,
      aiResult,
      emailDraft,
      jobListing: jobListing ? { id: jobListing.id, title: jobListing.title } : null
    });
  } catch (err) {
    console.error("AI processing error:", err);
    console.error("Error stack:", err.stack);
    
    
    let errorMessage = "AI processing failed";
    if (err.message) {
      errorMessage = err.message;
    } else if (err.cause) {
      errorMessage = err.cause.message || errorMessage;
    }

    res.status(500).json({ 
      success: false,
      error: errorMessage,
      details: process.env.NODE_ENV === 'development' ? err.stack : undefined
    });
  }
};


exports.processAllApplicants = async (req, res) => {
  try {
    const hrUserId = req.hrUserId; 
    
    const results = await AIService.processAllUnprocessedApplicants(hrUserId);
    
    res.json({
      success: results.success,
      message: `Processed ${results.processed} applicants, ${results.failed} failed out of ${results.total} total`,
      data: results
    });
  } catch (error) {
    console.error('Error in processAllApplicants:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to process applicants',
      details: error.message
    });
  }
};
