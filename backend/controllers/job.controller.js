const { supabase } = require("../config/supabase.config");


exports.createJobListing = async (req, res) => {
  console.log('Job creation request received');
  console.log('Content-Type header:', req.get('Content-Type'));
  console.log('Request body type:', typeof req.body);
  console.log('Request body value:', req.body);
  
  try {
    
    const contentType = req.get('Content-Type');
    if (!contentType || !contentType.includes('application/json')) {
      return res.status(400).json({
        success: false,
        error: 'Content-Type must be application/json',
        received: contentType || 'No Content-Type header',
        hint: 'Make sure to set Content-Type: application/json in your request headers'
      });
    }

    
    if (!req.body || typeof req.body !== 'object' || Object.keys(req.body).length === 0) {
      console.error('Invalid request body:', req.body);
      return res.status(400).json({
        success: false,
        error: 'Request body must be a non-empty JSON object',
        received: req.body || 'No body received',
        hint: 'Make sure to send a JSON object with at least a "title" field'
      });
    }

    const { title, description, requirements } = req.body || {};
    
    console.log('Request body:', JSON.stringify(req.body, null, 2));
    console.log('Extracted values:', { title, description: !!description, requirements: !!requirements });

    
    if (!title || typeof title !== 'string' || title.trim() === '') {
      return res.status(400).json({
        success: false,
        error: 'Title is required and must be a non-empty string',
        received: { title: typeof title === 'string' ? title : 'Not a string' }
      });
    }

    const hrUserId = req.hrUserId;

    
    const { data, error } = await supabase
      .from('job_listings')
      .insert([
        { 
          title,
          description: description || null,
          requirements: requirements || null,
          hr_user_id: hrUserId
        }
      ])
      .select('*')
      .single();

    if (error) throw error;

    res.status(201).json({
      success: true,
      data: data
    });
  } catch (error) {
    console.error('Error creating job listing:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to create job listing',
      details: error.message
    });
  }
};

exports.getJobListings = async (req, res) => {
  try {
    const hrUserId = req.hrUserId;

    const { data: jobs, error } = await supabase
      .from('job_listings')
      .select('*')
      .eq('hr_user_id', hrUserId) 
      .order('created_at', { ascending: false });

    if (error) throw error;

    
    const jobsWithCounts = await Promise.all(
      jobs.map(async (job) => {
        const { count, error: countError } = await supabase
          .from('applicants')
          .select('*', { count: 'exact', head: true })
          .eq('job_id', job.id)
          .eq('hr_user_id', hrUserId);

        return {
          ...job,
          applicant_count: countError ? 0 : (count || 0)
        };
      })
    );

    res.json({
      success: true,
      count: jobsWithCounts.length,
      data: jobsWithCounts
    });
  } catch (error) {
    console.error('Error fetching job listings:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch job listings',
      details: error.message
    });
  }
};


exports.getJobListingById = async (req, res) => {
  try {
    const { id } = req.params;
    const hrUserId = req.hrUserId;

    const { data: job, error } = await supabase
      .from('job_listings')
      .select('*')
      .eq('id', id)
      .eq('hr_user_id', hrUserId)
      .single();

    if (error) throw error;

    if (!job) {
      return res.status(404).json({
        success: false,
        error: 'Job listing not found'
      });
    }

    res.json({
      success: true,
      data: job
    });
  } catch (error) {
    console.error('Error fetching job listing:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch job listing',
      details: error.message
    });
  }
};


exports.updateJobListing = async (req, res) => {
  try {
    const { id } = req.params;
    const { title, description, requirements } = req.body;
    const hrUserId = req.hrUserId; 

    
    if (!title || typeof title !== 'string' || title.trim() === '') {
      return res.status(400).json({
        success: false,
        error: 'Title is required and must be a non-empty string'
      });
    }

    
    const { data: existingJob, error: fetchError } = await supabase
      .from('job_listings')
      .select('*')
      .eq('id', id)
      .eq('hr_user_id', hrUserId)
      .single();

    if (fetchError || !existingJob) {
      return res.status(404).json({
        success: false,
        error: 'Job listing not found'
      });
    }

    
    const { data: updatedJob, error: updateError } = await supabase
      .from('job_listings')
      .update({
        title,
        description: description || null,
        requirements: requirements || null
      })
      .eq('id', id)
      .eq('hr_user_id', hrUserId)
      .select('*')
      .single();

    if (updateError) throw updateError;

    res.json({
      success: true,
      data: updatedJob
    });
  } catch (error) {
    console.error('Error updating job listing:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to update job listing',
      details: error.message
    });
  }
};


exports.deleteJobListing = async (req, res) => {
  try {
    const { id } = req.params;
    const hrUserId = req.hrUserId; 

    
    const { data: existingJob, error: fetchError } = await supabase
      .from('job_listings')
      .select('*')
      .eq('id', id)
      .eq('hr_user_id', hrUserId)
      .single();

    if (fetchError || !existingJob) {
      return res.status(404).json({
        success: false,
        error: 'Job listing not found'
      });
    }

    
    const { error: deleteError } = await supabase
      .from('job_listings')
      .delete()
      .eq('id', id)
      .eq('hr_user_id', hrUserId);

    if (deleteError) throw deleteError;

    res.json({
      success: true,
      message: 'Job listing deleted successfully'
    });
  } catch (error) {
    console.error('Error deleting job listing:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to delete job listing',
      details: error.message
    });
  }
};
