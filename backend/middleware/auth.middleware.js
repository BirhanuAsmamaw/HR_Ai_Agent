const { supabase } = require('../config/supabase.config');


const authenticateHR = async (req, res, next) => {
  try {
    
    const authHeader = req.get('Authorization');
    
    if (!authHeader) {
      return res.status(401).json({
        success: false,
        error: 'Authorization header is required',
        hint: 'Include Authorization header with format: "Bearer <api_key>" or "ApiKey <api_key>"'
      });
    }

    
    let apiKey = null;
    if (authHeader.startsWith('Bearer ')) {
      apiKey = authHeader.substring(7);
    } else if (authHeader.startsWith('ApiKey ')) {
      apiKey = authHeader.substring(7);
    } else {
      
      apiKey = authHeader;
    }

    if (!apiKey || apiKey.trim() === '') {
      return res.status(401).json({
        success: false,
        error: 'API key is required',
        hint: 'Include API key in Authorization header'
      });
    }

    
    const { data: hrUser, error } = await supabase
      .from('hr_users')
      .select('id, name, email, api_key')
      .eq('api_key', apiKey.trim())
      .single();

    if (error || !hrUser) {
      return res.status(403).json({
        success: false,
        error: 'Invalid API key',
        hint: 'The provided API key is not valid or does not exist'
      });
    }

   
    req.hrUser = hrUser;
    req.hrUserId = hrUser.id;

    next();
  } catch (error) {
    console.error('Error in authentication middleware:', error);
    return res.status(500).json({
      success: false,
      error: 'Authentication error',
      details: error.message
    });
  }
};

module.exports = { authenticateHR };

