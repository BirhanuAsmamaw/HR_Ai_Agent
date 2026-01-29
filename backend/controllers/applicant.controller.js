const { supabase } = require("../config/supabase.config");
const SendGridService = require("../services/sendgrid.service");
const ApplicantService = require("../services/applicant.service");


exports.getApplicants = async (req, res) => {
  try {
    const hrUserId = req.hrUserId;

    const { data: applicants, error } = await supabase
      .from('applicants')
      .select('*')
      .eq('hr_user_id', hrUserId)
      .order('applied_at', { ascending: false });

    if (error) throw error;

    res.json({
      success: true,
      count: applicants.length,
      data: applicants
    });
  } catch (error) {
    console.error('Error fetching applicants:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch applicants',
      details: error.message
    });
  }
};


exports.getApplicantById = async (req, res) => {
  try {
    const { id } = req.params;
    const hrUserId = req.hrUserId;

    if (!id) {
      return res.status(400).json({
        success: false,
        error: 'Applicant ID is required'
      });
    }

    const { data: applicant, error } = await supabase
      .from('applicants')
      .select('*') 
      .eq('id', id)
      .eq('hr_user_id', hrUserId) 
      .single();

    if (error || !applicant) {
      return res.status(404).json({
        success: false,
        error: 'Applicant not found',
        details: error?.message
      });
    }

    res.json({
      success: true,
      data: applicant
    });
  } catch (error) {
    console.error('Error fetching applicant:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch applicant',
      details: error.message
    });
  }
};


exports.sendEmailsToAll = async (req, res) => {
  try {
    

    const hrUserId = req.hrUserId; 
    const { data: applicants, error: fetchError } = await supabase
      .from('applicants')
      .select('*')
      .eq('hr_user_id', hrUserId) 
      .not('ai_verdict', 'is', null) 
      .not('ai_generated_email', 'is', null) 
      .not('email', 'is', null) 
      .neq('email', '') 
      .in('status', ['new']) 
      .order('applied_at', { ascending: false });

    if (fetchError) {
      throw new Error(`Failed to fetch applicants: ${fetchError.message}`);
    }

    if (!applicants || applicants.length === 0) {
      return res.json({
        success: true,
        message: 'No applicants found that need emails sent',
        data: {
          processed: 0,
          failed: 0,
          total: 0
        }
      });
    }

    

    const results = {
      success: true,
      processed: 0,
      failed: 0,
      total: applicants.length,
      sent: [],
      errors: []
    };

    
    for (const [index, applicant] of applicants.entries()) {
      try {
        

        
        const emailResult = await SendGridService.sendApplicantEmail(applicant);

        
        let newStatus = 'emailed';
        if (applicant.ai_verdict === 'shortlist') {
          newStatus = 'shortlist';
        } else if (applicant.ai_verdict === 'reject') {
          newStatus = 'reject';
        }

        
        await ApplicantService.updateStatusAfterEmail(
          applicant.id,
          newStatus,
          {
            sentAt: new Date()
          }
        );// Update applicant status

        

        results.processed++;
        results.sent.push({
          applicantId: applicant.id,
          name: applicant.name,
          email: applicant.email,
          verdict: applicant.ai_verdict,
          status: newStatus,
          emailStatus: emailResult.statusCode
        });

        
        await new Promise(resolve => setTimeout(resolve, 500));

      } catch (error) {
        console.error(`Error processing ${applicant.name}:`, error.message);
        results.failed++;
        results.errors.push({
          applicantId: applicant.id,
          name: applicant.name,
          email: applicant.email,
          error: error.message
        });
        
        continue;
      }
    }

    

    res.json({
      success: true,
      message: `Processed ${results.processed} emails, ${results.failed} failed out of ${results.total} total`,
      data: results
    });
  } catch (error) {
    console.error('Error in bulk email sending:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to send emails',
      details: error.message
    });
  }
};


exports.sendEmailToApplicant = async (req, res) => {
  try {
    const { id } = req.params;
    const hrUserId = req.hrUserId;

    if (!id) {
      return res.status(400).json({
        success: false,
        error: 'Applicant ID is required'
      });
    }

    
    const { data: applicant, error: fetchError } = await supabase
      .from('applicants')
      .select('*')
      .eq('id', id)
      .eq('hr_user_id', hrUserId)
      .single();

    if (fetchError || !applicant) {
      return res.status(404).json({
        success: false,
        error: 'Applicant not found',
        details: fetchError?.message
      });
    }

    
    if (!applicant.email) {
      return res.status(400).json({
        success: false,
        error: 'Applicant does not have an email address'
      });
    }

    if (!applicant.ai_generated_email) {
      return res.status(400).json({
        success: false,
        error: 'AI-generated email not found. Please process the applicant with AI first.'
      });
    }

    
    const emailResult = await SendGridService.sendApplicantEmail(applicant);

    
    let newStatus = 'emailed';
    if (applicant.ai_verdict === 'shortlist') {
      newStatus = 'shortlist';
    } else if (applicant.ai_verdict === 'reject') {
      newStatus = 'reject';
    }

    
    await ApplicantService.updateStatusAfterEmail(
      applicant.id,
      newStatus,
      {
        sentAt: new Date()
      }
    );

    

    res.json({
      success: true,
      message: `Email sent successfully to ${applicant.name}`,
      data: {
        applicantId: applicant.id,
        name: applicant.name,
        email: applicant.email,
        verdict: applicant.ai_verdict,
        status: newStatus,
        emailStatus: emailResult.statusCode
      }
    });
  } catch (error) {
    console.error('Error sending email to applicant:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to send email',
      details: error.message
    });
  }
};


exports.linkJob = async (req, res) => {
  try {
    const { id } = req.params;
    const { job_id } = req.body;

    if (!id) {
      return res.status(400).json({
        success: false,
        error: 'Applicant ID is required'
      });
    }

    if (!job_id) {
      return res.status(400).json({
        success: false,
        error: 'job_id is required in request body'
      });
    }

    

    const hrUserId = req.hrUserId; 

    
    const { data: applicant, error: applicantError } = await supabase
      .from('applicants')
      .select('id, name, email, job_id, hr_user_id')
      .eq('id', id)
      .eq('hr_user_id', hrUserId) 
      .single();

    if (applicantError || !applicant) {
      return res.status(404).json({
        success: false,
        error: 'Applicant not found',
        details: applicantError?.message
      });
    }

    
    const { data: jobListing, error: jobError } = await supabase
      .from('job_listings')
      .select('id, title, hr_user_id')
      .eq('id', job_id)
      .eq('hr_user_id', hrUserId) 
      .single();

    if (jobError || !jobListing) {
      return res.status(404).json({
        success: false,
        error: 'Job listing not found',
        details: jobError?.message,
        job_id: job_id
      });
    }

    
    const { data: updatedApplicant, error: updateError } = await supabase
      .from('applicants')
      .update({
        job_id: job_id,
        updated_at: new Date()
      })
      .eq('id', id)
      .select('id, name, email, job_id, status')
      .single();

    if (updateError) {
      throw updateError;
    }

   

    res.json({
      success: true,
      message: `Applicant "${applicant.name}" linked to job "${jobListing.title}"`,
      data: {
        applicant: updatedApplicant,
        job: {
          id: jobListing.id,
          title: jobListing.title
        }
      }
    });
  } catch (error) {
    console.error('Error linking applicant to job:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to link applicant to job',
      details: error.message
    });
  }
};
