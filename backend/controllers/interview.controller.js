const { supabase } = require('../config/supabase.config');
const InterviewService = require('../services/interview.service');
const SendGridService = require('../services/sendgrid.service');


exports.generateInterviewSlots = async (req, res) => {
  try {
    const { applicant_ids } = req.body;
    const hrUserId = req.hrUserId; 

    if (!applicant_ids || !Array.isArray(applicant_ids) || applicant_ids.length === 0) {
      return res.status(400).json({
        success: false,
        error: 'applicant_ids array is required and must not be empty'
      });
    }

    console.log(`Generating interview slots for ${applicant_ids.length} applicants...`);

    
    const createdInterviews = await InterviewService.assignInterviewSlots(
      hrUserId,
      applicant_ids
    );

    if (createdInterviews.length === 0) {
      return res.status(400).json({
        success: false,
        error: 'No interviews were created. Check if applicants exist and belong to you.'
      });
    }

    console.log(`Successfully created ${createdInterviews.length} interview slots`);

    res.json({
      success: true,
      message: `Successfully generated ${createdInterviews.length} interview slots`,
      data: {
        created: createdInterviews.length,
        requested: applicant_ids.length,
        interviews: createdInterviews
      }
    });
  } catch (error) {
    console.error('Error generating interview slots:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to generate interview slots',
      details: error.message
    });
  }
};


exports.sendInterviewEmails = async (req, res) => {
  try {
    const { interview_ids } = req.body;
    const hrUserId = req.hrUserId;

    let interviews;

    if (interview_ids && Array.isArray(interview_ids) && interview_ids.length > 0) {
      
      interviews = [];
      for (const interviewId of interview_ids) {
        try {
          const interview = await InterviewService.getInterviewById(interviewId, hrUserId);
          
          if (interview) {
            interviews.push(interview);
          }
        } catch (error) {
          console.error(`Error fetching interview ${interviewId}:`, error.message);
        }
      }
    } else {
      
      const allInterviews = await InterviewService.getInterviewsByHR(hrUserId);
      
      interviews = allInterviews;
    }

    if (!interviews || interviews.length === 0) {
      return res.json({
        success: true,
        message: 'No interviews found that need emails sent',
        data: {
          processed: 0,
          failed: 0,
          total: 0
        }
      });
    }

    console.log(`Found ${interviews.length} interviews to send emails for`);

    const results = {
      success: true,
      processed: 0,
      failed: 0,
      total: interviews.length,
      sent: [],
      errors: []
    };

    
    for (const [index, interview] of interviews.entries()) {
      try {
        
        let applicant = interview.applicants;
        if (Array.isArray(applicant)) {
          applicant = applicant[0];
        }
        if (!applicant || !applicant.id) {
          console.error(`Interview ${interview.id} has no applicant data`);
          results.failed++;
          results.errors.push({
            interviewId: interview.id,
            error: 'Applicant data not found'
          });
          continue;
        }

        
        
        const emailResult = await SendGridService.sendInterviewEmail(interview, applicant);

        console.log(`Email sent successfully`);

        results.processed++;
        results.sent.push({
          interviewId: interview.id,
          applicantId: applicant.id,
          name: applicant.name,
          email: applicant.email,
          scheduledAt: interview.scheduled_at,
          emailStatus: emailResult.statusCode
        });

        
        await new Promise(resolve => setTimeout(resolve, 500));

      } catch (error) {
        console.error(`Error processing interview ${interview.id}:`, error.message);
        results.failed++;
        results.errors.push({
          interviewId: interview.id,
          applicantId: interview.applicant_id,
          error: error.message
        });
        
        continue;
      }
    }

    console.log(`\nInterview email sending complete: ${results.processed} sent, ${results.failed} failed out of ${results.total} total`);

    res.json({
      success: true,
      message: `Processed ${results.processed} interview emails, ${results.failed} failed out of ${results.total} total`,
      data: results
    });
  } catch (error) {
    console.error('Error sending interview emails:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to send interview emails',
      details: error.message
    });
  }
};


exports.getInterviews = async (req, res) => {
  try {
    const hrUserId = req.hrUserId;

    const interviews = await InterviewService.getInterviewsByHR(hrUserId);

    res.json({
      success: true,
      count: interviews.length,
      data: interviews
    });
  } catch (error) {
    console.error('Error fetching interviews:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch interviews',
      details: error.message
    });
  }
};


exports.getInterviewById = async (req, res) => {
  try {
    const { id } = req.params;
    const hrUserId = req.hrUserId; 

    if (!id) {
      return res.status(400).json({
        success: false,
        error: 'Interview ID is required'
      });
    }

    const interview = await InterviewService.getInterviewById(id, hrUserId);

    res.json({
      success: true,
      data: interview
    });
  } catch (error) {
    console.error('Error fetching interview:', error);
    res.status(404).json({
      success: false,
      error: 'Interview not found',
      details: error.message
    });
  }
};


exports.getAvailability = async (req, res) => {
  try {
    const hrUserId = req.hrUserId;
    const availability = await InterviewService.getHRAvailability(hrUserId);
    
    res.json({
      success: true,
      data: availability
    });
  } catch (error) {
    console.error('Error fetching availability:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch availability',
      details: error.message
    });
  }
};


exports.setAvailability = async (req, res) => {
  try {
    const { availability } = req.body;
    const hrUserId = req.hrUserId;

    if (!availability || !Array.isArray(availability)) {
      return res.status(400).json({
        success: false,
        error: 'availability array is required'
      });
    }

    const { supabase } = require('../config/supabase.config');

    
    await supabase
      .from('hr_availability')
      .delete()
      .eq('hr_user_id', hrUserId);

   
    const availabilityData = availability.map(avail => ({
      hr_user_id: hrUserId,
      day_of_week: avail.day_of_week,
      start_time: avail.start_time,
      end_time: avail.end_time
    }));

    const { data, error } = await supabase
      .from('hr_availability')
      .insert(availabilityData)
      .select();

    if (error) {
      throw error;
    }

    res.json({
      success: true,
      message: 'Availability updated successfully',
      data: data
    });
  } catch (error) {
    console.error('Error setting availability:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to set availability',
      details: error.message
    });
  }
};

