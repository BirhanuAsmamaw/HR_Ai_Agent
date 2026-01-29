const { model } = require("../config/gemini.config");
const { supabase } = require("../config/supabase.config");
const scoreResumePrompt = require("../prompts/scoreResume.prompt");
const generateEmailPrompt = require("../prompts/generateEmail.prompt");
const ApplicantService = require("./applicant.service");

class AIService {
  static async scoreApplicant(resumeText, jobRequirements) {
    try {
      if (!resumeText || !jobRequirements) {
        throw new Error("Resume text and job requirements are required");
      }

      const prompt = scoreResumePrompt(resumeText, jobRequirements);
      
      
      const result = await model.generateContent(prompt);
      const responseText = result.response.text();
      console.log("Received response from Gemini");

      
      let parsedResult;
      try {
        parsedResult = JSON.parse(responseText);
      } catch (parseError) {
        console.error("Failed to parse AI response as JSON:", responseText);
        
        const jsonMatch = responseText.match(/\{[\s\S]*\}/);
        if (jsonMatch) {
          parsedResult = JSON.parse(jsonMatch[0]);
        } else {
          throw new Error("AI response is not valid JSON: " + responseText.substring(0, 100));
        }
      }

      
      if (!parsedResult.score || !parsedResult.verdict) {
        throw new Error("Invalid AI response format. Missing score or verdict.");
      }

      return parsedResult;
    } catch (error) {
      console.error("Error in scoreApplicant:", error);
      
      
      if (error.message?.includes("fetch failed") || error.message?.includes("network")) {
        throw new Error("Failed to connect to Google AI API. Please check your GEMINI_API_KEY and internet connection.");
      } else if (error.message?.includes("API key")) {
        throw new Error("Invalid or missing GEMINI_API_KEY. Please check your .env file.");
      } else {
        throw error;
      }
    }
  }

  static async generateEmail(verdict, name) {
    try {
      if (!verdict || !name) {
        throw new Error("Verdict and name are required");
      }

      const prompt = generateEmailPrompt(verdict, name);
      
      
      const result = await model.generateContent(prompt);
      const emailText = result.response.text();
      

      return emailText.trim();
    } catch (error) {
      console.error("Error in generateEmail:", error);
      
      
      if (error.message?.includes("fetch failed") || error.message?.includes("network")) {
        throw new Error("Failed to connect to Google AI API. Please check your GEMINI_API_KEY and internet connection.");
      } else if (error.message?.includes("API key")) {
        throw new Error("Invalid or missing GEMINI_API_KEY. Please check your .env file.");
      } else {
        throw error;
      }
    }
  }

  
  static async processAllUnprocessedApplicants() {
    try {
      
      const { data: applicants, error: fetchError } = await supabase
        .from('applicants')
        .select('*')
        .is('ai_score', null)
        .not('job_id', 'is', null) 
        .not('body', 'is', null)
        .neq('body', '');

      if (fetchError) {
        throw new Error(`Failed to fetch applicants: ${fetchError.message}`);
      }

      if (!applicants || applicants.length === 0) {
        
        return {
          success: true,
          processed: 0,
          total: 0,
          message: 'No unprocessed applicants found'
        };
      }

      

      const results = {
        success: true,
        processed: 0,
        failed: 0,
        total: applicants.length,
        errors: []
      };

      
      for (const [index, applicant] of applicants.entries()) {
        try {
          

          
          if (!applicant.job_id) {
            console.warn(`Skipping ${applicant.name}: No job_id found. Applicant must be linked to a job listing.`);
            results.errors.push({
              applicantId: applicant.id,
              applicantName: applicant.name,
              error: 'No job_id found. Applicant must be linked to a job listing to be scored.'
            });
            results.failed++;
            continue;
          }

          
          const { data: jobListingData, error: jobError } = await supabase
            .from('job_listings')
            .select('*')
            .eq('id', applicant.job_id)
            .single();

          if (jobError || !jobListingData) {
            console.warn(`Skipping ${applicant.name}: Job listing not found for job_id ${applicant.job_id}`);
            results.errors.push({
              applicantId: applicant.id,
              applicantName: applicant.name,
              error: `Job listing not found for job_id: ${applicant.job_id}`
            });
            results.failed++;
            continue;
          }

          const jobListing = jobListingData;
          const requirements = jobListingData.requirements;

          if (!requirements || requirements.trim() === '') {
            console.warn(`Skipping ${applicant.name}: Job listing "${jobListingData.title}" has no requirements`);
            results.errors.push({
              applicantId: applicant.id,
              applicantName: applicant.name,
              error: `Job listing "${jobListingData.title}" has no requirements`
            });
            results.failed++;
            continue;
          }

          
          const resume = applicant.body;
          if (!resume || resume.trim() === '') {
            console.warn(`Skipping ${applicant.name}: Resume is empty`);
            results.errors.push({
              applicantId: applicant.id,
              applicantName: applicant.name,
              error: 'Resume is empty'
            });
            results.failed++;
            continue;
          }

          
          
          const aiResult = await this.scoreApplicant(resume, requirements);
          
          const emailDraft = await this.generateEmail(aiResult.verdict, applicant.name);

          
          const { error: updateError } = await ApplicantService.updateAIResult(
            applicant.id,
            aiResult.score,
            aiResult.matches,
            aiResult.verdict,
            emailDraft
          );

          if (updateError) {
            throw new Error(`Failed to update applicant: ${updateError.message}`);
          }

          
          results.processed++;

          
          await new Promise(resolve => setTimeout(resolve, 1000));

        } catch (error) {
          console.error(`Error processing ${applicant.name}:`, error.message);
          results.failed++;
          results.errors.push({
            applicantId: applicant.id,
            applicantName: applicant.name,
            error: error.message
          });
          
          continue;
        }
      }

      
      return results;

    } catch (error) {
      console.error('Error in processAllUnprocessedApplicants:', error);
      throw error;
    }
  }
}

module.exports = AIService;
