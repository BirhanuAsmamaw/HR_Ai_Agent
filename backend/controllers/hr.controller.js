const HRService = require('../services/hr.service');


exports.registerHRUser = async (req, res) => {
  try {
    const { name, email, password } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({
        success: false,
        error: 'Name, email, and password are required',
        hint: 'Send JSON body with: { "name": "HR User Name", "email": "hr@example.com", "password": "securepassword" }'
      });
    }

    if (password.length < 6) {
      return res.status(400).json({
        success: false,
        error: 'Password must be at least 6 characters long'
      });
    }

    const result = await HRService.createHRUser(name, email, password);

    res.status(201).json({
      success: true,
      message: 'HR user registered successfully',
      data: {
        id: result.data.id,
        name: result.data.name,
        email: result.data.email,
        api_key: result.data.api_key, 
        created_at: result.data.created_at
      },
      warning: 'Save this API key securely. It will not be shown again.'
    });
  } catch (error) {
    console.error('Error registering HR user:', error);  
    
    if (error.message.includes('already exists') || error.message.includes('duplicate')) {
      return res.status(409).json({
        success: false,
        error: 'Email already exists',
        details: error.message
      });
    }

    res.status(500).json({
      success: false,
      error: 'Failed to register HR user',
      details: error.message
    });
  }
};


exports.loginHRUser = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        success: false,
        error: 'Email and password are required',
        hint: 'Send JSON body with: { "email": "hr@example.com", "password": "yourpassword" }'
      });
    }

    const result = await HRService.loginHRUser(email, password);

    res.status(200).json({
      success: true,
      message: 'Login successful',
      data: result.data
    });
  } catch (error) {
    console.error('Error logging in HR user:', error);
    
    
    if (error.message.includes('Invalid email or password')) {
      return res.status(401).json({
        success: false,
        error: 'Invalid email or password',
        hint: 'Please check your credentials and try again'
      });
    }

    res.status(500).json({
      success: false,
      error: 'Login failed',
      details: error.message
    });
  }
};

