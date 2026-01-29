const {supabase} = require("../config/supabase.config");

class ApplicantService {
  static async updateAIResult(id, score, matches, verdict, emailText) {
    return await supabase
      .from("applicants")
      .update({
        ai_score: score,
        ai_matches: matches,
        ai_verdict: verdict,
        ai_generated_email: emailText,
        updated_at: new Date(),
      })
      .eq("id", id);
  }

  
  static async updateStatusAfterEmail(id, status, emailInfo = {}) {
    const updateData = {
      status: status,
      updated_at: new Date(),
    };

    

    const { data, error } = await supabase
      .from("applicants")
      .update(updateData)
      .eq("id", id)
      .select()
      .single();

    if (error) {
      throw error;
    }

    return data;
  }
}

module.exports = ApplicantService;
