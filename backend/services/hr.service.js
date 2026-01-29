const crypto = require('crypto');
const bcrypt = require('bcrypt');
const { supabase } = require('../config/supabase.config');

class HRService {
  
  static generateApiKey() {
    return crypto.randomBytes(32).toString('hex'); // 64-char hex key
  }

  
  static async hashPassword(password) {
    const saltRounds = 10;
    return await bcrypt.hash(password, saltRounds);
  }

  
  static async verifyPassword(password, hash) {
    return await bcrypt.compare(password, hash);
  }

 
  static async createHRUser(name, email, password) {
    try {
      if (!name || !email || !password) {
        throw new Error('Name, email, and password are required');
      }

      if (password.length < 6) {
        throw new Error('Password must be at least 6 characters long');
      }

     
      const hashedPassword = await this.hashPassword(password);

      
      const apiKey = this.generateApiKey();

      
      const { data, error } = await supabase
        .from('hr_users')
        .insert([
          {
            name: name.trim(),
            email: email.trim().toLowerCase(),
            password: hashedPassword,
            api_key: apiKey
          }
        ])
        .select('id, name, email, api_key, created_at')
        .single();

      if (error) {
        
        if (error.code === '23505' || error.message.includes('duplicate')) {
          throw new Error('Email already exists. Please use a different email address.');
        }
        throw error;
      }

      return {
        success: true,
        data: data,
        message: 'HR user created successfully'
      };
    } catch (error) {
      console.error('Error creating HR user:', error);
      throw error;
    }
  }

  
  static async loginHRUser(email, password) {
    try {
      if (!email || !password) {
        throw new Error('Email and password are required');
      }

      
      const { data: hrUser, error } = await supabase
        .from('hr_users')
        .select('id, name, email, password, api_key, created_at')
        .eq('email', email.trim().toLowerCase())
        .single();

      if (error || !hrUser) {
        throw new Error('Invalid email or password');
      }

      
      const isPasswordValid = await this.verifyPassword(password, hrUser.password);

      if (!isPasswordValid) {
        throw new Error('Invalid email or password');
      }

      
      return {
        success: true,
        data: {
          id: hrUser.id,
          name: hrUser.name,
          email: hrUser.email,
          api_key: hrUser.api_key,
          created_at: hrUser.created_at
        },
        message: 'Login successful'
      };
    } catch (error) {
      console.error('Error logging in HR user:', error);
      throw error;
    }
  }

  
  static async getHRUserById(id) {
    const { data, error } = await supabase
      .from('hr_users')
      .select('id, name, email, created_at')
      .eq('id', id)
      .single();

    if (error) throw error;
    return data;
  }
}

module.exports = HRService;

