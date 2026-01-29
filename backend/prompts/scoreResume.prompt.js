function scoreResumePrompt(resume, requirements) {
  return `
You are an HR resume evaluator.

JOB REQUIREMENTS:
${requirements}

APPLICANT RESUME:
${resume}

TASK:
Score the applicant from 0–100 based on match.
Return JSON with ONLY this format:

{
  "score": number,
  "matches": ["skill1","skill2"],
  "verdict": "shortlist" | "reject" 
}
`;
}

module.exports = scoreResumePrompt;
