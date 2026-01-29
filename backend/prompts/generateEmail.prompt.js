function generateEmailPrompt(verdict, applicantName) {
  const basePrompt = `
Generate a professional HR email.

Verdict: ${verdict}
Name: ${applicantName}
`;


  if (verdict === 'reject') {
    return `
${basePrompt}

For rejection emails:
- Be polite, professional, and respectful
- Thank the applicant for their interest
- Keep it brief and concise
- Wish them success in their job search
- Do not provide specific reasons for rejection
- Maintain a positive tone
- ALWAYS use "brain3.ai" as the company name (never use "[Company Name]" or placeholders)

CRITICAL INSTRUCTIONS:
- DO NOT include any greeting (no "Dear [Name]", no "Hello", no salutation)
- DO NOT include any signature (no "Best regards", no "Sincerely", no "The HR Team", no closing)
- DO NOT include subject line
- Return ONLY the message content/body text
- Start directly with the message content
- End directly after the message content

Example format:
Thank you for your interest in the position at brain3.ai and for taking the time to submit your application.

After careful review, we have decided to move forward with other candidates whose qualifications more closely match our current needs.

We appreciate your interest and wish you success in your job search.
`;
  } else if (verdict === 'shortlist') {
    return `
${basePrompt}

For shortlist emails:
- Be professional and positive
- Congratulate the applicant
- Inform them about next steps which is interview scheduling
- Mention interview scheduling if applicable
- Keep it clear and action-oriented
- ALWAYS use "brain3.ai" as the company name (never use "[Company Name]" or placeholders)
- Company name should be brain3.ai
CRITICAL INSTRUCTIONS:
- DO NOT include any greeting (no "Dear [Name]", no "Hello", no salutation)
- DO NOT include any signature (no "Best regards", no "Sincerely", no "The HR Team", no closing)
- DO NOT include subject line
- Return ONLY the message content/body text
- Start directly with the message content
- Use the company name "brain3.ai" in the email
- End directly after the message content

Example format:
Thank you for your interest in the position at brain3.ai and for taking the time to submit your application.

We are pleased to inform you that, following a careful review of all submissions, your candidacy has been shortlisted for the next stage of our selection process. We were highly impressed with your qualifications and experience.

The next step will be an interview with members of our hiring team. A representative from our HR department will contact you within the next 3-5 business days to schedule a suitable time for this meeting and provide you with all necessary details regarding the format and logistics.

We appreciate your patience throughout this process and look forward to the possibility of moving forward with your application.
`;
  }

  return `${basePrompt}

Return only the email body text (no subject line, no greeting, just the message content).
`;
}

module.exports = generateEmailPrompt;
