const { supabase } = require('../config/supabase.config');

class InterviewService {
  
  static async getHRAvailability(hrUserId) {
    const { data, error } = await supabase
      .from('hr_availability')
      .select('*')
      .eq('hr_user_id', hrUserId)
      .order('day_of_week', { ascending: true })
      .order('start_time', { ascending: true });

    if (error) {
      throw new Error(`Failed to fetch HR availability: ${error.message}`);
    }

    return data || [];
  }

  
  static async getExistingInterviews(hrUserId, startDate, endDate) {
    const { data, error } = await supabase
      .from('interviews')
      .select('*')
      .eq('hr_user_id', hrUserId)
      .gte('scheduled_at', startDate.toISOString())
      .lte('scheduled_at', endDate.toISOString());

    if (error) {
      throw new Error(`Failed to fetch existing interviews: ${error.message}`);
    }

    return data || [];
  }

  
  static async generateAvailableSlots(hrUserId, slotDurationMinutes = 30, weeksAhead = 4) {
    const availability = await this.getHRAvailability(hrUserId);

    if (!availability || availability.length === 0) {
      throw new Error('No HR availability found. Please set up your availability first.');
    }

    const now = new Date();
    const endDate = new Date(now);
    endDate.setDate(endDate.getDate() + (weeksAhead * 7));

    
    const existingInterviews = await this.getExistingInterviews(hrUserId, now, endDate);

    
    const existingSlots = new Set();
    existingInterviews.forEach(interview => {
      if (interview.scheduled_at) {
        const scheduledTime = new Date(interview.scheduled_at);
        
        const timeKey = scheduledTime.toISOString().slice(0, 16); // YYYY-MM-DDTHH:mm
        existingSlots.add(timeKey);
      }
    });

    const availableSlots = [];
    const currentDate = new Date(now);

    
    while (currentDate <= endDate) {
      const dayOfWeek = currentDate.getDay(); 

      
      const dayAvailability = availability.filter(avail => avail.day_of_week === dayOfWeek);

      for (const avail of dayAvailability) {
        
        const [startHours, startMinutes] = avail.start_time.split(':').map(Number);
        const [endHours, endMinutes] = avail.end_time.split(':').map(Number);

        const slotStart = new Date(currentDate);
        slotStart.setHours(startHours, startMinutes, 0, 0);

        const slotEnd = new Date(currentDate);
        slotEnd.setHours(endHours, endMinutes, 0, 0);

        
        if (slotStart < now) {
          continue;
        }

        
        let currentSlotStart = new Date(slotStart);

        while (currentSlotStart < slotEnd) {
          const currentSlotEnd = new Date(currentSlotStart);
          currentSlotEnd.setMinutes(currentSlotEnd.getMinutes() + slotDurationMinutes);

          
          if (currentSlotEnd > slotEnd) {
            break;
          }

          
          const timeKey = currentSlotStart.toISOString().slice(0, 16);
          if (!existingSlots.has(timeKey)) {
            availableSlots.push({
              scheduled_at: new Date(currentSlotStart),
              hr_user_id: hrUserId
            });
          }

          
          currentSlotStart = new Date(currentSlotEnd);
        }
      }

      
      currentDate.setDate(currentDate.getDate() + 1);
    }

    
    availableSlots.sort((a, b) => a.scheduled_at - b.scheduled_at);

    return availableSlots;
  }

  
  static async assignInterviewSlots(hrUserId, applicantIds) {
    if (!applicantIds || applicantIds.length === 0) {
      throw new Error('Applicant IDs are required');
    }

    
    const availableSlots = await this.generateAvailableSlots(hrUserId);

    if (availableSlots.length < applicantIds.length) {
      throw new Error(
        `Not enough available slots. Found ${availableSlots.length} slots for ${applicantIds.length} applicants. ` +
        `Please add more availability or schedule interviews manually.`
      );
    }

    const createdInterviews = [];

   
    for (let i = 0; i < applicantIds.length; i++) {
      const applicantId = applicantIds[i];
      const slot = availableSlots[i];

      
      const { data: applicant, error: applicantError } = await supabase
        .from('applicants')
        .select('id, name, email, hr_user_id')
        .eq('id', applicantId)
        .eq('hr_user_id', hrUserId)
        .single();

      if (applicantError || !applicant) {
        console.error(`Skipping applicant ${applicantId}: Not found or doesn't belong to HR user`);
        continue;
      }

      
      const { data: interview, error: interviewError } = await supabase
        .from('interviews')
        .insert({
          applicant_id: applicantId,
          hr_user_id: hrUserId,
          scheduled_at: slot.scheduled_at.toISOString(),
          reminder_sent: false
        })
        .select()
        .single();

      if (interviewError) {
        console.error(`Error creating interview for applicant ${applicantId}:`, interviewError);
        continue;
      }

      createdInterviews.push(interview);
    }

    return createdInterviews;
  }

  
  static async getTomorrowInterviews(hrUserId = null) {
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    tomorrow.setHours(0, 0, 0, 0);

    const dayAfter = new Date(tomorrow);
    dayAfter.setDate(dayAfter.getDate() + 1);

    let query = supabase
      .from('interviews')
      .select(`
        *,
        applicants:applicant_id (
          id,
          name,
          email
        )
      `)
      .gte('scheduled_at', tomorrow.toISOString())
      .lt('scheduled_at', dayAfter.toISOString())
      .eq('reminder_sent', false);

    if (hrUserId) {
      query = query.eq('hr_user_id', hrUserId);
    }

    const { data, error } = await query;

    if (error) {
      throw new Error(`Failed to fetch tomorrow's interviews: ${error.message}`);
    }

    return data || [];
  }

  /**
   * Mark reminder as sent for an interview
   * @param {string} interviewId - Interview ID
   * @returns {Promise<Object>} Updated interview record
   */
  static async markReminderSent(interviewId) {
    const { data, error } = await supabase
      .from('interviews')
      .update({ reminder_sent: true })
      .eq('id', interviewId)
      .select()
      .single();

    if (error) {
      throw new Error(`Failed to mark reminder as sent: ${error.message}`);
    }

    return data;
  }

  /**
   * Get interview by ID
   * @param {string} interviewId - Interview ID
   * @param {string} hrUserId - HR user ID (for authorization)
   * @returns {Promise<Object>} Interview record
   */
  static async getInterviewById(interviewId, hrUserId) {
    const { data, error } = await supabase
      .from('interviews')
      .select(`
        *,
        applicants:applicant_id (
          id,
          name,
          email
        )
      `)
      .eq('id', interviewId)
      .eq('hr_user_id', hrUserId)
      .single();

    if (error) {
      throw new Error(`Failed to fetch interview: ${error.message}`);
    }

    return data;
  }

  /**
   * Get all interviews for an HR user
   * @param {string} hrUserId - HR user ID
   * @returns {Promise<Array>} Array of interview records
   */
  static async getInterviewsByHR(hrUserId) {
    const { data, error } = await supabase
      .from('interviews')
      .select(`
        *,
        applicants:applicant_id (
          id,
          name,
          email
        )
      `)
      .eq('hr_user_id', hrUserId)
      .order('scheduled_at', { ascending: true });

    if (error) {
      throw new Error(`Failed to fetch interviews: ${error.message}`);
    }

    return data || [];
  }
}

module.exports = InterviewService;

