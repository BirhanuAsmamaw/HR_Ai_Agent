const cron = require('node-cron');
const emailService = require('../services/email.service');
const AIService = require('../services/ai.service');
const InterviewService = require('../services/interview.service');
const SendGridService = require('../services/sendgrid.service');
const { supabase } = require('../config/supabase.config');

const initScheduledJobs = () => {
  if (process.env.NODE_ENV !== 'test') {
    
    cron.schedule('*/5 * * * *', async () => {
      console.log('Running scheduled email check...');
      try {
        await emailService.fetchEmails();
      } catch (error) {
        console.error('Scheduled email check failed:', error);
      }
    });


    cron.schedule('*/15 * * * *', async () => {
      console.log('Running scheduled AI processing...');
      try {
        await AIService.processAllUnprocessedApplicants();
      } catch (error) {
        console.error('Scheduled AI processing failed:', error);
      }
    });

    
    cron.schedule('17 11 * * *', async () => {
      console.log('Running scheduled interview reminder check...');
      try {
        // Get all interviews scheduled for tomorrow that haven't had reminders sent
        const tomorrowInterviews = await InterviewService.getTomorrowInterviews();

        if (!tomorrowInterviews || tomorrowInterviews.length === 0) {
          console.log('No interviews scheduled for tomorrow');
          return;
        }

        console.log(`Found ${tomorrowInterviews.length} interviews scheduled for tomorrow`);

        // Group interviews by HR user
        const interviewsByHR = {};
        for (const interview of tomorrowInterviews) {
          const hrUserId = interview.hr_user_id;
          if (!interviewsByHR[hrUserId]) {
            interviewsByHR[hrUserId] = [];
          }
          interviewsByHR[hrUserId].push(interview);
        }

        // Send reminder to each HR user
        for (const [hrUserId, interviews] of Object.entries(interviewsByHR)) {
          try {
            // Get HR user email
            const { data: hrUser, error: hrError } = await supabase
              .from('hr_users')
              .select('id, name, email')
              .eq('id', hrUserId)
              .single();

            if (hrError || !hrUser || !hrUser.email) {
              console.error(`Error fetching HR user ${hrUserId}:`, hrError);
              continue;
            }

            // Format interview list for email
            const interviewList = interviews.map((interview, index) => {
              const scheduledDate = new Date(interview.scheduled_at);
              const formattedDate = scheduledDate.toLocaleDateString('en-US', {
                weekday: 'long',
                year: 'numeric',
                month: 'long',
                day: 'numeric'
              });
              const formattedTime = scheduledDate.toLocaleTimeString('en-US', {
                hour: 'numeric',
                minute: '2-digit',
                hour12: true
              });
              // Handle both array and object responses from Supabase
              let applicant = interview.applicants;
              if (Array.isArray(applicant)) {
                applicant = applicant[0];
              }
              const applicantName = applicant?.name || 'Unknown Applicant';
              
              return (
                '<tr style="border-bottom: 1px solid #ddd;">' +
                '<td style="padding: 10px;">' + (index + 1) + '</td>' +
                '<td style="padding: 10px;">' + applicantName + '</td>' +
                '<td style="padding: 10px;">' + formattedDate + '</td>' +
                '<td style="padding: 10px;">' + formattedTime + '</td>' +
                '</tr>'
              );
            }).join('');

            // Create HTML email content
            const htmlContent = `
              <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
                <h2 style="color: #333;">Interview Reminder</h2>
                
                <p>Dear ${hrUser.name},</p>
                
                <p>This is a reminder that you have <strong>${interviews.length}</strong> interview(s) scheduled for tomorrow.</p>
                
                <table style="width: 100%; border-collapse: collapse; margin: 20px 0;">
                  <thead>
                    <tr style="background-color: #f5f5f5;">
                      <th style="padding: 10px; text-align: left;">#</th>
                      <th style="padding: 10px; text-align: left;">Applicant</th>
                      <th style="padding: 10px; text-align: left;">Date</th>
                      <th style="padding: 10px; text-align: left;">Time</th>
                    </tr>
                  </thead>
                  <tbody>
                    ${interviewList}
                  </tbody>
                </table>
                
                <p>Please ensure you are prepared for these interviews.</p>
                
                <p>Best regards,<br>HR Assistant System</p>
              </div>
            `;

            // Create plain text version
            const textContent = `
Interview Reminder

Dear ${hrUser.name},

This is a reminder that you have ${interviews.length} interview(s) scheduled for tomorrow.

${interviews.map((interview, index) => {
  const scheduledDate = new Date(interview.scheduled_at);
  const formattedDate = scheduledDate.toLocaleDateString('en-US', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });
  const formattedTime = scheduledDate.toLocaleTimeString('en-US', {
    hour: 'numeric',
    minute: '2-digit',
    hour12: true
  });
  // Handle both array and object responses from Supabase
  let applicant = interview.applicants;
  if (Array.isArray(applicant)) {
    applicant = applicant[0];
  }
  const applicantName = applicant?.name || 'Unknown Applicant';
  
  return `${index + 1}. ${applicantName} - ${formattedDate} at ${formattedTime}`;
}).join('\n')}

Please ensure you are prepared for these interviews.

Best regards,
HR Assistant System
            `.trim();

            // Send reminder email to HR user
            await SendGridService.sendEmail(
              hrUser.email,
              `Interview Reminder - ${interviews.length} Interview(s) Tomorrow`,
              htmlContent,
              textContent
            );

            
            // Mark reminders as sent for all interviews
            for (const interview of interviews) {
              try {
                await InterviewService.markReminderSent(interview.id);
              } catch (error) {
                console.error(`Error marking reminder as sent for interview ${interview.id}:`, error);
              }
            }

          } catch (error) {
            console.error(`Error sending reminder to HR user ${hrUserId}:`, error);
          }
        }

        console.log(`✅ Interview reminder check complete. Processed ${tomorrowInterviews.length} interviews.`);

      } catch (error) {
        console.error('Scheduled interview reminder check failed:', error);
      }
    });

    console.log('Scheduled jobs initialized:');
    console.log('  - Email check: every 5 minutes');
    console.log('  - AI processing: every 15 minutes');
    console.log('  - Interview reminders: daily at 8:00 AM');
  }
};

module.exports = { initScheduledJobs };
