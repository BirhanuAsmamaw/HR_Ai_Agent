require('dotenv').config();

module.exports = {
  imap: {
    user: process.env.EMAIL_USER,
    password: process.env.EMAIL_PASSWORD,
    host: 'imap.gmail.com',
    port: 993,
    tls: true,
    tlsOptions: { 
      rejectUnauthorized: false,
      servername: 'imap.gmail.com'  
    },
    authTimeout: 10000,  
    connTimeout: 10000,  
    debug: console.log,  
    keepalive: true,     
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASSWORD
    }
  },
  searchCriteria: ['UNSEEN', ['SUBJECT', 'Job Application']],
  markAsRead: false,  
  mailbox: 'INBOX'    
};
