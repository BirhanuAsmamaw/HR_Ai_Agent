const emailService = require('../services/email.service');

const emailController = {
  async fetchEmails(req, res) {
    try {
      
      const processedEmails = await emailService.fetchEmails();
      
      res.json({
        success: true,
        message: `Processed ${processedEmails.length} emails`,
        data: processedEmails
      });
    } catch (error) {
      console.error('Error in fetchEmails:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to fetch emails',
        error: error.message
      });
    }
  },

};

module.exports = emailController;
